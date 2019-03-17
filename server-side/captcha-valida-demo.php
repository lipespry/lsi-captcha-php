<?php

$db_demo = require('db.php');

require('lsi-captcha.php');

if (Captcha::conferir($db_demo, $_POST['captchaId'], $_POST['captcha'])) {
    // Captcha válido
} else {
    // Captcha inválido
}
