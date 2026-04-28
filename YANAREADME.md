# GaucheShoes

## Installation & Lancement (Windows)

### 1. Cloner le repo et récupérer les changements
```cmd
git pull origin master
```

### 2. Créer la base de données
```cmd
del projet.db
sqlite3 projet.db < schema.sql
sqlite3 projet.db < insert_test.sql
```

### 3. Lancer le serveur
```cmd
php -S localhost:8000
```

### 4. Tester le site
Ouvre http://localhost:8000/catalogue.html
