<?php
//$do_list = [
//    'function_1' => ['param1', 'param2'], ]
//class dd {
//    public static $myVariable;
//}

$_PARAMS=[];
$_do_api=false;
if ( !isset($do_api_list) ) $do_api_list = [];

function get_request_params() {
    if ( isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) {
        $input = file_get_contents('php://input');
        $params = json_decode($input, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            return array_merge($_REQUEST, $params);
        }
    }
    return $_REQUEST;
}

/*function get_request_params() {
    $input = file_get_contents('php://input');
    if (empty($input)) {
        return $_REQUEST;
    }

    $params = json_decode($input, true);
    if (json_last_error() === JSON_ERROR_NONE) {
        return array_merge($_REQUEST, $params);
    }

    return $_REQUEST;
}*/

function do_api_fn($do_api_list, $error=null) {
    global $_PARAMS, $_do_api;

    $_PARAMS = get_request_params();

    if (isset($_PARAMS['do']) && array_key_exists($_PARAMS['do'], $do_api_list)) {

        $_do_api=true;

        $function_name = htmlspecialchars($_PARAMS['do']);

        $fn_params = $do_api_list[$function_name];

        if( isset($fn_params['__fn']) ){
            $function_name = $fn_params['__fn'];
            unset( $fn_params['__fn'] );
        }
        if( isset($fn_params['__title']) ){
            unset( $fn_params['__title'] );
        }

        $function_params = array();

        foreach ($fn_params as $param) {
            if ( isset($_PARAMS[$param]) && $param!=='__title' && $param!=='__fn') {

                $function_params[] = $_PARAMS[$param]; //filter_var($_PARAMS[$param], FILTER_SANITIZE_STRING);
            } else {
                echo "Missing parameter: $param";
                return;
            }
        }

        //TODO: autoru thisIsTheEnd
        call_user_func_array($function_name, $function_params);
    } else {
        if ($error) $error();
        //echo "Invalid function name";
    }
}
//end fn
function thisIsTheEnd($ok, $data = [], $message='', $fields = [])
{
    global $_do_api;
    if ( $_do_api ) {
        if ( $ok!==false && $ok!=='ok' ) $ok = !!$ok;
        echo json_encode(['ok' => $ok, 'data'=>$data, 'message'=>$message, ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        die();
    }
    return $data;
}

function generateRandomUUID($lenght = 14): string
{
    $bytes = random_bytes(ceil($lenght ));

    return substr( base_convert(bin2hex($bytes),16,36), 0, $lenght);
}
