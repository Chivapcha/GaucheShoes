<?php
header('Content-Type: application/json; charset=utf-8');

$cote = $_GET['cote'] ?? 'gauche';

try {
    $db = new PDO('sqlite:projet.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $sql = "
        SELECT DISTINCT
            mc.id_modele,
            mc.marque,
            mc.nom_modele,
            mc.couleur,
            mc.descr,
            mc.image_url,
            mc.prix
        FROM Modele_Chaussure mc
        JOIN Stock_Chaussure sc ON mc.id_modele = sc.id_modele
        WHERE sc.stock > 0 AND sc.pied = :cote
        ORDER BY mc.marque, mc.nom_modele
    ";

    $stmt = $db->query($sql);
     $stmt->execute([':cote' => $cote]);
    $produits = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($produits, JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["erreur" => $e->getMessage()]);
}
?>