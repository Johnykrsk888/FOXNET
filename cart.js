document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalContainer = document.getElementById('cart-total');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function renderCart() {
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Ваша корзина пуста.</p>';
            cartTotalContainer.innerHTML = '';
            return;
        }

        fetch('products.json')
            .then(response => response.json())
            .then(products => {
                let total = 0;
                cart.forEach(cartItem => {
                    const product = products.find(p => p.id === cartItem.id);
                    if (product) {
                        total += product.price * cartItem.quantity;
                        const cartItemElement = document.createElement('tr');
                        cartItemElement.classList.add('cart-item');
                        cartItemElement.innerHTML = `
                            <td>
                                <div class="cart-item-name">
                                    <img src="${product.image}" alt="${product.title}">
                                    <span>${product.title}</span>
                                </div>
                            </td>
                            <td>${product.price.toFixed(2)} ₽</td>
                            <td>
                                <div class="cart-item-quantity">
                                    <button class="quantity-btn" data-id="${product.id}" data-change="-1">-</button>
                                    <span>${cartItem.quantity}</span>
                                    <button class="quantity-btn" data-id="${product.id}" data-change="1">+</button>
                                </div>
                            </td>
                            <td>${(product.price * cartItem.quantity).toFixed(2)} ₽</td>
                            <td>
                                <button class="remove-btn" data-id="${product.id}">Удалить</button>
                            </td>
                        `;
                        cartItemsContainer.appendChild(cartItemElement);
                    }
                });

                cartTotalContainer.innerHTML = `<h3>Итого: ${total.toFixed(2)} ₽</h3>`;
            });
    }

    cartItemsContainer.addEventListener('click', (e) => {
        const target = e.target;
        const productId = parseInt(target.dataset.id);

        if (target.classList.contains('quantity-btn')) {
            const change = parseInt(target.dataset.change);
            const item = cart.find(item => item.id === productId);
            if (item) {
                item.quantity += change;
                if (item.quantity <= 0) {
                    cart = cart.filter(item => item.id !== productId);
                }
                saveCart();
                renderCart();
            }
        } else if (target.classList.contains('remove-btn')) {
            cart = cart.filter(item => item.id !== productId);
            saveCart();
            renderCart();
        }
    });

    renderCart();

    const clearCartBtn = document.getElementById('clear-cart-btn');

    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите очистить корзину?')) {
                cart = [];
                saveCart();
                renderCart();
            }
        });
    }
});