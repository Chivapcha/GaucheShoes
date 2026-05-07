<?php
session_start();
header('Content-Type: application/json');
require_once 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

$email = trim($data['email'] ?? '');
$mdp = $data['mot_de_passe'] ?? '';

if ($email === '' || $mdp === '') {
    http_response_code(400);
    echo json_encode(["erreur" => "Champs manquants"]);
    exit;
}

try {
    $db = getDb();

    $stmt = $db->prepare("
        SELECT id_user, nom_util, email, mdp_hash
        FROM Utilisateur
        WHERE email = :email
    ");
    $stmt->execute([':email' => $email]);

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(401);
        echo json_encode(["erreur" => "Email ou mot de passe incorrect"]);
        exit;
    }

    $storedHash = $user['mdp_hash'] ?? '';

    if (password_verify($mdp, $storedHash)) {
        // mot de passe valide
    } elseif ($storedHash === $mdp) {
        // ancien mot de passe stocké en clair — on le re-hashe et on met à jour
        $newHash = password_hash($mdp, PASSWORD_DEFAULT);
        $upd = $db->prepare("UPDATE Utilisateur SET mdp_hash = :h WHERE id_user = :id");
        $upd->execute([':h' => $newHash, ':id' => $user['id_user']]);
    } else {
        http_response_code(401);
        echo json_encode(["erreur" => "Email ou mot de passe incorrect"]);
        exit;
    }

    $_SESSION['id_user'] = $user['id_user'];
    $_SESSION['nom_util'] = $user['nom_util'];
    $_SESSION['email'] = $user['email'];

    echo json_encode([
        "succes" => true,
        "message" => "Connexion réussie",
        "utilisateur" => [
            "id_user" => $user['id_user'],
            "nom_util" => $user['nom_util'],
            "email" => $user['email']
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["erreur" => $e->getMessage()]);
}
?>