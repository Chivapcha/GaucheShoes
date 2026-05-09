DELETE FROM Ligne_Commande;
DELETE FROM Commande;
DELETE FROM Stock_Chaussure;
DELETE FROM Adresse;
DELETE FROM Utilisateur;
DELETE FROM Modele_Chaussure;

DELETE FROM sqlite_sequence;
/*
INSERT INTO Utilisateur (nom_util, email, mdp_hash)
VALUES
('Eliot', 'eliot@test.com', '$2y$12$S9Wi.rwSqYp4/sr3zwxp8Oo.O/p3NlPa7pBOw/eAWHGkMukKCmNWC'),
('Yana', 'yana@test.com', '$2y$12$Cru3S7Sgc2QnE4n9ljUyI.TlqS0esEr8IwHc2T0D2jtYi1BodbwgG');

INSERT INTO Adresse (id_user, rue, ville, code_postal, pays)
VALUES
(2, '948 rue des orang-outans', 'Lille', '59000', 'Ukraine'),
(1, '4657 route droite', 'Valenciennes', '59300', 'France');
*/
INSERT INTO Modele_Chaussure (marque, nom_modele, couleur, descr, image_url, prix)
VALUES 
('Nike', 'Lighting', 'Saumon', 'Chaussure qui coure vite', 'img/c3.jpg', 35.76),
('Parso', 'Loddes', 'Marron', 'Chaussure qui coute cher', 'img/c1.jpg', 84.54),
('Parso', 'Talles', 'Noire', 'Chaussure à talon', 'img/c2.jpg', 31.28),
('Quick', 'Salmons', 'Saumon', 'Description trop trop trop longue il faut que tu modifie ca si tu peux stp parce que sinon ca va etre trop long et on pourras pas voir les informations', 'img/c4.jpg', 37.65);

INSERT INTO Stock_Chaussure (id_modele, taille, stock, pied)
VALUES
(1, 36, 5, 'gauche'),
(1, 37, 4, 'droite'),
(1, 38, 8, 'gauche'),
(1, 39, 7, 'droite'),
(1, 40, 6, 'gauche'),
(1, 41, 9, 'droite'),
(1, 42, 4, 'gauche'),
(1, 43, 2, 'droite'),
(2, 36, 10, 'gauche'),
(2, 37, 65, 'droite'),
(2, 38, 5, 'gauche'),
(2, 39, 6, 'droite'),
(2, 40, 8, 'gauche'),
(2, 41, 9, 'droite'),
(2, 42, 7, 'gauche'),
(2, 43, 4, 'droite'),
(3, 36, 1, 'gauche'),
(3, 37, 2, 'droite'),
(3, 38, 3, 'gauche'),
(3, 39, 5, 'droite'),
(3, 40, 8, 'gauche'),
(3, 41, 12, 'droite'),
(3, 42, 23, 'gauche'),
(3, 43, 6, 'droite'),
(4, 36, 8, 'gauche'),
(4, 37, 5, 'droite'),
(4, 38, 7, 'gauche'),
(4, 39, 4, 'droite'),
(4, 40, 6, 'gauche'),
(4, 41, 9, 'droite'),
(4, 42 ,8 , 'gauche'),
(4 ,43 ,5 , 'droite');
/*
INSERT INTO Commande (id_user, id_adresse, date_commande, statut, total)
VALUES (2, 1, '2026-04-27', 'en_attente', 79.99);

INSERT INTO Ligne_Commande (id_commande, id_stock, quantite, prix_unitaire)
VALUES (1, 1, 1, 79.99);*/