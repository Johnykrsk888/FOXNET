document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.querySelector('.product-grid');
    const resultsCount = document.querySelector('.results-count');
    const searchInput = document.getElementById('product-search-input');
    const sortSelect = document.querySelector('.sort-select');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const categoryFilterContainer = document.getElementById('category-filter-options');
    const minPriceInput = document.querySelector('.price-range .price-input:nth-child(1)');
    const maxPriceInput = document.querySelector('.price-range .price-input:nth-child(3)');
    const applyFiltersBtn = document.querySelector('.apply-btn');

    let allProducts = [];

    // Fetch products and categories simultaneously
    Promise.all([
        fetch('/api/products').then(res => res.json()),
        fetch('/api/categories').then(res => res.json())
    ])
    .then(([products, categories]) => {
        allProducts = products;
        renderCategories(categories);
        updateProductDisplay();
    })
    .catch(error => console.error('Error fetching initial data:', error));

    function renderCategories(categories) {
        if (!categoryFilterContainer) return;
        categoryFilterContainer.innerHTML = ''; // Clear existing
        categories.forEach(category => {
            const categoryId = `cat-${category.replace(/\s+/g, '-').toLowerCase()}`;
            const li = document.createElement('li');
            li.className = 'filter-option';
            li.innerHTML = `
                <input type="checkbox" id="${categoryId}" class="filter-checkbox category-checkbox" data-category="${category}">
                <label for="${categoryId}" class="filter-label">${category}</label>
            `;
            categoryFilterContainer.appendChild(li);
        });

        // Add event listeners after categories are rendered
        document.querySelectorAll('.category-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', updateProductDisplay);
        });

        // Add event listeners for fiber count checkboxes
        document.querySelectorAll('input[id^="fiber-"]').forEach(checkbox => {
            checkbox.addEventListener('change', updateProductDisplay);
        });
    }

    function displayProducts(products) {
        if (!productGrid) return;
        productGrid.innerHTML = '';
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <a href="product.html?id=${product.id}">
                    <div class="product-image">
                         <img src="${product.image}" alt="${product.title}">
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${product.title}</h3>
                        <p class="product-sku">Арт: ${product.sku}</p>
                        <div class="product-meta">
                            <p class="product-price">${product.price} ₽</p>
                            <span class="product-quantity">В наличии: ${product.quantity}</span>
                        </div>
                    </div>
                </a>
                <div class="product-actions">
                    <button class="cart-btn" data-id="${product.id}">В корзину</button>
                </div>
            `;
            productGrid.appendChild(productCard);
        });
        updateResultsCount(products.length);
    }

    function updateResultsCount(count) {
        if (!resultsCount) return;
        resultsCount.textContent = `Показано ${count} из ${allProducts.length} товаров`;
    }

    function updateProductDisplay() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const sortValue = sortSelect ? sortSelect.value : 'Популярности';
        
        const selectedCategories = [...document.querySelectorAll('.category-checkbox:checked')].map(cb => cb.dataset.category);

        if (clearSearchBtn) {
            clearSearchBtn.style.display = searchTerm.length > 0 ? 'inline' : 'none';
        }

        let displayedProducts = [...allProducts];

        // Filter by category
        if (selectedCategories.length > 0) {
            displayedProducts = displayedProducts.filter(product => selectedCategories.includes(product.group));
        }

        // Filter by fiber count
        const selectedFibers = [...document.querySelectorAll('input[id^="fiber-"]:checked')].map(cb => parseInt(cb.id.replace('fiber-', '')));
        if (selectedFibers.length > 0) {
            displayedProducts = displayedProducts.filter(product => {
                const fiberMatch = product.title.match(/(\d+)\s*(волокон|волокна|волокно)/);
                if (fiberMatch) {
                    const fiberCount = parseInt(fiberMatch[1]);
                    return selectedFibers.includes(fiberCount);
                }
                return false;
            });
        }

        // Filter by price range
        const minPrice = minPriceInput ? parseFloat(minPriceInput.value) : null;
        const maxPrice = maxPriceInput ? parseFloat(maxPriceInput.value) : null;

        if (minPrice !== null && !isNaN(minPrice)) {
            displayedProducts = displayedProducts.filter(product => parseFloat(String(product.price).replace(/\s/g, '')) >= minPrice);
        }
        if (maxPrice !== null && !isNaN(maxPrice)) {
            displayedProducts = displayedProducts.filter(product => parseFloat(String(product.price).replace(/\s/g, '')) <= maxPrice);
        }

        // Filter by search term
        if (searchTerm) {
            displayedProducts = displayedProducts.filter(product => 
                (product.title && product.title.toLowerCase().includes(searchTerm)) ||
                (product.sku && product.sku.toLowerCase().includes(searchTerm))
            );
        }

        // Sort products
        if (sortValue === 'Цене: по возрастанию') {
            displayedProducts.sort((a, b) => parseFloat(String(a.price).replace(/\s/g, '')) - parseFloat(String(b.price).replace(/\s/g, '')));
        } else if (sortValue === 'Цене: по убыванию') {
            displayedProducts.sort((a, b) => parseFloat(String(b.price).replace(/\s/g, '')) - parseFloat(String(a.price).replace(/\s/g, '')));
        } else {
            // Default sort can be by ID or popularity if available
            displayedProducts.sort((a, b) => String(a.id).localeCompare(String(b.id)));
        }

        displayProducts(displayedProducts);
    }

    // Initial Event Listeners
    if (searchInput) {
        searchInput.addEventListener('input', updateProductDisplay);
    }
    if (sortSelect) {
        sortSelect.addEventListener('change', updateProductDisplay);
    }
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            updateProductDisplay();
        });
    }
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', updateProductDisplay);
    }
    if (productGrid) {
        productGrid.addEventListener('click', (e) => {
            if (e.target.classList.contains('cart-btn')) {
                const productId = e.target.dataset.id;
                const product = allProducts.find(p => String(p.id) === String(productId));
                if (product) {
                    addToCart(product);
                }
            }
        });
    }
});
