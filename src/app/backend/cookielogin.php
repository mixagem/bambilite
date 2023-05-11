<?php

function CookieGenerator($stampsize = 25)
{
	$chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	$charsLen = strlen($chars);
	$randomString = '';
	for ($i = 0; $i < $stampsize; $i++) {
		$randomString .= $chars[random_int(0, $charsLen - 1)];
	}
	return $randomString;
}

$cookie = str_replace("'","''",$_POST["cookie"]);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header("Access-Control-Allow-Headers: X-Requested-With");

$SQL_CON = mysqli_connect('localhost', 'root', '', 'bambilite');
$SQL_QUERY = "SELECT name,username,language,version,theme,email,profilepic,cookie,favourites,active FROM users WHERE cookie = '" . $cookie . "'";
$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

$login_object = [
	"validLogin" => false,
	"userSettings" => [],
	"details" => "expired"
];

// checking if cookie is valid
if (mysqli_num_rows($SQL_RUN) !== 1) {
	echo json_encode($login_object);
	mysqli_close($SQL_CON);
	return;
}

// fetching user data
while ($SQL_RESULT_ROW = mysqli_fetch_assoc($SQL_RUN)) {
	$login_object["userSettings"] = $SQL_RESULT_ROW;
}

// account locked
if ($login_object["userSettings"]["active"] == false) {
	$login_object["details"] = "locked";
	array_splice($login_object, 1, -1); //removing userSettings
	echo json_encode($login_object);
	mysqli_close($SQL_CON);
	return;
}

// cookie generator
$newcookie = CookieGenerator();

// cookie update
$SQL_QUERY = "UPDATE users SET cookie = '" . $newcookie . "' WHERE cookie = '" . $cookie . "'";
$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

// error checking on users update
if (mysqli_affected_rows($SQL_CON) !== 1) {
	$login_object["details"] = "cookiegeneration";
	array_splice($login_object, 1, -1); //removing userSettings
	echo json_encode($login_object);
	mysqli_close($SQL_CON);
	return;
}

// final wrap-up
unset($login_object["userSettings"]['active']);
$login_object["validLogin"] = true;
$login_object["details"] = "valid";
$login_object["userSettings"]["cookie"] = $newcookie;
$login_object["userSettings"]["favourites"] = json_decode($login_object["userSettings"]["favourites"]);
echo json_encode($login_object);
mysqli_close($SQL_CON);