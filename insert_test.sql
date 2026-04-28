INSERT INTO Utilisateur (nom_util, email, mdp_hash)
VALUES
('Eliot', 'eliot@test.com', 'hash_eliot_test_0211'),
('Yana', 'yana@test.com', 'hash_yana_test_3003');

INSERT INTO Adresse (id_user, rue, ville, code_postal, pays)
VALUES
(2, '948 rue des orang-outans', 'Lille', '59000', 'Ukraine'),
(1, '4657 route droite', 'Valenciennes', '59300', 'France');

INSERT INTO Modele_Chaussure (marque, nom_modele, couleur, descr, image_url, prix)
VALUES 
('Nike', 'Air Test', 'Noir', 'Chaussure confortable', 'default.jpg', 79.99),
('Adidas', 'Run Light', 'Blanc', 'Chaussure legere', 'default3.jpg', 69.99);

INSERT INTO Stock_Chaussure (id_modele, taille, stock, pied)
VALUES
(1, 40, 5, 'gauche'),
(1, 40, 5, 'droite'),
(1, 41, 3, 'gauche'),
(1, 41, 3, 'droite'),
(2, 39, 4, 'gauche'),
(2, 39, 4, 'droite');

INSERT INTO Commande (id_user, id_adresse, date_commande, statut, total)
VALUES (2, 1, '2026-04-27', 'en_attente', 79.99);

INSERT INTO Ligne_Commande (id_commande, id_stock, quantite, prix_unitaire)
VALUES (1, 1, 1, 79.99);