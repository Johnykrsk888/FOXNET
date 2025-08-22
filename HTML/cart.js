document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalContainer = document.getElementById('cart-total');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Ваша корзина пуста.</p>';
        return;
    }

    fetch('products.json')
        .then(response => response.json())
        .then(products => {
            let total = 0;
            const cartProducts = cart.map(productId => products.find(p => p.id === productId));

            cartProducts.forEach(product => {
                if (product) {
                    total += product.price;
                    const cartItem = document.createElement('div');
                    cartItem.classList.add('cart-item');
                    cartItem.innerHTML = `
                        <img src="${product.image}" alt="${product.title}">
                        <div class="cart-item-info">
                            <h4>${product.title}</h4>
                            <p>${product.price.toFixed(2)} ₽</p>
                        </div>
                    `;
                    cartItemsContainer.appendChild(cartItem);
                }
            });

            cartTotalContainer.innerHTML = `<h3>Итого: ${total.toFixed(2)} ₽</h3>`;
        });
});
