<?php

$username = $_POST["username"];
$cookie = $_POST["cookie"];
$version = $_POST["version"];

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header("Access-Control-Allow-Headers: X-Requested-With");

// login validation
$SQL_CON = mysqli_connect('localhost', 'root', '', 'bambilite');
$SQL_QUERY = "UPDATE users SET version = '" . $version . "' WHERE username = '" . $username . "' AND cookie = '" . $cookie . "'";
$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

// error checking on users update
if (mysqli_affected_rows($SQL_CON) !== 1) {
	echo false;
	mysqli_close($SQL_CON);
	return;
}

echo true;
mysqli_close($SQL_CON);
