<?php
// Exemplo: e-mail.local_part@domain.com.br
function isEmailValid($email) {
    $characters = '[0-9a-z\x{00C0}-\x{00FF}]';
    $punctuation = '[0-9a-z\x{00C0}-\x{00FF}+-.]';
    $special = '[!#$%&*+-_.]';
    $regex = 
        '/^' .
        $characters . '+' .
        $special . '*' .
        $characters . '+@' .
        $characters . '+' .
        $punctuation . '*' .
        $characters . '+$'.
        '/i';

    if (!preg_match_all($regex, $email)) {
        return false;
    }

    return true;
}