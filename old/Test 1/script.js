let products = [];

const productsContainer = document.getElementById("products");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

function displayProducts(productsToDisplay) {
  productsContainer.innerHTML = "";

  for (const product of productsToDisplay) {
    const cheapestPrice = Math.min(
      ...product.offers.map(offer => offer.price)
    );

    let offersHtml = "";

    for (const offer of product.offers) {
      const badge =
        offer.price === cheapestPrice
          ? " 🔥 Meilleur prix"
          : "";

      offersHtml += `
        <a href="${offer.link}" target="_blank">
          ${offer.shop} : ${offer.price}€
          ${badge}
        </a>
      `;
    }

    productsContainer.innerHTML += `
      <div class="product">
        <img src="${product.image}" alt="${product.name}">

        <div>
          <h2>${product.name}</h2>
          <p class="best-price">Meilleur prix : ${cheapestPrice}€</p>

          ${offersHtml}
        </div>
      </div>
    `;
  }
}

function sortProducts(productsToSort, sortType) {
  const sortedProducts = [...productsToSort];

  if (sortType === "name") {
    sortedProducts.sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  if (sortType === "priceAsc") {
    sortedProducts.sort((a, b) => {
      const priceA = Math.min(...a.offers.map(o => o.price));
      const priceB = Math.min(...b.offers.map(o => o.price));

      return priceA - priceB;
    });
  }

  if (sortType === "priceDesc") {
    sortedProducts.sort((a, b) => {
      const priceA = Math.min(...a.offers.map(o => o.price));
      const priceB = Math.min(...b.offers.map(o => o.price));

      return priceB - priceA;
    });
  }

  return sortedProducts;
}

function updateDisplay() {
  const searchTerm = searchInput.value.toLowerCase();
  const sortType = sortSelect.value;

  let filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm)
  );

  filteredProducts = sortProducts(filteredProducts, sortType);

  displayProducts(filteredProducts);
}

searchInput.addEventListener("input", updateDisplay);
sortSelect.addEventListener("change", updateDisplay);

fetch("products.csv")
  .then(response => response.text())
  .then(csvText => {
    const lines = csvText.trim().split("\n");
    const dataLines = lines.slice(1);

    const groupedProducts = {};

    for (const line of dataLines) {
      const columns = line.split(",");

      const offer = {
        product: columns[0],
        merchant: columns[1],
        price: Number(columns[2]),
        image: columns[3],
        link: columns[4]
      };

      if (!groupedProducts[offer.product]) {
        groupedProducts[offer.product] = {
          name: offer.product,
          image: offer.image,
          offers: []
        };
      }

      groupedProducts[offer.product].offers.push({
        shop: offer.merchant,
        price: offer.price,
        link: offer.link
      });
    }

    products = Object.values(groupedProducts);

    updateDisplay();
  });