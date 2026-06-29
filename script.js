let shoes = [];
let displayedProducts = 12;
let currentProducts = [];

const shoesGrid = document.getElementById("shoesGrid");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const resultsCount = document.getElementById("resultsCount");
const terrainFilter = document.getElementById("terrainFilter");
const usageFilter = document.getElementById("usageFilter");
const levelFilter = document.getElementById("levelFilter");
const priceFilter = document.getElementById("priceFilter");
const cushioningFilter = document.getElementById("cushioningFilter");
const pronationFilter = document.getElementById("pronationFilter");
const distanceFilter = document.getElementById("distanceFilter");
const sortSelect = document.getElementById("sortSelect");
const resetFiltersBtn = document.getElementById("resetFiltersBtn");
const recommendationCard = document.getElementById("recommendationCard");
const loadMoreBtn = document.getElementById("loadMoreBtn");

fetch("data/Classeur2.csv")
  .then((response) => response.text())
  .then((csvText) => {
    const products = parseCSV(csvText);
    shoes = normalizeProducts(products);
    applyFilters();
  });

function parseCSV(csvText) {
  const lines = csvText.trim().split("\n");
  const headers = lines[0].replace("\uFEFF", "").split(";");

  return lines.slice(1).map((line) => {
    const values = line.split(";");
    const product = {};

    headers.forEach((header, index) => {
      product[header.trim()] = values[index]?.trim();
    });

    return product;
  });
}

function normalizeProducts(products) {
  const uniqueProducts = new Map();

  products.forEach((product) => {
    if (product.sport !== "Running") return;

    const productKey = product["Product URL"];
    if (!productKey) return;

    if (!uniqueProducts.has(productKey)) {
      uniqueProducts.set(productKey, {
        brand: product.brand || "adidas",
        model: cleanProductName(product["Product Name"]),
        image: product["Product Image URL"],
        product_url: product["Product URL"],
        price: getProductPrice(product),
        terrain: guessTerrain(product),
        usage: guessUsage(product),
        cushioning: guessCushioning(product),
        distance_tags: guessDistanceTags(product),
        level: guessLevel(product),
        pronation: guessPronation(product),
        rating: product.rating || "5,0"
      });
    }
  });

  return Array.from(uniqueProducts.values());
}

function cleanProductName(name) {
  if (!name) return "Produit running";

  return name
    .replace("Chaussure de running", "")
    .replace("Chaussures de running", "")
    .replace("Chaussure", "")
    .replace("chaussure", "")
    .trim();
}

function getProductPrice(product) {
  const price = product.sale_price || product.price || "0";
  return price.replace(",", ".");
}

function guessTerrain(product) {
  const text = `${product["Product Name"]} ${product.Description} ${product.specifications}`.toLowerCase();

  if (text.includes("trail")) return "Trail";
  if (text.includes("track") || text.includes("piste")) return "Piste";

  return "Route";
}

function guessUsage(product) {
  const name = product["Product Name"].toLowerCase();

  if (name.includes("adios pro") || name.includes("pro evo")) return "Racing";
  if (name.includes("takumi") || name.includes("adizero")) return "Speed Work";
  if (name.includes("ultraboost") || name.includes("adistar") || name.includes("supernova")) return "Long Run";

  return "Daily Training";
}

function guessCushioning(product) {
  const text = `${product["Product Name"]} ${product.Description} ${product.specifications}`.toLowerCase();

  if (text.includes("ultraboost") || text.includes("supernova") || text.includes("adistar") || text.includes("boost")) {
    return "High";
  }

  if (text.includes("adios") || text.includes("takumi") || text.includes("evo")) {
    return "Low";
  }

  return "Medium";
}


function guessDistanceTags(product) {
  const name = product["Product Name"].toLowerCase();

  if (name.includes("adios pro") || name.includes("pro evo") || name.includes("prime x")) {
    return "HALF|MARATHON";
  }

  if (name.includes("boston") || name.includes("supernova") || name.includes("ultraboost") || name.includes("adistar") || name.includes("galaxy")) {
    return "10K|HALF|MARATHON";
  }

  if (name.includes("takumi") || name.includes("adizero")) {
    return "5K_OR_LESS|10K|HALF";
  }

  return "5K_OR_LESS|10K";
}

function guessLevel(product) {
  const name = product["Product Name"].toLowerCase();

  if (name.includes("adios pro") || name.includes("takumi") || name.includes("prime x") || name.includes("pro evo")) {
    return "Advanced";
  }

  if (name.includes("boston") || name.includes("adizero")) {
    return "Intermediate|Advanced";
  }

  return "Beginner|Intermediate";
}

function guessPronation(product) {
  const text = `${product["Product Name"]} ${product.Description} ${product.specifications}`.toLowerCase();

  if (text.includes("stability") || text.includes("support")) {
    return "Pronator";
  }

  return "Neutral";
}

function applyFilters() {
  const searchTerm = searchInput.value.toLowerCase();

  let filtered = shoes.filter((shoe) => {
    const matchSearch = `${shoe.brand} ${shoe.model}`.toLowerCase().includes(searchTerm);

    const matchTerrain = !terrainFilter.value || shoe.terrain === terrainFilter.value;
    const matchUsage = !usageFilter.value || shoe.usage === usageFilter.value;
    const matchLevel = !levelFilter.value || shoe.level.includes(levelFilter.value);
    const matchPrice = !priceFilter.value || Number(shoe.price) <= Number(priceFilter.value);
    const matchCushioning = !cushioningFilter.value || shoe.cushioning === cushioningFilter.value;
    const matchPronation = !pronationFilter.value || shoe.pronation === pronationFilter.value;
    const matchDistance = !distanceFilter.value || shoe.distance_tags.includes(distanceFilter.value);

    return (
      matchSearch &&
      matchTerrain &&
      matchUsage &&
      matchLevel &&
      matchPrice &&
      matchCushioning &&
      matchPronation &&
      matchDistance
    );
  });

filtered = sortProducts(filtered);

displayedProducts = 12;
currentProducts = filtered;

updateRecommendation(filtered);
displayShoes(currentProducts);

loadMoreBtn.style.display =
  displayedProducts >= products.length ? "none" : "block";
}

function updateRecommendation(filteredProducts) {
  const hasActiveSearch = searchInput.value.trim() !== "";

  const hasActiveFilter =
    terrainFilter.value ||
    usageFilter.value ||
    levelFilter.value ||
    priceFilter.value ||
    cushioningFilter.value ||
    pronationFilter.value ||
    distanceFilter.value;

  if (!hasActiveSearch && !hasActiveFilter) {
    recommendationCard.classList.add("hidden");
    recommendationCard.innerHTML = "";
    return;
  }

  if (filteredProducts.length === 0) {
    recommendationCard.classList.add("hidden");
    recommendationCard.innerHTML = "";
    return;
  }

  const bestShoe = filteredProducts[0];

  const score = Math.min(97, 82 + countActiveFilters() * 3);

  recommendationCard.classList.remove("hidden");

  recommendationCard.innerHTML = `
    <img src="${bestShoe.image}" alt="${bestShoe.model}">

    <div class="recommendation-content">
      <p class="tag">● Recommandation RunGuide</p>
      <h2>${bestShoe.model}</h2>
      <p>
        Le modèle le plus cohérent avec vos critères actuels.
      </p>
    </div>

    <div class="recommendation-score">
      <strong>${score}</strong>
      <span>Score RunGuide</span>
      <a href="${bestShoe.product_url}" target="_blank">Voir la fiche</a>
    </div>
  `;
}

function countActiveFilters() {
  return [
    searchInput.value.trim(),
    terrainFilter.value,
    usageFilter.value,
    levelFilter.value,
    priceFilter.value,
    cushioningFilter.value,
    pronationFilter.value,
    distanceFilter.value
  ].filter(Boolean).length;
}

function sortProducts(products) {
  const sorted = [...products];

  if (sortSelect.value === "price-asc") {
    sorted.sort((a, b) => Number(a.price) - Number(b.price));
  }

  if (sortSelect.value === "price-desc") {
    sorted.sort((a, b) => Number(b.price) - Number(a.price));
  }

  if (sortSelect.value === "name-asc") {
    sorted.sort((a, b) => a.model.localeCompare(b.model));
  }

  if (sortSelect.value === "name-desc") {
    sorted.sort((a, b) => b.model.localeCompare(a.model));
  }

  return sorted;
}

function displayShoes(products) {
  shoesGrid.innerHTML = "";
  resultsCount.textContent = `${products.length} Résultats`;

  if (products.length === 0) {
    shoesGrid.innerHTML = "<p>Aucun produit trouvé.</p>";
    return;
  }

products.slice(0, displayedProducts).forEach((shoe) => {
    const card = document.createElement("article");
    card.className = "product-card";

    card.innerHTML = `
      <div class="product-image-wrapper">
        <img class="product-image" src="${shoe.image}" alt="${shoe.model}">
      </div>

      <div class="product-content">
        <div class="product-top">
          <div>
            <p class="product-brand">${shoe.brand}</p>
            <h3 class="product-name">${shoe.model}</h3>
            <p class="product-meta">${formatUsage(shoe.usage)} - ${shoe.terrain.toLowerCase()}</p>
          </div>

          <p class="product-price">
            <small>à partir de</small>
            <strong>${formatPrice(shoe.price)}€</strong>
          </p>
        </div>

        <div class="product-rating">
          ★★★★★ <span>(${shoe.rating})</span>
        </div>

        <a class="product-link" href="${shoe.product_url}" target="_blank">
          Voir la fiche
        </a>
      </div>
    `;

    shoesGrid.appendChild(card);
  });
}

function formatPrice(price) {
  const number = Number(price);
  return Number.isNaN(number) ? price : Math.round(number);
}

function formatUsage(usage) {
  const labels = {
    "Daily Training": "Quotidien",
    "Long Run": "Sortie longue",
    "Speed Work": "Fractionné",
    "Racing": "Course"
  };

  return labels[usage] || usage;
}

function resetFilters() {
  searchInput.value = "";
  terrainFilter.value = "";
  usageFilter.value = "";
  levelFilter.value = "";
  priceFilter.value = "";
  cushioningFilter.value = "";
  pronationFilter.value = "";
  distanceFilter.value = "";
  sortSelect.value = "price-asc";

  applyFilters();
}

searchInput.addEventListener("input", applyFilters);
searchBtn.addEventListener("click", applyFilters);
terrainFilter.addEventListener("change", applyFilters);
usageFilter.addEventListener("change", applyFilters);
levelFilter.addEventListener("change", applyFilters);
priceFilter.addEventListener("change", applyFilters);
cushioningFilter.addEventListener("change", applyFilters);
pronationFilter.addEventListener("change", applyFilters);
distanceFilter.addEventListener("change", applyFilters);
sortSelect.addEventListener("change", applyFilters);
resetFiltersBtn.addEventListener("click", resetFilters);

const moreFiltersBtn = document.getElementById("moreFiltersBtn");
const advancedFilters = document.getElementById("advancedFilters");

moreFiltersBtn.addEventListener("click", () => {
  advancedFilters.classList.toggle("open");

  moreFiltersBtn.textContent = advancedFilters.classList.contains("open")
    ? "Moins de filtres"
    : "Plus de filtres";
});

loadMoreBtn.addEventListener("click", () => {
  displayedProducts += 12;
  displayShoes(currentProducts);
});