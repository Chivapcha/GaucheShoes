<?php
session_start();
header('Content-Type: application/json');
require_once 'db.php';

// Vérifier la session
if (!isset($_SESSION['id_user'])) {
    http_response_code(401);
    echo json_encode(['erreur' => 'Utilisateur non connecté']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$panier = $data['panier'] ?? [];
$adresse = $data['adresse'] ?? null;

if (empty($panier) || !is_array($panier)) {
    http_response_code(400);
    echo json_encode(['erreur' => 'Panier vide']);
    exit;
}

$id_user = $_SESSION['id_user'];

try {
    $db = getDb();
    $db->beginTransaction();

    // gérer l'adresse : utiliser la première adresse existante ou insérer une adresse neutre
    if ($adresse && is_array($adresse) && isset($adresse['rue'])) {
        $stmt = $db->prepare("INSERT INTO Adresse (id_user, rue, ville, code_postal, pays) VALUES (:id_user, :rue, :ville, :code_postal, :pays)");
        $stmt->execute([
            ':id_user' => $id_user,
            ':rue' => $adresse['rue'] ?? '',
            ':ville' => $adresse['ville'] ?? '',
            ':code_postal' => $adresse['code_postal'] ?? '',
            ':pays' => $adresse['pays'] ?? ''
        ]);
        $id_adresse = $db->lastInsertId();
    } else {
        $stmt = $db->prepare("SELECT id_adresse FROM Adresse WHERE id_user = :id_user LIMIT 1");
        $stmt->execute([':id_user' => $id_user]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $id_adresse = $row['id_adresse'];
        } else {
            $stmt = $db->prepare("INSERT INTO Adresse (id_user, rue, ville, code_postal, pays) VALUES (:id_user, :rue, :ville, :code_postal, :pays)");
            $stmt->execute([
                ':id_user' => $id_user,
                ':rue' => 'Non renseigné',
                ':ville' => 'Non renseigné',
                ':code_postal' => '00000',
                ':pays' => 'Non renseigné'
            ]);
            $id_adresse = $db->lastInsertId();
        }
    }

    // Créer la commande et lignes
    $total = 0.0;

    // Vérifier disponibilité et calculer total
    $stocksToUpdate = [];
    foreach ($panier as $item) {
        $id_modele = $item['id_modele'] ?? null;
        $taille = $item['taille'] ?? null;
        $pied = $item['cote'] ?? null; // 'gauche' ou 'droite'
        $quantite = $item['quantite'] ?? 1;
        $prix = $item['prix'] ?? 0;

        if (!$id_modele || $taille === null || !$pied) {
            $db->rollBack();
            http_response_code(400);
            echo json_encode(['erreur' => 'Item de panier invalide']);
            exit;
        }

        $stmt = $db->prepare("SELECT id_stock, stock FROM Stock_Chaussure WHERE id_modele = :id_modele AND taille = :taille AND pied = :pied");
        $stmt->execute([':id_modele' => $id_modele, ':taille' => $taille, ':pied' => $pied]);
        $stockRow = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$stockRow) {
            $db->rollBack();
            http_response_code(400);
            echo json_encode(['erreur' => "Stock introuvable pour le modèle $id_modele taille $taille côté $pied"]);
            exit;
        }

        if ($stockRow['stock'] < $quantite) {
            $db->rollBack();
            http_response_code(400);
            echo json_encode(['erreur' => "Quantité insuffisante pour le modèle $id_modele taille $taille"]);
            exit;
        }

        $stocksToUpdate[] = ['id_stock' => $stockRow['id_stock'], 'new_stock' => $stockRow['stock'] - $quantite];
        $total += floatval($prix) * intval($quantite);
    }

    // Insérer la commande
    $stmt = $db->prepare("INSERT INTO Commande (id_user, id_adresse, date_commande, statut, total) VALUES (:id_user, :id_adresse, :date_commande, :statut, :total)");
    $date = date('Y-m-d');
    $stmt->execute([
        ':id_user' => $id_user,
        ':id_adresse' => $id_adresse,
        ':date_commande' => $date,
        ':statut' => 'en_attente',
        ':total' => $total
    ]);

    $id_commande = $db->lastInsertId();

    // Insérer lignes et mettre à jour stocks
    foreach ($panier as $item) {
        $id_modele = $item['id_modele'];
        $taille = $item['taille'];
        $pied = $item['cote'];
        $quantite = $item['quantite'];
        $prix = $item['prix'];

        // retrouver id_stock de nouveau (sécurité)
        $stmt = $db->prepare("SELECT id_stock FROM Stock_Chaussure WHERE id_modele = :id_modele AND taille = :taille AND pied = :pied");
        $stmt->execute([':id_modele' => $id_modele, ':taille' => $taille, ':pied' => $pied]);
        $stockRow = $stmt->fetch(PDO::FETCH_ASSOC);
        $id_stock = $stockRow['id_stock'];

        $ins = $db->prepare("INSERT INTO Ligne_Commande (id_commande, id_stock, quantite, prix_unitaire) VALUES (:id_commande, :id_stock, :quantite, :prix_unitaire)");
        $ins->execute([
            ':id_commande' => $id_commande,
            ':id_stock' => $id_stock,
            ':quantite' => $quantite,
            ':prix_unitaire' => $prix
        ]);

        // mise à jour stock
        $upd = $db->prepare("UPDATE Stock_Chaussure SET stock = stock - :q WHERE id_stock = :id_stock");
        $upd->execute([':q' => $quantite, ':id_stock' => $id_stock]);
    }

    $db->commit();

    echo json_encode(['succes' => true, 'id_commande' => $id_commande]);
    exit;
} catch (Exception $e) {
    if ($db && $db->inTransaction()) $db->rollBack();
    http_response_code(500);
    echo json_encode(['erreur' => $e->getMessage()]);
    exit;
}

?>
