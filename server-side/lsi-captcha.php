<?php

class Captcha
{
    protected $id;
    protected $codigo;
    protected $data;
    protected $db;

    protected static $config = array(
        'tamanho' => 5,
        'fonte' => 'captcha/Hostage.otf',
        'img_fundo' => 'captcha/captcha_bg.png',
        'caracteres' => (
            'abcdefghjkmnpqrstuvwxyz'
            .'ABCDEFGHJKMNPQRSTUVWXYZ'
            .'23456789'
        )
    );

    public function __construct($db = null)
    {
        if (!empty($db))
            $this->setDb($db);
    }

    public function buscaPorId($id)
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM `captcha` WHERE `id` = :id;'
        );
        $stmt->bindValue(':id', $id);
        $stmt->execute();
        if (
            $stmt->rowCount() == 0
            || $stmt->rowCount() > 1
        )
            return false;
        else {
            $this->popula($stmt->fetch(\PDO::FETCH_ASSOC));
            return true;
        }
    }

    public function destroi()
    {
        if (!empty($this->id)) {
            $stmt = $this->db->prepare(
                'DELETE FROM `captcha` WHERE `id` = :id;'
            );
            $stmt->bindValue(':id', $this->id);
            $stmt->execute();
        }
        unset($this->id);
        unset($this->codigo);
        unset($this->data);
        unset($this->db);
        return true;
    }

    public function valida($codigo)
    {
        $valido = (
            strtolower($this->codigo) == strtolower($codigo)
            ? true
            : false
        );
        $this->destroi();
        return $valido;
    }

    protected function popula($dados)
    {
        $this->id = $dados['id'];
        $this->codigo = $dados['codigo'];
        $this->data = $dados['data'];
        return;
    }

    public function novo()
    {
        unset($this->id);
        $this->codigo = '';
        for ($i = 0; $i < static::$config['tamanho']; $i++) {
            $this->codigo .= substr(
                static::$config['caracteres'],
                rand(
                    0,
                    strlen(static::$config['caracteres'])-1
                ),
                1
            );
        }
        $stmt = $this->db->prepare(
            'INSERT INTO `captcha` (`codigo`) VALUES (:codigo);'
        );
        $stmt->bindValue(':codigo', $this->codigo);
        if ($stmt->execute())
            $this->id = $this->db->lastInsertId();
        else
            throw new \Exception('Erro ao gerar o código do captcha.');
    }

    public function getCodigo()
    {
        return $this->codigo;
    }

    public function getId()
    {
        return $this->id;
    }

    public function getImg()
    {
        Captcha::img($this->codigo);
    }

    public static function img($codigo)
    {
        if (empty($codigo))
            throw new \Exception('Solicitação de Captcha inválido.');
        $img = imagecreatefrompng(
            static::$config['img_fundo']
        );

        $letra = str_split($codigo);

        for ($i = 0; $i <= (static::$config['tamanho']-1); $i++) {
            imagettftext(
                $img,
                rand(30, 50),
                rand(-20, 20),
                ((($i)*40)+10),
                65,
                imagecolorallocate(
                    $img,
                    rand(0, 200),
                    rand(0, 200),
                    rand(0, 200)
                ),
                static::$config['fonte'],
                $letra[$i]
            );
        }
        header('Content-type: image/png');
        imagepng($img);
        imagedestroy($img);
    }

    public function setDb($db = null)
    {
        if (!empty($db) && $db instanceof \PDO)
            $this->db = $db;
        else
            throw new \Exception(
                'A conexão com o banco de dados '
                .'(setDb) deve ser uma instância da classe \PDO.'
            );
        return true;
    }

    public static function conferir($db, $id, $codigo)
    {
        $captcha = new Captcha($db);

        if (!$captcha->buscaPorId($id))
            return false;
        else
            return $captcha->valida($codigo);
    }
}
