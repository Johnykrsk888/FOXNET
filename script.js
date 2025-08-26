document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.querySelector('.product-grid');
    const resultsCount = document.querySelector('.results-count');
    const searchInput = document.getElementById('product-search-input');
    const sortSelect = document.querySelector('.sort-select');

    let allProducts = [];

    // Fetch all products initially
    fetch('/api/products')
        .then(response => response.json())
        .then(products => {
            allProducts = products;
            updateProductDisplay(); // Initial display
        })
        .catch(error => console.error('Error fetching products:', error));

    // Function to display products
    function displayProducts(products) {
        productGrid.innerHTML = '';
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <a href="product.html?id=${product.id}">
                    <div class="product-image">
                         <img src="PIC/9cd6c8987056d73e9b6597dc0a7ad3fa4fbb6415b60dc82c0206167f147bab22.JPG" alt="${product.title}">
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${product.title}</h3>
                        <p class="product-sku">Арт: ${product.sku}</p>
                        <p class="product-price">${product.price} ₽</p>
                        <div class="product-actions">
                            <button class="cart-btn">В корзину</button>
                        </div>
                    </div>
                </a>
            `;
            productGrid.appendChild(productCard);
        });
        updateResultsCount(products.length);
    }

    // Function to update results count
    function updateResultsCount(count) {
        resultsCount.textContent = `Показано ${count} из ${allProducts.length} товаров`;
    }

    // Function to filter and sort products
    function updateProductDisplay() {
        const searchTerm = searchInput.value.toLowerCase();
        const sortValue = sortSelect.value;

        let displayedProducts = [...allProducts]; // Create a copy to avoid mutating the original array

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
        } else { // 'Популярности' or default
            // Sort by ID as a default
            displayedProducts.sort((a, b) => String(a.id).localeCompare(String(b.id)));
        }

        displayProducts(displayedProducts);
    }

    // Event listeners
    searchInput.addEventListener('input', updateProductDisplay);
    sortSelect.addEventListener('change', updateProductDisplay);
});
