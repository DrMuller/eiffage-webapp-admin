<?php 
function add_chart($type, $id, $title, $labels, $values, $x_axis_label, $y_axis_label, $color) { ?>

	<script>
		const data_<?= $id ?> = {
			labels: ['<?= implode("','",$labels) ?>'],
			datasets: [{
				backgroundColor: '<?= $color ?>',
				borderColor: '<?= $color ?>',	
				data: [<?= implode(',',$values) ?>],
			}]
		};

		const config_<?= $id ?> = {
			type: '<?= $type ?>',
			data: data_<?= $id ?>,
			options: {
				animation: {
					duration: 1400,
				},
				plugins: {
					title: {
							 display: true,
							 text: '<?= $title ?>',
							 font: { size: 16, weight: 'normal'},
							 padding: 18,
							 color: '#333'
						},
					legend: {
						 display: false
					}		
				},
				scales: {
					x: {
						title: {
							display: <?= $x_axis_label ? 'true' : 'false'?>,
							text: '<?= $x_axis_label ?>',
							font: {size: 14},
						}
					},
					y: {
						title: {
							display: <?= $y_axis_label ? 'true' : 'false'?>,
							text: '<?= $y_axis_label ?>',
							font: {size: 14},
						}
					} 
				}
			}
		};
		
		const <?= $id ?> = new Chart(document.getElementById('<?= $id ?>'), config_<?= $id ?>);
							
	</script>

<?php } ?>


<?php 
function add_stacked_bar_chart($id, $title, $labels, $series, $x_axis_label, $y_axis_label) { ?>

	<script>
		const data_<?= $id ?> = {
			labels: ['<?= implode("','",$labels) ?>'],
			datasets: [
			<?php foreach ($series as $label => $this_series) : ?>
				{
					label: '<?= $label ?>',
					data: [<?= implode(',',$this_series['value']) ?>],
					backgroundColor: '<?= $this_series['color'] ?>',
				},
			<?php endforeach ?>
			]
		};

		const config_<?= $id ?> = {
			type: 'bar',
			data: data_<?= $id ?>,
			options: {
				animation: {
					duration: 1400,
				},
				plugins: {
					title: {
							 display: true,
							 text: '<?= $title ?>',
							 font: { size: 16, weight: 'normal'},
							 padding: 6,
							 color: '#333'
						},
					legend: {
						 display: true,
						 position: 'top'
					}
				},
				scales: {
					x: {
						stacked: true,
						title: {
							display: <?= $x_axis_label ? 'true' : 'false'?>,
							text: '<?= $x_axis_label ?>',
							font: {size: 14},
						}
					},
					y: {
						stacked: true,
						title: {
							display: <?= $y_axis_label ? 'true' : 'false'?>,
							text: '<?= $y_axis_label ?>',
							font: {size: 14},
						}
					} 
				}
			}
		};
		
		const <?= $id ?> = new Chart(document.getElementById('<?= $id ?>'), config_<?= $id ?>);
							
	</script>

<?php } ?>


	
<?php 
// $series = array( label_1 => array('values' => array(values_1), 'color' => #000)
function add_multiple_chart($type, $id, $title, $labels, $series, $x_axis_label, $y_axis_label, $display_points = true) { ?>

	<script>
		const data_<?= $id ?> = {
			labels: ['<?= implode("','",$labels) ?>'],	
			datasets: [
			<?php foreach($series as $label => $this_series) : ?>
				{
					label : '<?= $label ?>',
					backgroundColor: '<?= $this_series['color'] ?>',
					borderColor: '<?= $this_series['color'] ?>',	
					data: [<?= implode(',',$this_series['values']) ?>],
					borderWidth: 2.25,
					<?= $display_points ? '' : 'pointRadius: 0' ?>
					
				},
			<?php endforeach ?>
			]
		};

		const config_<?= $id ?> = {
			type: '<?= $type ?>',
			data: data_<?= $id ?>,
			options: {
				animation: {
					duration: 1400,
				},
				plugins: {
					title: {
							 display: true,
							 text: '<?= $title ?>',
							 font: { size: 16, weight: 'normal'},
							 padding: 18,
							 color: '#333'
						},
					legend: {
						 display: true,
						 position: 'right'
					}		
				},
				scales: {
					x: {
						title: {
							display: <?= $x_axis_label ? 'true' : 'false'?>,
							text: '<?= $x_axis_label ?>',
							font: {size: 14},
						}
					},
					y: {
						title: {
							display: <?= $y_axis_label ? 'true' : 'false'?>,
							text: '<?= $y_axis_label ?>',
							font: {size: 14},
						}
					} 
				}
			}
		};
		
		const <?= $id ?> = new Chart(document.getElementById('<?= $id ?>'), config_<?= $id ?>);
							
	</script>

<?php } ?>




<?php 
// SCATTER PLOT, indispensable si les x sont pas espacés régulièrement + bien meilleur pour l'affichage de l'échelle des abscisses.
// $x : tableau des abscisses.
// $series = array( label_1 => array('values' => array(values_1), 'color' => '#000', 'line_width' => '1.75', 'dash' => '[10, 10]')
// les arguments 'line_width' et 'dash' sont optionnels
function add_multiple_scatter_chart($id, $title, $x, $y_series, $x_axis_label, $y_axis_label, $display_points = true, $stacked = false) { ?>
	
	<script>
		const data_<?= $id ?> = {
		
			datasets: [
			<?php foreach($y_series as $label => $this_series) :		
				$data = array();
				for ($i=0; $i<count($x); $i++) 
					if ($this_series['values'][$i] !== '') // si pas de valeur dans y on ne met pas de x
						$data[] = '{x: '.$x[$i].', y: '.$this_series['values'][$i].'}';			
			?>			
				{
					label : '<?= $label ?>',
					backgroundColor: '<?= $this_series['color'] ?>',
					borderColor: '<?= $this_series['color'] ?>',	
					data: [<?= implode(', ', $data) ?>],
					<?php if (array_key_exists('line_width', $this_series)) : ?>
					borderWidth: <?= $this_series['line_width'] ?>,
					<?php else: ?>
					borderWidth: 1.75,
					<?php endif ?>
					<?php if (array_key_exists('dash', $this_series)) : ?>
					borderDash: <?= $this_series['dash'] ?>,
					<?php endif ?>
					<?= $display_points ? '' : 'pointRadius: 0' ?>,
					showLine: true,
					//tension: 0.5,
					<?= $stacked ? 'fill: true' : '' ?>
				},
			<?php endforeach ?>
			]
		};

		const config_<?= $id ?> = {
			type: 'scatter',
			data: data_<?= $id ?>,
			options: {
				animation: {
					duration: 1400,
				},
				plugins: {
					title: {
							 display: true,
							 text: '<?= $title ?>',
							 font: { size: 16, weight: 'normal'},
							 padding: 18,
							 color: '#333'
						},
					legend: {
						 display: true,
						 position: 'right'
					},
					
				},
				scales: {
					x: {
						min: <?= $x[0] ?>,
						max: <?= end($x) ?>,
						title: {
							display: <?= $x_axis_label ? 'true' : 'false'?>,
							text: '<?= $x_axis_label ?>',
							font: {size: 14},
						}
					},
					y: {
						<?= $stacked ? 'stacked: true,' : '' ?> 
						title: {
							display: <?= $y_axis_label ? 'true' : 'false'?>,
							text: '<?= $y_axis_label ?>',
							font: {size: 14},
						}
					} 
				}
			}
		};
		
		const <?= $id ?> = new Chart(document.getElementById('<?= $id ?>'), config_<?= $id ?>);
							
	</script>

<?php } ?>