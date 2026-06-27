alert("JavaScript fonctionne !");
const products = [
  {
    name: "iPhone 16",
    image: "https://picsum.photos/200?1",
    offers: [
      { shop: "Amazon", price: 959 },
      { shop: "Fnac", price: 979 },
      { shop: "Darty", price: 989 }
    ]
  },

  {
    name: "PlayStation 5",
    image: "https://picsum.photos/200?2",
    offers: [
      { shop: "Amazon", price: 499 },
      { shop: "Fnac", price: 489 },
      { shop: "Cdiscount", price: 479 }
    ]
  },

  {
    name: "Nintendo Switch",
    image: "https://picsum.photos/200?3",
    offers: [
      { shop: "Amazon", price: 299 },
      { shop: "Fnac", price: 289 },
      { shop: "Cdiscount", price: 279 }
    ]
  }
];

const productsContainer = document.getElementById("products");

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
        <a href="#">
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

          ${offersHtml}

        </div>

      </div>
    `;
  }
}

displayProducts(products);

const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", function () {

  const searchTerm = searchInput.value.toLowerCase();

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm)
  );

  displayProducts(filteredProducts);

});