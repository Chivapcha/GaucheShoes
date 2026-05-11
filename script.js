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
let utilisateurActuel = null;

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
    afficherErreur("nameError", "");
    afficherErreur("passwordErrorCo", "");
    afficherErreur("emailErrorCo", "");
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

  // Mettre à jour l'affichage du stock côté client (décrémenter)
  const opt = select.querySelector(`option[value="${taille}"]`);
  if (opt) {
    const s = Number(opt.dataset.stock || 0) - 1;
    if (s <= 0) {
      // retirer l'option si plus de stock
      opt.remove();
      // si la taille retirée était sélectionnée, réinitialiser
      if (select.value === taille) {
        select.value = '';
      }
    } else {
      opt.dataset.stock = s;
    }
    updateStockDisplay(idModele);
  }
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

  // Mettre à jour l'affichage du stock côté client (incrémenter)
  try {
    const select = document.getElementById(`taille-${item.id_modele}`);
    if (select) {
      let opt = select.querySelector(`option[value="${item.taille}"]`);
      if (opt) {
        opt.dataset.stock = Number(opt.dataset.stock || 0) + 1;
      } else {
        // recréer l'option si elle avait été retirée
        opt = document.createElement('option');
        opt.value = item.taille;
        opt.dataset.stock = 1;
        opt.textContent = item.taille;
        select.appendChild(opt);
      }
      updateStockDisplay(item.id_modele);
    }
  } catch (e) {
    console.error('Erreur en mettant à jour le stock affiché', e);
  }
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

  document.getElementById("body").style.transform = coteActuel === 'gauche' ? 'scaleX(1)' : 'scaleX(-1)';
  chargerCatalogue();
}

async function chargerCatalogue() {
  const reponse = await fetch(`api_catalogue.php?cote=${coteActuel}`);
  const produits = await reponse.json();

  for (const produit of produits) {
    const repTailles = await fetch(`api_tailles.php?id_modele=${produit.id_modele}&cote=${coteActuel}`);
    const taillesData = await repTailles.json();
    // convertir en tableau d'objets {taille, stock} et garder une entrée par taille
    const mapTailles = {};
    for (const t of taillesData) {
      mapTailles[t.taille] = Number(t.stock);
    }
    produit.tailles = Object.keys(mapTailles).map(t => ({ taille: Number(t), stock: mapTailles[t] }));
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
    afficherErreur("nameError", "Le nom est requis");
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
    effacerErreurs();
    afficherErreur("emailErrorCo", "Veuillez entrer un email valide");
    return;
  }

  if (!validerMotDePasse(motDePasse)) {
    effacerErreurs();
    afficherErreur("passwordErrorCo", "Le mot de passe doit contenir au moins 6 caractères");
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
  const btnConnexion = document.getElementById("btnConnexion");
  const btnInfoCompte = document.getElementById("btnInfoCompte");

  utilisateurActuel = utilisateur;

  if (utilisateur) {
    boutonCompte.innerHTML = `<i class="fas fa-user"></i> ${utilisateur.nom_util}`;
    btnDeconnecter.style.display = "block";
    btnConnexion.style.display = "none";
    btnInfoCompte.style.display = "block";
  } else {
    boutonCompte.innerHTML = `<i class="fas fa-user"></i>`;
    btnDeconnecter.style.display = "none";
    btnConnexion.style.display = "block";
    btnInfoCompte.style.display = "none";
  }
}

function ouvrirInfoCompte() {
  if (utilisateurActuel) {
    const infoBody = document.querySelector(".infoCompteBody");
    infoBody.innerHTML = `
      <div>
        <p><strong>Nom :</strong> ${utilisateurActuel.nom_util}</p>
        <p><strong>Email :</strong> ${utilisateurActuel.email}</p>
        <br>
        <button onclick="afficherHistorique()" class="avecFond" id="boutonHistoriqueCommandes">Historique des commandes</button>
      </div>
    `;
  }
  document.getElementById("infoCompte").style.visibility = "visible";
  fermerMenuCompte();
}

async function afficherHistorique() {
  const infoBody = document.querySelector(".infoCompteBody");

  if (!utilisateurActuel) {
    infoBody.innerHTML = `<p>Vous devez être connecté pour voir vos commandes.</p>`;
    return;
  }

  infoBody.innerHTML = `<p>Chargement des commandes en cours...</p>`;

  try {
    const reponse = await fetch('api_historique_commandes.php', {
      credentials: 'same-origin'
    });
    const data = await reponse.json();

    if (!reponse.ok) {
      infoBody.innerHTML = `<p>${data.erreur || 'Impossible de charger les commandes'}</p>`;
      return;
    }

    const commandes = data.commandes || [];

    if (commandes.length === 0) {
      infoBody.innerHTML = `
        <button type="button" class="avecFond" onclick="ouvrirInfoCompte()" style="margin-bottom: 16px;">
          Retour aux infos du compte
        </button>
        <p>Aucune commande en cours.</p>
      `;
      return;
    }

    const etatTexte = {
      en_attente: 'En attente',
      payee: 'Payée',
      expediee: 'Expédiée'
    };

    infoBody.innerHTML = `
      <button type="button" class="avecFond" onclick="ouvrirInfoCompte()" style="margin-bottom: 16px;">
        Retour aux infos du compte
      </button>
      ${commandes.map(cmd => `
      <div class="commandeBloc" style="margin-bottom: 18px; padding: 12px; border: 1px solid #ddd; border-radius: 8px;">
        <p><strong>Commande #${cmd.id_commande}</strong></p>
        <p>Date : ${cmd.date_commande}</p>
        <p>Statut : ${etatTexte[cmd.statut] || cmd.statut}</p>
        <p>Total : ${Number(cmd.total).toFixed(2)} €</p>
        <div style="margin-top: 10px;">
          ${cmd.lignes.map(ligne => `
            <div style="display:flex; gap:10px; align-items:center; margin-bottom:8px;">
              <img src="${ligne.image_url || 'img/default.jpg'}" alt="${ligne.nom_modele}" style="width:48px; height:48px; object-fit:cover; border-radius:6px;">
              <div>
                <p><strong>${ligne.marque} ${ligne.nom_modele}</strong></p>
                <p>Taille ${ligne.taille} - ${ligne.pied} - Qté ${ligne.quantite}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')}
    `;
  } catch (e) {
    console.error(e);
    infoBody.innerHTML = `
      <button type="button" class="avecFond" onclick="ouvrirInfoCompte()" style="margin-bottom: 16px;">
        Retour aux infos du compte
      </button>
      <p>Erreur lors du chargement de l'historique.</p>
    `;
  }
}

function fermerInfoCompte() {
  document.getElementById("infoCompte").style.visibility = "hidden";
}

document.addEventListener("DOMContentLoaded", () => {
  chargerPanierDepuisStockage();
  chargerCatalogue();
  afficherPanier();
  verifierSession();

  document.getElementById("boutonCreerCompte").addEventListener("click", inscrireUtilisateur);
  document.getElementById("boutonConnexioncompte").addEventListener("click", connecterUtilisateur);
  const historiqueBtn = document.getElementById("historique");
  if (historiqueBtn) {
    historiqueBtn.addEventListener("click", afficherHistorique);
  }

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

// Utilitaire client-side pour exiger la connexion avant une action
function requireLogin(action) {
  if (utilisateurActuel) {
    try {
      action();
    } catch (e) {
      console.error(e);
      alert('Une erreur est survenue');
    }
  } else {
    ouvrirCompte();
  }
}

// Envoie le panier au serveur pour créer une commande (nécessite session)
async function passerCommande() {
  if (!utilisateurActuel) {
    ouvrirCompte();
    return;
  }

  if (!panier || panier.length === 0) {
    alert('Votre panier est vide');
    return;
  }

  const payload = {
    panier: panier,
    adresse: null // ici on ne collecte pas d'adresse; le serveur utilisera une adresse existante ou créera une entrée vide
  };

  try {
    const resp = await fetch('api_passer_commande.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(payload)
    });

    const data = await resp.json();

    if (!resp.ok) {
      alert(data.erreur || 'Erreur lors de la création de la commande');
      return;
    }

    // succès
    alert('✓ Commande créée (id ' + data.id_commande + ')');
    // vider le panier côté client
    viderPanier();
    fermerPanier();
    // rafraîchir le catalogue pour récupérer les nouveaux stocks côté serveur
    chargerCatalogue();
  } catch (e) {
    console.error(e);
    alert('Erreur réseau lors de la commande');
  }
}

// lier le bouton si présent (gestion au chargement différée)
document.addEventListener('DOMContentLoaded', () => {
  const btnPasser = document.getElementById('passerCommande');
  if (btnPasser) btnPasser.addEventListener('click', () => requireLogin(passerCommande));
});

function afficherCatalogue(produits) {
  const container = document.getElementById("catalogueContainer");
  container.innerHTML = "";

  produits.forEach(produit => {
    const optionsTailles = produit.tailles
      .map(t => `<option value="${t.taille}" data-stock="${t.stock}">${t.taille}</option>`)
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
              <select id="taille-${produit.id_modele}" class="taille" onchange="updateStockDisplay(${produit.id_modele})">
                <option value="">--</option>
                ${optionsTailles}
              </select>
              <span class="stockInfo" id="stock-${produit.id_modele}" style="margin-left:8px;font-size:0.9em;color:#333"></span>
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

    // initialiser l'affichage du stock (au cas où une taille par défaut est sélectionnée)
    setTimeout(() => updateStockDisplay(produit.id_modele), 0);
  });
}

// Met à jour l'affichage du stock à côté du sélecteur de taille
function updateStockDisplay(idModele) {
  const select = document.getElementById(`taille-${idModele}`);
  const span = document.getElementById(`stock-${idModele}`);
  if (!select || !span) return;

  const val = select.value;
  if (!val) {
    span.textContent = '';
    return;
  }

  const opt = select.options[select.selectedIndex];
  const stock = opt ? opt.dataset.stock : null;
  if (stock === undefined || stock === null) {
    span.textContent = '';
  } else {
    span.textContent = `Stock : ${stock}`;
  }
}