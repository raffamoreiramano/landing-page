<?php
// Trata o request se tiver algo no corpo do POST
if (isset($_POST['email'])) {
    // Avisa o arquivo scripts que hove um POST request
    define('request', true);

    // Inclui o arquivo scripts
    require_once('./scripts.php');

    try {
        validate();

        $response = [
            'name' => $_POST['name'],
            'email' => $_POST['email'],
            'phone' => $_POST['phone'],
            'address' => [
                'code' => $_POST['code'],
                'uf' => $_POST['uf'],
                'city' => $_POST['city'],
                'district' => $_POST['district'],
                'street' => $_POST['street'],
                'number' => $_POST['number'],
            ],
        ];
    } catch(Exception $e) {
        $response = ['status' => $e->getCode(), 'error' => $e->getMessage()];

        http_response_code($e->getCode());
    } finally {
        echo json_encode($response, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE);
    }
}

// Se não houver a constante request vinda do arquivo scripts, redireciona para home.html
if (!defined('aproved')) {
    require_once('./home.html');
}

exit;
?>