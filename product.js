document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    const container = document.getElementById('product-detail-container');

    if (!productId) {
        container.innerHTML = '<h1>Товар не найден</h1>';
        return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/api/product/${productId}`, true);

    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 400) {
            const product = JSON.parse(xhr.responseText);
            
            // Create the HTML for the product details
            const productHTML = `
                <div class="product-detail">
                    <div class="product-detail-image">
                        <img src="PIC/9cd6c8987056d73e9b6597dc0a7ad3fa4fbb6415b60dc82c0206167f147bab22.JPG" alt="${product.title}">
                    </div>
                    <div class="product-detail-info">
                        <h1>${product.title}</h1>
                        <p class="sku">Арт: ${product.sku}</p>
                        <p class="price">${product.price} ₽</p>
                        <p class="stock">В наличии: ${product.quantity}</p>
                        <div class="product-actions">
                            <button class="cart-btn">В корзину</button>
                        </div>
                        <div class="product-specs-detail">
                            <h3>Описание</h3>
                            <p>${product.description}</p>
                        </div>
                    </div>
                </div>
            `;
            
            container.innerHTML = productHTML;

        } else {
            console.error('Server returned an error');
            container.innerHTML = '<h1>Ошибка загрузки товара</h1><p>Сервер вернул ошибку.</p>';
        }
    };

    xhr.onerror = function () {
        console.error('Connection error');
        container.innerHTML = '<h1>Ошибка загрузки товара</h1><p>Ошибка соединения.</p>';
    };

    xhr.send();
});