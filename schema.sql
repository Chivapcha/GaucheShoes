PRAGMA foreign_keys = ON;

CREATE TABLE Utilisateur (
    id_user INTEGER PRIMARY KEY AUTOINCREMENT,
    nom_util TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    mdp_hash TEXT NOT NULL
);

CREATE TABLE Adresse (
    id_adresse INTEGER PRIMARY KEY AUTOINCREMENT,
    id_user INTEGER NOT NULL,
    rue TEXT NOT NULL,
    ville TEXT NOT NULL,
    code_postal TEXT NOT NULL,
    pays TEXT NOT NULL,
    FOREIGN KEY (id_user) REFERENCES Utilisateur(id_user)
);

CREATE TABLE Modele_Chaussure (
    id_modele INTEGER PRIMARY KEY AUTOINCREMENT,
    marque TEXT NOT NULL,
    nom_modele TEXT NOT NULL,
    couleur TEXT NOT NULL,
    descr TEXT NOT NULL,
    image_url TEXT NOT NULL,
    prix REAL NOT NULL CHECK (prix >= 0)
);

CREATE TABLE Stock_Chaussure (
    id_stock INTEGER PRIMARY KEY AUTOINCREMENT,
    id_modele INTEGER NOT NULL,
    taille INTEGER NOT NULL CHECK (taille >= 0),
    stock INTEGER NOT NULL CHECK (stock >= 0),
    pied TEXT NOT NULL CHECK (pied IN ('gauche', 'droite')),
    UNIQUE (id_modele, taille, pied)
    FOREIGN KEY (id_modele) REFERENCES Modele_Chaussure(id_modele)
);

CREATE TABLE Commande (
    id_commande INTEGER PRIMARY KEY AUTOINCREMENT,
    id_user INTEGER NOT NULL,
    id_adresse INTEGER NOT NULL,
    date_commande TEXT NOT NULL,
    statut TEXT NOT NULL CHECK (statut IN ('en_attente', 'payee', 'expediee', 'annulee')),
    total REAL NOT NULL CHECK (total >= 0),
    FOREIGN KEY (id_user) REFERENCES Utilisateur(id_user),
    FOREIGN KEY (id_adresse) REFERENCES Adresse(id_adresse)
);

CREATE TABLE Ligne_Commande (
    id_ligne INTEGER PRIMARY KEY AUTOINCREMENT,
    id_commande INTEGER NOT NULL,
    id_stock INTEGER NOT NULL,
    quantite INTEGER NOT NULL CHECK (quantite >= 0),
    prix_unitaire REAL NOT NULL CHECK (prix_unitaire >= 0),
    FOREIGN KEY (id_commande) REFERENCES Commande(id_commande),
    FOREIGN KEY (id_stock) REFERENCES Stock_Chaussure(id_stock)
);