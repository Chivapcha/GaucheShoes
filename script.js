function ouvrirPanier() {
    document.getElementById("panier").style.visibility = "visible";
    afficherPanier();
}
function fermerPanier() {
    document.getElementById("panier").style.visibility = "hidden";
}

function ouvrirCompte() {
    document.getElementById("compte").style.visibility = "visible";
    document.getElementById("menuCompteDropdown").style.display = "none";
}
function fermerCompte() {
    document.getElementById("compte").style.visibility = "hidden";
    document.getElementById("creationCompte").style.visibility = "hidden";
    document.getElementById("connexionCompte").style.visibility = "hidden";
    effacerErreurs();
}

function ouvrirInscription() {
    document.getElementById("creationCompte").style.visibility = "visible";
    document.getElementById("connexionCompte").style.visibility = "hidden";
    effacerErreurs();
}

function ouvrirConnexion() {
    document.getElementById("connexionCompte").style.visibility = "visible";
    document.getElementById("creationCompte").style.visibility = "hidden";
    effacerErreurs();
}

function toggleMenuCompte() {
    const menu = document.getElementById("menuCompteDropdown");
    menu.style.display = menu.style.display === "none" ? "block" : "none";
}

function fermerMenuCompte() {
    document.getElementById("menuCompteDropdown").style.display = "none";
}

let panier = [];

// Validation et affichage d'erreurs
function validerEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validerMotDePasse(mdp) {
    return mdp.length >= 6;
}

function afficherErreur(elementId, message) {
    const elem = document.getElementById(elementId);
    if (elem) {
        elem.textContent = message;
        elem.style.display = message ? "block" : "none";
    }
}

function effacerErreurs() {
    afficherErreur("emailError", "");
    afficherErreur("passwordError", "");
    afficherErreur("newPasswordError", "");
}

function sauvegarderPanier() {
  localStorage.setItem("panier", JSON.stringify(panier));
}

function chargerPanierDepuisStockage() {
  const panierSauvegarde = localStorage.getItem("panier");

  if (panierSauvegarde) {
    panier = JSON.parse(panierSauvegarde);
  } else {
    panier = [];
  }
}

function ajouterAuPanier(idModele, nomModele, prix, imageUrl) {
  const select = document.getElementById(`taille-${idModele}`);
  const taille = select.value;

  if (!taille) {
    alert("Choisis une taille d'abord !");
    return;
  }

  const ligneExistante = panier.find(item => item.id_modele == idModele && item.taille == taille && item.cote == coteActuel);

  if (ligneExistante) {
    ligneExistante.quantite += 1;
  } else {
    panier.push({
      id_modele: idModele,
      nom_modele: nomModele,
      prix: Number(prix),
      image_url: imageUrl,
      taille: Number(taille),
      cote: coteActuel,
      quantite: 1
    });
  }

  sauvegarderPanier();
  afficherPanier();
}

function afficherPanier() {
  const container = document.getElementById("panierContenu");
  const sousTotalElt = document.getElementById("sousTotal");
  const livraisonElt = document.getElementById("livraison");
  const totalElt = document.getElementById("total");

  container.innerHTML = "";

  if (panier.length === 0) {
    container.innerHTML = "<p>Panier vide</p>";
    sousTotalElt.textContent = "0.00 €";
    livraisonElt.textContent = "0.00 €";
    totalElt.textContent = "0.00 €";
    return;
  }

  let sousTotal = 0;

  panier.forEach((item, index) => {
    const totalLigne = item.prix * item.quantite;
    sousTotal += totalLigne;
    
    container.innerHTML += `
      <div class="ligne-panier">
        <img src="${item.image_url || 'img/default.jpg'}" alt="${item.nom_modele}" class="miniature">
        <div class="detailsArtPanier">
          <strong>${item.nom_modele}</strong>
          <p>Taille : ${item.taille}</p>
          <p>Côté : ${item.cote}</p>
          <p>Quantité : ${item.quantite}</p>
          <p>${totalLigne.toFixed(2)} €</p>
        </div>
        <button onclick="supprimerDuPanier(${index})">Supprimer</button>
      </div>
      <br>
    `;
  });

  const livraison = sousTotal > 0 ? (sousTotal < 100 ? 12.98 : 0) : 0;
  const total = sousTotal + livraison;

  sousTotalElt.textContent = `${sousTotal.toFixed(2)} €`;
  livraisonElt.textContent = `${livraison.toFixed(2)} €`;
  totalElt.textContent = `${total.toFixed(2)} €`;
}

function supprimerDuPanier(index) {
  const item = panier[index];

  if (item.quantite > 1) {
    item.quantite -= 1;
  } else {
    panier.splice(index, 1);
  }
  
  sauvegarderPanier();
  afficherPanier();
}

function viderPanier() {
  panier = [];
  localStorage.removeItem("panier");
  afficherPanier();
}

let coteActuel = 'gauche';

function switchCote() {
  coteActuel = (coteActuel === 'gauche') ? 'droite' : 'gauche';

  const bouton = document.getElementById('changeCote');
  bouton.innerHTML = coteActuel === 'gauche' ? '<i class="fa-solid fa-arrow-right-arrow-left"></i> Passer à droite' : '<i class="fa-solid fa-arrow-right-arrow-left"></i> Passer à gauche';
  chargerCatalogue();
}

async function chargerCatalogue() {
  const reponse = await fetch(`api_catalogue.php?cote=${coteActuel}`);
  const produits = await reponse.json();

  for (const produit of produits) {
    const repTailles = await fetch(`api_tailles.php?id_modele=${produit.id_modele}&cote=${coteActuel}`);
    const taillesData = await repTailles.json();
    produit.tailles = [...new Set(taillesData.map(item => item.taille))];
  }

  afficherCatalogue(produits);
}

async function inscrireUtilisateur() {
  effacerErreurs();
  const nom = document.getElementById("newName").value.trim();
  const email = document.getElementById("newEmail").value.trim();
  const motDePasse = document.getElementById("newPassword").value;

  // Validations
  if (!nom) {
    afficherErreur("newPasswordError", "Le nom est requis");
    return;
  }

  if (!validerEmail(email)) {
    afficherErreur("emailError", "Veuillez entrer un email valide");
    return;
  }

  if (!validerMotDePasse(motDePasse)) {
    afficherErreur("newPasswordError", "Le mot de passe doit contenir au moins 6 caractères");
    return;
  }

  const reponse = await fetch("api_inscription.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nom_util: nom,
      email: email,
      mot_de_passe: motDePasse
    })
  });

  const data = await reponse.json();

  if (data.succes) {
    alert("✓ Compte créé et connecté");
    fermerCompte();
    mettreAJourInterfaceUtilisateur(data.utilisateur);
    document.getElementById("newName").value = "";
    document.getElementById("newEmail").value = "";
    document.getElementById("newPassword").value = "";
  } else {
    afficherErreur("emailError", data.erreur || "Erreur lors de l'inscription");
  }
}

async function connecterUtilisateur() {
  effacerErreurs();
  const email = document.getElementById("email").value.trim();
  const motDePasse = document.getElementById("password").value;

  // Validations
  if (!validerEmail(email)) {
    afficherErreur("emailError", "Veuillez entrer un email valide");
    return;
  }

  if (!validerMotDePasse(motDePasse)) {
    afficherErreur("passwordError", "Le mot de passe doit contenir au moins 6 caractères");
    return;
  }

  const reponse = await fetch("api_connexion.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email,
      mot_de_passe: motDePasse
    })
  });

  const data = await reponse.json();

  if (data.succes) {
    alert("✓ Connexion réussie");
    fermerCompte();
    mettreAJourInterfaceUtilisateur(data.utilisateur);
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
  } else {
    afficherErreur("emailError", data.erreur || "Erreur connexion");
  }
}

async function verifierSession() {
  const reponse = await fetch("api_session.php");
  const data = await reponse.json();

  if (data.connecte) {
    mettreAJourInterfaceUtilisateur(data.utilisateur);
  } else {
    mettreAJourInterfaceUtilisateur(null);
  }
}

async function deconnecterUtilisateur() {
  const reponse = await fetch("api_deconnexion.php");
  const data = await reponse.json();

  if (data.succes) {
    mettreAJourInterfaceUtilisateur(null);
    fermerMenuCompte();
    alert("✓ Vous avez été déconnecté");
  }
}

function mettreAJourInterfaceUtilisateur(utilisateur) {
  const boutonCompte = document.getElementById("boutonCompte");
  const btnDeconnecter = document.getElementById("btnDeconnecter");

  if (utilisateur) {
    boutonCompte.innerHTML = `<i class="fas fa-user"></i> ${utilisateur.nom_util}`;
    btnDeconnecter.style.display = "block";
  } else {
    boutonCompte.innerHTML = `<i class="fas fa-user"></i>`;
    btnDeconnecter.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  chargerPanierDepuisStockage();
  chargerCatalogue();
  afficherPanier();
  verifierSession();

  document.getElementById("boutonCreerCompte").addEventListener("click", inscrireUtilisateur);
  document.getElementById("boutonConnexioncompte").addEventListener("click", connecterUtilisateur);

  // Fermer le menu si on clique ailleurs
  document.addEventListener("click", (e) => {
    const menu = document.getElementById("menuCompteDropdown");
    const boutonCompte = document.getElementById("boutonCompte");
    const menuContainer = document.querySelector(".menuCompteCont");
    
    if (!menuContainer.contains(e.target)) {
      menu.style.display = "none";
    }
  });
});

function afficherCatalogue(produits) {
  const container = document.getElementById("catalogueContainer");
  container.innerHTML = "";

  produits.forEach(produit => {
    const optionsTailles = produit.tailles
      .map(taille => `<option value="${taille}">${taille}</option>`)
      .join("");

    container.innerHTML += `
      <div class="chaussure">
        <div class="chaussImg">
          <img src="${produit.image_url}" alt="${produit.nom_modele}">
        </div>

        <div class="chausTexte">
          <b class="nomChaussure">${produit.marque} ${produit.nom_modele}</b>
          <p class="descChaussure">${produit.descr}</p>

          <p>
            <span class="tailleText">Je choisis ma taille : </span>
            <select id="taille-${produit.id_modele}" class="taille">
              <option value="">--</option>
              ${optionsTailles}
            </select>
          </p>
          
          <div class="prixBouton">
            <p class="prixChaussure">${Number(produit.prix).toFixed(2)} €</p>
            <button type="button" class="avecFond" onclick="ajouterAuPanier(${produit.id_modele}, '${produit.nom_modele.replace(/'/g, "\\'").replace(/"/g, '\\"')}', ${produit.prix}, '${produit.image_url.replace(/'/g, "\\'").replace(/"/g, '\\"')}')">
              <i class="fas fa-cart-shopping"></i> Ajouter au panier
            </button>
          </div>
        </div>
      </div>
    `;
  });
}