<?php
require_once "config.php";
require_once "skel.php";

$do_api_list = [
    'sload'   => [  'uid' ],
    'ssave'   => ['__fn'=>'ssave', 'name', 'data'],
    'slist'   => [],
    'delete'  => [  'uid' ],
];

$allowed_tables = [
    'participants',
    'rewards'
];

do_api_fn($do_api_list);


function sload( $uid ){
    global $dd;
    $res=$dd->one("SELECT * FROM `saves` WHERE (`uid`=?s)", $uid);

    if(!$res) thisIsTheEnd(false);

    $res['data'] = json_decode($res['data']);
    thisIsTheEnd( 'ok', $res );
}

function delete( $uid ){
    global $dd;
    $res=$dd->query("DELETE FROM `saves` WHERE (`uid`=?s)", $uid);

    if(!$res) thisIsTheEnd(false);

    thisIsTheEnd( 'ok', '' );
}

function ssave( $name, $data ){
    global $dd;
    $uid = generateRandomUUID();
    $data['file']['uid'] = $uid;
    $res=$dd->query("INSERT INTO saves SET ?u",
        [ 'user'=>1, 'name'=>$name, 'data'=>json_encode($data, 320), 'uid'=>$uid ]);

    thisIsTheEnd($res, $uid );
}

function slist(){
    global $dd;

    $res=$dd->all("SELECT name, uid FROM `saves` WHERE (`user`=1)");

    thisIsTheEnd('ok', $res);
}
