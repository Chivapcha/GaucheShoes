<?php
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['id_user'])) {
    echo json_encode([
        "connecte" => true,
        "utilisateur" => [
            "id_user" => $_SESSION['id_user'],
            "nom_util" => $_SESSION['nom_util'],
            "email" => $_SESSION['email']
        ]
    ]);
} else {
    echo json_encode(["connecte" => false]);
}
?>