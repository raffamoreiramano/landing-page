<?php
if (isset($_POST['email'])) {
    define('appropriate', true);

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

if (!defined('request')) {
    require_once('./home.html');
}

exit;
?>