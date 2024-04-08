<?php

ini_set('error_reporting', E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

//ini_set('display_errors', 0);
//ini_set('display_startup_errors', 0);

define('_ROOT_', $_SERVER['DOCUMENT_ROOT'] . '/');
define('_ADM_ROOT_', $_SERVER['DOCUMENT_ROOT'].'/admin/');

$auth_token = 'abba';
$admin_auth_token = 'abbatt';

$sql_servername = "localhost";
$sql_username = "u0732772_trademeter";
$sql_password = "trademeterq1q1q1q1";
$sql_dbname = "u0732772_trademeter";

$admin_email = '1644730@mail.ru';

//full_path_base
const FULL_PATH_BASE = 'https://trademeter.4848.site/';


//////////////////////////////


require_once   "SSQL.php";

$dd = new SSQL($sql_username, $sql_password);


