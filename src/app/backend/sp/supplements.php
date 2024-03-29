<?php

//gestão de suplementos
//

/*

tabelas sql - suplements c/c
quantidade entrada
quantidade saída
data adquisição -
data validade -
preço


campos virutais suplements

	snapshot com validades
*/


if (!isset($_POST["operation"]) || !isset($_POST["owner"]) || !isset($_POST["cookie"])) {
	return;
}

$operation = $_POST["operation"];
$owner = $_POST["owner"];
$cookie = $_POST["cookie"];

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header("Access-Control-Allow-Headers: X-Requested-With");

$SQL_CON = mysqli_connect('localhost', 'root', '', 'bambilite');

function LeggeraStamp()
{
	$microtime = microtime();
	$arrray = explode(" ", $microtime);
	$milisec = floatval($arrray[0]);
	$milliPart = substr(strval($milisec), 2);
	$stampsize = 3;
	$chars = '0123456789';
	$charsLen = strlen($chars);
	$randomString = '';
	for ($i = 0; $i < $stampsize; $i++) {
		$randomString .= $chars[random_int(0, $charsLen - 1)];
	}
	$fillerPart = $randomString;
	return "bl" . date("YmdHis") . $milliPart . $fillerPart;
}

function LeggeraError($object, $con, $details)
{
	$object["details"] = $details;
	echo json_encode($object);
	mysqli_close($con);
}

function LeggeraSucess($object, $con, $details = "")
{
	$object["sucess"] = true;
	$object["details"] = $details;
	echo json_encode($object);
	mysqli_close($con);
}

function sanitizeInput($input)
{
	return str_replace("'", "''", $input);
}


$record_object = ["sucess" => false, "details" => ""];

$SQL_QUERY = "SELECT name FROM users WHERE username = '" . $owner . "' AND cookie = '" . $cookie . "'";
$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

if (mysqli_affected_rows($SQL_CON) !== 1) {
	LeggeraError($record_object, $SQL_CON, "security");
	return;
}

switch ($operation) {

	case 'getlist':
		$SQL_QUERY = "SELECT stamp,title,image,tags FROM supplements WHERE owner = '" . $owner . "' OR public = 1 ORDER BY timestamp desc";
		$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

		if (mysqli_num_rows($SQL_RUN) === 0) {
			LeggeraError($record_object, $SQL_CON, "no-records-found");
			return;
		}

		$record_object["recordList"] = [];
		while ($SQL_RESULT_ROW = mysqli_fetch_assoc($SQL_RUN)) {
			if ($SQL_RESULT_ROW["tags"] !== ""){
				$SQL_RESULT_ROW["tags"] = explode(",", $SQL_RESULT_ROW["tags"]);
			};
			array_push($record_object["recordList"], $SQL_RESULT_ROW);
		}

		LeggeraSucess($record_object, $SQL_CON);
		return;

	case 'getqueriedlist':

		if (!isset($_POST["query"])) {
			LeggeraError($record_object, $SQL_CON, "no-query-provided");
			return;
		}

		$query = strtolower($_POST["query"]);
		$query = sanitizeInput($query);
		$OR_CLAUSE = "LOWER(title) LIKE '%" . $query . "%' OR LOWER(tags) LIKE '%" . $query . "%'";

		if (is_numeric($query)) {
			$OR_CLAUSE .= " OR kcal LIKE '%" . $query . "%' OR unitvalue LIKE '%" . $query . "%' OR price LIKE '%" . $query . "%'";
		}

		$SQL_QUERY = "SELECT stamp,title,image,tags FROM supplements WHERE ( " . $OR_CLAUSE . " ) AND ( owner = '" . $owner . "' OR public = 1 ) ORDER BY timestamp desc";
		$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

		if (mysqli_num_rows($SQL_RUN) === 0) {
			LeggeraError($record_object, $SQL_CON, "no-records-found");
			return;
		}

		$record_object["recordList"] = [];
		while ($SQL_RESULT_ROW = mysqli_fetch_assoc($SQL_RUN)) {
			if ($SQL_RESULT_ROW["tags"] !== ""){
				$SQL_RESULT_ROW["tags"] = explode(",", $SQL_RESULT_ROW["tags"]);
			};
			array_push($record_object["recordList"], $SQL_RESULT_ROW);
		}

		LeggeraSucess($record_object, $SQL_CON);
		return;

	case 'getdetails':

		if (!isset($_POST["stamp"])) {
			LeggeraError($record_object, $SQL_CON, "no-stamp-provided");
			return;
		}

		$srecordstamp = $_POST["stamp"];
		$SQL_QUERY = "SELECT * FROM supplements WHERE stamp = '" . $srecordstamp . "'";
		$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

		if (mysqli_num_rows($SQL_RUN) !== 1) {
			LeggeraError($record_object, $SQL_CON, "no-records-found");
			return;
		}

		$record_object["recordDetails"] = [];
		while ($SQL_RESULT_ROW = mysqli_fetch_assoc($SQL_RUN)) {
			if ($SQL_RESULT_ROW["tags"] !== ""){
				$SQL_RESULT_ROW["tags"] = explode(",", $SQL_RESULT_ROW["tags"]);
			};
			$record_object["recordDetails"] = $SQL_RESULT_ROW;
			$record_object["recordDetails"]["inactive"] = boolval($record_object["recordDetails"]["inactive"]);
			$record_object["recordDetails"]["public"] = boolval($record_object["recordDetails"]["public"]);
		}

		$record_object["recordDetails"]["recipelist"] = [];

		$SQL_QUERY = "SELECT recipestamp FROM recipemats WHERE originstamp = '" . $record_object["recordDetails"]["stamp"] . "'";
		$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

		if (mysqli_num_rows($SQL_RUN) === 0) {
			LeggeraSucess($record_object, $SQL_CON);
			return;
		}

		$IN_CLAUSE = "";
		while ($SQL_RESULT_ROW = mysqli_fetch_assoc($SQL_RUN)) {
			$IN_CLAUSE .= "'" . $SQL_RESULT_ROW["recipestamp"] . "',";
		}
		$IN_CLAUSE = substr_replace($IN_CLAUSE, "", -1);

		$SQL_QUERY = "SELECT stamp as recipestamp, title, kcal, unit, unitvalue, price, owner FROM recipes WHERE stamp IN (" . $IN_CLAUSE . ")";
		$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

		if (mysqli_num_rows($SQL_RUN) === 0) {
			LeggeraError($record_object, $SQL_CON, "error-fetching-recipelist");
			return;
		}

		while ($SQL_RESULT_ROW = mysqli_fetch_assoc($SQL_RUN)) {
			array_push($record_object["recordDetails"]["recipelist"], $SQL_RESULT_ROW);
		}

		LeggeraSucess($record_object, $SQL_CON);
		return;

	case 'update':

		if (!isset($_POST["record"])) {
			LeggeraError($record_object, $SQL_CON, "no-supplement-provided");
			return;
		}

		$record = json_decode($_POST["record"], true);
		if ($record["tags"] !== "") {
			$record["tags"] = implode(",", $record["tags"]);
		};

		if ($record['inactive'] == '') {
			$record['inactive'] = 0;
		}

		$SQL_QUERY = "SELECT owner FROM supplements WHERE stamp = '" . $record['stamp'] . "'";
		$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

		if (mysqli_num_rows($SQL_RUN) !== 1) {
			LeggeraError($record_object, $SQL_CON, "record-not-found");
			return;
		}

		while ($SQL_RESULT_ROW = mysqli_fetch_assoc($SQL_RUN)) {
			$ogowner = $SQL_RESULT_ROW["owner"];
		}

		if ($ogowner !== $owner) {
			LeggeraError($record_object, $SQL_CON, "user-not-owner");
			return;
		}

		$SQL_QUERY = "UPDATE supplements SET title = '" . sanitizeInput($record['title']) . "', kcal = " . sanitizeInput($record['kcal']) . ", image = '" . $record['image'] . "', unit = '" . $record['unit'] . "', unitvalue = " . sanitizeInput($record['unitvalue']) . ", price = " . sanitizeInput($record['price']) . ", tags = '" . sanitizeInput($record['tags']) . "', timestamp = " . $record['timestamp'] . " WHERE stamp = '" . $record['stamp'] . "'";
		$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);


		if (mysqli_affected_rows($SQL_CON) !== 1) {
			LeggeraError($record_object, $SQL_CON, "error-updating-record");
			return;
		}

		LeggeraSucess($record_object, $SQL_CON);
		return;

	case 'new':

		if (!isset($_POST["record"])) {
			LeggeraError($record_object, $SQL_CON, "no-record-provided");
			return;
		}

		$record = json_decode($_POST["record"], true);
		$record["tags"] = implode(",", $record["tags"]);
		$stampgen = LeggeraStamp();

		if ($record['inactive'] == '') {
			$record['inactive'] = 0;
		}

		$SQL_QUERY = "INSERT INTO supplements (stamp,title,kcal,image,unit,unitvalue,price,tags,owner,timestamp) VALUES ('" . $stampgen . "','" . sanitizeInput($record['title']) . "'," . sanitizeInput($record['kcal']) . ",'" . $record['image'] . "','" . $record['unit'] . "'," . sanitizeInput($record['unitvalue']) . "," . sanitizeInput($record['price']) . ",'" . sanitizeInput($record['tags']) . "','" . $owner . "', " . $record['timestamp'] . " )";

		$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

		if (mysqli_affected_rows($SQL_CON) !== 1) {
			LeggeraError($record_object, $SQL_CON, "error-creating-supplement");
			return;
		}

		LeggeraSucess($record_object, $SQL_CON);
		return;

	case 'delete':

		if (!isset($_POST["stamps"])) {
			LeggeraError($record_object, $SQL_CON, "no-stamp-provided");
			return;
		}

		$recordstamps_str = str_replace(" ", "", $_POST["stamps"]);
		$recordstamps_arr = explode(",", $recordstamps_str);

		if ($recordstamps_str === "") {
			LeggeraError($record_object, $SQL_CON, "no-records-selected");
			return;
		}

		$IN_CLAUSE = "";
		foreach ($recordstamps_arr as &$recordstamp) {
			$IN_CLAUSE .= "'" . $recordstamp . "',";
		}
		$IN_CLAUSE = substr_replace($IN_CLAUSE, "", -1);

		$SQL_QUERY = "SELECT COUNT(owner) as count FROM supplements WHERE public = 0 AND owner = '" . $owner . "' AND stamp IN (" . $IN_CLAUSE . ")";
		$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

		if (mysqli_num_rows($SQL_RUN) === 0) {
			LeggeraError($record_object, $SQL_CON, "error-counting-user-owner-rows");
			return;
		}

		while ($SQL_RESULT_ROW = mysqli_fetch_assoc($SQL_RUN)) {
			$rows_owner = intval($SQL_RESULT_ROW["count"]);
		}

		if ($rows_owner === 0) {
			LeggeraError($record_object, $SQL_CON, "user-owns-none");
			return;
		}

		$SQL_QUERY = "DELETE FROM supplements WHERE stamp IN (" . $IN_CLAUSE  . ") AND owner = '" . $owner . "' AND public = 0";
		$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

		if (mysqli_affected_rows($SQL_CON) === 0) {
			LeggeraError($record_object, $SQL_CON, "error-deleting-supplement");
			return;
		}

		$details = $rows_owner !== count($recordstamps_arr) ? "user-owns-some" : "user-owns-all";
		LeggeraSucess($record_object, $SQL_CON, $details);
}
