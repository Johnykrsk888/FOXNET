// Function to add a product to the cart
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProductIndex = cart.findIndex(item => item.id === product.id);

    if (existingProductIndex > -1) {
        cart[existingProductIndex].quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCounter();
}

// Function to update the cart counter in the header
function updateCartCounter() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const counterElement = document.querySelector('.cart-counter');
    if (counterElement) {
        counterElement.textContent = totalItems;
        counterElement.style.display = totalItems > 0 ? 'block' : 'none';
    }
}

// Functions for the cart page (cart.html)
function displayCartItems() {
    const cartItemsContainer = document.querySelector('#cart-items');
    const cartFooter = document.querySelector('.cart-footer');
    const cartTotalEl = document.getElementById('cart-total');

    if (!cartItemsContainer) return;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cartItemsContainer.innerHTML = '';

    // Always show the footer
    if(cartFooter) cartFooter.style.display = 'flex';

    if (cart.length === 0) {
        const row = cartItemsContainer.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 5;
        cell.textContent = 'Ваша корзина пуста.';
        if(cartTotalEl) cartTotalEl.innerHTML = 'Итого: 0.00 ₽'; // Show zero total
        return;
    }

    let grandTotal = 0;

    cart.forEach(item => {
        const itemPrice = parseFloat(String(item.price).replace(/\s/g, ''));
        const itemTotal = itemPrice * item.quantity;
        grandTotal += itemTotal;

        const row = cartItemsContainer.insertRow();
        row.innerHTML = `
            <td>
                <div class="cart-item-name">
                    <img src="${item.image}" alt="${item.title}">
                    <span>${item.title}</span>
                </div>
            </td>
            <td>${item.price} ₽</td>
            <td>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" data-id="${item.id}" data-change="-1">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" data-id="${item.id}" data-change="1">+</button>
                </div>
            </td>
            <td>${itemTotal.toFixed(2)} ₽</td>
            <td>
                <button class="remove-btn" data-id="${item.id}">Удалить</button>
            </td>
        `;
    });

    if (cartTotalEl) {
        cartTotalEl.textContent = `Итого: ${grandTotal.toFixed(2)} ₽`;
    }

    addCartPageEventListeners();
}

function addCartPageEventListeners() {
    document.querySelectorAll('.quantity-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            const change = parseInt(e.target.dataset.change, 10);
            updateCartItemQuantity(productId, change);
        });
    });

    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            removeCartItem(productId);
        });
    });

    const clearCartBtn = document.getElementById('clear-cart-btn');
    if(clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }
}

function updateCartItemQuantity(productId, change) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex > -1) {
        cart[itemIndex].quantity += change;
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartItems();
    updateCartCounter();
}

function removeCartItem(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartItems();
    updateCartCounter();
}

function clearCart() {
    localStorage.removeItem('cart');
    displayCartItems();
    updateCartCounter();
}

// Initial calls when the script loads
document.addEventListener('DOMContentLoaded', () => {
    updateCartCounter();
    if (window.location.pathname.includes('cart.html')) {
        displayCartItems();
    }
});
