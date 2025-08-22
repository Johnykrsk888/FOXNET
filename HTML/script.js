document.addEventListener('DOMContentLoaded', () => {
  const productGrid = document.querySelector('.product-grid');
  const resultsCount = document.querySelector('.results-count');
  const sortSelect = document.querySelector('.sort-select');
  const searchInput = document.getElementById('product-search-input');
  const navLinks = document.querySelectorAll('.nav-menu a');
  const sidebarLinks = document.querySelectorAll('.category-filter a');
  const logo = document.getElementById('logo');
  const cartIcon = document.querySelector('.ri-shopping-cart-2-line');

  let allProducts = [];
  let filteredProducts = [];
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  function updateCartIcon() {
    const cartItemCount = cart.length;
    const cartIconContainer = cartIcon.parentElement;
    if (cartItemCount > 0) {
        let countElement = cartIconContainer.querySelector('.cart-count');
        if (!countElement) {
            countElement = document.createElement('span');
            countElement.classList.add('cart-count');
            cartIconContainer.appendChild(countElement);
        }
        countElement.textContent = cartItemCount;
    } else {
        const countElement = cartIconContainer.querySelector('.cart-count');
        if (countElement) {
            countElement.remove();
        }
    }
  }

  function addToCart(productId) {
    cart.push(productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartIcon();
  }

  productGrid.addEventListener('click', (e) => {
    if (e.target.classList.contains('cart-btn')) {
        const productId = parseInt(e.target.dataset.id);
        addToCart(productId);
    }
  });

  fetch('products.json')
    .then(response => response.json())
    .then(products => {
      allProducts = products;
      filteredProducts = allProducts;
      renderProducts();
      updateResultsCount();
      updateCartIcon(); // Initial update
    });

  function renderProducts() {
    productGrid.innerHTML = '';
    filteredProducts.forEach(product => {
      const productCard = document.createElement('div');
      productCard.classList.add('product-card');
      productCard.innerHTML = `
        <a href="product.html?id=${product.id}">
            <div class="product-image">
              <img src="${product.image}" alt="${product.title}">
            </div>
        </a>
        <div class="product-info">
          <a href="product.html?id=${product.id}">
            <h3 class="product-title">${product.title}</h3>
          </a>
          <div class="product-sku">Артикул: ${product.sku}</div>
          <div class="product-price">${product.price.toFixed(2)} ₽</div>
          <div class="product-actions">
            <button class="cart-btn" data-id="${product.id}">В корзину</button>
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

  const allCategoryLinks = [...navLinks, ...sidebarLinks];

  allCategoryLinks.forEach(link => {
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