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

$username = $_POST["username"];
$password = $_POST["password"];

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header("Access-Control-Allow-Headers: X-Requested-With");

// login validation
$SQL_CON = mysqli_connect('localhost', 'root', '', 'bambilite');
$SQL_QUERY = "SELECT name,username,password,language,version,theme,email,profilepic,cookie,failedattempts,active,favourites FROM users WHERE username = '" . $username . "'";
$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

// default invalid state
$login_object = [
	"validLogin" => false,
	"userSettings" => [],
	"details" => "invalid"
];

// no user found credentials
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

// wrong password
if ($login_object["userSettings"]["password"] !== $password) {

	if ($login_object["userSettings"]["failedattempts"] >= 3) {


		$SQL_QUERY = "UPDATE users SET active = 0 WHERE username = '" . $username . "'";
		$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

		// error checking on users update
		if (mysqli_affected_rows($SQL_CON) !== 1) {
			$login_object["details"] = "onlock";

			array_splice($login_object, 1, -1); //removing userSettings
			echo json_encode($login_object);
			mysqli_close($SQL_CON);
			return;
		}

		$login_object["details"] = "locked";
		array_splice($login_object, 1, -1); //removing userSettings
		echo json_encode($login_object);
		mysqli_close($SQL_CON);
		return;
	}

	$totalAttempts = intval($login_object["userSettings"]["failedattempts"]) + 1;

	$SQL_QUERY = "UPDATE users SET failedattempts = " . $totalAttempts . " WHERE username = '" . $username . "'";
	$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

	// error checking on users update
	if (mysqli_affected_rows($SQL_CON) !== 1) {
		$login_object["details"] = "newattempt";
		array_splice($login_object, 1, -1); //removing userSettings
		echo json_encode($login_object);
		mysqli_close($SQL_CON);
		return;
	}


	array_splice($login_object, 1, -1); //removing userSettings
	echo json_encode($login_object);
	mysqli_close($SQL_CON);
	return;
}

// cookie generator
$newcookie = CookieGenerator();

// cookie update
$SQL_QUERY = "UPDATE users SET cookie = '" . $newcookie . "' WHERE username = '" . $username . "'";
$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

// error checking on users update
if (mysqli_affected_rows($SQL_CON) !== 1) {
	$login_object["details"] = "cookiegeneration";
	array_splice($login_object, 1, -1); //removing userSettings
	echo json_encode($login_object);
	mysqli_close($SQL_CON);
	return;
}

// login attempts reset
if (intval($login_object["userSettings"]["failedattempts"]) !== 0) {

	$SQL_QUERY = "UPDATE users SET failedattempts = 0 WHERE username = '" . $username . "'";
	$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

	// error checking on users update
	if (mysqli_affected_rows($SQL_CON) !== 1) {
		$login_object["details"] = "attemptsreset";
		array_splice($login_object, 1, -1); //removing userSettings
		echo json_encode($login_object);
		mysqli_close($SQL_CON);
		return;
	}
}

// unsetting active / loginattempts
unset($login_object["userSettings"]['failedattempts'], $login_object["userSettings"]['active'], $login_object["userSettings"]['password']);

$login_object["userSettings"]["cookie"] = $newcookie;
$login_object["userSettings"]["favourites"] = json_decode($login_object["userSettings"]["favourites"]);
$login_object["validLogin"] = true;
$login_object["details"] = "";

echo json_encode($login_object);
mysqli_close($SQL_CON);