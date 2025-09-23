document.addEventListener('DOMContentLoaded', () => {
    const productDetails = document.getElementById('product-details');
    const productId = new URLSearchParams(window.location.search).get('id');

    if (!productId) {
        productDetails.innerHTML = '<p>Товар не найден.</p>';
        return;
    }

    fetch(`/api/product/${productId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(product => {
            if (product) {
                displayProductDetails(product);
            } else {
                productDetails.innerHTML = '<p>Информация о товаре не найдена.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching product details:', error);
            productDetails.innerHTML = '<p>Не удалось загрузить информацию о товаре.</p>';
        });
});

function displayProductDetails(product) {
    const productDetails = document.getElementById('product-details');
    productDetails.innerHTML = `
        <div class="product-image-large">
            <img src="${product.image}" alt="${product.title}">
        </div>
        <div class="product-info-main">
            <h1>${product.title}</h1>
            <p class="product-sku-single">Артикул: ${product.sku}</p>
            <p class="product-price-single">${product.price} ₽</p>
            <p class="product-quantity">В наличии: ${product.quantity} шт.</p>
            <div class="product-description">
                <!-- Description will be injected here -->
            </div>
            <button class="cart-btn">В корзину</button>
        </div>
    `;

    const descriptionContainer = productDetails.querySelector('.product-description');
    if (descriptionContainer) {
        descriptionContainer.innerHTML = product.description || '<p>Описание отсутствует.</p>';

        setTimeout(() => {
            const availableHeight = window.innerHeight - descriptionContainer.getBoundingClientRect().top - 100; // 100px buffer
            
            if (descriptionContainer.scrollHeight > availableHeight) {
                descriptionContainer.classList.add('collapsed');
                const moreBtn = document.createElement('div');
                moreBtn.className = 'more-btn';
                moreBtn.textContent = 'еще';
                descriptionContainer.appendChild(moreBtn);

                moreBtn.addEventListener('click', () => {
                    descriptionContainer.classList.remove('collapsed');
                    moreBtn.style.display = 'none';
                });
            }
        }, 200);
    }

    const cartBtn = productDetails.querySelector('.cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            addToCart(product);
        });
    }
}
