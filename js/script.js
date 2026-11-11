// ==========================================
// 1. ОТОБРАЖЕНИЕ КАРТОЧКИ ТОВАРА (работает на product.html)
// ==========================================
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');
const productContainer = document.getElementById('product-container');

if (productContainer) {
    if (!productId) {
        productContainer.innerHTML = `
            <div style="text-align: center; width: 100%; padding: 50px 0;">
                <h1 style="color: white; margin-bottom: 20px;">Товар не выбран</h1>
                <p style="color: #9a9a9a; margin-bottom: 20px;">Пожалуйста, вернитесь в каталог и выберите нужный товар.</p>
                <a href="catalog.html" class="btn">Перейти в каталог</a>
            </div>
        `;
    } else if (typeof productsData !== 'undefined' && productsData[productId]) {
        const product = productsData[productId];
        
        let specsHTML = '';
        for (const [key, value] of Object.entries(product.specs)) {
            specsHTML += `<tr><th>${key}</th><td>${value}</td></tr>`;
        }

        productContainer.innerHTML = `
            <div class="product-page__media">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-page__info">
                <h1>${product.name}</h1>
                <p class="price price--big">${product.price} ₽</p>
                <button class="btn add-to-cart">В корзину</button>

                <h2>Характеристики</h2>
                <table class="specs">
                    ${specsHTML}
                </table>
            </div>
        `;
        document.title = product.name + " — DetailPro";
    } else {
        productContainer.innerHTML = `<h1 style="color:white; text-align:center; width:100%;">Товар не найден</h1>`;
    }
}

// ==========================================
// 2. ЛОГИКА КОРЗИНЫ (работает на всех страницах)
// ==========================================
let cart = [];

if (localStorage.getItem('cart')) {
    cart = JSON.parse(localStorage.getItem('cart'));
}

const cartCountEls = document.querySelectorAll('#cart-count');
const cartModal = document.getElementById('cart-modal');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const cartBtnOpen = document.getElementById('open-cart-btn');
const cartBtnClose = document.getElementById('close-cart-btn');
const cartBtnCheckout = document.getElementById('checkout-btn');

function updateCartUI() {
    let totalItems = 0;
    cart.forEach(item => totalItems += item.quantity);
    cartCountEls.forEach(el => el.textContent = totalItems);

    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = '';
    }
    
    let totalPrice = 0;

    if (cart.length === 0) {
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = '<p style="text-align:center;">Корзина пуста</p>';
        }
    } else {
        cart.forEach((item, index) => {
            totalPrice += item.price * item.quantity;
            
            if (cartItemsContainer) {
                const itemHTML = `
                    <div class="cart-item" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; padding: 10px 0;">
                        <div>
                            <h4 style="margin:0; font-size:16px;">${item.name}</h4>
                            <span style="color:#e63946; font-size:14px;">${item.price} ₽</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:10px;">
                            <button class="qty-btn" onclick="changeQty(${index}, -1)" style="background:#333; color:white; border:none; padding:2px 8px; cursor:pointer; border-radius:4px;">-</button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn" onclick="changeQty(${index}, 1)" style="background:#333; color:white; border:none; padding:2px 8px; cursor:pointer; border-radius:4px;">+</button>
                            <button onclick="removeItem(${index})" style="background:none; border:none; color:#9a9a9a; cursor:pointer; margin-left:10px;">✕</button>
                        </div>
                    </div>
                `;
                cartItemsContainer.innerHTML += itemHTML;
            }
        });
    }

    if (cartTotalEl) {
        cartTotalEl.textContent = totalPrice + ' ₽';
    }
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Глобальные функции для кнопок внутри корзины
window.changeQty = function(index, delta) {
    cart[index].quantity += delta;
    if (cart[index].quantity < 1) cart[index].quantity = 1;
    updateCartUI();
};

window.removeItem = function(index) {
    cart.splice(index, 1);
    updateCartUI();
};

// Делегирование событий: ловит клики по кнопкам "В корзину" на любой странице
document.body.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('add-to-cart')) {
        e.preventDefault();
        const button = e.target;
        const card = button.closest('.product-card') || button.closest('.product-page__info');
        
        if (card) {
            const name = card.querySelector('h4, h1').innerText;
            const priceText = card.querySelector('.price').innerText;
            const price = parseInt(priceText.replace(/[^0-9]/g, ''));

            const existingItem = cart.find(item => item.name === name);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ name: name, price: price, quantity: 1 });
            }

            updateCartUI();
            
            button.textContent = 'Добавлено!';
            setTimeout(() => button.textContent = 'В корзину', 1000);
        }
    }
});

// Открытие/закрытие окна корзины
if (cartBtnOpen && cartModal) {
    cartBtnOpen.addEventListener('click', (e) => {
        e.preventDefault();
        cartModal.style.display = 'flex';
    });
}

if (cartBtnClose && cartModal) {
    cartBtnClose.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });
}

// Кнопка оформления заказа (Заглушка)
if (cartBtnCheckout && cartItemsContainer) {
    cartBtnCheckout.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Ваша корзина пуста!');
            return;
        }
        
        cartItemsContainer.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <h3 style="color: #e63946; margin-bottom: 10px;">Заказ оформлен!</h3>
                <p>Ваша заявка принята. Наш менеджер свяжется с вами в ближайшее время для подтверждения.</p>
                <p style="font-size: 12px; color: #9a9a9a; margin-top: 20px;">(Это демонстрационный сайт)</p>
            </div>
        `;
        cart = [];
        updateCartUI();
        if (cartTotalEl) cartTotalEl.textContent = '0 ₽';
        cartBtnCheckout.style.display = 'none';
    });
}

// Запуск обновления интерфейса корзины
updateCartUI();