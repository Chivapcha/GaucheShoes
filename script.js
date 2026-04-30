function ouvrirPanier() {
    document.getElementById("panier").style.visibility = "visible";
}
function fermerPanier() {
    document.getElementById("panier").style.visibility = "hidden";
}

function ouvrirCompte() {
    document.getElementById("compte").style.visibility = "visible";
}
function fermerCompte() {
    document.getElementById("compte").style.visibility = "hidden";
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
  chargerCatalogue();
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
            <select class="taille">
              ${optionsTailles}
            </select>
          </p>
          <div class="prixBouton">
            <p class="prixChaussure">${produit.prix.toFixed(2)} €</p>
            <button type="button" class="avecFond">
              <i class="fas fa-cart-shopping"></i> Ajouter
            </button>
          </div>
        </div>
      </div>
    `;
  });
}

afficherCatalogue(produits);