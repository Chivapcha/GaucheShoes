<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once 'db.php';

if (!isset($_SESSION['id_user'])) {
    http_response_code(401);
    echo json_encode(['erreur' => 'Utilisateur non connecté']);
    exit;
}

try {
    $db = getDb();
    $id_user = $_SESSION['id_user'];

    $stmt = $db->prepare(<<<SQL
        SELECT
            c.id_commande,
            c.date_commande,
            c.statut,
            c.total,
            lc.quantite,
            lc.prix_unitaire,
            s.taille,
            s.pied,
            m.marque,
            m.nom_modele,
            m.image_url
        FROM Commande c
        LEFT JOIN Ligne_Commande lc ON lc.id_commande = c.id_commande
        LEFT JOIN Stock_Chaussure s ON s.id_stock = lc.id_stock
        LEFT JOIN Modele_Chaussure m ON m.id_modele = s.id_modele
        WHERE c.id_user = :id_user
          AND c.statut IN ('en_attente', 'payee', 'expediee')
        ORDER BY c.date_commande DESC, c.id_commande DESC, lc.id_ligne ASC
SQL);
    $stmt->execute([':id_user' => $id_user]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $commandes = [];
    foreach ($rows as $row) {
        $id_commande = $row['id_commande'];
        if (!isset($commandes[$id_commande])) {
            $commandes[$id_commande] = [
                'id_commande' => $id_commande,
                'date_commande' => $row['date_commande'],
                'statut' => $row['statut'],
                'total' => $row['total'],
                'lignes' => []
            ];
        }

        if ($row['quantite'] !== null) {
            $commandes[$id_commande]['lignes'][] = [
                'marque' => $row['marque'],
                'nom_modele' => $row['nom_modele'],
                'taille' => $row['taille'],
                'pied' => $row['pied'],
                'quantite' => $row['quantite'],
                'prix_unitaire' => $row['prix_unitaire'],
                'image_url' => $row['image_url']
            ];
        }
    }

    echo json_encode([
        'succes' => true,
        'commandes' => array_values($commandes)
    ], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['erreur' => $e->getMessage()]);
}
?>