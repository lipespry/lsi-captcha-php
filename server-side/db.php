<?php

return new PDO(
    'mysql:host=localhost;dbname=lsi_captcha',
    'captcha_usr',
    'C4ptCH4by_LipESprY',
    array(
        \PDO::MYSQL_ATTR_INIT_COMMAND => (
            'SET NAMES utf8'
        )
    )
);
