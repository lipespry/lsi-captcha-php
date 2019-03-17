--
-- BANCO DE DADOS `lsi_captcha`
--

-- CREATE DATABASE `lsi_captcha`;

--
-- USUÁRIO `captcha_usr`
--

-- CREATE USER 'captcha_usr'@'localhost' IDENTIFIED BY 'C4ptCH4by_LipESprY';

--
-- PRIVILÉGIOS (PERMISSÕES)
--

-- GRANT INSERT, SELECT, DELETE ON `lsi_captcha`.* TO 'captcha_usr'@'localhost';
-- FLUSH PRIVILEGES;

--
-- TABELA `captcha`
--

CREATE TABLE `captcha` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    `codigo` varchar(24) NOT NULL,
    `data` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
)
    ENGINE=InnoDB
    AUTO_INCREMENT=1700000;
