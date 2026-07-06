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
const strikeFilter = document.getElementById("strikeFilter");
const distanceFilter = document.getElementById("distanceFilter");
const brandFilter = document.getElementById("brandFilter");
const colorFilter = document.getElementById("colorFilter");
const waterproofFilter = document.getElementById("waterproofFilter");
const sortSelect = document.getElementById("sortSelect");
const resetFiltersBtn = document.getElementById("resetFiltersBtn");
const recommendationCard = document.getElementById("recommendationCard");
const loadMoreBtn = document.getElementById("loadMoreBtn");

const moreFiltersBtn = document.getElementById("moreFiltersBtn");
const advancedFilters = document.getElementById("advancedFilters");


fetch("data/products.json")
  .then((response) => response.json())
  .then((products) => {
  shoes = normalizeProducts(products);
  populateBrandFilter();
  populateColorFilter();
  applyFiltersFromURL();
  applyFilters();
})
  .catch((error) => {
    console.error("Erreur de chargement du CSV :", error);
    shoesGrid.innerHTML = "<p>Impossible de charger les produits.</p>";
  });

function normalizeProducts(products) {
  return products.flatMap((product) => {
    const offers = product.offers || [];
    const offerColors = [...new Set(offers.map((offer) => offer.color).filter(Boolean))];
    const productColors = product.colors || [];
    const colors = offerColors.length ? offerColors : productColors;

    if (colors.length === 0) {
      return [createNormalizedProduct(product, "", offers)];
    }

    return colors.map((color) => {
      const colorOffers = offers.filter((offer) => offer.color === color);
      return createNormalizedProduct(product, color, colorOffers.length ? colorOffers : offers);
    });
  });
}

function createNormalizedProduct(product, color, offers) {
  const bestOffer = getBestOffer(offers) || product.offers?.[0] || {};

  return {
    brand: product.brand,
    model: cleanProductName(product.name),
    color,
    image: bestOffer.image || product.image,
    product_url: bestOffer.url || product.offers?.[0]?.url || "#",
    price: bestOffer.price || product.bestPrice,

    terrain: guessTerrain(product),
    usage: guessUsage(product),
    cushioning: guessCushioning(product),
    distance_tags: guessDistanceTags(product),
    level: guessProfile(product),
    pronation: guessPronation(product),
    strike: guessStrike(product),
    colors: color ? [color] : getProductColors(product),
    waterproof: isProductWaterproof(product),

    rating: "5,0",

    offerCount: offers.length,
    offers,

    // On garde ces champs pour les fonctions guess*
    name: product.name,
    category: product.category
  };
}

function getBestOffer(offers) {
  return [...(offers || [])]
    .filter((offer) => offer.price)
    .sort((a, b) => Number(a.price) - Number(b.price))[0];
}
function getProductColors(product) {
  const colorsFromProduct = product.colors || [];
  const colorsFromOffers = (product.offers || [])
    .map((offer) => offer.color)
    .filter(Boolean);

  return [...new Set([...colorsFromProduct, ...colorsFromOffers])];
}

function isProductWaterproof(product) {
  const productText = getProductText(product);
  const materials = [product.material || ""]
    .concat((product.offers || []).map((offer) => offer.material || ""))
    .join(" ")
    .toLowerCase();

  return (
    Boolean(product.waterproof) ||
    (product.offers || []).some((offer) => Boolean(offer.waterproof)) ||
    hasWaterproofKeyword(productText) ||
    hasWaterproofKeyword(materials)
  );
}

function hasWaterproofKeyword(text) {
  return /gore[-\s]?tex|goretex|\bgtx\b/i.test(text || "");
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

function getProductText(product) {
  return `${product.name || ""} ${product.category || ""}`.toLowerCase();
}

function guessTerrain(product) {
  const text = getProductText(product);

  if (
    text.includes("door to trail") ||
    text.includes("door-to-trail") ||
    text.includes("route et trail") ||
    text.includes("road to trail") ||
    text.includes("road-to-trail") ||
    text.includes("gravel") ||
    text.includes("hybride") ||
    text.includes("hybrid") ||
    text.includes("terra") ||
    text.includes("terrex") ||
    text.includes("pegasus trail")
  ) {
    return "Mixte";
  }

  if (
    text.includes("trail") ||
    text.includes("fell") ||
    text.includes("mountain") ||
    text.includes("montagne") ||
    text.includes("agility peak") ||
    text.includes("speedgoat") ||
    text.includes("mafate") ||
    text.includes("hierro") ||
    text.includes("wildhorse") ||
    text.includes("peregrine") ||
    text.includes("cascadia") ||
    text.includes("xodus") ||
    text.includes("ultraventure") ||
    text.includes("tomir")
  ) {
    return "Trail";
  }

  if (
    text.includes("athlétisme") ||
    text.includes("athletisme") ||
    text.includes("track") ||
    text.includes("piste") ||
    text.includes("spike") ||
    text.includes("pointes") ||
    text.includes("distancestar") ||
    text.includes("ambition") ||
    text.includes("allroundstar")
  ) {
    return "Piste";
  }

  return "Route";
}

function guessUsage(product) {
  const text = getProductText(product);

  if (
    text.includes("walking") ||
    text.includes("marche") ||
    text.includes("walk") ||
    text.includes("randonnee") ||
    text.includes("randonnée") ||
    text.includes("hiking") ||
    text.includes("freehiker")
  ) {
    return "Walking";
  }

  if (
    text.includes("adios pro") ||
    text.includes("pro evo") ||
    text.includes("vaporfly") ||
    text.includes("alphafly") ||
    text.includes("metaspeed") ||
    text.includes("carbon") ||
    text.includes("carbone") ||
    text.includes("elite") ||
    text.includes("rocket x") ||
    text.includes("fast-r") ||
    text.includes("race") ||
    text.includes("racing")
  ) {
    return "Racing";
  }

  if (
    text.includes("takumi") ||
    text.includes("adizero") ||
    text.includes("boston") ||
    text.includes("kinvara") ||
    text.includes("streakfly") ||
    text.includes("magic speed") ||
    text.includes("tempo") ||
    text.includes("speed") ||
    text.includes("interval") ||
    text.includes("fractionné") ||
    text.includes("fractionne")
  ) {
    return "Speed Work";
  }

  if (
    text.includes("ultraboost") ||
    text.includes("adistar") ||
    text.includes("supernova") ||
    text.includes("invincible") ||
    text.includes("vomero") ||
    text.includes("triumph") ||
    text.includes("glycerin") ||
    text.includes("nimbus") ||
    text.includes("more") ||
    text.includes("max") ||
    text.includes("long") ||
    text.includes("ultra")
  ) {
    return "Long Run";
  }

  return "Daily Training";
}

function guessCushioning(product) {
  const text = getProductText(product);

  if (
    text.includes("max") ||
    text.includes("max cushion") ||
    text.includes("ultraboost") ||
    text.includes("supernova") ||
    text.includes("adistar") ||
    text.includes("invincible") ||
    text.includes("vomero") ||
    text.includes("triumph") ||
    text.includes("glycerin") ||
    text.includes("nimbus") ||
    text.includes("cumulus") ||
    text.includes("more") ||
    text.includes("bondi") ||
    text.includes("clifton") ||
    text.includes("skyward") ||
    text.includes("magmax") ||
    text.includes("infinite") ||
    text.includes("skyrise")
  ) {
    return "High";
  }

  if (
    text.includes("spike") ||
    text.includes("pointes") ||
    text.includes("distancestar") ||
    text.includes("ambition") ||
    text.includes("takumi") ||
    text.includes("adios") ||
    text.includes("streakfly") ||
    text.includes("evo") ||
    text.includes("minimal") ||
    text.includes("barefoot") ||
    text.includes("xero")
  ) {
    return "Low";
  }

  return "Medium";
}

function guessDistanceTags(product) {
  const text = getProductText(product);

  if (
    text.includes("ultra") ||
    text.includes("ultratrail") ||
    text.includes("ultra trail") ||
    text.includes("xodus") ||
    text.includes("mafate") ||
    text.includes("speedgoat") ||
    text.includes("agility peak") ||
    text.includes("hierro") ||
    text.includes("tomir") ||
    text.includes("ultraventure") ||
    text.includes("trabuco") ||
    text.includes("cascadia")
  ) {
    return "HALF|MARATHON|ULTRA";
  }

  if (
    text.includes("adios pro") ||
    text.includes("pro evo") ||
    text.includes("vaporfly") ||
    text.includes("alphafly") ||
    text.includes("metaspeed") ||
    text.includes("prime x") ||
    text.includes("carbon") ||
    text.includes("carbone")
  ) {
    return "10K|HALF|MARATHON";
  }

  if (
    text.includes("boston") ||
    text.includes("supernova") ||
    text.includes("ultraboost") ||
    text.includes("adistar") ||
    text.includes("galaxy") ||
    text.includes("pegasus") ||
    text.includes("ride") ||
    text.includes("ghost") ||
    text.includes("triumph") ||
    text.includes("nimbus") ||
    text.includes("cumulus") ||
    text.includes("vomero")
  ) {
    return "10K|HALF|MARATHON";
  }

  if (
    text.includes("takumi") ||
    text.includes("adizero") ||
    text.includes("streakfly") ||
    text.includes("spike") ||
    text.includes("pointes") ||
    text.includes("distancestar") ||
    text.includes("ambition")
  ) {
    return "5K_OR_LESS|10K|HALF";
  }

  return "5K_OR_LESS|10K";
}

function guessProfile(product) {
  const text = getProductText(product);

  if (
    text.includes("enfant") ||
    text.includes("kid") ||
    text.includes("kids") ||
    text.includes("junior") ||
    text.includes("fille") ||
    text.includes("garçon") ||
    text.includes("garcon")
  ) {
    return "Enfant";
  }

  if (
    text.includes("unisexe") ||
    text.includes("unisex") ||
    text.includes("mixte")
  ) {
    return "Unisexe";
  }

  if (
    text.includes("femme") ||
    text.includes("women") ||
    text.includes("woman") ||
    text.includes(" wos")
  ) {
    return "Femme";
  }

  if (
    text.includes("homme") ||
    text.includes(" men") ||
    text.includes(" man")
  ) {
    return "Homme";
  }

  return "Unisexe";
}

function guessPronation(product) {
  const text = getProductText(product);

  if (
    text.includes("stability") ||
    text.includes("stable") ||
    text.includes("support") ||
    text.includes("guide") ||
    text.includes("gts") ||
    text.includes("structure") ||
    text.includes("kayano") ||
    text.includes("gt-2000") ||
    text.includes("gt 2000") ||
    text.includes("hurricane") ||
    text.includes("paradigm") ||
    text.includes("arahi") ||
    text.includes("vongo") ||
    text.includes("tempus") ||
    text.includes("inspire") ||
    text.includes("echelon")
  ) {
    return "Pronator";
  }

  return "Neutral";
}

function guessStrike(product) {
  const text = getProductText(product);

  if (
    text.includes("spike") ||
    text.includes("pointes") ||
    text.includes("distancestar") ||
    text.includes("ambition") ||
    text.includes("takumi") ||
    text.includes("streakfly") ||
    text.includes("adios pro") ||
    text.includes("vaporfly") ||
    text.includes("alphafly") ||
    text.includes("metaspeed")
  ) {
    return "Forefoot";
  }

  if (
    text.includes("speed") ||
    text.includes("tempo") ||
    text.includes("boston") ||
    text.includes("kinvara") ||
    text.includes("rebel") ||
    text.includes("mach") ||
    text.includes("endorphin")
  ) {
    return "Midfoot";
  }

  return "Heel";
}

function populateBrandFilter() {
  if (!brandFilter) return;

  console.log("shoes pour marques :", shoes);

  const brands = [...new Set(shoes.map((shoe) => shoe.brand).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));

  brandFilter.innerHTML = `<option value="">Toutes</option>`;

  brands.forEach((brand) => {
    const option = document.createElement("option");
    option.value = brand;
    option.textContent = brand;
    brandFilter.appendChild(option);
  });
}

function populateColorFilter() {
  if (!colorFilter) return;

  const preferredOrder = [
    "Noir",
    "Blanc",
    "Bleu",
    "Rouge",
    "Vert",
    "Jaune",
    "Orange",
    "Rose",
    "Violet",
    "Gris",
    "Beige",
    "Marron",
    "Turquoise",
    "Argenté",
    "Doré",
    "Multicolore"
  ];

  const colors = [...new Set(shoes.flatMap((shoe) => shoe.colors || []))]
    .sort((a, b) => {
      const indexA = preferredOrder.indexOf(a);
      const indexB = preferredOrder.indexOf(b);

      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

  colorFilter.innerHTML = `<option value="">Toutes</option>`;

  colors.forEach((color) => {
    const option = document.createElement("option");
    option.value = color;
    option.textContent = color;
    colorFilter.appendChild(option);
  });
}

function applyFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);

  const mappings = [
    [terrainFilter, "terrain"],
    [usageFilter, "usage"],
    [levelFilter, "level"],
    [priceFilter, "price"],
    [distanceFilter, "distance"],
    [cushioningFilter, "cushioning"],
    [pronationFilter, "pronation"],
    [strikeFilter, "strike"],
    [colorFilter, "color"],
    [waterproofFilter, "waterproof"]
  ];

  let hasAdvancedFilter = false;

  mappings.forEach(([element, key]) => {
    const value = params.get(key);

    if (!element || !value) return;

    element.value = value;

    if (["cushioning", "pronation", "strike", "color", "waterproof"].includes(key)) {
      hasAdvancedFilter = true;
    }
  });

  if (params.get("search")) {
    searchInput.value = params.get("search");
  }

  if (hasAdvancedFilter && advancedFilters && moreFiltersBtn) {
    advancedFilters.classList.add("open");
    moreFiltersBtn.textContent = "Moins de filtres";
  }
}
function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getSearchTokens(value) {
  const ignoredWords = new Set([
    "chaussure",
    "chaussures",
    "running",
    "run",
    "de",
    "du",
    "des",
    "la",
    "le",
    "les",
    "pour",
    "homme",
    "femme"
  ]);

  return normalizeSearchText(value)
    .split(" ")
    .filter((token) => token && !ignoredWords.has(token));
}
function applyFilters() {
  const searchTokens = getSearchTokens(searchInput.value);

  let filtered = shoes.filter((shoe) => {
    const searchableText = normalizeSearchText(`${shoe.brand} ${shoe.model} ${shoe.category || ""}`);
    const matchSearch = searchTokens.length === 0 || searchTokens.every((token) => searchableText.includes(token));

    const matchTerrain = !terrainFilter.value || shoe.terrain === terrainFilter.value;
    const matchBrand = !brandFilter.value || shoe.brand === brandFilter.value;
    const matchUsage = !usageFilter.value || shoe.usage === usageFilter.value;
    const matchLevel =
      !levelFilter.value ||
      shoe.level === levelFilter.value ||
      ((levelFilter.value === "Homme" || levelFilter.value === "Femme") && shoe.level === "Unisexe");
    const matchCushioning = !cushioningFilter.value || shoe.cushioning === cushioningFilter.value;
    const matchPronation = !pronationFilter.value || shoe.pronation === pronationFilter.value;
    const matchStrike = !strikeFilter.value || shoe.strike === strikeFilter.value;
    const matchDistance = !distanceFilter.value || shoe.distance_tags.includes(distanceFilter.value);
    const matchColor = !colorFilter.value || shoe.colors.includes(colorFilter.value);
    const matchWaterproof =
      !waterproofFilter.value ||
      (waterproofFilter.value === "Yes" && shoe.waterproof) ||
      (waterproofFilter.value === "No" && !shoe.waterproof);
    let matchPrice = true;

    if (priceFilter.value === "200_PLUS") {
      matchPrice = Number(shoe.price) > 200;
    } else if (priceFilter.value !== "") {
      matchPrice = Number(shoe.price) <= Number(priceFilter.value);
    }

    return (
      matchSearch &&
      matchTerrain &&
      matchBrand &&
      matchUsage &&
      matchLevel &&
      matchPrice &&
      matchCushioning &&
      matchPronation &&
      matchStrike &&
      matchDistance &&
      matchColor &&
      matchWaterproof
    );
  });

  filtered = sortProducts(filtered);

  displayedProducts = 12;
  currentProducts = filtered;

  updateRecommendation(filtered);
  displayShoes(currentProducts);
  updateLoadMoreButton();
}

function updateRecommendation(filteredProducts) {
  const hasActiveSearch = searchInput.value.trim() !== "";

  const hasActiveFilter =
    terrainFilter.value ||
    brandFilter.value ||
    usageFilter.value ||
    levelFilter.value ||
    priceFilter.value ||
    cushioningFilter.value ||
    pronationFilter.value ||
    strikeFilter.value ||
    distanceFilter.value ||
    colorFilter.value ||
    waterproofFilter.value;

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
      <p>Le modèle le plus cohérent avec vos critères actuels.</p>
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
    brandFilter.value,
    usageFilter.value,
    levelFilter.value,
    priceFilter.value,
    cushioningFilter.value,
    pronationFilter.value,
    strikeFilter.value,
    distanceFilter.value,
    colorFilter.value,
    waterproofFilter.value
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

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getVisibleOffers(shoe) {
  const offers = (shoe.offers || []).filter((offer) => offer.url && offer.price);
  const colorOffers = colorFilter.value
    ? offers.filter((offer) => offer.color === colorFilter.value)
    : [];

  const sortedOffers = (colorOffers.length ? colorOffers : offers)
    .sort((a, b) => Number(a.price) - Number(b.price));

  return dedupeOffersByRetailer(sortedOffers);
}

function dedupeOffersByRetailer(offers) {
  const byRetailer = new Map();

  offers.forEach((offer) => {
    const retailer = offer.retailer || "Voir le site";
    const current = byRetailer.get(retailer);

    if (!current || Number(offer.price) < Number(current.price)) {
      byRetailer.set(retailer, offer);
    }
  });

  return [...byRetailer.values()];
}

function renderOffers(shoe) {
  const offers = getVisibleOffers(shoe);

  if (offers.length === 0) {
    return `
      <a class="product-link" href="${escapeHTML(shoe.product_url)}" target="_blank" rel="noopener">
        Voir la fiche
      </a>
    `;
  }

  const visibleOffers = offers.slice(0, 4);
  const remainingOffers = offers.length - visibleOffers.length;

  return `
    <div class="product-offers">
      <p class="product-offers-title">Offres disponibles</p>
      ${visibleOffers.map((offer) => `
        <a class="product-offer" href="${escapeHTML(offer.url)}" target="_blank" rel="noopener">
          <span>${escapeHTML(offer.retailer || "Voir le site")}</span>
          <strong>${formatPrice(offer.price)}€</strong>
        </a>
      `).join("")}
      ${remainingOffers > 0 ? `<p class="product-offers-more">+ ${remainingOffers} autre${remainingOffers > 1 ? "s" : ""} offre${remainingOffers > 1 ? "s" : ""}</p>` : ""}
    </div>
  `;
}
function getDisplayShoe(shoe) {
  if (!colorFilter.value) return shoe;

  const matchingOffer = (shoe.offers || []).find((offer) => offer.color === colorFilter.value);

  if (!matchingOffer) return shoe;

  return {
    ...shoe,
    image: matchingOffer.image || shoe.image,
    product_url: matchingOffer.url || shoe.product_url,
    price: matchingOffer.price || shoe.price
  };
}
function displayShoes(products) {
  shoesGrid.innerHTML = "";
  resultsCount.textContent = `${products.length} Résultats`;

  if (products.length === 0) {
    shoesGrid.innerHTML = "<p>Aucun produit trouvé.</p>";
    return;
  }

  products.slice(0, displayedProducts).forEach((shoe) => {
    const displayShoe = getDisplayShoe(shoe);
    const card = document.createElement("article");
    card.className = "product-card";

    card.innerHTML = `
      <div class="product-image-wrapper">
        <img class="product-image" src="${displayShoe.image}" alt="${shoe.model}">
      </div>

      <div class="product-content">
        <div class="product-top">
          <div>
            <p class="product-brand">${shoe.brand}</p>
            <h3 class="product-name">${shoe.model}</h3>
            <p class="product-meta">${formatUsage(shoe.usage)} - ${shoe.terrain.toLowerCase()}${shoe.color ? ` - ${shoe.color}` : ""}</p>
          </div>

          <p class="product-price">
            <small>à partir de</small>
            <strong>${formatPrice(displayShoe.price)}€</strong>
          </p>
        </div>

        <div class="product-rating">
          ★★★★★ <span>(${shoe.rating})</span>
        </div>

        ${renderOffers(displayShoe)}
      </div>
    `;

    shoesGrid.appendChild(card);
  });
}

function updateLoadMoreButton() {
  if (!loadMoreBtn) return;

  loadMoreBtn.style.display =
    displayedProducts >= currentProducts.length ? "none" : "block";
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
  brandFilter.value = "";
  usageFilter.value = "";
  levelFilter.value = "";
  priceFilter.value = "";
  cushioningFilter.value = "";
  pronationFilter.value = "";
  strikeFilter.value = "";
  distanceFilter.value = "";
  colorFilter.value = "";
  waterproofFilter.value = "";
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
strikeFilter.addEventListener("change", applyFilters);
distanceFilter.addEventListener("change", applyFilters);
colorFilter.addEventListener("change", applyFilters);
waterproofFilter.addEventListener("change", applyFilters);
sortSelect.addEventListener("change", applyFilters);
resetFiltersBtn.addEventListener("click", resetFilters);
brandFilter.addEventListener("change", applyFilters);
moreFiltersBtn.addEventListener("click", () => {
  advancedFilters.classList.toggle("open");

  moreFiltersBtn.textContent = advancedFilters.classList.contains("open")
    ? "Moins de filtres"
    : "Plus de filtres";
});

loadMoreBtn.addEventListener("click", () => {
  displayedProducts += 12;
  displayShoes(currentProducts);
  updateLoadMoreButton();
});

