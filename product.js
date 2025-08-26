document.addEventListener('DOMContentLoaded', () => {
    const productDetails = document.getElementById('product-details');
    const productId = new URLSearchParams(window.location.search).get('id');

    if (!productId) {
        productDetails.innerHTML = '<p>Товар не найден.</p>';
        return;
    }

    // Fetch the specific product details from the correct endpoint
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
            <img src="PIC/9cd6c8987056d73e9b6597dc0a7ad3fa4fbb6415b60dc82c0206167f147bab22.JPG" alt="${product.title}">
        </div>
        <div class="product-info-main">
            <h1>${product.title}</h1>
            <p class="product-sku-single">Артикул: ${product.sku}</p>
            <p class="product-price-single">${product.price} ₽</p>
            <p class="product-quantity">В наличии: ${product.quantity} шт.</p>
            <div class="product-description">
                <p>${product.description || 'Описание отсутствует.'}</p>
            </div>
            <button class="cart-btn">В корзину</button>
        </div>
    `;

    // Add to cart event listener
    const cartBtn = productDetails.querySelector('.cart-btn');
    cartBtn.addEventListener('click', () => {
        // Use the global addToCart function from cart.js
        addToCart(product);
    });
}
