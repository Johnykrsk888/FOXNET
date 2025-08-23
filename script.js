document.addEventListener('DOMContentLoaded', () => {
  const productGrid = document.querySelector('.product-grid');
  const resultsCount = document.querySelector('.results-count');
  const sortSelect = document.querySelector('.sort-select');
  const searchInput = document.getElementById('product-search-input');
  const logo = document.getElementById('logo');
  const cartIcon = document.querySelector('.ri-shopping-cart-2-line');
  const navMenuLinks = document.querySelectorAll('.nav-menu a[data-category]');
  
  // Filters
  const allFilters = document.querySelectorAll('.filter-checkbox');
  const priceMinInput = document.querySelector('.price-input[placeholder="Мин"]');
  const priceMaxInput = document.querySelector('.price-input[placeholder="Макс"]');
  const applyPriceBtn = document.querySelector('.apply-btn');

  let allProducts = [];
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  function updateCartIcon() {
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartIconContainer = cartIcon.parentElement;
    let countElement = cartIconContainer.querySelector('.cart-count');

    if (cartItemCount > 0) {
        if (!countElement) {
            countElement = document.createElement('span');
            countElement.classList.add('cart-count');
            cartIconContainer.appendChild(countElement);
        }
        countElement.textContent = cartItemCount;
    } else {
        if (countElement) {
            countElement.remove();
        }
    }
  }

  function addToCart(productId) {
    const existingProduct = cart.find(item => item.id === productId);
    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartIcon();
  }

  productGrid.addEventListener('click', (e) => {
    if (e.target.classList.contains('cart-btn')) {
        const productId = parseInt(e.target.dataset.id);
        addToCart(productId);
    }
  });

  function applyAllFilters() {
    let filtered = [...allProducts];

    // Search Filter
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(product => 
            product.title.toLowerCase().includes(searchTerm)
        );
    }

    // Category & Fiber Count Filters (Checkboxes)
    const activeCheckboxes = document.querySelectorAll('.filter-checkbox:checked');
    if (activeCheckboxes.length > 0) {
        const filterGroups = {};
        activeCheckboxes.forEach(cb => {
            const filterType = cb.closest('.filter-section').querySelector('.filter-title span').textContent;
            if (!filterGroups[filterType]) {
                filterGroups[filterType] = [];
            }
            filterGroups[filterType].push(cb.dataset.category || cb.nextElementSibling.textContent);
        });

        for (const group in filterGroups) {
            const selectedValues = filterGroups[group];
            if (selectedValues.length > 0) {
                filtered = filtered.filter(product => {
                    if (group === 'Разделы каталога') {
                        return selectedValues.includes(product.category);
                    }
                    if (group === 'Количество волокон') {
                        const fiberCount = parseInt(product.fiber_count);
                        return selectedValues.some(val => fiberCount === parseInt(val));
                    }
                    return true;
                });
            }
        }
    }

    // Price Filter
    const minPrice = parseFloat(priceMinInput.value);
    const maxPrice = parseFloat(priceMaxInput.value);

    if (!isNaN(minPrice)) {
        filtered = filtered.filter(product => product.price >= minPrice);
    }
    if (!isNaN(maxPrice)) {
        filtered = filtered.filter(product => product.price <= maxPrice);
    }

    // Sorting
    const sortBy = sortSelect.value;
    if (sortBy === 'Цене: по возрастанию') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Цене: по убыванию') {
      filtered.sort((a, b) => b.price - a.price);
    }

    renderProducts(filtered);
    updateResultsCount(filtered);
  }

  function renderProducts(productsToRender) {
    productGrid.innerHTML = '';
    productsToRender.forEach(product => {
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

  function updateResultsCount(products) {
    resultsCount.textContent = `Показано ${products.length} из ${allProducts.length} товаров`;
  }

  logo.addEventListener('click', (e) => {
    e.preventDefault();
    // Reset all filters
    searchInput.value = '';
    priceMinInput.value = '';
    priceMaxInput.value = '';
    document.querySelectorAll('.filter-checkbox:checked').forEach(cb => cb.checked = false);
    applyAllFilters();
  });

  navMenuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const category = link.dataset.category;
      const categoryCheckbox = document.querySelector(`.category-checkbox[data-category="${category}"]`);
      if (categoryCheckbox) {
        // Uncheck all other checkboxes
        document.querySelectorAll('.category-checkbox').forEach(cb => cb.checked = false);
        // Check the corresponding checkbox
        categoryCheckbox.checked = true;
        applyAllFilters();
      }
    });
  });

  // Event Listeners
  searchInput.addEventListener('input', applyAllFilters);
  sortSelect.addEventListener('change', applyAllFilters);
  allFilters.forEach(filter => filter.addEventListener('change', applyAllFilters));
  applyPriceBtn.addEventListener('click', applyAllFilters);

  // Initial Load
  fetch('products.json')
    .then(response => response.json())
    .then(products => {
      allProducts = products;
      applyAllFilters(); // Apply initial filters (if any)
      updateCartIcon();
    });
});
