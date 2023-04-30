<?php

$username = $_POST["username"];
$cookie = $_POST["cookie"];

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header("Access-Control-Allow-Headers: X-Requested-With");

$SQL_CON = mysqli_connect('localhost', 'root', '', 'bambilite');


// $SQL_QUERY = "SELECT features FROM users WHERE username = '" . $username . "' AND cookie = '" . $cookie . "'"; // defaults

// //error fetching user premissions menus
// if (mysqli_num_rows($SQL_RUN) !== 1) {
// 	$login_object["details"] = "user menu access";
// 	array_splice($login_object, 1, -1); //removing userSettings
// 	echo json_encode($login_object);
// 	mysqli_close($SQL_CON);
// 	return;
// }

// checking for freatures
// while ($SQL_RESULT_ROW = mysqli_fetch_assoc($SQL_RUN)) {
// 	$isTrainer = str_contains($SQL_RESULT_ROW["features"], 'trainer');
// }
$isTrainer = true;


// MENU BUILDER
$SQL_QUERY = "SELECT title,id,icon,route,haschild from MENUS WHERE mainentry = 1 AND ( defaults = 1 )"; // defaults

if ($isTrainer) {
	$SQL_QUERY = substr_replace($SQL_QUERY, "", -1); //trailling parenteses
	$SQL_QUERY .= "OR trainer = 1 )";
} // if special user

$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

//error fetching default menus
if (mysqli_num_rows($SQL_RUN) !== 1) {
	$login_object["details"] = "menu fetching";
	array_splice($login_object, 1, -1); //removing userSettings
	echo json_encode($login_object);
	mysqli_close($SQL_CON);
	return;
}

$login_object["userSettings"]["menus"] = [];

// main entries
while ($SQL_RESULT_ROW = mysqli_fetch_assoc($SQL_RUN)) {
	$login_object["userSettings"]["menus"] = $SQL_RESULT_ROW;
}

// subentries
foreach ($login_object["userSettings"]["menus"] as &$mainmenu) {
	$mainmenu["subEntries"] = [];

	if (boolval($mainmenu["haschild"])) {
		$SQL_QUERY = "SELECT title,id,route from MENUS WHERE mainentry = 0 AND parent = '" . $mainmenu["id"] . "' AND ( defaults = 1 )";  //defaults
		if ($isTrainer) {
			$SQL_QUERY = substr_replace($SQL_QUERY, "", -1); //trailling parenteses
			$SQL_QUERY .= "OR trainer = 1 )";
		}		//if special user
		$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

		// creating sub entries for the respective main entry
		while ($SQL_RESULT_ROW = mysqli_fetch_assoc($SQL_RUN)) {
			$mainmenu["subEntries"] = $SQL_RESULT_ROW;
		}
	};
	unset($mainmenu["haschild"]);
}

//colunas sql para menu builder
//title, id, icon, route, mainentry, haschild, defaults, trainer
//                     se  ^ = 0,      ^ = 0 de obriga
//                                                ^    e    ^, apenas um pode ser verdadeiro

// colunas sql para user
// features