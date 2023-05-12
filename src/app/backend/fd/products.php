<?php

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
		$SQL_QUERY = "SELECT stamp,title,image,tags FROM products WHERE owner = '" . $owner . "' OR public = 1 ORDER BY timestamp desc";
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
		if (!isset($_POST["query"])) {
			LeggeraError($products_object, $SQL_CON, "no-query-provided");
			return;
		}
		$query = strtolower($_POST["query"]);
		$query = str_replace("'", "''", $query);
		$OR_CLAUSE = "LOWER(title) LIKE '%" . $query . "%' OR LOWER(tags) LIKE '%" . $query . "%'";

		if (is_numeric($query)) {
			$OR_CLAUSE .= " OR kcal LIKE '%" . $query . "%' OR price LIKE '%" . $query . "%'";
		}
		$SQL_QUERY = "SELECT stamp,title,image,tags FROM products WHERE ( " . $OR_CLAUSE . " ) AND ( owner = '" . $owner . "' OR public = 1 ) ORDER BY timestamp desc";

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
		if (!isset($_POST["stamp"])) {
			LeggeraError($products_object, $SQL_CON, "no-stamp-provided");
			return;
		}
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
			$products_object["productDetails"]["inactive"] = boolval($products_object["productDetails"]["inactive"]);
			$products_object["productDetails"]["public"] = boolval($products_object["productDetails"]["public"]);
		}

		LeggeraSucess($products_object, $SQL_CON);
		return;

	case 'update':
		if (!isset($_POST["product"])) {
			LeggeraError($products_object, $SQL_CON, "no-product-provided");
			return;
		}
		$product = json_decode($_POST["product"], true);

		if ($product['inactive'] == '') {
			$product['inactive'] = 0;
		}
		// get og owner
		$SQL_QUERY = "SELECT owner FROM products WHERE stamp = '" . $product['stamp'] . "'";
		$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

		// product not found
		if (mysqli_num_rows($SQL_RUN) !== 1) {
			LeggeraError($products_object, $SQL_CON, "product-not-found");
			return;
		}

		// fetching og owner
		while ($SQL_RESULT_ROW = mysqli_fetch_assoc($SQL_RUN)) {
			$ogowner = $SQL_RESULT_ROW["owner"];
		}

		// user not owner
		if ($ogowner !== $owner) {
			LeggeraError($products_object, $SQL_CON, "user-not-owner");
			return;
		}
		str_replace("'", "''", $product['title']);
		// validations over, product collection
		$SQL_QUERY = "UPDATE products SET title = '" . str_replace("'", "''", $product['title']) . "', kcal = " . str_replace("'", "''", $product['kcal']) . ", image = '" . $product['image'] . "', unit = '" . $product['unit'] . "', unitvalue = " . str_replace("'", "''", $product['unitvalue']) . ", price = " . str_replace("'", "''", $product['price']) . ", tags = '" . str_replace("'", "''", json_encode($product['tags'])) . "', timestamp = " . $product['timestamp'] . ", inactive = " . $product['inactive'] . " WHERE stamp = '" . $product['stamp'] . "'";

		$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

		// error updating element
		if (mysqli_affected_rows($SQL_CON) !== 1) {
			LeggeraError($products_object, $SQL_CON, "error-updating-product");
			return;
		}

		LeggeraSucess($products_object, $SQL_CON);
		return;

	case 'new':
		if (!isset($_POST["product"])) {
			LeggeraError($products_object, $SQL_CON, "no-product-provided");
			return;
		}

		$product = json_decode($_POST["product"], true);
		$stampgen = LeggeraStamp();

		if ($product['inactive'] == '') {
			$product['inactive'] = false;
		}

		$SQL_QUERY = "INSERT INTO products (stamp,title,kcal,image,unit,unitvalue,price,tags,owner,timestamp,inactive) VALUES ('" . $stampgen . "','" . str_replace("'", "''", $product['title']) . "'," . str_replace("'", "''", $product['kcal']) . ",'" . $product['image'] . "','" . $product['unit'] . "'," . str_replace("'", "''", $product['unitvalue']) . "," . str_replace("'", "''", $product['price']) . ",'" . str_replace("'", "''", json_encode($product['tags'])) . "','" . $owner . "', " . $product['timestamp'] . ", " . $product['inactive'] . " )";

		$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

		// error creating element
		if (mysqli_affected_rows($SQL_CON) !== 1) {
			LeggeraError($products_object, $SQL_CON, "error-creating-product");
			return;
		}

		LeggeraSucess($products_object, $SQL_CON);
		return;

	case 'delete':
		if (!isset($_POST["stamps"])) {
			LeggeraError($products_object, $SQL_CON, "no-stamplist-provided");
			return;
		}
		$productstamps_str = str_replace(" ", "", $_POST["stamps"]);
		$productstamps_arr = explode(",", $productstamps_str);

		if ($productstamps_str === "") {
			LeggeraError($products_object, $SQL_CON, "no-products-selected");
			return;
		}

		$IN_CLAUSE = "";
		foreach ($productstamps_arr as &$productstamp) {
			$IN_CLAUSE .= "'" . $productstamp . "',";
		}
		$IN_CLAUSE = substr_replace($IN_CLAUSE, "", -1);

		$SQL_QUERY = "SELECT COUNT(owner) as count FROM products WHERE public = 0 AND owner = '" . $owner . "' AND stamp IN (" . $IN_CLAUSE . ")";
		$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

		if (mysqli_num_rows($SQL_RUN) === 0) {
			LeggeraError($products_object, $SQL_CON, "error-counting-owner-rows");
			return;
		}

		while ($SQL_RESULT_ROW = mysqli_fetch_assoc($SQL_RUN)) {
			$rows_owner = intval($SQL_RESULT_ROW["count"]);
		}


		if ($rows_owner === 0) {
			LeggeraError($products_object, $SQL_CON, "user-owns-none");
			return;
		}

		$SQL_QUERY = "DELETE FROM products WHERE stamp IN (" . $IN_CLAUSE  . ") AND owner = '" . $owner . "' AND public = 0";
		$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

		// products not found
		if (mysqli_affected_rows($SQL_CON) === 0) {
			LeggeraError($products_object, $SQL_CON, "error-deleting-products");
			return;
		}

		$details = $rows_owner !== count($productstamps_arr) ? "user-owns-some" : "user-owns-all";
		LeggeraSucess($products_object, $SQL_CON, $details);
}
