<?php

if(!isset($_POST["username"]) || !isset($_POST["cookie"]) ){return;}

$username = $_POST["username"];
$cookie = $_POST["cookie"];

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header("Access-Control-Allow-Headers: X-Requested-With");


$SQL_CON = mysqli_connect('localhost', 'root', '', 'bambilite');
$SQL_QUERY = "SELECT sessionticks FROM users WHERE username = '" . $username . "' AND cookie = '" . $cookie . "'";
$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

// no user found credentials
if (mysqli_num_rows($SQL_RUN) !== 1) {
	echo false;
	mysqli_close($SQL_CON);
	return;
}

// fetching current ticks
while ($SQL_RESULT_ROW = mysqli_fetch_assoc($SQL_RUN)) {
	$current_tickets = intval($SQL_RESULT_ROW["sessionticks"]) + 1;
}

// update tickss
$SQL_CON = mysqli_connect('localhost', 'root', '', 'bambilite');
$SQL_QUERY = "UPDATE users SET sessionticks = " . $current_tickets . " WHERE username = '" . $username . "' AND cookie = '" . $cookie . "'";
$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

// error checking on users update
if (mysqli_affected_rows($SQL_CON) !== 1) {
	echo false;
	mysqli_close($SQL_CON);
	return;
}

echo true;
mysqli_close($SQL_CON);
