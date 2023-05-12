<?php

if(!isset($_POST["operation"]) || !isset($_POST["owner"]) || !isset($_POST["cookie"]) ){return;}

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
$recipes_object = [
	"sucess" => false,
	"details" => ""
];


$SQL_QUERY = "SELECT name FROM users WHERE username = '" . $owner . "' AND cookie = '" . $cookie . "'";
$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

// no owner/cookie match found
if (mysqli_affected_rows($SQL_CON) !== 1) {
	LeggeraError($recipes_object, $SQL_CON, "security");
	return;
}


switch ($operation) {

	case 'getlist':
		$SQL_QUERY = "SELECT stamp,title,image,tags FROM recipes WHERE owner = '" . $owner . "' OR public = 1 ORDER BY timestamp desc";
		$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

		// no recipes found
		if (mysqli_num_rows($SQL_RUN) === 0) {
			LeggeraError($recipes_object, $SQL_CON, "no-recipes-found");
			return;
		}

		// recipes loop
		$recipes_object["recipeList"] = [];
		while ($SQL_RESULT_ROW = mysqli_fetch_assoc($SQL_RUN)) {
			$SQL_RESULT_ROW["tags"] = json_decode($SQL_RESULT_ROW["tags"]);
			array_push($recipes_object["recipeList"], $SQL_RESULT_ROW);
		}

		LeggeraSucess($recipes_object, $SQL_CON);
		return;

	case 'getqueriedlist':
		if (!isset($_POST["query"])) {
			LeggeraError($products_object, $SQL_CON, "no-query-provided");
			return;
		}
		$query = strtolower($_POST["query"]);
		$query = str_replace("'","''",$query);
		$OR_CLAUSE = "LOWER(title) LIKE '%" . $query . "%' OR LOWER(tags) LIKE '%" . $query . "%'";

		if (is_numeric($query)) {
			$OR_CLAUSE .= " OR kcal LIKE '%" . $query . "%' OR price LIKE '%" . $query . "%'";
		}
		$SQL_QUERY = "SELECT stamp,title,image,tags FROM recipes WHERE ( " . $OR_CLAUSE . " ) AND ( owner = '" . $owner . "' OR public = 1 ) ORDER BY timestamp desc";

		$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

		// no recipes found
		if (mysqli_num_rows($SQL_RUN) === 0) {
			LeggeraError($recipes_object, $SQL_CON, "no-recipes-found");
			return;
		}

		// recipes loop
		$recipes_object["recipeList"] = [];
		while ($SQL_RESULT_ROW = mysqli_fetch_assoc($SQL_RUN)) {
			$SQL_RESULT_ROW["tags"] = json_decode($SQL_RESULT_ROW["tags"]);
			array_push($recipes_object["recipeList"], $SQL_RESULT_ROW);
		}

		LeggeraSucess($recipes_object, $SQL_CON);
		return;

	case 'getdetails':
		if (!isset($_POST["stamp"])) {
			LeggeraError($products_object, $SQL_CON, "no-stamp-provided");
			return;
		}
		$recipesstamp = $_POST["stamp"];

		$SQL_QUERY = "SELECT * FROM recipes WHERE stamp = '" . $recipesstamp . "'";
		$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

		// no recipes found
		if (mysqli_num_rows($SQL_RUN) !== 1) {
			LeggeraError($recipes_object, $SQL_CON, "no-recipes-found");
			return;
		}

		// fetching recipes details
		$recipes_object["recipeDetails"] = [];
		while ($SQL_RESULT_ROW = mysqli_fetch_assoc($SQL_RUN)) {
			$SQL_RESULT_ROW["tags"] = json_decode($SQL_RESULT_ROW["tags"]);
			$recipes_object["recipeDetails"] = $SQL_RESULT_ROW;
			$recipes_object["recipeDetails"]["inactive"] = boolval($recipes_object["recipeDetails"]["inactive"]);
			$recipes_object["recipeDetails"]["public"] = boolval($recipes_object["recipeDetails"]["public"]);
		}

		LeggeraSucess($recipes_object, $SQL_CON);
		return;

	case 'update':
		if (!isset($_POST["recipe"])) {
			LeggeraError($products_object, $SQL_CON, "no-product-provided");
			return;
		}
		$recipe = json_decode($_POST["recipe"], true);

		// get og owner
		$SQL_QUERY = "SELECT owner FROM recipes WHERE stamp = '" . $recipe['stamp'] . "'";
		$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

		// recipe not found
		if (mysqli_num_rows($SQL_RUN) !== 1) {
			LeggeraError($recipes_object, $SQL_CON, "recipe-not-found");
			return;
		}

		// fetching og owner
		while ($SQL_RESULT_ROW = mysqli_fetch_assoc($SQL_RUN)) {
			$ogowner = $SQL_RESULT_ROW["owner"];
		}

		// user not owner
		if ($ogowner !== $owner) {
			LeggeraError($recipes_object, $SQL_CON, "user-not-owner");
			return;
		}
		str_replace("'","''",$recipe['title']);
		// validations over, recipe collection
		$SQL_QUERY = "UPDATE recipes SET title = '" . str_replace("'","''",$recipe['title']) . "', kcal = " . str_replace("'","''",$recipe['kcal']) . ", image = '" . $recipe['image'] . "', unit = '" . $recipe['unit'] . "', unitvalue = " . str_replace("'","''",$recipe['unitvalue']) . ", price = " . str_replace("'","''",$recipe['price']) . ", tags = '" . str_replace("'","''",json_encode($recipe['tags'])) . "', timestamp = " . $recipe['timestamp'] . " WHERE stamp = '" . $recipe['stamp'] . "'";
		$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

		// error updating element
		if (mysqli_affected_rows($SQL_CON) !== 1) {
			LeggeraError($recipes_object, $SQL_CON, "error-updating-recipe");
			return;
		}

		LeggeraSucess($recipes_object, $SQL_CON);
		return;

	case 'new':
		if (!isset($_POST["recipe"])) {
			LeggeraError($products_object, $SQL_CON, "no-product-provided");
			return;
		}
		$recipe = json_decode($_POST["recipe"], true);

		$stampgen = LeggeraStamp();

		$SQL_QUERY = "INSERT INTO recipes (stamp,title,kcal,image,unit,unitvalue,price,tags,owner,timestamp) VALUES ('" . $stampgen . "','" . str_replace("'","''",$recipe['title']) . "'," . str_replace("'","''",$recipe['kcal']) . ",'" . $recipe['image'] . "','" . $recipe['unit'] . "'," . str_replace("'","''",$recipe['unitvalue']) . "," . str_replace("'","''",$recipe['price']) . ",'" . str_replace("'","''",json_encode($recipe['tags'])) . "','" . $owner . "', " . $recipe['timestamp'] . " )";

		$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

		// error creating element
		if (mysqli_affected_rows($SQL_CON) !== 1) {
			LeggeraError($recipes_object, $SQL_CON, "error-creating-recipe");
			return;
		}

		LeggeraSucess($recipes_object, $SQL_CON);
		return;

	case 'delete':
		if (!isset($_POST["stamps"])) {
			LeggeraError($products_object, $SQL_CON, "no-stamplist-provided");
			return;
		}
		$recipestamps_str = str_replace(" ", "", $_POST["stamps"]);
		$recipestamps_arr = explode(",", $recipestamps_str);

		if ($recipestamps_str === "") {
			LeggeraError($recipes_object, $SQL_CON, "no-recipes-selected");
			return;
		}

		$IN_CLAUSE = "";
		foreach ($recipestamps_arr as &$recipestamp) {
			$IN_CLAUSE .= "'" . $recipestamp . "',";
		}
		$IN_CLAUSE = substr_replace($IN_CLAUSE, "", -1);

		$SQL_QUERY = "SELECT COUNT(owner) as count FROM recipes WHERE public = 0 AND owner = '" . $owner . "' AND stamp IN (" . $IN_CLAUSE . ")";
		$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

		if (mysqli_num_rows($SQL_RUN) === 0) {
			LeggeraError($recipes_object, $SQL_CON, "error-counting-owner-rows");
			return;
		}

		while ($SQL_RESULT_ROW = mysqli_fetch_assoc($SQL_RUN)) {
			$rows_owner = intval($SQL_RESULT_ROW["count"]);
		}


		if ($rows_owner === 0) {
			LeggeraError($recipes_object, $SQL_CON, "user-owns-none");
			return;
		}

		$SQL_QUERY = "DELETE FROM recipes WHERE stamp IN (" . $IN_CLAUSE  . ") AND owner = '" . $owner . "' AND public = 0";
		$SQL_RUN = mysqli_query($SQL_CON, $SQL_QUERY);

		// recipe not found
		if (mysqli_affected_rows($SQL_CON) === 0) {
			LeggeraError($recipes_object, $SQL_CON, "error-deleting-recipe");
			return;
		}

		$details = $rows_owner !== count($recipestamps_arr) ? "user-owns-some" : "user-owns-all";
		LeggeraSucess($recipes_object, $SQL_CON, $details);
}
