document.addEventListener('DOMContentLoaded', () => {
  const productGrid = document.querySelector('.product-grid');
  const resultsCount = document.querySelector('.results-count');
  const sortSelect = document.querySelector('.sort-select');
  const searchInput = document.getElementById('product-search-input');
  const navLinks = document.querySelectorAll('.nav-menu a');
  const logo = document.getElementById('logo');

  let allProducts = [];
  let filteredProducts = [];

  fetch('products.json')
    .then(response => response.json())
    .then(products => {
      allProducts = products;
      filteredProducts = allProducts;
      renderProducts();
      updateResultsCount();
    });

  function renderProducts() {
    productGrid.innerHTML = '';
    filteredProducts.forEach(product => {
      const productCard = document.createElement('div');
      productCard.classList.add('product-card');
      productCard.innerHTML = `
        <div class="product-image">
          <img src="${product.image}" alt="${product.title}">
        </div>
        <div class="product-info">
          <h3 class="product-title">${product.title}</h3>
          <div class="product-sku">Артикул: ${product.sku}</div>
          <div class="product-price">${product.price.toFixed(2)} ₽</div>
          <div class="product-actions">
            <div class="cart-btn">В корзину</div>
          </div>
        </div>
      `;
      productGrid.appendChild(productCard);
    });
  }

  function updateResultsCount() {
    resultsCount.textContent = `Показано ${filteredProducts.length} из ${allProducts.length} товаров`;
  }

  function filterByCategory(category) {
    filteredProducts = allProducts.filter(product => product.category === category);
    renderProducts();
    updateResultsCount();
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const category = link.dataset.category;
      filterByCategory(category);
    });
  });

  logo.addEventListener('click', (e) => {
    e.preventDefault();
    filteredProducts = allProducts;
    renderProducts();
    updateResultsCount();
  });

  function sortProducts() {
    const sortBy = sortSelect.value;
    if (sortBy === 'Популярности') {
      // No change for now, as we don't have popularity data
    } else if (sortBy === 'Цене: по возрастанию') {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Цене: по убыванию') {
      filteredProducts.sort((a, b) => b.price - a.price);
    }
    renderProducts();
  }

  sortSelect.addEventListener('change', sortProducts);

  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    filteredProducts = allProducts.filter(product => 
      product.title.toLowerCase().includes(searchTerm)
    );
    renderProducts();
    updateResultsCount();
  });
});
