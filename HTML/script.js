document.addEventListener('DOMContentLoaded', () => {
  const productGrid = document.querySelector('.product-grid');
  const resultsCount = document.querySelector('.results-count');
  const sortSelect = document.querySelector('.sort-select');
  const filters = document.querySelectorAll('.filter-checkbox');

  let allProducts = [];
  let filteredProducts = [];

  // Fetch products from the API
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
          <div class="product-specs">
            ${product.specs.map(spec => `
              <div class="spec-item">
                <span class="spec-label">${spec.label}:</span>
                <span class="spec-value">${spec.value}</span>
              </div>
            `).join('')}
          </div>
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

  function applyFilters() {
    const activeFilters = {};
    filters.forEach(filter => {
      if (filter.checked) {
        const filterType = filter.closest('.filter-section').querySelector('.filter-title span').textContent.toLowerCase().replace(' ', '_');
        if (!activeFilters[filterType]) {
          activeFilters[filterType] = [];
        }
        activeFilters[filterType].push(filter.nextElementSibling.textContent);
      }
    });

    filteredProducts = allProducts.filter(product => {
        for (const filterType in activeFilters) {
            const filterValues = activeFilters[filterType];
            const productValue = product[filterType];
            if (filterValues.length > 0 && !filterValues.includes(productValue)) {
                return false;
            }
        }
        return true;
    });

    renderProducts();
    updateResultsCount();
  }

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

  filters.forEach(filter => filter.addEventListener('change', applyFilters));
  sortSelect.addEventListener('change', sortProducts);
});