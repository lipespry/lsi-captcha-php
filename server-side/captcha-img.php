<?php

ini_set('display_errors', true);

$db_demo = require('db.php');

require('lsi-captcha.php');

if (empty($_GET['id']))
    die('Solicitação inválida: ID do Captcha não definido.');

$captcha = new Captcha($db_demo);
if ($captcha->buscaPorId($_GET['id']))
    $captcha->getImg();
else
    die('Solicitação inválida: ID do Captcha inválido.');
