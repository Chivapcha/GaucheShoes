<?php
session_start();
header('Content-Type: application/json');
require_once 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

$nom = trim($data['nom_util'] ?? '');
$email = trim($data['email'] ?? '');
$mdp = $data['mot_de_passe'] ?? '';

if ($nom === '' || $email === '' || $mdp === '') {
    http_response_code(400);
    echo json_encode(["erreur" => "Champs manquants"]);
    exit;
}

try {
    $db = getDB();

    $stmt = $db->prepare("SELECT id_user FROM Utilisateur WHERE email = :email");
    $stmt->execute([':email' => $email]);

    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(["erreur" => "Email déjà utilisé"]);
        exit;
    }

    $hash = password_hash($mdp, PASSWORD_DEFAULT);

    $stmt = $db->prepare("
        INSERT INTO Utilisateur (nom_util, email, mdp_hash)
        VALUES (:nom, :email, :hash)
    ");
    $stmt->execute([
        ':nom' => $nom,
        ':email' => $email,
        ':hash' => $hash
    ]);

    $_SESSION['id_user'] = $db->lastInsertId();
    $_SESSION['nom_util'] = $nom;
    $_SESSION['email'] = $email;

    echo json_encode([
        "succes" => true,
        "message" => "Compte créé",
        "utilisateur" => [
            "id_user" => $_SESSION['id_user'],
            "nom_util" => $nom,
            "email" => $email
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["erreur" => $e->getMessage()]);
}
?>