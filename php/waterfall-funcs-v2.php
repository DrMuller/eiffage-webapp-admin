<?php

// Utils for display
function echo_array ($arr) {
  echo '<pre>';
  print_r($arr);
  echo '</pre>';
}
function echo_txt ($txt) {
  echo $txt;
  echo '<br>';
}
function echo_amount ($amount, $nb_digits=0) {
	echo number_format($amount, $nb_digits, ',', ' ') ;
	echo '<br>';
}

// Display tooltip
function tooltip($text, $icon_bg_color = '') {

	if (!isset($_GET['print'])) { // tooltips désactivés pour la version imprimable
		if (!$icon_bg_color)
			$icon_bg_color = '#888';
		echo '<a data-bs-html="true" data-bs-toggle="tooltip" style="cursor:pointer; color:'.$icon_bg_color.'" title="'.$text.'"><i class="bi bi-question-circle-fill"></i></a>';
	}
}

// Pour savoir si un tableau a des doublons 
function array_has_duplicates ($array) {
   return count($array) !== count(array_unique($array));
}

// Extrait un sous tableau d'un tableau (le premier pour lequel sub_array[$field_name] == $field_value)
// fonction pratique pour faire des get dendreo globaux
function get_sub_array($array_of_arrays, $field_name, $field_value) {
	foreach ($array_of_arrays as $array) {
		if ( $array[$field_name] == $field_value )
			return $array;
	}
	return array();
}

function send_data_to_webhook($webhook_url, $data) {

	// Convertir les données en format JSON
	$json_data = json_encode($data);

	// Configuration de la requête HTTP
	$options = array(
		 'http' => array(
			  'header'  => "Content-type: application/json",
			  'method'  => 'POST',
			  'content' => $json_data,
		 ),
	);

	// Créer le contexte de la requête
	$context = stream_context_create($options);

	// Effectuer la requête vers le webhook_url
	return file_get_contents($webhook_url, false, $context);
}

// ******************************************************************************************
//  Fonction utile pour trier les tableaux associatifs
//  Exemple utilisation :
//
// 	arr1 = array(
//    	array('id'=>1,'name'=>'aA','cat'=>'cc'),
//    	array('id'=>2,'name'=>'aa','cat'=>'dd'),
//    	array('id'=>3,'name'=>'bb','cat'=>'cc'),
//			array('id'=>4,'name'=>'bb','cat'=>'dd')
// 	);
//
// 	$arr2 = array_msort($arr1, array('name' => SORT_DESC, 'cat' => SORT_ASC));
// 
function array_msort($array, $cols) {
    $colarr = array();
    foreach ($cols as $col => $order) {
        $colarr[$col] = array();
        foreach ($array as $k => $row) { $colarr[$col]['_'.$k] = strtolower($row[$col]); }
    }
    $eval = 'array_multisort(';
    foreach ($cols as $col => $order) {
        $eval .= '$colarr[\''.$col.'\'],'.$order.',';
    }
    $eval = substr($eval,0,-1).');';
    eval($eval);
    $ret = array();
    foreach ($colarr as $col => $arr) {
        foreach ($arr as $k => $v) {
            $k = substr($k,1);
            if (!isset($ret[$k])) $ret[$k] = $array[$k];
            $ret[$k][$col] = $array[$k][$col];
        }
    }
    
	 $result = array();
	 foreach ($ret as $ret_item)
		$result[] = $ret_item;
		
	 return $result;
}

// The core function
// Le tableau $pref_shares_by_seniority est supposé être ordonné par rang de liquidation croissant
function compute_proceeds_core ($v, $pref_shares_by_seniority, $nb_common_shares, $nominal, $carve_out) {	
	
	// Si v = 0 on renvoit 0 (ce qui n'est pas le cas avec les calcul à cause de la valeur nominale
	if ($v == 0) {
		$pref_shares_zero = [];
		foreach($pref_shares_by_seniority as $pref_shares)
			foreach ($pref_shares as $pref_share)
				$pref_shares_zero[$pref_share['name']] = 0;									
				
		return [	'proceeds' => ['pref_shares' => $pref_shares_zero, 'common_shares' => 0], 'share_price' => ['pref_shares' => $pref_shares_zero, 'common_shares' => 0], 'all_shares_at_prorata' => false ];
	}
	
	
	// Calcul du nbre total d'actions			
	$total_nb_shares = 0;
	foreach($pref_shares_by_seniority as $pref_shares)
		foreach ($pref_shares as $pref_share)
			$total_nb_shares += $pref_share['nb_shares'];					
	$total_nb_shares += 	$nb_common_shares;

	// Montant total de carve-out distribué
	$carve_out_amount = $carve_out * $v; 					
	
	// Ajout de la valeur nominale et du carve-out aux proceeds de chaque classe d'actions
	$pref_shares_proceeds = [];
	foreach($pref_shares_by_seniority as $pref_shares)
		foreach ($pref_shares as $pref_share)
			$pref_shares_proceeds[$pref_share['name']] = $nominal * $pref_share['nb_shares'] +  $carve_out_amount *  $pref_share['nb_shares'] / $total_nb_shares;			
	$common_shares_proceeds = $nominal * $nb_common_shares +  $carve_out_amount *   $nb_common_shares / $total_nb_shares;			;
	
	// On retranche les montants distribués à la valeur disponible
	$current_v = $v - $nominal * $total_nb_shares - $carve_out_amount;	

	// On calcule la pref nette de chaque classe d'actions = pref initiale - montant déjà distribué, et on l'ajoute au tableau $pref_shares_by_seniority
	foreach($pref_shares_by_seniority as &$pref_shares)
		foreach ($pref_shares as &$pref_share)
			$pref_share['net_pref_amount'] = max($pref_share['pref_amount'] - $pref_shares_proceeds[$pref_share['name']], 0); // si nominal & carve out permet de rembourser la pref, ça peut être négatif, d'où le max (juste esthétique, ça fonctionnerait sans)
	// Suppression des références
	unset($pref_shares);
	unset($pref_share);
					
	// $current_nb_shares = nombre d'actions restant à traiter = nbre total d'actions au départ
	$current_nb_shares = $total_nb_shares;
	
	// Distribution des proceeds				
	foreach($pref_shares_by_seniority as $pref_shares) {				
							
		// Calcul du nbre total d'actions dans le groupe de même rang de liquidation
		$seniority_nb_shares = 0;
		foreach ($pref_shares as $pref_share)
			$seniority_nb_shares += $pref_share['nb_shares'];		
		
		// Calcul de la pref nette du  groupe
		$seniority_net_pref_amount = 0;
		foreach ($pref_shares as $pref_share)
			$seniority_net_pref_amount += $pref_share['net_pref_amount'];							
		
		// Net proceeds du groupe d'ADP
		$seniority_net_proceeds = 0;				
		
		foreach ($pref_shares as $pref_share) {
			
			// Proceeds au prorata de la participation
			$prorata = $current_v * $pref_share['nb_shares'] / $current_nb_shares; 
			
			// Valeur disponible partagée au prorata des préférences du groupe (Si une seule action dans le groupe, $prorata_pref = $current_v)
			$prorata_pref = $seniority_net_pref_amount ? $current_v * $pref_share['net_pref_amount'] / $seniority_net_pref_amount : 0;
			
			if ($pref_share['pref_type'] == 'NP') 	
				$net_proceeds = max(min($prorata_pref, $pref_share['net_pref_amount']), $prorata);
			else	
				$net_proceeds = min($prorata_pref, $pref_share['net_pref_amount']) + max($current_v - $seniority_net_pref_amount, 0) * $pref_share['nb_shares'] /  $current_nb_shares; 
		
			$pref_shares_proceeds[$pref_share['name']] += $net_proceeds;
			$seniority_net_proceeds += $net_proceeds;
		
		}
		// Pour le tour suivant, on retire au nb d'actions les actions que l'on vient de traiter, et au montant disponible le montant distribué à ces actions
		$current_nb_shares -= $seniority_nb_shares;
		$current_v -= $seniority_net_proceeds;				
	}
	
	// Tout ce qu'il reste est destiné aux AOs
	$common_shares_proceeds += $current_v;
	
	// Calcul des PPS pour les ADPs
	$pref_shares_price = [];
	foreach($pref_shares_by_seniority as $pref_shares)
		foreach ($pref_shares as $pref_share)
			$pref_shares_price[$pref_share['name']] = $pref_shares_proceeds[$pref_share['name']] / $pref_share['nb_shares'];
							
	
	// Construction du résultat retourné
	$proceeds = 	['pref_shares' => $pref_shares_proceeds, 'common_shares' => $common_shares_proceeds];
	$share_price = ['pref_shares' => $pref_shares_price, 'common_shares' => $common_shares_proceeds / $nb_common_shares];
	
	
	// Bool indiquant si toutes les classes d'actions sont au prorata = toutes les actions ont le même prix
	$all_shares_at_prorata = false;
	$values = array();
	foreach ($pref_shares_price as $pref_share_price) 
		$values[] = round($pref_share_price, 10);
	$values[] = round($common_shares_proceeds / $nb_common_shares, 10);
	$values = array_unique($values);
	if (count($values) == 1)
		$all_shares_at_prorata = true;
	
	
	// pour checker combien de fois on appelle la fonction
	global $function_calls;
	$function_calls ++;
	
	return ['v'=> $v, 'proceeds' => $proceeds, 'share_price' => $share_price, 'all_shares_at_prorata' => $all_shares_at_prorata];	
}




// Calcul du point d'exercice des options
// Les options sont supposées être ordonnées par strike croissant
function compute_options_exercise_points_core ($options, $pref_shares_by_seniority, $nb_common_shares, $nominal, $carve_out) {
	
	// solver params
	$nb_iter_max = 10**3;	
	$dvs = [10**7, 10**6, 10**5, 10**4, 10**3, 10**2, 10, 1];	
	
	// le résultat sera stocké dans ptions_exercise_points
	$options_exercise_points = []; 
	
	// initialisation de la valo d'exit, du montant issu de l'exercice des options et du nbre d'options exerçées
	$v = 0;
	$options_exercise_proceeds = 0; // montants issus de l'exercice des options 
	$nb_exercised_options = 0;
	
	
	foreach ($options as $option) {
		
		$nb_exercised_options += $option['nb_alive_options']; // le nombre d'AO augmente du nombre d'options exercées
		$options_exercise_proceeds += $option['nb_alive_options'] * $option['strike']; // On ajoute les montants issus de l'exercice des options à la valeur à partager
		
		foreach ($dvs as $dv) {
			
			$cpt = 0;
			
			while (true) {		
			
				$v += $dv;
				$cpt++;
			
				$common_share_price = compute_proceeds_core ($v + $options_exercise_proceeds, $pref_shares_by_seniority, $nb_common_shares + $nb_exercised_options, $nominal, $carve_out)['share_price']['common_shares'];
				
				if ($common_share_price > $option['strike']) 
					break;
							
				if ($cpt > $nb_iter_max) // ne doit jamais arriver
					return -1;
			}
			
			$v -= $dv; // on revient au point juste avant exercice et on recommence avec le dv plus petit
			
		}

		$options_exercise_points[$option['name']] = $v;
	
	}
		
	return $options_exercise_points;
}


// Construction du tableau des ADPs par groupe d'actions de même rang de liquidation à partir du tableau à plat fourni en input
function build_pref_shares_by_seniority($pref_shares) {
	
	// on classe les actions par rang de liquidation croissant au cas où pas déjà fait
	$pref_shares = array_msort($pref_shares, array('seniority' => SORT_ASC));

	$pref_shares_by_seniority = [];		
	foreach ($pref_shares as $pref_share) {			
		$seniority = $pref_share['seniority'];			
		 if (!isset($pref_shares_by_seniority[$seniority])) 
			  $pref_shares_by_seniority[$seniority] = [];			
		$pref_shares_by_seniority[$seniority][] = $pref_share;			
	}
	$pref_shares_by_seniority = array_values($pref_shares_by_seniority);
	
	return $pref_shares_by_seniority;
}


// La fonction à appeler depuis le front pour calculer les points d'exercices des options
function compute_options_exercise_points ($pref_shares, $common_shares, $options, $params) {	

	// regroupement des adp par rang de liquidation croissant
	$pref_shares_by_seniority = build_pref_shares_by_seniority($pref_shares);
		
	// Nombre total d'AO initial
	$nb_common_shares = 0;
	foreach($common_shares as $emission) 
		$nb_common_shares += $emission['nb_shares'];	
	
	// tri des options par strike croissant au cas où pas déjà fait
	$options = array_msort($options, array('strike' => SORT_ASC));	
	
	// et appel de la core function
	return compute_options_exercise_points_core ($options, $pref_shares_by_seniority, $nb_common_shares, $params['nominal'], $params['carve_out']);	

}

// petit shortcut pour calculer en fonction de la valo le nbre d'options exercées et les montants issus de l'exercice des options
function compute_options_exercise ($v, $options, $options_exercise_points) {
		
	$options_exercise_proceeds = 0; // montants issus de l'exercice des options 
	$nb_exercised_options = 0;
			
	foreach($options as $option) 
		if ($v > $options_exercise_points[$option['name']]) {
			$nb_exercised_options += $option['nb_alive_options'];
			$options_exercise_proceeds += $option['nb_alive_options'] * $option['strike']; 
		}
	
	return ['nb_exercised' => $nb_exercised_options, 'exercise_proceeds' => $options_exercise_proceeds, ];
}


// La fonction à appeler depuis le front pour les proceeds et PPS
function compute_proceeds_on_range ($pref_shares, $common_shares, $options, $params, $exit_values = 0) {	
	
	// Regroupement des adp par rang de liquidation croissant
	$pref_shares_by_seniority = build_pref_shares_by_seniority($pref_shares);
		
	// Nbre total d'AO existantes
	$nb_common_shares = 0;
	foreach($common_shares as $emission) 
		$nb_common_shares += $emission['nb_shares'];	
	
	// Tri des options par strike croissant au cas où pas déjà fait
	$options = array_msort($options, array('strike' => SORT_ASC));
	
	// Nbre total d'options 
	$nb_options = 0;
	$total_options_exercise_proceeds = 0;
	foreach($options as $option) {
		$nb_options += $option['nb_alive_options'];		
		$total_options_exercise_proceeds += $option['nb_alive_options'] * $option['strike']  ;
	}	
	
	// Nbre d'actions de pref
	$nb_pref_shares = 0;
	foreach ($pref_shares as $pref_share)
		$nb_pref_shares += $pref_share['nb_shares'];	
	
	// Nbre total d'actions au capital fully diluted
	$total_nb_shares_fd = $nb_common_shares + $nb_options + $nb_pref_shares;	
	
		
	// Params aditionnels
	$nominal = $params['nominal'];
	$carve_out = $params['carve_out'];

	// Calcul points d'exercice des options
	$options_exercise_points = compute_options_exercise_points_core ($options, $pref_shares_by_seniority, $nb_common_shares, $nominal, $carve_out);	
		
	// si pas de tableau de valeurs d'exit donné en input, on en construit un joli pour les graphiques
	if (!$exit_values) {
		
		// On calcule les breakpoints, tant pis si des calculs ci-dessus sont refaits dedans
		$pref_shares_refund_breakpoints = compute_pref_shares_refund_breakpoints ($pref_shares, $common_shares, $options, $params) ;
		
		if (!$pref_shares) // pas d'actions de pref
			if ($options_exercise_points)
				$exit_value_max = 2 * end($options_exercise_points);
			else
				$exit_value_max = 10**7;
		else if (array_key_exists('all_shares_at_prorata', $pref_shares_refund_breakpoints)) // cas où tous les tours sont NPs => ont finit toujours par arriver au prorata
			$exit_value_max = 1.4 * end($pref_shares_refund_breakpoints);
		else 
			$exit_value_max = 4 * end($pref_shares_refund_breakpoints);
			
		
		$exit_values = [];
		
		// Choix du bon step pour les graphiques (pas plus de 1000 points)
		$dvs = [1, 10, 100, 200, 250, 500, 1000, 2000, 2500, 5000, 100000, 200000, 250000, 500000, 1000000, 2000000, 5000000];
		
		foreach ($dvs as $dv) {
			$n = $exit_value_max / $dv + 1;	
			if ($n < 990)
				break;
		}	
		
		for ($i=0; $i<$n; $i++)
			$exit_values[] = $i * $dv;			
	
	}

	// On stocke dans le résultat le range de valo d'exit en input ou construit ci-dessus
	$result['exit_values'] = $exit_values;	
	
	// Ainsi que les points d'exercice des options
	$result['options_exercise_points'] = $options_exercise_points;	
	
	if (isset($pref_shares_refund_breakpoints))
		$result['pref_shares_refund_breakpoints'] = $pref_shares_refund_breakpoints;		
	
	// il faut initialiser le tableau des actions de pref à vide dans pour le cas où il n'y a pas d'actions de pref
	$result['proceeds']['pref_shares'] = $result['share_price']['pref_shares'] = []; 
	
	// Calcul des proceeds pour chaque valeur dans le range
	foreach ($exit_values as $v) {
				
		$exer = compute_options_exercise($v, $options, $options_exercise_points) ;
		$results_for_v = compute_proceeds_core ($v + $exer['exercise_proceeds'], $pref_shares_by_seniority, $nb_common_shares + $exer['nb_exercised'], $nominal, $carve_out);	
		
		foreach ($results_for_v['proceeds']['pref_shares'] as $name => $value)
			$result['proceeds']['pref_shares'][$name][] = $value;
		
		$result['proceeds']['common_shares'][] = $results_for_v['proceeds']['common_shares'];
		
		foreach ($results_for_v['share_price']['pref_shares'] as $name => $value)
			$result['share_price']['pref_shares'][$name][] = $value;
		
		$result['share_price']['common_shares'][] = $results_for_v['share_price']['common_shares'];
		$result['share_price']['prorata_fd'][] = ($v + $total_options_exercise_proceeds) / $total_nb_shares_fd;
		
		$result['more']['all_shares_at_prorata'][] = $results_for_v['all_shares_at_prorata'];
		$result['more']['nb_exercised_options'][] =  $exer['nb_exercised'];
		$result['more']['options_exercise_proceeds'][] =  $exer['exercise_proceeds'];
		//$result['more']['nb_common_shares'][] =  $nb_common_shares + $exer['nb_exercised'];
		$result['more']['total_nb_shares'][] =  $nb_pref_shares + $nb_common_shares + $exer['nb_exercised'];
	}
	$result['more']['nb_pref_shares'] = $nb_pref_shares;
	$result['more']['nb_common_shares'] = $nb_common_shares;
	$result['more']['nb_options'] = $nb_options;
	$result['more']['nb_common_shares_fd'] = $nb_common_shares + $nb_options;
	$result['more']['total_nb_shares_fd'] = $total_nb_shares_fd;

	return $result;		
}


// La fonction à appeler depuis le front pour déterminer les breakpoints des ADPs
function compute_pref_shares_refund_breakpoints ($pref_shares, $common_shares, $options, $params) {
	
	// si pas d'actions de pref, pas de breakpoints
	if (!$pref_shares) return [];
	
	// Regroupement des adp par rang de liquidation croissant
	$pref_shares_by_seniority = build_pref_shares_by_seniority($pref_shares);
	
	// Tri des ADPs par rang de liquidation si pas déja fait (car boucle sur les $pref_shares plus bas)
	$pref_shares = array_msort($pref_shares, array('seniority' => SORT_ASC));		
		
	// Nombre total d'AO initial
	$nb_common_shares = 0;
	foreach($common_shares as $emission) 
		$nb_common_shares += $emission['nb_shares'];	
	
	// Tri des options par strike croissant au cas où pas déjà fait
	$options = array_msort($options, array('strike' => SORT_ASC));		
		
	// Params aditionnels
	$nominal = $params['nominal'];
	$carve_out = $params['carve_out'];
	
	// Calcul points d'exercice des options
	$options_exercise_points = compute_options_exercise_points_core ($options, $pref_shares_by_seniority, $nb_common_shares, $nominal, $carve_out);
	
	// solver params
	$nb_iter_max = 10**3;	
	$dvs = [10**7, 10**6, 10**5, 10**4, 10**3, 10**2, 10, 1];		
	
	// le résultat du calcul sera stocké dans $breakpoints
	$breakpoints = [];
	
	// initialisation de la valo d'exit
	$v = 0;
	
	foreach ($pref_shares as $pref_share) {				
			
		foreach ($dvs as $dv) {
			
			$cpt = 0;
			
			while (true) {		
			
				$v += $dv;
				$cpt++;
						
				$exer = compute_options_exercise($v, $options, $options_exercise_points) ;
				$proceeds = compute_proceeds_core ($v + $exer['exercise_proceeds'], $pref_shares_by_seniority, $nb_common_shares + $exer['nb_exercised'], $nominal, $carve_out);
				
				if ( $proceeds['proceeds']['pref_shares'][$pref_share['name']] >= $pref_share['pref_amount']) 
					break;
							
				if ($cpt > $nb_iter_max) // ne doit jamais arriver
					return -1;
			}
			
			$v -= $dv; // on revient au point juste avant et on recommence avec le dv plus petit
		}	

		$breakpoints[$pref_share['name']] = $v+1; // on rajoute 1 euro pour être à un niveau où le remboursement est effectif (sinon on est juste en dessous à cause du -$dv)
	
	}
	
	
	// Dans le cas où toutes les actions sont non participating, on ajoute au tableau le point où toutes les actions passent au prorata du prix de cession	
	$all_shares_non_participating = true;
		foreach ($pref_shares as $pref_share)
			if ($pref_share['pref_type'] == 'P') {
				$all_shares_non_participating = false;
				break;
			}	
	
	if ($all_shares_non_participating) {			
				
		foreach ($dvs as $dv) {
			
			$cpt = 0;
			
			while (true) {		
			
				$v += $dv;
				$cpt++;				
								
				$exer = compute_options_exercise($v, $options, $options_exercise_points) ;
				$proceeds = compute_proceeds_core ($v + $exer['exercise_proceeds'], $pref_shares_by_seniority, $nb_common_shares + $exer['nb_exercised'], $nominal, $carve_out);		
				
				if ( $proceeds['all_shares_at_prorata']) 
					break;
							
				if ($cpt > $nb_iter_max) // ne doit jamais arriver
					return -1;
			}
			
			$v -= $dv; // on revient au point juste avant et on recommence avec le dv plus petit
		}	

		$breakpoints['all_shares_at_prorata'] = $v+1; // on rajoute 1 euro pour être à un niveau où le full prorata est effectif (sinon on est juste en dessous à cause du -$dv)
		
	}	
	
	return $breakpoints;	
}

?>