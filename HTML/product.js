document.addEventListener('DOMContentLoaded', () => {
    const productDetailContainer = document.getElementById('product-detail-container');
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));

    if (isNaN(productId)) {
        productDetailContainer.innerHTML = '<p>Товар не найден.</p>';
        return;
    }

    fetch('products.json')
        .then(response => response.json())
        .then(products => {
            const product = products.find(p => p.id === productId);

            if (product) {
                document.title = product.title; // Update the page title
                const productHtml = `
                    <div class="product-detail">
                        <div class="product-detail-image">
                            <img src="${product.image}" alt="${product.title}">
                        </div>
                        <div class="product-detail-info">
                            <h1>${product.title}</h1>
                            <div class="product-sku">Артикул: ${product.sku}</div>
                            <div class="product-price">${product.price.toFixed(2)} ₽</div>
                            <div class="product-actions">
                                <div class="cart-btn">В корзину</div>
                            </div>
                            <div class="product-specs-detail">
                                <h3>Характеристики</h3>
                                <ul>
                                    ${product.specs.map(spec => `<li><strong>${spec.label}:</strong> ${spec.value}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                `;
                productDetailContainer.innerHTML = productHtml;
            } else {
                productDetailContainer.innerHTML = '<p>Товар не найден.</p>';
            }
        })
        .catch(error => {
            console.error('Ошибка загрузки данных о товаре:', error);
            productDetailContainer.innerHTML = '<p>Не удалось загрузить информацию о товаре.</p>';
        });
});
