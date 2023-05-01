<?php


$operation = $_POST["operation"];
$owner = $_POST["owner"];
$cookie = $_POST["cookie"];

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header("Access-Control-Allow-Headers: X-Requested-With");

$SQL_CON = mysqli_connect('localhost', 'root', '', 'bambilite');

// stamp generator
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

// default state
$products_object = [
	"sucess" => false,
	"details" => ""
];


$SQL_QUERY = "SELECT name FROM users WHERE username = '" . $owner . "' AND cookie = '" . $cookie . "'";
$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

// no owner/cookie match found
if (mysqli_affected_rows($SQL_CON) !== 1) {
	LeggeraError($products_object, $SQL_CON, "security");
	return;
}


switch ($operation) {

	case 'getlist':
		$SQL_QUERY = "SELECT stamp,title,image,tags FROM products WHERE owner = '" . $owner . "' OR public = 1";
		$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

		// no products found
		if (mysqli_num_rows($SQL_RUN) === 0) {
			LeggeraError($products_object, $SQL_CON, "no-products-found");
			return;
		}

		// products loop
		$products_object["productList"] = [];
		while ($SQL_RESULT_ROW = mysqli_fetch_assoc($SQL_RUN)) {
			$SQL_RESULT_ROW["tags"] = json_decode($SQL_RESULT_ROW["tags"]);
			array_push($products_object["productList"], $SQL_RESULT_ROW);
		}

		LeggeraSucess($products_object, $SQL_CON);
		return;

	case 'getqueriedlist':
		$query = strtolower($_POST["query"]);
		$OR_CLAUSE = "LOWER(title) LIKE '%" . $query . "%' OR LOWER(tags) LIKE '%" . $query . "%'";

		if (is_numeric($query)) {
			$OR_CLAUSE .= " OR kcal LIKE '%" . $query . "%' OR price LIKE '%" . $query . "%'";
		}
		$SQL_QUERY = "SELECT stamp,title,image,tags FROM products WHERE ( " . $OR_CLAUSE . " ) AND ( owner = '" . $owner . "' OR public = 1 )";

		$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

		// no products found
		if (mysqli_num_rows($SQL_RUN) === 0) {
			LeggeraError($products_object, $SQL_CON, "no-products-found");
			return;
		}

		// products loop
		$products_object["productList"] = [];
		while ($SQL_RESULT_ROW = mysqli_fetch_assoc($SQL_RUN)) {
			$SQL_RESULT_ROW["tags"] = json_decode($SQL_RESULT_ROW["tags"]);
			array_push($products_object["productList"], $SQL_RESULT_ROW);
		}

		LeggeraSucess($products_object, $SQL_CON);
		return;

	case 'getdetails':
		$productstamp = $_POST["stamp"];

		$SQL_QUERY = "SELECT * FROM products WHERE stamp = '" . $productstamp . "'";
		$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

		// no product found
		if (mysqli_num_rows($SQL_RUN) !== 1) {
			LeggeraError($products_object, $SQL_CON, "no-products-found");
			return;
		}

		// fetching product details
		$products_object["productDetails"] = [];
		while ($SQL_RESULT_ROW = mysqli_fetch_assoc($SQL_RUN)) {
			$SQL_RESULT_ROW["tags"] = json_decode($SQL_RESULT_ROW["tags"]);
			$products_object["productDetails"] = $SQL_RESULT_ROW;
		}

		LeggeraSucess($products_object, $SQL_CON);
		return;

	case 'update':
		$ele = json_decode($_POST["element"]);

		// get og owner
		$SQL_QUERY = "SELECT owner FROM htmlelements WHERE stamp = '" . $ele['stamp'] . "'";
		$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

		// ele not found
		if (mysqli_num_rows($SQL_RUN) !== 1) {
			LeggeraError($products_object, $SQL_CON, "ele-not-found");
			return;
		}

		// fetching og owner
		while ($SQL_RESULT_ROW = mysqli_fetch_assoc($SQL_RUN)) {
			$ogowner = $SQL_RESULT_ROW["owner"];
		}

		// user not owner
		if ($ogowner === 'public' || $ogowner !== $owner) {
			LeggeraError($products_object, $SQL_CON, "user-not-owner");
			return;
		}

		// validations over, updating collection
		$SQL_QUERY = "UPDATE htmlelements SET elestamp = '" . $ele['elestamp'] . "', subelestamp = '" . $ele['subelestamp'] . "', title = '" . $ele['title'] . "', description = '" . $ele['description'] . "', code = '" . $ele['code'] . "', active = " . $ele['active'] . " WHERE stamp = '" . $ele['stamp'] . "'";
		$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

		// error updating element
		if (mysqli_affected_rows($SQL_CON) !== 1) {
			LeggeraError($products_object, $SQL_CON, "error-updating-ele");
			return;
		}

		LeggeraSucess($products_object, $SQL_CON);
		return;

	case 'new':
		$ele = json_decode($_POST["element"]);

		$stampgen = LeggeraStamp();

		$SQL_QUERY = "INSERT INTO htmlelements (stamp,owner,elestamp,subelestamp,title,description,code,active) VALUES ('" . $stampgen . "','" . $ele['owner'] . "','" . $ele['elestamp'] . "','" . $ele['subelestamp'] . "','" . $ele['title'] . "','" . $ele['description'] . "','" . $ele['code'] . "'," . $ele['active'] . ")";
		$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

		// error creating element
		if (mysqli_affected_rows($SQL_CON) !== 1) {
			LeggeraError($products_object, $SQL_CON, "error-creating-element");
			return;
		}

		LeggeraSucess($products_object, $SQL_CON);
		return;

	case 'delete':
		$elestamp = $_POST["stamp"];

		$SQL_QUERY = "DELETE FROM htmlelements WHERE stamp = '" . $elestamp  . "' AND owner = '" . $owner . "'";
		$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

		// ele not found
		if (mysqli_num_rows($SQL_RUN) !== 1) {
			LeggeraError($products_object, $SQL_CON, "ele-not-found");
			return;
		}

		// fetching og owner
		while ($SQL_RESULT_ROW = mysqli_fetch_assoc($SQL_RUN)) {
			$ogowner = $SQL_RESULT_ROW["owner"];
		}

		// user not owner
		if ($ogowner === 'public' || $ogowner !== $owner) {
			LeggeraError($products_object, $SQL_CON, "user-not-owner");
			return;
		}

		// validations over, deleting element
		$SQL_QUERY = "DELETE FROM htmlcols WHERE stamp = '" . $colstamp  . "' AND owner = '" . $owner . "'";
		$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

		// error deleting element
		if (mysqli_affected_rows($SQL_CON) !== 1) {
			LeggeraError($products_object, $SQL_CON, "error-deleting-col");
			return;
		}

		LeggeraSucess($products_object, $SQL_CON);
}
