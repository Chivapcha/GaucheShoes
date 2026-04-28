<?php
header('Content-Type: application/json; charset=utf-8');

if (!isset($_GET['id_modele'])) {
    http_response_code(400);
    echo json_encode(["erreur" => "id_modele manquant"]);
    exit;
}

try {
    $db = new PDO('sqlite:projet.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $sql = "
        SELECT taille, pied, stock
        FROM Stock_Chaussure
        WHERE id_modele = :id_modele
          AND stock > 0
        ORDER BY taille, pied
    ";

    $stmt = $db->prepare($sql);
    $stmt->execute([':id_modele' => $_GET['id_modele']]);
    $tailles = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($tailles, JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["erreur" => $e->getMessage()]);
}
?>
