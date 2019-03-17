<?php

$db_demo = require('db.php');

require('lsi-captcha.php');

$captcha = new Captcha($db_demo);
$captcha->novo();

$webservice = array(
    'sucesso' => true,
    'resultado' => $captcha->getId()
);

echo json_encode($webservice);
