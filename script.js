function ouvrirPanier() {
    document.getElementById("panier").style.visibility = "visible";
    afficherPanier();
}
function fermerPanier() {
    document.getElementById("panier").style.visibility = "hidden";
}

function ouvrirCompte() {
    document.getElementById("compte").style.visibility = "visible";
}
function fermerCompte() {
    document.getElementById("compte").style.visibility = "hidden";
    document.getElementById("creationCompte").style.visibility = "hidden";
    document.getElementById("connexionCompte").style.visibility = "hidden";
}

function ouvrirInscription() {
    document.getElementById("creationCompte").style.visibility = "visible";
    document.getElementById("connexionCompte").style.visibility = "hidden";
}

function ouvrirConnexion() {
    document.getElementById("connexionCompte").style.visibility = "visible";
    document.getElementById("creationCompte").style.visibility = "hidden";
}

let panier = [];

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
        <p><strong>${item.nom_modele}</strong></p>
        <p><img src="${item.image_url || 'img/default.jpg'}" alt="${item.nom_modele}" class="miniature" style="width: 100px; height: 100px;"></p>
        <p>Taille : ${item.taille} | Côté : ${item.cote}</p>
        <p>Quantité : ${item.quantite}</p>
        <p>${totalLigne.toFixed(2)} €</p>
        <button onclick="supprimerDuPanier(${index})">Supprimer</button>
      </div>
      <hr>
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

document.addEventListener("DOMContentLoaded", () => {
  chargerPanierDepuisStockage();
  chargerCatalogue();
  afficherPanier();
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