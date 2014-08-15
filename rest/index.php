<?php

$filepath = "../data/stickies";

if (!file_exists($filepath)) {
	$temp = fopen($filepath, 'w');
}

$stickies = unserialize(file_get_contents($filepath));
if($stickies === false) {
	$stickies = array();
}

if(isset($_GET['id'])) {
	$id = $_GET['id'];

	switch($_GET['r']) {
		case 'new':
			$stickies[$id] = array('x' => $_GET['x'], 'y' => $_GET['y'], 'content' => urldecode($_GET['c']));
			break;
		case 'edit':
			$stickies[$id]['content'] = urldecode($_GET['c']);
			break;
		case 'move':
			$stickies[$id]['x'] = $_GET['x'];
			$stickies[$id]['y'] = $_GET['y'];
			break;
		case 'delete':
			unset($stickies[$id]);
			break;
	}

	file_put_contents($filepath, serialize($stickies));
}

echo json_encode($stickies);
die;

?>