<?php 


if (!(strpos($_SERVER['PHP_SELF'], 'edsa') === false )) {
	ini_set('display_errors', 1);
	ini_set('display_startup_errors', 1);
	error_reporting(E_ALL);
}

session_start();

// Connexion automatique si serveur local
if (strpos($_SERVER['PHP_SELF'], 'edsa') !== false) {
	
	$_SESSION['is_admin'] = 1; 
	$_SESSION['auth_key'] = 'abcd';
	$_SESSION['auth_user_name'] = 'Toto';	
	$_SESSION['auth_user_email'] = 'antonin.chaix@gmail.com';
	
}

// si pas authentifié, ciao
if (!isset($_SESSION['is_admin'])) { 
	header("location: ../login/");
	exit();
}


$page_title = "Waterfall simulator";

// includes
require_once('waterfall-header.php');
require_once('charts.php');
require_once('waterfall-funcs-v2.php');


// current URL
if (strpos($_SERVER['PHP_SELF'], 'edsa') === false)	$protocol = 'https';
else																	$protocol = 'http';
$current_url = "$protocol://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";


if(strpos($current_url, 'simulator.futurz.co') !== false) {
	$webhook_url = 'https://hook.eu1.make.com/8s85uxs2ft0telt9fr6biwtweex54dyp';
}
else {
	$webhook_url = 'http://127.0.0.1/edsa-php/futurz/simulators/waterfall-webhook.php';	// pour ne pas remplir la google sheet avec mes tests
}

// url du report et pour mpodifier les inputs
if (isset($_GET['submitted'])) 
	$edit_inputs_url =  $current_url . '&edit_inputs=1';		



// Vérification des erreurs
$errors = [];

if (isset($_GET['submitted'])) {
	
	if (isset($_GET['emission_name']) && array_has_duplicates($_GET['emission_name']))
		$errors[] = "Deux émissions d'actions de préférence ont le même intitulé.";
	
	
	if (isset($_GET['plan_option_name']) && array_has_duplicates($_GET['plan_option_name']))
		$errors[] = "Deux émissions d'options ont le même intitulé.";
	
	if (isset($_GET['emission_name']))
		for ($i=0; $i<count($_GET['emission_name']); $i++) 
			if ($_GET['emission_pref_multiple'][$i] == '' && $_GET['emission_pref_tri'][$i] == '')
				$errors[] = "Les actions de préférence <strong>".$_GET['emission_name'][$i]."</strong> n'ont ni multiple ni TRI. Pour chaque émission d'actions de préférence, spécifier un multiple OU un TRI.";
	
	
	if (isset($_GET['emission_name']) && !$_GET['exit_date'])
		foreach ($_GET['emission_pref_tri'] as $tri)
			if ($tri)
				$errors[] = "Vous avez spécifié une préférence sous forme de TRI pour une ou plusieurs actions de préférence. <strong>Une date de cession doit être renseignée</strong> pour déterminer le multiple de préférence qui s'appliquera.";

}				
?>


<!-- GO FOR HTML -->

<div class="container d-block  d-lg-none">
	<br>
	<p class="text-center" style="font-size:400%"><i class="bi bi-laptop"></i></p>
	
	<h2 class="display-6 text-center"><small>Rendez-vous sur votre ordinateur pour utiliser notre simulateur.</small></h2>
	<br>
	<p class="text-center" style="font-size:400%"><i class="bi bi-arrow-down-circle"></i></p>
	<br>
	<img src="assets/teasing-exit-simulator-1.png" style="max-width: 100%"  Alt="teasing exit simulator">
	<br><br><br>
	<img src="assets/teasing-exit-simulator-2.png" style="max-width: 100%"  Alt="teasing exit simulator">
</div>

<div class="container-fluid waterfall-simulator-container d-none d-lg-block bspce-discount-report">

	<!-- Content here -->
	<br>		
	
	<?php if (isset($_GET['submitted']) && !isset($_GET['edit_inputs'])) : ?>
		<a href="<?= $edit_inputs_url ?>" class="btn btn-light float-start" style="margin-top:-130px; margin-right:50px"><i class="bi bi-pencil-square"></i></i>&nbsp; Modifier les inputs</a>
		<div class="clearfix"></div>
	<?php endif ?>
	
	<h1 class="display-5 text-center">Waterfall Simulator</h1>
	<?php if (!isset($_GET['submitted']) || isset($_GET['edit_inputs'])) : ?>
		<p class="display-6 text-center mt-3"" style="font-size:200%; color:#999">Modélisez et simulez les gains de cession</p>
	<?php else: ?>
		<p class="display-6 text-center mt-3" style="font-size:180%;">Résultats de votre simulation pour la société <strong><?= $_GET['company_name'] ?></strong></p>
	<?php endif ?>	

	
	<br>
	<br>	
	<br>
	
	<?php if (!isset($_GET['submitted']) || isset($_GET['edit_inputs'])) : // Affichage du formulaire s'il n'a pas encore été soumis ou si on veut éditer les inputs ?>
	
		<form id="cap_table_form">
					
			<div class="row justify-content-center">
				<div class="col-md-4">
					<label class="form-spacing"><span style="font-weight:500">Nom de la société</span></label>
					<?php $value = isset($_GET['company_name']) ?  $_GET['company_name'] : '' ?>
					<input type="text" class="form-control" name="company_name" value="<?= $value ?>" required>
				</div>
				
			</div>
			
			<br>
			<br>
			<br>
			
			<div class="card">
				<div class="card-header card-header-inputs">
					Historique des émissions d'actions ordinaires
				</div>
				<div class="card-body card-body-inputs">
										
						
					<table class="table mt-2" id="cap-table-form-emission-actions-ordinaires">
						<thead style="font-size:90%">
							<tr>
								<th style="font-weight:500; width:40%">Intitulé de l'émission</th>
								<th style="font-weight:500; width:25%">Date de l'émission</th>
								<th style="font-weight:500">Nombre d'actions émises</th>
								<th style="font-weight:500;">Prix de souscription <?= tooltip("Prix payé pour chaque action, soit la somme de leur valeur nominale et de leur prime d'émission.")?></th>
							</tr>
						</thead>
						<tbody>
						  <tr>
								<?php //$value = isset($_GET['ao_emission_name']) ?  $_GET['ao_emission_name'] : array('') ?>
								<td><input type="text" class="form-control"  placeholder="Capital social (prix de souscription = valeur nominale d'une action)"  disabled></td>
								<input type="hidden" value="Capital social" name="ao_emission_name[]">
								<?php $value = isset($_GET['ao_emission_date']) ?  $_GET['ao_emission_date'] : array('') ?>
								<td><input type="date" class="form-control" name="ao_emission_date[]" value="<?= $value[0] ?>" required></td>
								<?php $value = isset($_GET['ao_emission_nb_shares']) ?  $_GET['ao_emission_nb_shares'] : array('') ?>
								<td><input type="text" class="form-control" id="ao_emission_nb_shares" name="ao_emission_nb_shares[]"  oninput="formatNumber('ao_emission_nb_shares')" onkeypress="return isNumberKey(event, 'ao_emission_nb_shares')" value="<?= $value[0] ?>" required></td>
								<?php $value = isset($_GET['ao_emission_share_price']) ?  $_GET['ao_emission_share_price'] : array('') ?>
								<td><input type="number" class="form-control" name="ao_emission_share_price[]" min="0" step="any" value="<?= $value[0] ?>" required></td>
							
						  </tr>
						</tbody>
						
					</table>
					<button type="button" class="btn b text-primary fw-bold" id="add-row-actions-ordinaires"><i class="bi bi-plus-circle-fill"></i>&nbsp; Ajouter une émission d'actions</button>
				
				
				</div>
				
			</div>			
			
			<br>
			<br>
			<br>
			
			<div class="card">
				<div class="card-header card-header-inputs">
					Historique des émissions d'actions avec préférences financières&nbsp; <?= tooltip("Actions de préférence statutaires ou actions ordinaires labellisées")?>
				</div>
				<div class="card-body card-body-inputs">
				
					<div class="row mt-2 mb-3">
						
						<div class="col-md-2 offset-md-7 text-end">							
							<label class="form-spacing mt-2"><span style="font-weight:500">Date de la cession</span> &nbsp;<?= tooltip("Si certaines préférences sont spécifiées sous forme de TRI, une date de cession est requise afin de calculer les multiples à appliquer aux actions de préférence concernées. Dans le cas contraire, ce champ peut être laissé vide.") ?></label>
						</div>
						<div class="col-md-3">
							<?php $value = isset($_GET['exit_date']) ?  $_GET['exit_date'] : '' ?>
							<input style="width:84%" type="date" class="form-control" name="exit_date" value="<?= $value ?>">
						</div>
					</div>				
							
						
					<table class="table mt-2" id="cap-table-form-emission-actions">
						<thead style="font-size:90%">
							<tr>
								<th style="font-weight:500; width:20%">Intitulé de l'émission</th>
								<th style="font-weight:500">Date de l'émission</th>
								<th style="font-weight:500; width:9%">Rang de liquidation <?= tooltip("1 pour les actions de préférence qui sont remboursées en premier, 2 pour les actions de préférence qui sont remboursées en 2<sup>ème</sup>, et ainsi de suite.") ?></th>
								<th style="font-weight:500; width:11%">Nombre d'actions émises</th>
								<th style="font-weight:500; width:10%">Prix de<br>souscription <?= tooltip("Prix payé pour chaque action, soit la somme de leur valeur nominale et de leur prime d'émission.")?></th>
								<th style="font-weight:500; width:16%">Type de participation&nbsp;<?= tooltip("Les actions de préférence dites &laquo; participating &raquo; donnent le droit aux investisseurs de participer au partage de la valeur en plus du remboursement de leur investissement initial, lequel intervient en priorité.<br><br>Les actions de préférence dites &laquo; non participating &raquo; donnent le droit aux investisseurs de récupérer leur investissement initial en priorité mais les excluent du partage de la valeur éventuellement restante ensuite. Si le montant de leur investissement est inférieur à ce qu'ils obtiendrait en ayant des actions ordinaires, ils exercent alors leur droit de conversion pour obtenir des actions ordinaires.<br><br><strong>Ces dernières années, la quasi-totalité des actions de préférence émises lors des levées de fonds sont non-participating, mais en raison de la conjoncture actuelle, le participating est parfois de nouveau proposé.</strong><br><br><em>Nous vous invitons à consulter la Term Sheet du Galion Project (pages 5 à 10) pour plus de détails.</em>")?></th>
								<th style="font-weight:500; width:8%">Multiple</span> <?= tooltip("<strong>Saisir (par exemple) 1.5 pour un multiple des actions de préférence émises égal à 1.5x</strong><br><br>Le multiple des actions de préférence d'un tour de financement est le facteur par lequel est multiplié le montant investi par les fonds pour déterminer le montant qui leur sera remboursé de façon prioritaire au moment de la cessions de l'entreprise.<br><br>Prenons un exemple. Supposons que lors d'un premier (et seul) tour de financement, un fonds investisse un montant de 10 millions d'euros et que le multiple de ce tour soit 2x. Supposons que quelques années plus tard l'entreprise soit vendue à 18 M€. Alors, en raison du multiple 2x des actions de préférence, le montant remboursé prioritairement au fonds d'investissement s'élevera à 20 M€ = 2 x 10 M€. L'intégralité du montant de la vente (18 M€) sera donc perçu par le fonds d'investissement, et les actionnaires ordinaires ne toucheront rien.<br><br><strong>Le multiple des actions de préférences émises lors des levées de fonds était tradionnellement égal à 1x. Néanmoins, dans la conjoncture actuelle, ce multiple peut grimper jusqu'à 2.5x (c'est une protection pour le fonds investissant avec la valorisation d'une entreprise qu'il estime trop élevée et que les actionnaires historiques ne veulent pas voir baisser).</strong>") ?></th>
								<th style="font-weight:500; width: 8%">TRI (%) </th>
								<th></th>
							</tr>
						</thead>
						<tbody>
						  <tr id="cap-table-form-emission-actions-first-row">
								<?php $value = isset($_GET['emission_name']) ?  $_GET['emission_name'] : array('') ?>
								<td><input type="text" class="form-control" name="emission_name[]" placeholder="Seed, Series A..." value="<?= $value[0] ?>" required></td>
								<?php $value = isset($_GET['emission_date']) ?  $_GET['emission_date'] : array('') ?>
								<td><input type="date" class="form-control" name="emission_date[]" value="<?= $value[0] ?>" required></td>
								<?php $value = isset($_GET['emission_seniority']) ?  $_GET['emission_seniority'] : array('') ?>
								<td><input type="number" class="form-control" name="emission_seniority[]" min="0" step="1" value="<?= $value[0] ?>" required></td>
								<?php $value = isset($_GET['emission_nb_shares']) ?  $_GET['emission_nb_shares'] : array('') ?>
								<td><input type="text" class="form-control" id="emission_nb_shares" name="emission_nb_shares[]"  oninput="formatNumber('emission_nb_shares')" onkeypress="return isNumberKey(event, 'emission_nb_shares')" value="<?= $value[0] ?>" required></td>
								<?php $value = isset($_GET['emission_share_price']) ?  $_GET['emission_share_price'] : array('') ?>
								<td><input type="number" class="form-control" name="emission_share_price[]" min="0" step="any" value="<?= $value[0] ?>" required></td>
								<td>
									<select class="form-control" name="emission_pref_type[]" required>
										<?php $selected = !isset($_GET['emission_pref_type']) ? ' selected' : '' ?>
										<option value=""<?= $selected ?>>&ndash;</option>
										<?php $selected = (isset($_GET['emission_pref_type']) && $_GET['emission_pref_type'][0] == 'NP')  ? ' selected' : '' ?>							
										<option value="NP"<?= $selected ?>>Non participating</option>
										<?php $selected = (isset($_GET['emission_pref_type']) && $_GET['emission_pref_type'][0] == 'P')  ? ' selected' : '' ?>							
										<option value="P"<?= $selected ?>>Participating</option>
									</select>
								</td>
								<?php $value = isset($_GET['emission_pref_multiple']) ?  $_GET['emission_pref_multiple'] : array('') ?>
								<td><input type="number" class="form-control" name="emission_pref_multiple[]" min="0" step="any" value="<?= $value[0] ?>" ></td>
								<?php $value = isset($_GET['emission_pref_tri']) ?  $_GET['emission_pref_tri'] : array('') ?>
								<td><input type="number" class="form-control" name="emission_pref_tri[]" min="0" step="any" value="<?= $value[0] ?>" ></td>
								
								<td><button type="button" class="btn btn-danger delete-row"><i class="bi bi-trash3"></i></button></td>
						  
						  </tr>
						</tbody>
						
					</table>
					
					<div class="row mt-4">
						<div class="col-md-5">
							<button type="button" class="btn b text-primary fw-bold" id="add-row-actions"><i class="bi bi-plus-circle-fill"></i>&nbsp; Ajouter une émission d'actions</button>
						</div>
						
						<div class="col-md-3 offset-md-2 text-end">
							<label class="form-spacing mt-2"><span style="font-weight:500; ">Carve-out (%) &nbsp;<?= tooltip("<strong>Saisir (par exemple) 10 pour un carve-out égal à 10%</strong><br><br>Le &laquo; carve-out &raquo; est le pourcentage de la valeur de cession de l'entreprise qui sera distribuée à l'ensemble des actionnaires au prorata de leurs participations avant que les investisseurs détenant des actions de préférence exercent leurs priorités de remboursement.") ?></span></label>
						</div>
						<div class="col-md-2">
							<?php $value = isset($_GET['carve_out']) ?  $_GET['carve_out'] : '' ?>
							<input style="width:73%" type="number" class="form-control form-spacing" id="carve_out" name="carve_out" value="<?= $value ?>" placeholder="10 (pour 10%)" >		
						</div>					
					</div>
				</div>
			</div>
			
			
			<br>	
			<br>
			<br>
				
			
			<div class="card">
				<div class="card-header card-header-inputs">
					Historique des émissions d'options (BSPCE, BSA)
				</div>
				<div class="card-body card-body-inputs">				
								
					<table class="table mt-2" id="cap-table-form-emission-options">
						<thead style="font-size:90%">
							<tr>
								<th style="font-weight:500; width:25%">Intitulé du plan d'options</th>
								<th style="font-weight:500">Date du plan</th>
								<th style="font-weight:500">Nombre d'options émises <?= tooltip("Par hypothèse une option (BSPCE ou BSA) donne le droit futur de souscrire une action.") ?></th>
								<th style="font-weight:500">Prix d'exercice </th>
								<th style="font-weight:500">Nombre d'options caduques</span></th>
								<th></th>
							</tr>
						</thead>
						<tbody>
						  <tr id="cap-table-form-emission-options-first-row">
								<?php $value = isset($_GET['plan_option_name']) ?  $_GET['plan_option_name'] : array('') ?>
								<td><input type="text" class="form-control" name="plan_option_name[]" placeholder="BSPCE 2024..." value="<?= $value[0] ?>" required></td>
								<?php $value = isset($_GET['plan_option_date']) ?  $_GET['plan_option_date'] : array('') ?>
								<td><input type="date" class="form-control" name="plan_option_date[]" value="<?= $value[0] ?>"  required></td>
								<?php $value = isset($_GET['plan_option_nb_options']) ?  $_GET['plan_option_nb_options'] : array('') ?>
								<td><input type="text" class="form-control" id="plan_option_nb_options" name="plan_option_nb_options[]"  oninput="formatNumber('plan_option_nb_options')" onkeypress="return isNumberKey(event, 'plan_option_nb_options')" value="<?= $value[0] ?>" required></td>
								<?php $value = isset($_GET['plan_option_strike']) ?  $_GET['plan_option_strike'] : array('') ?>
								<td><input type="number" class="form-control" name="plan_option_strike[]" min="0" step="any" value="<?= $value[0] ?>" required></td>
								<?php $value = isset($_GET['plan_option_dead_options']) ?  $_GET['plan_option_dead_options'] : array('') ?>
								<td><input type="text" class="form-control" id="plan_option_dead_options" name="plan_option_dead_options[]"  oninput="formatNumber('plan_option_dead_options')" onkeypress="return isNumberKey(event, 'plan_option_dead_options')" value="<?= $value[0] ?>"></td>
								
								<td><button type="button" class="btn btn-danger delete-row"><i class="bi bi-trash3"></i></button></td>
								
						  </tr>
						</tbody>
					
					</table>
					<button type="button" class="btn text-primary fw-bold" id="add-row-options"><i class="bi bi-plus-circle-fill"></i>&nbsp; Ajouter de nouvelles options</strong></button>
			
				</div>
			</div>	
		
			
			<br><br>			
					
			<div class="form-check">
			  <input class="form-check-input" id="flexCheckDefault" type="checkbox" name="get_simulation_by_email">
			  <label class="form-check-label" for="flexCheckDefault">
				 Recevoir la simulation par email
			  </label>
			</div>
			
			<br>
			<button type="submit" name="submitted" class="btn btn-primary text-uppercase mt-2" style="padding:20px" value="1">Visualiser</button>
			<br>
			<br>
			
			
			
		</form>
		
		
		<!-- Ajouter et supprimer des lignes sur le tableau des émissions d'actions ordinaires -->
		<script>
			
			let id = 1; // pour pouvoir donner des ids différenciés pour chaque ligne
			
			document.getElementById('add-row-actions-ordinaires').addEventListener('click', function() {
			  const tbody = document.getElementById('cap-table-form-emission-actions-ordinaires').getElementsByTagName('tbody')[0];
			  const newRow = tbody.insertRow();
			  newRow.innerHTML = `<td><input type="text" class="form-control" name="ao_emission_name[]" required></td>
				 <td><input type="date" class="form-control" name="ao_emission_date[]" required></td>
				 <td><input type="text" class="form-control" id="ao_emission_nb_shares_${id}" name="ao_emission_nb_shares[]" oninput="formatNumber('ao_emission_nb_shares_${id}')" onkeypress="return isNumberKey(event, 'ao_emission_nb_shares_${id}')" required></td>
				 <td><input type="number" class="form-control" name="ao_emission_share_price[]" min="0" step="any" required></td>
				 <td><button type="button" class="btn btn-danger delete-row"><i class="bi bi-trash3"></i></button></td>
			  `;
				id++;
			});		
			
		</script>
		
		
		<!-- Ajouter et supprimer des lignes sur le tableau des émissions d'actions de préférence-->
		<script>
			document.getElementById('add-row-actions').addEventListener('click', function() {
			  const tbody = document.getElementById('cap-table-form-emission-actions').getElementsByTagName('tbody')[0];
			  const newRow = tbody.insertRow();
			  newRow.innerHTML = `<td><input type="text" class="form-control" name="emission_name[]" required></td>
				 <td><input type="date" class="form-control" name="emission_date[]" required></td>
				 <td><input type="number" class="form-control" name="emission_seniority[]" min="0" step="1" required></td>
				 <td><input type="text" class="form-control" id="emission_nb_shares_${id}" name="emission_nb_shares[]" oninput="formatNumber('emission_nb_shares_${id}')" onkeypress="return isNumberKey(event, 'emission_nb_shares_${id}')" required></td>
				 <td><input type="number" class="form-control" name="emission_share_price[]" min="0" step="any" required></td>
				 <td>
					<select class="form-control" name="emission_pref_type[]">
						<option value="">&ndash;</option>
						<option value="NP">Non participating</option>
						<option value="P">Participating</option>
					</select>
				</td>
				 <td><input type="number" class="form-control" name="emission_pref_multiple[]" min="0" step="any"></td>
				 <td><input type="number" class="form-control" name="emission_pref_tri[]" min="0" step="any"></td>
							 
				 <td><button type="button" class="btn btn-danger delete-row"><i class="bi bi-trash3"></i></button></td>
			  `;
				id++;
			});
		</script>
		
		<!-- Ajouter et supprimer des lignes sur le tableau des émissions d'options -->		
		<script>
			// formulaire options
			document.getElementById('add-row-options').addEventListener('click', function() {
			  const tbody = document.getElementById('cap-table-form-emission-options').getElementsByTagName('tbody')[0];
			  const newRow = tbody.insertRow();
			  newRow.innerHTML = `
					<td><input type="text" class="form-control" name="plan_option_name[]" required></td>
					<td><input type="date" class="form-control" name="plan_option_date[]" required></td>
					<td><input type="text" class="form-control" id="plan_option_nb_options_${id}" name="plan_option_nb_options[]"  oninput="formatNumber('plan_option_nb_options_${id}')" onkeypress="return isNumberKey(event, 'plan_option_nb_options_${id}')" required></td>
					<td><input type="number" class="form-control" name="plan_option_strike[]" min="0" step="any" required></td>
					<td><input type="text" class="form-control" id="plan_option_dead_options_${id}" name="plan_option_dead_options[]"  oninput="formatNumber('plan_option_dead_options_${id}')" onkeypress="return isNumberKey(event, 'plan_option_dead_options_${id}')"></td>
							 
					<td><button type="button" class="btn btn-danger delete-row"><i class="bi bi-trash3"></i></button></td>
			  `;
			  id++;
			});			
		</script>
		
		
		<!-- Supprimer ligne -->
		<script>
			document.addEventListener('click', function(e) {
			  if (e.target.classList.contains('delete-row')) {
				 const row = e.target.closest('tr');
				 row.remove();
			  }
			});	
			
		</script>		
		
		<?php if (isset($_GET['edit_inputs'])) : // Puisque les lignes du formulaires sont ajoutées en JS,  on doit ajouter toutes les lignes des tableaux en fonction de ce qu'il y a dans la query string ?>
			
			
			<script>
				tbody = document.getElementById('cap-table-form-emission-actions-ordinaires').getElementsByTagName('tbody')[0];

				<?php for ($i=1; $i<count($_GET['ao_emission_name']); $i++) : ?>
					
					newRow = tbody.insertRow();
					newRow.innerHTML = `<td><input type="text" class="form-control" name="ao_emission_name[]" value="<?= $_GET['ao_emission_name'][$i]?>" required></td>
					 <td><input type="date" class="form-control" name="ao_emission_date[]" value="<?= $_GET['ao_emission_date'][$i]?>" required></td>
					 <td><input type="text" class="form-control" id="ao_emission_nb_shares_${id}" name="ao_emission_nb_shares[]" oninput="formatNumber('ao_emission_nb_shares_${id}')" onkeypress="return isNumberKey(event, 'ao_emission_nb_shares_${id}')" value="<?= $_GET['ao_emission_nb_shares'][$i]?>" required></td>
					 <td><input type="number" class="form-control" name="ao_emission_share_price[]" min="0" step="any" value="<?= $_GET['ao_emission_share_price'][$i]?>" required></td>
					 
					 <td><button type="button" class="btn btn-danger delete-row"><i class="bi bi-trash3"></i></button></td>
				  `;
					id++;

				<?php endfor ?>

			</script>		
			
			
			<script>
			
				<?php if (isset($_GET['emission_name'])) : ?>
					tbody = document.getElementById('cap-table-form-emission-actions').getElementsByTagName('tbody')[0];

					<?php for ($i=1; $i<count($_GET['emission_name']); $i++) : ?>
						
						newRow = tbody.insertRow();
						newRow.innerHTML = `<td><input type="text" class="form-control" name="emission_name[]" value="<?= $_GET['emission_name'][$i]?>" required></td>
						 <td><input type="date" class="form-control" name="emission_date[]" value="<?= $_GET['emission_date'][$i]?>" required></td>
						 <td><input type="number" class="form-control" name="emission_seniority[]" min="0" step="1" value="<?= $_GET['emission_seniority'][$i] ?>" required></td>
						 <td><input type="text" class="form-control" id="emission_nb_shares_${id}" name="emission_nb_shares[]" oninput="formatNumber('emission_nb_shares_${id}')" onkeypress="return isNumberKey(event, 'emission_nb_shares_${id}')" value="<?= $_GET['emission_nb_shares'][$i]?>" required></td>
						 <td><input type="number" class="form-control" name="emission_share_price[]" min="0" step="any" value="<?= $_GET['emission_share_price'][$i]?>" required></td>
						 <td>
							<select class="form-control" name="emission_pref_type[]">
								<option value="">&ndash;</option>
								<?php $selected = ($_GET['emission_pref_type'][$i] == 'NP')  ? ' selected' : '' ?>					
								<option value="NP"<?= $selected ?>>Non participating</option>
								<?php $selected = ($_GET['emission_pref_type'][$i] == 'P')  ? ' selected' : '' ?>					
								<option value="P"<?= $selected ?>>Participating</option>
							</select>
						</td>
						 <td><input type="number" class="form-control" name="emission_pref_multiple[]" min="0" step="any" value="<?= $_GET['emission_pref_multiple'][$i]?>"></td>
						 <td><input type="number" class="form-control" name="emission_pref_tri[]" min="0" step="any" value="<?= $_GET['emission_pref_tri'][$i]?>"></td>
									 
						 <td><button type="button" class="btn btn-danger delete-row"><i class="bi bi-trash3"></i></button></td>
					  `;
						id++;

					<?php endfor ?>
				<?php else : // aucune action de pref n'a été saisie => on supprime la ligne existante?>
					document.getElementById("cap-table-form-emission-actions-first-row").remove();				
				<?php endif ?>
				
			</script>
			
			<script>
				<?php if (isset($_GET['plan_option_name'])) : ?>
					tbody = document.getElementById('cap-table-form-emission-options').getElementsByTagName('tbody')[0];

					<?php for ($i=1; $i<count($_GET['plan_option_name']); $i++) : ?>
						
						newRow = tbody.insertRow();
						newRow.innerHTML = `
							<td><input type="text" class="form-control" name="plan_option_name[]" value="<?= $_GET['plan_option_name'][$i]?>" required></td>
							<td><input type="date" class="form-control" name="plan_option_date[]" value="<?= $_GET['plan_option_date'][$i]?>" required></td>
							<td><input type="text" class="form-control" id="plan_option_nb_options_${id}" name="plan_option_nb_options[]"  oninput="formatNumber('plan_option_nb_options_${id}')" onkeypress="return isNumberKey(event, 'plan_option_nb_options_${id}')" value="<?= $_GET['plan_option_nb_options'][$i]?>" required></td>
							<td><input type="number" class="form-control" name="plan_option_strike[]" min="0" step="any" value="<?= $_GET['plan_option_strike'][$i]?>" required></td>
							<td><input type="text" class="form-control" id="plan_option_dead_options_${id}" name="plan_option_dead_options[]"  oninput="formatNumber('plan_option_dead_options_${id}')" onkeypress="return isNumberKey(event, 'plan_option_dead_options_${id}')" value="<?= $_GET['plan_option_dead_options'][$i]?>"></td>
									 
							<td><button type="button" class="btn btn-danger delete-row"><i class="bi bi-trash3"></i></button></td>
					  `;					
						
						id++;

					<?php endfor ?>
					
				
				<?php else : // aucun plan d'option n'a été saisi => on supprime la ligne existante?>
					document.getElementById("cap-table-form-emission-options-first-row").remove();
				<?php endif ?>
			</script>
			
		<?php endif ?>
		
	
	<?php elseif ($errors) : ?>

		<div class="alert alert-danger" role="alert">
			<h5>ERREURS</h5>
			<br>
			<ul>
			<?php
				foreach ($errors as $error)
					echo '<li>'.$error.'</li>';
			?>
			</ul>
			
			<p class="mt-4"><a href="<?= $edit_inputs_url ?>">Revenir à la page de saisie</a></p>
		</div>


			
	<?php else: // AFFICHAGE DE LA SIMULATION ?>		
		
		<?php		
	
		// ===== Appel du webhook de Clément =====
		$simulation_url = str_replace('&get_simulation_by_email=on', '', $current_url); // si email demandé, on retire la checkbox pour pas que ça renvoie un email quand on y retourne
		
		$_SESSION['simulations_history'][] = $simulation_url;
		
		
		if (isset($_SESSION['auth_key']))
			$data = array(
				 'auth_key' => $_SESSION['auth_key'],
				 'auth_user_name' => $_SESSION['auth_user_name'],
				 'auth_user_email' => $_SESSION['auth_user_email'],
				 'simulation_url' => $simulation_url,
				 'get_simulation_by_email' => isset($_GET['get_simulation_by_email']) ? true : false
			);
		else
			$data = ['simulation_url' => $simulation_url, 'get_simulation_by_email' => isset($_GET['get_simulation_by_email']) ? true : false];

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
		$response = file_get_contents($webhook_url, false, $context);
			
		// ===== End webhook =============================
		
		
		// Input actions ordinaires
		$input_emissions_ao = [];
		
		for ($i=0; $i<count($_GET['ao_emission_name']); $i++) {
			$emission = [];
			$emission_nb_shares = intval(str_replace(' ', '', $_GET['ao_emission_nb_shares'][$i]));
			$emission['name'] = $_GET['ao_emission_name'][$i];
			$emission['date'] = $_GET['ao_emission_date'][$i];
			$emission['nb_shares'] = $emission_nb_shares; 
			$emission['share_price'] = $_GET['ao_emission_share_price'][$i];		
			$emission['amount'] =  $emission_nb_shares * $_GET['ao_emission_share_price'][$i];			
			$input_emissions_ao[] = $emission;
		}
			
		// Input actions de pref	
		$input_emissions_adp = [];
		
		if (isset($_GET['emission_name'])) {
			
			for ($i=0; $i<count($_GET['emission_name']); $i++) {		
			
				$emission = [];
				$emission_nb_shares = intval(str_replace(' ', '', $_GET['emission_nb_shares'][$i]));
				$T_tri =  (new DateTime($_GET['emission_date'][$i]))->diff(new DateTime($_GET['exit_date']))->days / 365.;
				$emission['name'] = $_GET['emission_name'][$i];
				$emission['date'] = $_GET['emission_date'][$i];
				$emission['seniority'] = $_GET['emission_seniority'][$i] ;
				$emission['nb_shares'] = $emission_nb_shares; 
				$emission['share_price'] = $_GET['emission_share_price'][$i];
				$emission['amount'] =  $emission_nb_shares * $_GET['emission_share_price'][$i];
				$emission['pref_type'] = $_GET['emission_pref_type'][$i];
				$emission['pref_multiple'] = $_GET['emission_pref_multiple'][$i] ? $_GET['emission_pref_multiple'][$i] : 0;
				$emission['pref_tri'] = $_GET['emission_pref_tri'][$i] ? 0.01 * $_GET['emission_pref_tri'][$i] : 0;
				$emission['pref_effective_multiple'] = max($emission['pref_multiple'], (1+$emission['pref_tri'])**$T_tri);
				$emission['pref_share_price'] = $_GET['emission_share_price'][$i] * $emission['pref_effective_multiple'];
				$emission['pref_amount'] = $emission_nb_shares * $_GET['emission_share_price'][$i] * $emission['pref_effective_multiple'];
				$input_emissions_adp[] = $emission;
			}
			
			$input_emissions_adp = array_msort($input_emissions_adp, array('seniority' => SORT_ASC)); // Tri par rang de liquidation croissant
		}
			
		// Input plans d'options
		$input_plans_options = [];
		
		if (isset($_GET['plan_option_name'])) {			
			
			for ($i=0; $i<count($_GET['plan_option_name']); $i++) {
				$plan_options = [];
				$nb_options = intval(str_replace(' ', '', $_GET['plan_option_nb_options'][$i]));
				$nb_dead_options = intval(str_replace(' ', '', $_GET['plan_option_dead_options'][$i]));
				$plan_options['name'] = $_GET['plan_option_name'][$i];
				$plan_options['date'] = $_GET['plan_option_date'][$i];				
				$plan_options['nb_options'] = $nb_options;
				$plan_options['strike'] = $_GET['plan_option_strike'][$i];
				$plan_options['nb_dead_options'] = $_GET['plan_option_dead_options'][$i] ? $nb_dead_options : 0;
				$plan_options['nb_alive_options'] = $plan_options['nb_options'] - $plan_options['nb_dead_options'];
				$input_plans_options[] = $plan_options;
			}
			
		}						
		
		// params additionnels
		$nominal = $input_emissions_ao[0]['share_price'];
		$carve_out = $_GET['carve_out'] ? $_GET['carve_out'] * 0.01 : 0 ;		
		$input_plans_options = array_msort($input_plans_options, array('strike' => SORT_ASC)); // tri des options par strikes croissant
				
		$params = ['nominal' => $nominal, 'carve_out' => $carve_out];
		
		// compteur d'appels à la fonction compute_proceeds_core, juste pour info
		$function_calls = 0;
		
		// Les calculs
		$result = compute_proceeds_on_range ($input_emissions_adp, $input_emissions_ao, $input_plans_options, $params) ;
		$pref_shares_refund_breakpoints = $result['pref_shares_refund_breakpoints'];
		
		//echo $function_calls ;		
		
		// Les séries pour les graphiques
		//$colors = array("#005f73","#0a9396","#94d2bd","#9cbb5a","#ee9b00","#ca6702","#bb3e03","#ae2012","#9b2226", "#7a1c18", "#631717", "#4d1313", "#3a0f0f", "#270b0b", "#1a0808", "#100505", "#080303");
		
		// new colors chat gpt
		$colors = array(
		  "#004f63", // teal foncé (plus dense que #005f73)
		  "#08878a", // turquoise plus soutenu
		  "#77bfa8", // vert clair mais moins pastel que #94d2bd
		  "#a8d173", // lime doux, plus contrasté que #c2e59c
		  "#e6c600", // jaune plus dense que #f4e04d
		  "#e1a800", // jaune orangé plus chaud
		  "#e07c1d", // orange un peu plus saturé
		  "#d35b38", // orange/rouge plus profond
		  "#c22222", // rouge vif
		  "#a41517", // rouge foncé
		  "#870308", // rouge très foncé
		  "#5a030c", // bordeaux profond
		  "#44060a", // bordeaux foncé
		  "#32090b", // rouge brun
		  "#21080a", // rouge très sombre
		  "#140607", // presque noir
		  "#0a0304"  // noir rougeâtre
		);

		
		$share_price_plot_series = [];			
		$i = 0;
		foreach ($result['share_price']['pref_shares'] as $name => $values) {		
			$share_price_plot_series[$name] = array('color' => $colors[$i], 'values' => $values);
			$i++;
		}
		$share_price_plot_series['Actions ordinaires'] = array('color' => $colors[$i], 'values' => $result['share_price']['common_shares']);
		$prorata_fd = $result['share_price']['prorata_fd'];
		
		// calcul début droite prorata FD pointillée
		$prorata_plot_start = 0;		
		if ($input_emissions_adp)
			$prorata_plot_start = $pref_shares_refund_breakpoints[end($input_emissions_adp)['name']] ;
		else if ($input_plans_options)
			$prorata_plot_start = end($result['options_exercise_points']) / 3.;		
		for ($i=0; $i<count($prorata_fd); $i++) {
				if ($result['exit_values'][$i] < $prorata_plot_start  )
				$prorata_fd[$i] = '';
		}
		$share_price_plot_series['Prorata FD'] = array('color' => '#bbb', 'dash' => '[6, 5]', 'line_width' => 1.2, 'values' => $prorata_fd);			
		
		$proceeds_plot_series = [];			
		$i = 0;
		foreach ($result['proceeds']['pref_shares'] as $name => $values) {		
			$proceeds_plot_series[$name] = array('color' => $colors[$i], 'values' => $values);
			$i++;
		}
		$proceeds_plot_series['Actions ordinaires'] = array('color' => $colors[$i], 'values' => $result['proceeds']['common_shares']);
		
		// Calculs des proceeds au niveau des points de remboursement des ADPs + breakpoint passage au prorata (pour les tableaux correspondants)
		if ($input_emissions_adp) {
			$breakpoints_for_table = [];
			foreach($pref_shares_refund_breakpoints as $v)
				$breakpoints_for_table[] = $v;		
			$breakpoints_for_table = array_values(array_unique($breakpoints_for_table)); // dans le cas pari passu, plusieurs actions ont le même point de remboursement
			$result_at_breakpoints = compute_proceeds_on_range ($input_emissions_adp, $input_emissions_ao, $input_plans_options, $params, $breakpoints_for_table) ;	
		}
		
		?>		
	
		
		<header>Actions ordinaires</header>	
		
		<br>
		
		<div class="row justify-content-center">
			<div class="col-md-7 text-center text-muted fst-italic">
				<p>Le tableau ci-dessous présente l’ensemble des actions ordinaires non identifiées par un label, correspondant aux actions émises lors de la création de la société ainsi qu’à celles émises lors des augmentations de capital ultérieures.</p>
			</div>
		</div>	
	
		<br>
		
		<div class="row justify-content-center">
			<div class="col-md-8">
				<table class="table">
				  <thead>
					 <tr>
						<th scope="col" style="width:20%"></th>
						<th scope="col" class="text-center">Date de l'émission</th>
						<th scope="col" class="text-center">Nbre d'actions émises</th>
						<th scope="col" class="text-center">Prix de souscription</th>
						<th scope="col" class="text-center">Montant souscrit</th>
					 </tr>
				  </thead>
				  <tbody>
				
					
					<?php foreach($input_emissions_ao as $emission) : ?>
						
						<tr>
							<td class="table-label align-middle"><?= $emission['name'] ?></td>
							<td class="text-center align-middle"><?= date("d/m/Y", strtotime($emission['date'])) ?></td>
							<td class="text-center align-middle"><?= number_format($emission['nb_shares'], 0, ',', ' ') ?></td>
							<td class="text-center align-middle"><?= number_format($emission['share_price'], 2, ',', ' ') ?> €<?= ($emission['name'] == "Capital social")  ? '<br><small class="text-muted">Valeur nominale d\'une action</small>' : '' ?></td>
							<td class="text-center align-middle"><?= number_format($emission['amount'], 0, ',', ' ') ?>&nbsp;€</td>
						</tr>
						
					 <?php endforeach ?>
					
				  </tbody>
				</table>
			</div>
		</div>
		
		
		<?php if ($input_emissions_adp)  : ?>
			<br>
			<br>
			<br>
					
			<header>Actions avec préférences financières</header>		
		
			<br>
			
			<div class="row justify-content-center">
				<div class="col-md-8 text-center text-muted fst-italic">
					<p>Le tableau ci-dessous présente les souscriptions d’actions assorties de préférences financières, qu’elles soient statutaires <br>ou contractuelles — cette distinction n’ayant pas d’incidence sur les calculs.</p>
					<p>Lorsque la préférence est définie comme le maximum entre un multiple de l’investissement et un rendement, la colonne “multiple effectif” indique la valeur maximale retenue pour les calculs dans la visualisation.</p>
				</div>
			</div>	
		
			<br>
					
			<table class="table">
			  <thead>
				 <tr>
					<th scope="col" style="width:12%"></th>
					<th scope="col" class="text-center">Date de<br>l'émission</th>
					<th scope="col" class="text-center" style="width:7%">Rang de liquidation</th>
					<th scope="col" class="text-center">Nbre d'actions<br>émises</th>
					<th scope="col" class="text-center" style="width:7%">Prix de souscription</th>
					<th scope="col" class="text-center">Montant<br>souscrit</th>
					<th scope="col" class="text-center">Type de<br>participation</th>
					<th scope="col" class="text-center">Multiple</th>
					<th scope="col" class="text-center">TRI</th>
					<th scope="col" class="text-center">Multiple<br>effectif</th>
					<th scope="col" class="text-center">Préférence<br>par action</th>
					<th scope="col" class="text-center">Préférence<br>totale</th>				
				 </tr>
			  </thead>
			  <tbody>
			
				
				<?php foreach($input_emissions_adp as $emission) : ?>
					
					<tr>
						<td class="table-label"><?= $emission['name'] ?></td>
						<td class="text-center align-middle"><?= date("d/m/Y", strtotime($emission['date'])) ?></td>
						<td class="text-center align-middle"><?= $emission['seniority'] ?></td>
						<td class="text-center align-middle"><?= number_format($emission['nb_shares'], 0, ',', ' ') ?></td>
						<td class="text-center align-middle"><?= number_format($emission['share_price'], 2, ',', ' ') ?> €</td>
						<td class="text-center align-middle"><?= number_format($emission['amount'], 0, ',', ' ') ?>&nbsp;€</td>
						<td class="text-center align-middle"><?= ($emission['pref_type'] == 'NP') ? 'Non participating' : 'Participating'  ?></td>
						<td class="text-center align-middle"><?= $emission['pref_multiple'] ? $emission['pref_multiple'] . 'x' : '-'?></td>
						<td class="text-center align-middle"><?= $emission['pref_tri']  ? 100 * $emission['pref_tri'] . '%' : '-' ?></td>
						<td class="text-center align-middle"><?= number_format($emission['pref_effective_multiple'], 2, ',', ' ') ?>x</td>
						<td class="text-center align-middle"><?= number_format($emission['pref_share_price'], 2, ',', '&nbsp;') ?>&nbsp;€</td>
						<td class="text-center align-middle"><?= number_format($emission['pref_amount'], 0, ',', '&nbsp;') ?>&nbsp;€</td>
					</tr>
					
				 <?php endforeach ?>
				
			  </tbody>
			</table>
			
		
			
			<div class="row justify-content-center mt-4">
				<div class="col-md-3">
					<table class="table">
						<thead>	
							<th></th>
							<th></th>
						</thead>
						<tbody>					
						<tr>
							<td class="table-label">Carve-out</td>
							<td class="text-center"><?= $_GET['carve_out'] ? $_GET['carve_out'] : 0 ?>%</td>
						</tr>
						<?php if ($_GET['exit_date']) : ?>
							<tr>
								<td class="table-label">Date de la cession</td>
								<td class="text-center"><?= date("d/m/Y", strtotime($_GET['exit_date']))  ?></td>
							</tr>
						<?php endif ?>
					  </tbody>
					</table>
				</div>
			</div>
		
		<?php endif ?>
		
		<?php if ($input_plans_options)  : ?>
			
			<br>
			<br>
			<br>
			
			
			<header>Options</header>
			
			<br>

			<div class="row justify-content-center">
				<div class="col-md-8 text-center text-muted fst-italic">
					<p>Ce tableau indique le nombre d’options émises par la société. Celles-ci sont supposées systématiquement être exercées<br>dès lors que le prix par action de la cession dépasse leur prix d’exercice.</p>
					<p>Ainsi, seules les actions générant un gain financier au moment de la cession sont identifiées comme faisant partie du capital.</p>
				</div>
			</div>	
			
			<br>
			
			<div class="row justify-content-center">
				<div class="col-md-10">
					<table class="table">
					  <thead>
						 <tr>
							<th scope="col" style="width:20%"></th>
							<th scope="col" class="text-center">Date du plan</th>
							<th scope="col" class="text-center">Nbre d'options émises</th>
							<th scope="col" class="text-center">Prix d'exercice</th>
							<th scope="col" class="text-center">Nbre d'options caduques</th>
							<th scope="col" class="text-center">Nbre d'options exerçables</th>
						 </tr>
					  </thead>
					  <tbody>
						
						<?php foreach($input_plans_options as $plan_options) : ?>
							
							<tr>
								<td class="table-label"><?= $plan_options['name'] ?></td>
								<td class="text-center align-middle"><?= date("d/m/Y", strtotime($plan_options['date'])) ?></td>
								<td class="text-center align-middle"><?= number_format($plan_options['nb_options'], 0, ',', ' ') ?></td>
								<td class="text-center align-middle"><?= number_format($plan_options['strike'], 2, ',', ' ') ?> €</td>					
								<td class="text-center align-middle"><?= number_format($plan_options['nb_dead_options'], 0, ',', ' ') ?></td>
								<td class="text-center align-middle"><?= number_format($plan_options['nb_alive_options'], 0, ',', ' ') ?></td>						
							</tr>
							
						 <?php endforeach ?>
						
					  </tbody>
					</table>
				</div>
			</div>
		<?php endif ?>
		
		<br>
		<br>
		<br>
		<br>
		<br>
		
		<header>Participation au capital des différentes catégories d'actions</header>
		
		<br>
		<div class="row justify-content-center">
			<div class="col-md-8 text-center text-muted fst-italic">
				<p>Le tableau ci-dessous présente une synthèse en trois catégories du nombre de titres, ainsi que leur répartition au sein du capital social, en tenant compte de l’ensemble des actions existantes et potentielles susceptibles souscrites dans le cadre des options en circulation.</p>
			</div>
		</div>	
		<br>		
		
		<div class="row justify-content-center">
			<div class="col-md-7">
				<table class="table">
				  <thead>
					 <tr style="border-bottom:4px double #ccc">
						<th scope="col"></th>
						<th scope="col" class="text-center" width="30%">Nombre de titres</th>
						<th scope="col" class="text-center">% fully diluted</th>		
					 </tr>
				  </thead>
				  <tbody>										
					<?php  if ($input_emissions_adp)  : ?>
						<tr style="border-bottom-color: #c5c5c5">
							<td class="table-label text-end"><strong>Total des actions avec préférences financières</strong></td>
							<td class="text-center align-middle"><strong style="font-weight:500"><?= number_format(100 * $result['more']['nb_pref_shares'], 0, ',', ' ')  ?></strong></td>
							<td class="text-center align-middle"><strong style="font-weight:500"><?= number_format(100 * $result['more']['nb_pref_shares'] / $result['more']['total_nb_shares_fd'], 1, ',', ' ')  ?>%</strong></td>
						</tr>					
						<?php $i=1; foreach($input_emissions_adp as $emission) : ?>						
							<tr class="small" style="<?= ($i==count($input_emissions_adp)) ? 'border-bottom:4px double #ccc' : '' ?>">
								<td class="table-label text-end"><?= $emission['name'] ?></td>
								<td class="text-center align-middle"><?= number_format(100 * $emission['nb_shares'], 0, ',', ' ') ?></td>
								<td class="text-center align-middle"><?= number_format(100 * $emission['nb_shares'] / $result['more']['total_nb_shares_fd'], 1, ',', ' ')  ?>%</td>
							</tr>
							
						<?php $i++; endforeach ?>
					<?php else :  ?>					
						<tr style="border-bottom:4px double #ccc">
							<td class="table-label text-end"><strong>Total des actions avec préférences financières</strong></td>
							<td class="text-center align-middle"><strong style="font-weight:500">0</strong></td>
							<td class="text-center align-middle"><strong style="font-weight:500">0%</strong></td>
						</tr>					
					<?php endif ?>
					
					<tr style="border-bottom-color: #c5c5c5">
						<td class="table-label text-end"><strong>Total des actions ordinaires</strong></td>
						<td class="text-center align-middle"><strong style="font-weight:500"><?= number_format(100 * $result['more']['nb_common_shares'], 0, ',', ' ')  ?></strong></td>
						<td class="text-center align-middle"><strong style="font-weight:500"><?= number_format(100 * $result['more']['nb_common_shares'] / $result['more']['total_nb_shares_fd'], 1, ',', ' ')  ?>%</strong></td>
					</tr>					
					<?php $i=1; foreach($input_emissions_ao as $emission) : ?>						
						<tr class="small" style="<?= ($i==count($input_emissions_ao)) ? 'border-bottom:4px double #ccc' : '' ?>">
							<td class="table-label text-end"><?= str_replace('Capital social', 'Lors de l\'immatriculation', $emission['name']) ?></td>
							<td class="text-center align-middle"><?= number_format(100 * $emission['nb_shares'], 0, ',', ' ') ?></td>
							<td class="text-center align-middle"><?= number_format(100 * $emission['nb_shares'] / $result['more']['total_nb_shares_fd'], 1, ',', ' ')  ?>%</td>
						</tr>						
					<?php $i++; endforeach ?>
					
					
					<?php  if ($input_plans_options)  : ?>
						
						<tr style="border-bottom-color: #c5c5c5">
							<td class="table-label text-end"><strong>Total des options non caduques</strong></td>
							<td class="text-center align-middle"><strong style="font-weight:500"><?= number_format(100 * $result['more']['nb_options'], 0, ',', ' ')  ?></strong></td>
							<td class="text-center align-middle"><strong style="font-weight:500"><?= number_format(100 * $result['more']['nb_options'] / $result['more']['total_nb_shares_fd'], 1, ',', ' ')  ?>%</strong></td>
						</tr>					
						<?php $i=1; foreach($input_plans_options as $plan_options) : ?>						
							<tr class="small" style="<?= ($i==count($input_plans_options)) ? 'border-bottom:4px double #ccc' : '' ?>">
								<td class="table-label text-end"><?= $plan_options['name'] ?></td>
								<td class="text-center align-middle"><?= number_format(100 * $plan_options['nb_alive_options'], 0, ',', ' ') ?></td>
								<td class="text-center align-middle"><?= number_format(100 * $plan_options['nb_alive_options'] / $result['more']['total_nb_shares_fd'], 1, ',', ' ')  ?>%</td>
							</tr>						
						<?php $i++; endforeach ?>
					<?php else :  ?>					
						<tr style="border-bottom:4px double #ccc">
							<td class="table-label text-end"><strong>Total des options non caduques</strong></td>
							<td class="text-center align-middle"><strong style="font-weight:500">0</strong></td>
							<td class="text-center align-middle"><strong style="font-weight:500">0%</strong></td>
						</tr>					
						
					
					<?php endif ?>
					
					<tr style="border-bottom:4px double #ccc">
						<td class="table-label text-end"><strong style="font-weight:600">Total fully diluted</strong></td>
						<td class="text-center align-middle"><strong><?= number_format(100 * $result['more']['total_nb_shares_fd'], 0, ',', ' ')  ?></strong></td>
						<td class="text-center align-middle"><strong>100%</strong></td>
					</tr>
					
					
					</tbody>
				</table>
			</div>
		</div>
		
		
		<br>
		<br>
		<br>
		<br>
		<br>
		
		
		<header>Prix par action en fonction de la valeur des titres</header>
		
		<br>
		
		<div class="row justify-content-center">
			<div class="col-md-8 text-center text-muted fst-italic">
				<p>Le graphique ci-dessous illustre, pour chaque classe d’actions, l’évolution du prix par action en fonction de la valeur des titres.
				<br>Les actions avec un rang de priorité plus élevé (le rang 1 étant le plus prioritaire) captent en premier la valeur. </p>
				<p>Pour simplifier l’observation, une classe d’actions peut être isolée via le panneau de sélection à droite du graphique.</p>
			</div>
		</div>	
		
		<div class="row">	
			<div class="col-md-12" >
				<canvas id="share_price"></canvas>
			</div>
		</div>
		
		<br>
		<br>
		<br>
		<br>
		<br>
	
		
		
		<header>Valeur des titres par catégorie d’actions</header>
		
		<br>
		
		<div class="row justify-content-center">
			<div class="col-md-8 text-center text-muted fst-italic">
				<p>Le graphique ci-dessous montre l’évolution de la valeur de chaque catégorie d’actions en fonction de la valeur des titres.<br>Cette valeur est calculée en multipliant le nombre d’actions par leur prix unitaire.</p>
				<p>En présence d'options, les petites discontinuités visibles sur la courbe des actions ordinaires correspondent aux points où les options deviennent exerçables. Leur exercice augmente le nombre d’actions, entraînant de fait une hausse de la valeur totale de la catégorie.</p>
			</div>
		</div>	
		
		
		<div class="row">	
			<div class="col-md-12">
				<canvas id="proceeds"></canvas>
			</div>
		</div>
		
		<br>
		<br>
		<br>
		<br>
		<br>
	
		
		<header>Valeur des titres par empilement des catégories d’actions</header>		
		
		<br>
		
		<div class="row justify-content-center">
			<div class="col-md-8 text-center text-muted fst-italic">
				<p>Ce graphique complète le précédent en empilant les courbes des différentes catégories d’actions, offrant ainsi une visualisation claire de la répartition de la valeur des titres entre les classes.</p>
			</div>
		</div>	
		
		<div class="row">	
			<div class="col-md-12">
				<canvas id="proceeds_stacked"></canvas>
			</div>
		</div>
		
		<?php
			add_multiple_scatter_chart('share_price', '', $result['exit_values'], $share_price_plot_series, "Valeur des titres (€)", "Prix par action (€)", false) ;
			add_multiple_scatter_chart('proceeds', '', $result['exit_values'], $proceeds_plot_series, "Valeur des titres (€)", "Valeur de la catégorie de titres (€)", false) ;
			add_multiple_scatter_chart('proceeds_stacked', '', $result['exit_values'], $proceeds_plot_series, "Valeur des titres (€)", "Valeur de la catégorie de titres (€)", false, true) ;
		?>
		
		<?php if ($input_emissions_adp) :  ?>
		
			<br>
			<br>
			<br>
			<br>
			<br>
			<br>
			
			<header>Points de remboursement des différentes catégories d’actions de préférence</header>
			
			<br>

			<div class="row justify-content-center">
				<div class="col-md-8 text-center text-muted fst-italic">
					<p>Le point de remboursement d’une catégorie d’actions correspond au moment où sa préférence financière est intégralement satisfaite. </p>
				</div>
			</div>	
			
			<br>
		
			
			<table class="table">
			  <thead>
				 <tr>
					<th scope="col" style="width:12%"></th>				
					<th scope="col" class="text-center">Rang de liquidation</th>
					<th scope="col" class="text-center">Prix de souscription</th>
					<th scope="col" class="text-center">Type de participation</th>
					<th scope="col" class="text-center">Multiple</th>				
					<th scope="col" class="text-center">Préférence par action</th>
					<th scope="col" class="text-center">Préférence totale</th>
					<th scope="col" class="text-center">Point de remboursement <span style="font-weight:normal">(VT)</span></th>
				 </tr>
			  </thead>
			  <tbody>
			  
				
				<?php foreach($input_emissions_adp as $emission) :  ?>
					
					<tr>
						<td class="table-label"><?= $emission['name'] ?></td>
						<td class="text-center align-middle"><?= $emission['seniority']  ?></td>
						<td class="text-center align-middle"><?= number_format($emission['share_price'], 2, ',', ' ') ?> €</td>
						<td class="text-center align-middle"><?= ($emission['pref_type'] == 'NP') ? 'Non participating' : 'Participating'  ?></td>
						<td class="text-center align-middle"><?= number_format($emission['pref_effective_multiple'], 2, ',', ' ') ?>x</td>
						<td class="text-center align-middle"><?= number_format($emission['pref_share_price'], 2, ',', '&nbsp;') ?>&nbsp;€</td>
						<td class="text-center align-middle"><?= number_format($emission['pref_amount'], 0, ',', '&nbsp;') ?>&nbsp;€</td>
						<td class="text-center align-middle"><strong><?= number_format($pref_shares_refund_breakpoints[$emission['name']], 0, ',', '&nbsp;') ?>&nbsp;€</strong></td>
					</tr>
					
				 <?php endforeach ?>
				
			  </tbody>
			</table>
		
						
		
			<br>
			<br>
			<br>
			<br>
			<br>
			
			<header>Prix par action aux points de remboursement des actions de préférence</header>
		
			<br>

			<div class="row justify-content-center">
				<div class="col-md-8 text-center text-muted fst-italic">
					<p>Les points de remboursement sont des repères clés marquant la satisfaction d’une priorité de remboursement.</p>
					<p>Le prix par action observé à ces seuils illustre les différences de captation de valeur entre les différentes classes d’actions.</p>
				</div>
			</div>	
			
			<br>	
			
			<?php 
				if (count($breakpoints_for_table) < 2)				$table_width = 6;					
				else if (count($breakpoints_for_table) < 4)		$table_width = 8;
				else if (count($breakpoints_for_table) < 6) 		$table_width = 10;
				else															$table_width = 12;
						
			?>
			<div class="row justify-content-center">
				<div class="col-md-<?= $table_width ?>">
					<table class="table">
						<thead>
							<tr>					
								<th scope="col" class="text-end" style="widsth:12%"></th>
							
								<?php foreach ($breakpoints_for_table as $breakpoint) : ?>
									
									<?php
										$share_list = [];
										foreach ($pref_shares_refund_breakpoints as $name => $v)
											if ($v == $breakpoint)
												$share_list[] = $name ;

										if ($share_list[0] != 'all_shares_at_prorata') 	
											$btn_type = "light";					
										else { 
												$btn_type = "success"; 
												$share_list[0] = 'Prorata complet';
										}
									?>
									
									<th scope="col" class="text-center"><button style="border:1px solid #81ad7d !important" type="button" class="mb-2 btn btn-<?= $btn_type ?>">VT&nbsp;=&nbsp;<strong><?= number_format($breakpoint, 0, ',', '&nbsp;') ?>&nbsp;€</strong><br><small><?= implode('<br>', $share_list) ?></small></th>
										
								
								<?php endforeach ?>
							</tr>
						</thead>
						<tbody>				
						
							<?php foreach ($result_at_breakpoints['share_price']['pref_shares'] as $name => $share_prices) :?>
									
									<?php $pref_share = get_sub_array($input_emissions_adp, 'name', $name) ?>
									
									<tr>
										<td class="table-label text-end"><?= $name ?></td>
										<?php foreach ($share_prices as $share_price) : ?>
											
											<?php 
												$css = ($share_price >= $pref_share['pref_share_price']) ? 'text-success' : 'text-danger' ; 
											?>
											<td class="text-center align-middle <?= $css ?>"><?= number_format($share_price, 2, ',', ' ') . '&nbsp;€' ?></td>
										<?php endforeach ?>
									</tr>

							<?php endforeach ?>
							
							<tr>
								<td class="table-label text-end">Actions ordinaires</td>
								<?php $i= 0; foreach ($result_at_breakpoints['share_price']['common_shares'] as $common_share_price) : ?>
									
									<?php 						
										$css = ($result_at_breakpoints['more']['all_shares_at_prorata'][$i]) ? 'text-success' : 'text-danger' ; 
									?>
									<td class="text-center align-middle <?= $css ?>"><?= number_format($common_share_price, 2, ',', ' ') . '&nbsp;€' ?></td>
								<?php $i++; endforeach ?>
							</tr>			

						</tbody>
					</table>
				</div>
			</div>
			
			<br>
			<br>
			<br>
			<br>
			<br>
			
			<header>Valeur totale des différentes catégories d'actions aux points de remboursement</header>
			
			<br>

			<div class="row justify-content-center">
				<div class="col-md-8 text-center text-muted fst-italic">
					<p>Ce tableau, complémentaire du précédent, compare la part de la valeur économique<br>captée par chaque classe d’actions à sa part en nombre dans le capital. </p>
					<p>Les actions de préférence y apparaissent comme valorisées au-delà de leur poids capitalistique,<br>en raison de leurs droits financiers prioritaires.</p>
				</div>
			</div>	
			
			<br>	
			
			
			<div class="row justify-content-center">
				<div class="col-md-<?= min(12, $table_width+1) ?>">
					<table class="table">
						<thead>
							<tr>					
								<th scope="col"  class="text-end"></th>
								<th scope="col"  class="text-center">% Capital FD</th>
								<?php foreach ($breakpoints_for_table as $breakpoint) : ?>
									
									<?php
										$share_list = [];
										foreach ($pref_shares_refund_breakpoints as $name => $v)
											if ($v == $breakpoint)
												$share_list[] = $name ;

										if ($share_list[0] != 'all_shares_at_prorata') 	
											$btn_type = "light";					
										else { 
												$btn_type = "success"; 
												$share_list[0] = 'Prorata complet';
										}
									?>
									
									<th scope="col" class="text-center" style="borsder:none"><button style="border:1px solid #81ad7d !important" type="button" class="mb-2 btn btn-<?= $btn_type ?>">VT&nbsp;=&nbsp;<strong><?= number_format($breakpoint, 0, ',', '&nbsp;') ?>&nbsp;€</strong><br><small><?= implode('<br>', $share_list) ?></small></th>
										
								
								<?php endforeach ?>
							</tr>
						</thead>
						<tbody>				
						
							<?php foreach ($result_at_breakpoints['proceeds']['pref_shares'] as $name => $amounts) :?>
									
									<?php $pref_share = get_sub_array($input_emissions_adp, 'name', $name) ?>
									<tr>
										<td class="table-label align-middle text-end"><?= $name ?></td>
										<td class="text-center align-middle"><small><?= number_format(100 * $pref_share['nb_shares'] / $result_at_breakpoints['more']['total_nb_shares_fd'], 1, '.', ' ') ?>%</small></td>
										
										<?php $i= 0; foreach ($amounts as $amount) : ?>
											
											<?php 
												$css = ($amount >= $pref_share['pref_amount']) ? 'text-success' : 'text-danger' ; 
												$percent = $amount / ($result_at_breakpoints['exit_values'][$i] + $result_at_breakpoints['more']['options_exercise_proceeds'][$i]);
											?>
											<td class="text-center align-middle <?= $css ?>"><?=  number_format($amount, 0, ',', ' ') . '&nbsp;€' ?><br><small class="text-muted"><?=  number_format(100*$percent, 1, '.', ' ')?>%</small></td>
										<?php $i++; endforeach ?>
									</tr>

							<?php endforeach ?>
							
							<tr>
								<td class="table-label align-middle text-end">Actions ordinaires</td>
								<td class="text-center align-middle"><small><?= number_format(100 * $result_at_breakpoints['more']['nb_common_shares_fd'] / $result_at_breakpoints['more']['total_nb_shares_fd'], 1, '.', ' ') ?>%</small></td>
								<?php $i= 0; foreach ($result_at_breakpoints['proceeds']['common_shares'] as $amount) : ?>
									
									<?php 						
										$css = ($result_at_breakpoints['more']['all_shares_at_prorata'][$i]) ? 'text-success' : 'text-danger' ; 
										$percent = $amount / ($result_at_breakpoints['exit_values'][$i] + $result_at_breakpoints['more']['options_exercise_proceeds'][$i]);
									?>
									<td class="text-center align-middle <?= $css ?>"><?= number_format($amount, 0, ',', ' ') . '&nbsp;€' ?><br><small class="text-muted"><?=  number_format(100*$percent, 1, '.', ' ')?>%</small></td>
								<?php $i++; endforeach ?>
							</tr>			

						</tbody>
					</table>
				</div>
			</div>
		
		
		<?php endif ?>
		
			
	
		<?php if ($input_plans_options) : ?>	
			
			<br>
			<br>
			<br>
			<br>
			<br>
			
			<header>Points d'exercice des options</header>
			
			<br>

			<div class="row justify-content-center">
				<div class="col-md-7 text-center text-muted fst-italic">
					<p>Le point d’exercice d’une option correspond au seuil à partir duquel son exercice devient économiquement avantageux, c’est-à-dire lorsque le prix de revente de l’action couvre au moins son prix d’achat ou prix d’exercice.</p>
					<p>Le tableau ci-dessous indique, pour chaque catégorie d’options, la valeur des titres à partir de laquelle les options deviennent “dans la monnaie”.</p>
				</div>
			</div>	
			
			<br>	
			<div class="row justify-content-center">
				<div class="col-md-8">
					<table class="table">
					  <thead>
						 <tr>
							<th scope="col"></th>					
							<th scope="col" class="text-center">Prix d'exercice</th>
							<th scope="col" class="text-center">Nombre d'options exerçables</th>
							<th scope="col" class="text-center">Point d'exercice <span style="font-weight:normal">(VT)</span></th>
							
						 </tr>
					  </thead>
					  <tbody>
						
						<?php foreach($input_plans_options as $plan) : ?>
							
							<tr>
								<td class="table-label"><?= $plan['name'] ?></td>						
								<td class="text-center align-middle"><?= number_format($plan['strike'], 2, ',', ' ') ?> €</td>					
								<td class="text-center align-middle"><?= number_format($plan['nb_alive_options'], 0, ',', ' ') ?></td>					
								<td class="text-center align-middle"><strong><?= number_format($result['options_exercise_points'][$plan['name']] , 0, ',', ' ') ?> €</strong></td>					
									
							</tr>
							
						 <?php endforeach ?>
						
					  </tbody>
					</table>
				</div>
			</div>
		<?php endif ?>
	
		
		<br>
		<br>
		
		<p class="text-center mt-5">
			<a href="<?= $edit_inputs_url ?>" class="btn btn-light" style="padding:13px"><i class="bi bi-pencil-square"></i></i>&nbsp; Modifier les inputs</a>
		</p>	
		<br>
		
	<?php endif ?>
	
	
	<?php 	
		// historique des simulations de la plus récente à la plus ancienne
		
		$simulations_history = [];
		
		if (isset($_SESSION['simulations_history'])) {					
			
			$simulations_history = $_SESSION['simulations_history'];
			
			// Si on vient de soumettre la simulation, c'est ce qui est affiché à présent donc on la supprimer de la liste
			if (isset($_GET['submitted']) && !isset($_GET['edit_inputs']))
				array_pop($simulations_history);
			
			// la dernière en premier
			$simulations_history = array_reverse($simulations_history);			
					
		}
	
	?>
	
	<?php if ($simulations_history) : ?>	
		
		<br>
		<br>
		<hr>
		
		<header class="text-start mt-4"><small>Vos dernières simulations</small></header>		
		
		<small>
		<ul>
		<?php foreach ($simulations_history as $simulation_url) : ?>
					
			<?php
			
			// Extraire la partie query de l'URL
			$parsed_url = parse_url($simulation_url);
			$query_string = $parsed_url['query'];

			// Parser la query string en un tableau comme $_GET
			parse_str($query_string, $params);						
		
			?>				
			<li>
				<p class="mt-4">
				
						<strong><?= $params['company_name'] ?></strong> 						
						
						<?php
							for ($i=0; $i<count($params['ao_emission_name']); $i++) 									
								echo '<br>' . $params['ao_emission_name'][$i] . ' : ' . $params['ao_emission_nb_shares'][$i] . ' @ ' . $params['ao_emission_share_price'][$i]  . '€';
						
						?>				
						
						<?php
						
							if (isset($params['emission_name'])) {
								for ($i=0; $i<count($params['emission_name']); $i++) {

									$multiple_display = '';
									if ($params['emission_pref_multiple'][$i])
										$multiple_display .= $params['emission_pref_multiple'][$i] . 'x';
									
									if ($params['emission_pref_multiple'][$i] && $params['emission_pref_tri'][$i] )
										$multiple_display .= '-';
									
									if ($params['emission_pref_tri'][$i])
										$multiple_display .= $params['emission_pref_tri'][$i]. '%';
									
									
									echo '<br>' . $params['emission_name'][$i] . ' (rang '.$params['emission_seniority'][$i].') : ' . $params['emission_nb_shares'][$i] . ' @ ' . $params['emission_share_price'][$i]  . '€ ' . $params['emission_pref_type'][$i] . ' ' . $multiple_display ;
								}
							}
													
						?>							
						<?php if ($params['exit_date']) : ?>
							<br>Date cession : <?= date("d/m/Y", strtotime($_GET['exit_date'])) ?>
						<?php endif ?>
						<br>Carve-out : <?= $params['carve_out'] ? $params['carve_out'] : 0 ?>% 							
						<?php if (isset($params['plan_option_name'])) : ?>
							<?php
								for ($i=0; $i<count($params['plan_option_name']); $i++) {									
									echo '<br>' . $params['plan_option_name'][$i] . ' : ' . $params['plan_option_nb_options'][$i] . ($params['plan_option_dead_options'][$i] ? (' - '. $params['plan_option_dead_options'][$i]) : ''). ' @ ' . $params['plan_option_strike'][$i]  . '€';
								}
							?>							
						<?php endif ?>
						<br><a href="<?= $simulation_url ?>">Recharger la simulation</a>
				
				</p>
			</li>
		
			
		<?php endforeach ?>
		</ul>
		</small>
		
		
	<?php endif ?>
	
</div>	

<?php require_once('footer.php') ?>

