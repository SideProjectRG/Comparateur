let shoes = [];
let activeFilters = {
  level: [],
  pronation: [],
  terrain: [],
  usage: [],
  cushioning: [],
  distance: []
};

const shoesGrid = document.getElementById("shoesGrid");
const searchInput = document.getElementById("searchInput");
const resultsCount = document.getElementById("resultsCount");
const sortSelect = document.getElementById("sortSelect");
const filterChips = document.querySelectorAll(".filter-chip");

fetch("data/Classeur2.csv")
  .then((response) => response.text())
  .then((csvText) => {
    const products = parseCSV(csvText);
    shoes = normalizeProducts(products);
    applyAllFilters();
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
        currency: product.currency || "EUR",
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

  if (name.includes("adios pro") || name.includes("pro evo")) {
    return "Racing";
  }

  if (name.includes("takumi") || name.includes("adizero")) {
    return "Speed Work";
  }

  if (
    name.includes("ultraboost") ||
    name.includes("adistar") ||
    name.includes("supernova")
  ) {
    return "Long Run";
  }

  return "Daily Training";
}

function guessCushioning(product) {
  const text = `${product["Product Name"]} ${product.Description} ${product.specifications}`.toLowerCase();

  if (
    text.includes("ultraboost") ||
    text.includes("supernova") ||
    text.includes("adistar") ||
    text.includes("boost")
  ) {
    return "High";
  }

  if (
    text.includes("adios") ||
    text.includes("takumi") ||
    text.includes("evo")
  ) {
    return "Low";
  }

  return "Medium";
}

function guessDistanceTags(product) {
  const name = product["Product Name"].toLowerCase();

  if (
    name.includes("adios pro") ||
    name.includes("pro evo") ||
    name.includes("prime x")
  ) {
    return "HALF|MARATHON";
  }

  if (
    name.includes("boston") ||
    name.includes("supernova") ||
    name.includes("ultraboost") ||
    name.includes("adistar") ||
    name.includes("galaxy")
  ) {
    return "10K|HALF|MARATHON";
  }

  if (
    name.includes("takumi") ||
    name.includes("adizero")
  ) {
    return "5K_OR_LESS|10K|HALF";
  }

  return "5K_OR_LESS|10K";
}

function guessLevel(product) {
  const name = product["Product Name"].toLowerCase();

  if (
    name.includes("adios pro") ||
    name.includes("takumi") ||
    name.includes("prime x") ||
    name.includes("pro evo")
  ) {
    return "Advanced";
  }

  if (
    name.includes("boston") ||
    name.includes("adizero")
  ) {
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

function displayShoes(products) {
  shoesGrid.innerHTML = "";
  resultsCount.textContent = `${products.length} Résultats`;

  if (products.length === 0) {
    shoesGrid.innerHTML = "<p>Aucun produit trouvé.</p>";
    return;
  }

  products.forEach((shoe) => {
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

            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              <h3 class="product-name">${shoe.model}</h3>
              <p class="product-meta">${formatUsage(shoe.usage)} - ${formatTerrain(shoe.terrain)}</p>
            </div>
          </div>

          <p class="product-price">${formatPrice(shoe.price)}€</p>
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

  if (Number.isNaN(number)) {
    return price;
  }

  return Math.round(number);
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

function formatTerrain(terrain) {
  return terrain.toLowerCase();
}

function applyAllFilters() {
  const searchTerm = searchInput.value.toLowerCase();

  let filtered = shoes.filter((shoe) => {
    const searchText = `${shoe.brand} ${shoe.model}`.toLowerCase();
    const matchSearch = searchText.includes(searchTerm);

    const matchLevel =
      activeFilters.level.length === 0 ||
      activeFilters.level.some((value) => shoe.level.includes(value));

    const matchPronation =
      activeFilters.pronation.length === 0 ||
      activeFilters.pronation.includes(shoe.pronation);

    const matchTerrain =
      activeFilters.terrain.length === 0 ||
      activeFilters.terrain.includes(shoe.terrain);

    const matchUsage =
      activeFilters.usage.length === 0 ||
      activeFilters.usage.includes(shoe.usage);

    const matchCushioning =
      activeFilters.cushioning.length === 0 ||
      activeFilters.cushioning.includes(shoe.cushioning);

    const matchDistance =
      activeFilters.distance.length === 0 ||
      activeFilters.distance.some((value) => shoe.distance_tags.includes(value));

    return (
      matchSearch &&
      matchLevel &&
      matchPronation &&
      matchTerrain &&
      matchUsage &&
      matchCushioning &&
      matchDistance
    );
  });

  filtered = sortProducts(filtered);
  displayShoes(filtered);
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

filterChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const filterName = chip.dataset.filter;
    const filterValue = chip.dataset.value;

    chip.classList.toggle("active");

    if (activeFilters[filterName].includes(filterValue)) {
      activeFilters[filterName] = activeFilters[filterName].filter(
        (value) => value !== filterValue
      );
    } else {
      activeFilters[filterName].push(filterValue);
    }

    applyAllFilters();
  });
});

searchInput.addEventListener("input", applyAllFilters);
sortSelect.addEventListener("change", applyAllFilters);