<?php

if(!isset($_POST["username"]) || !isset($_POST["cookie"]) ){return;}

$username = $_POST["username"];
$cookie = $_POST["cookie"];

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header("Access-Control-Allow-Headers: X-Requested-With");

$SQL_CON = mysqli_connect('localhost', 'root', '', 'bambilite');

$menu_object = [
	"sucess" => true,
	"menus" => []
];

$SQL_QUERY = "SELECT features FROM users WHERE username = '" . $username . "' AND cookie = '" . $cookie . "'"; // defaults
$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

//error fetching user premissions menus
if (mysqli_num_rows($SQL_RUN) !== 1) {
	$menu_object["sucess"] = false;
	$menu_object["details"] = "user menu access";
	array_splice($menu_object, 1, -1); //removing userSettings
	echo json_encode($menu_object);
	mysqli_close($SQL_CON);
	return;
}

// checking for freatures
while ($SQL_RESULT_ROW = mysqli_fetch_assoc($SQL_RUN)) {
	$isTrainer = str_contains($SQL_RESULT_ROW["features"], 'trainer');
}

//development override
$isTrainer = true;

// MENU BUILDER
$SQL_QUERY = "SELECT title,id,icon,route,haschild from MENUS WHERE mainentry = 1 AND ( coremenu = 1 )"; // defaults

if ($isTrainer) {
	$SQL_QUERY = substr_replace($SQL_QUERY, "", -1); //trailling parenteses
	$SQL_QUERY .= "OR features like '%trainer%' )";
} // if special user

$SQL_QUERY .= " ORDER BY position";
$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

//error fetching default menus
if (mysqli_num_rows($SQL_RUN) === 0) {
	$menu_object["sucess"] = false;
	$menu_object["details"] = "menu fetching";
	array_splice($menu_object, 1, -1); //removing userSettings
	echo json_encode($menu_object);
	mysqli_close($SQL_CON);
	return;
}

$menu_object["menus"] = [];

// main entries
while ($SQL_RESULT_ROW = mysqli_fetch_assoc($SQL_RUN)) {
	array_push($menu_object["menus"], $SQL_RESULT_ROW);
}

// subentries
foreach ($menu_object["menus"] as &$mainmenu) {

	$mainmenu["subEntries"] = [];
	if (boolval($mainmenu["haschild"])) {
		$SQL_QUERY = "SELECT title,id,route from MENUS WHERE mainentry = 0 AND parent = '" . $mainmenu["id"] . "' AND ( coremenu = 1 )";  //defaults

		if ($isTrainer) {
			$SQL_QUERY = substr_replace($SQL_QUERY, "", -1); //trailling parenteses
			$SQL_QUERY .= "OR features like '%trainer%' )";
		}

		$SQL_QUERY .= " ORDER BY position";
		$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);
		//error fetching submenus
		if (mysqli_num_rows($SQL_RUN) === 0) {
			$menu_object["sucess"] = false;
			$menu_object["details"] = "submenu fetching";
			array_splice($menu_object, 1, -1); //removing userSettings
			echo json_encode($menu_object);
			mysqli_close($SQL_CON);
			return;
		}

		// creating sub entries for the respective main entry
		while ($SQL_RESULT_ROW = mysqli_fetch_assoc($SQL_RUN)) {
			array_push($mainmenu["subEntries"], $SQL_RESULT_ROW);
		}
	}
	unset($mainmenu["haschild"]);
}

echo json_encode($menu_object);
mysqli_close($SQL_CON);