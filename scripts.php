<?php
// Avisa que passou pelo arquivo scripts
define('aproved', true);

// Volta sem executar o resto do código se não tiver vindo de um POST request
if (!defined('request')) {
    header("Location: ./index.php");

    exit;
}

require_once('./utils.php');

$DB = './db/users.txt';

$LIST = isset($_COOKIE['email_list']) ? json_decode($_COOKIE['email_list'], true) : [];
$EXPIRATION = time() + 60 * 60 * 24 * 7;


// Busca ou cria por um arquivo users.txt e retorna os dados ou uma array vazia
function openDB() {
    global $DB;

    $dirname = dirname($DB);

    if (!is_dir($dirname)) {
        mkdir($dirname, 0755, true);
    }

    $rows = [];

    if (false !== ($data = @file_get_contents($DB))) {
        $rows = json_decode($data, true, 3);
    }

    if (!is_array($rows)) {
        return [];
    }

    if (!array_is_list($rows)) {
        return [];
    }

    if (empty($rows)) {
        return [];
    }

    if (!array_key_exists('name', $rows[0]) || !array_key_exists('email', $rows[0])) {
        return [];
    }

    return $rows;
}

function emailAlreadyExists($email) {
    global $LIST, $DB;

    if (in_array($email, $LIST)) {
        return true;
    }

    $userList = openDB();
    $emailList = array_map(fn($user) => is_array($user) ? $user['email'] : null, $userList);

    return in_array($email, $emailList);
}

function setEmailCookie($email) {
    global $EXPIRATION, $LIST;

    $list = $LIST ? $LIST : [];
    $list[] = $email;

    return setcookie('email_list', json_encode($list), $EXPIRATION);
}

// Adiciona usuário ao arquivo users.txt
function setUser($name, $email) {
    global $DB;

    $users = openDB();

    $users[] = ['name' => ucfirst($name), 'email' => $email];

    $file = fopen('./db/users.txt', 'w');
    fwrite($file, json_encode($users, JSON_PRETTY_PRINT, 3));

    return setEmailCookie($email);
}

function validate() {
    if (emailAlreadyExists($_POST['email'])) {
        setEmailCookie($_POST['email']);

        throw new Exception("Email já existe!", 409);
    }

    if (!isset($_POST['name'])) {
        throw new Exception("Nome não inserido!", 401);
    }

    if (!isset($_POST['phone'])) {
        throw new Exception("Telefone não inserido!", 401);
    }

    if (!isset($_POST['code'])) {
        throw new Exception("CEP não inserido!", 401);
    }

    if (!isset($_POST['uf'])) {
        throw new Exception("Estado não inserido!", 401);
    }

    if (!isset($_POST['city'])) {
        throw new Exception("Cidade não inserida!", 401);
    }

    if (!isset($_POST['district'])) {
        throw new Exception("Bairro não inserido!", 401);
    }

    if (!isset($_POST['street'])) {
        throw new Exception("Rua não inserida!", 401);
    }

    if (!isset($_POST['number'])) {
        throw new Exception("Número não inserido!", 401);
    }

    if (!isEmailValid($_POST['email'])) {
        throw new Exception("Email inválido!", 400);
    }
    
    setUser($_POST['name'], $_POST['email']);
}