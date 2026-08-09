// =========================================================
// B.TECH PANI PURI WALA — SCRIPT
// =========================================================

document.addEventListener('DOMContentLoaded', function () {

    /* ---------------- LOADER ---------------- */
    const loader = document.getElementById('loader');
    window.addEventListener('load', () => {
        setTimeout(() => loader.classList.add('hide'), 400);
    });

    /* ---------------- MOBILE MENU ---------------- */
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');

    menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => navLinks.classList.remove('active'));
    });

    /* ---------------- SHOP OPEN / CLOSED STATUS ---------------- */
    // Shop hours: 11:00 AM to 9:00 PM (21:00), every day
    function updateShopStatus() {
        const statusEl = document.getElementById('shopStatus');
        const now = new Date();
        const hour = now.getHours();
        const isOpen = hour >= 11 && hour < 21;

        if (isOpen) {
            statusEl.textContent = '🟢 Open Now';
            statusEl.classList.remove('closed');
        } else {
            statusEl.textContent = '🔴 Closed Now (Opens 11:00 AM)';
            statusEl.classList.add('closed');
        }
    }
    updateShopStatus();
    setInterval(updateShopStatus, 60000);

    /* ---------------- SCROLL TO TOP ---------------- */
    const topBtn = document.getElementById('topBtn');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            topBtn.classList.add('show');
        } else {
            topBtn.classList.remove('show');
        }
    });
    topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    /* ---------------- MENU FILTER ---------------- */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const menuCards = document.querySelectorAll('.menu-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;

            menuCards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    /* ---------------- MENU SEARCH ---------------- */
    const searchBox = document.getElementById('searchBox');
    searchBox.addEventListener('input', () => {
        const term = searchBox.value.trim().toLowerCase();

        // Reset filter buttons to "All" look when searching
        if (term) {
            filterBtns.forEach(b => b.classList.remove('active'));
        }

        menuCards.forEach(card => {
            const name = card.querySelector('h3').textContent.toLowerCase();
            card.classList.toggle('hidden', !name.includes(term));
        });
    });

    /* =========================================================
       CART STATE
    ========================================================= */

    let cart = [];

    function saveCart() {
        updateCartCount();
    }

    function updateCartCount() {
        // Badge shows number of distinct ITEM NAMES in the cart.
        // Same item in both Half & Full still counts as ONE (only pricing/qty differ per size).
        const uniqueNames = new Set(cart.map(item => item.name));
        document.getElementById('cartCount').textContent = uniqueNames.size;
    }

    /* =========================================================
       ORDER POPUP (item -> add to cart)
    ========================================================= */

    const orderPopup = document.getElementById('orderPopup');
    const popupItem = document.getElementById('popupItem');
    const popupPrice = document.getElementById('popupPrice');
    const sizeBox = document.getElementById('sizeBox');
    const qtyEl = document.getElementById('qty');
    const minusBtn = document.getElementById('minusBtn');
    const plusBtn = document.getElementById('plusBtn');
    const addToCartBtn = document.getElementById('addToCart');

    let currentItem = null;

    function openOrderPopup(btn) {
        const name = btn.dataset.item;
        const type = btn.dataset.type; // "single" | "piece" | "size"

        currentItem = {
            name,
            type,
            priceSingle: parseFloat(btn.dataset.price || 0),
            priceHalf: parseFloat(btn.dataset.priceHalf || 0),
            priceFull: parseFloat(btn.dataset.priceFull || 0)
        };

        popupItem.textContent = name;
        qtyEl.textContent = '1';

        if (type === 'size') {
            sizeBox.style.display = 'block';
            document.querySelector('input[name="size"][value="Half"]').checked = true;
            popupPrice.textContent = `Half ₹${currentItem.priceHalf} | Full ₹${currentItem.priceFull}`;
        } else {
            sizeBox.style.display = 'none';
            popupPrice.textContent = `₹${currentItem.priceSingle}`;
        }

        orderPopup.classList.add('active');
    }

    document.querySelectorAll('.openPopup').forEach(btn => {
        btn.addEventListener('click', () => openOrderPopup(btn));
    });

    document.getElementById('closePopup').addEventListener('click', () => {
        orderPopup.classList.remove('active');
    });

    document.querySelectorAll('input[name="size"]').forEach(radio => {
        radio.addEventListener('change', () => {
            if (!currentItem) return;
            const size = document.querySelector('input[name="size"]:checked').value;
            popupPrice.textContent = size === 'Half'
                ? `Half ₹${currentItem.priceHalf} selected`
                : `Full ₹${currentItem.priceFull} selected`;
        });
    });

    minusBtn.addEventListener('click', () => {
        let q = parseInt(qtyEl.textContent);
        if (q > 1) qtyEl.textContent = q - 1;
    });

    plusBtn.addEventListener('click', () => {
        let q = parseInt(qtyEl.textContent);
        qtyEl.textContent = q + 1;
    });

    addToCartBtn.addEventListener('click', () => {
        if (!currentItem) return;

        const qty = parseInt(qtyEl.textContent) || 1;
        let size = null;
        let unitPrice = currentItem.priceSingle;

        if (currentItem.type === 'size') {
            size = document.querySelector('input[name="size"]:checked').value;
            unitPrice = size === 'Half' ? currentItem.priceHalf : currentItem.priceFull;
        }

        // Merge with existing identical item+size in cart
        const existing = cart.find(i => i.name === currentItem.name && i.size === size);
        if (existing) {
            existing.qty += qty;
        } else {
            cart.push({ name: currentItem.name, size, qty, price: unitPrice });
        }

        saveCart();
        renderCart();
        orderPopup.classList.remove('active');
        showToast(`✅ ${currentItem.name} added to your order`);
    });

    /* ---------------- TOAST ---------------- */
    let toastTimer = null;
    function showToast(text) {
        let toast = document.querySelector('.toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = text;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
    }

    /* =========================================================
       CART POPUP
    ========================================================= */

    const cartPopup = document.getElementById('cartPopup');
    const cartBtn = document.getElementById('cartBtn');
    const cartItemsEl = document.getElementById('cartItems');
    const totalPriceEl = document.getElementById('totalPrice');
    const deliveryChargeEl = document.getElementById('deliveryCharge');
    const deliveryTimeEl = document.getElementById('deliveryTime');
    const grandTotalEl = document.getElementById('grandTotal');
    const deliveryAreaBox = document.getElementById('deliveryAreaBox');
    const addressBox = document.getElementById('addressBox');
    const kmBox = document.getElementById('kmBox');
    const kmInput = document.getElementById('kmInput');

    /* ---------------- ORDER ACCEPTANCE WINDOW ----------------
       Shop hours are 11 AM - 9 PM, but last WhatsApp orders are
       accepted up to 10 PM. Outside 11:00 AM - 10:00 PM, ordering
       is blocked entirely.
    ------------------------------------------------------- */
    const orderClosedMsg = document.getElementById('orderClosedMsg');
    const placeOrderBtn = document.getElementById('placeOrder');

    function isAcceptingOrders() {
        const hour = new Date().getHours();
        return hour >= 11 && hour < 22; // 11:00 AM to 9:59 PM
    }

    function updateOrderAvailability() {
        if (isAcceptingOrders()) {
            orderClosedMsg.style.display = 'none';
            placeOrderBtn.disabled = false;
        } else {
            orderClosedMsg.style.display = 'block';
            placeOrderBtn.disabled = true;
        }
    }

    cartBtn.addEventListener('click', () => {
        renderCart();
        updateOrderAvailability();
        cartPopup.classList.add('active');
    });

    document.querySelector('.close-cart').addEventListener('click', () => {
        cartPopup.classList.remove('active');
    });

    // Close popups when clicking the dark overlay (not the box itself)
    [orderPopup, cartPopup].forEach(p => {
        p.addEventListener('click', (e) => {
            if (e.target === p) p.classList.remove('active');
        });
    });

    document.querySelectorAll('input[name="deliveryType"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const isDelivery = document.querySelector('input[name="deliveryType"]:checked').value === 'Delivery';
            deliveryAreaBox.style.display = isDelivery ? 'block' : 'none';
            addressBox.style.display = isDelivery ? 'block' : 'none';
            calculateTotals();
        });
    });

    document.querySelectorAll('input[name="areaType"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const isOutside = document.querySelector('input[name="areaType"]:checked').value === 'outside';
            kmBox.style.display = isOutside ? 'flex' : 'none';
            calculateTotals();
        });
    });

    kmInput.addEventListener('input', calculateTotals);

    function renderCart() {
        if (cart.length === 0) {
            cartItemsEl.innerHTML = '<p class="empty-cart">No food items added yet.</p>';
        } else {
            cartItemsEl.innerHTML = cart.map((item, index) => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <b>${item.name}${item.size ? ' (' + item.size + ')' : ''}</b>
                        <span>₹${item.price} x ${item.qty} = ₹${item.price * item.qty}</span>
                    </div>
                    <div class="cart-item-actions">
                        <button data-action="minus" data-index="${index}">-</button>
                        <span>${item.qty}</span>
                        <button data-action="plus" data-index="${index}">+</button>
                        <button class="remove-item" data-action="remove" data-index="${index}">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
        calculateTotals();
    }

    cartItemsEl.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        const index = parseInt(btn.dataset.index);
        const action = btn.dataset.action;

        if (action === 'plus') cart[index].qty++;
        if (action === 'minus') {
            cart[index].qty--;
            if (cart[index].qty <= 0) cart.splice(index, 1);
        }
        if (action === 'remove') cart.splice(index, 1);

        saveCart();
        renderCart();
    });

    /* ---------------- DELIVERY CHARGE LOGIC ----------------
       Within Birsinghpur: free on orders ₹50+, else ₹20.
       Outside Birsinghpur (up to 5 KM): exact KM entered x ₹10/km.
       Beyond 5 KM: too far to auto-calculate — ask to contact on WhatsApp.
    ------------------------------------------------------- */
    function calculateTotals() {
        const foodTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        const deliveryType = document.querySelector('input[name="deliveryType"]:checked').value;

        let charge = 0;
        let time = '10-15 Minutes';
        let contactNeeded = false;

        if (deliveryType === 'Pickup') {
            charge = 0;
            time = '10-15 Minutes';
        } else {
            const areaType = document.querySelector('input[name="areaType"]:checked').value;
            if (areaType === 'local') {
                charge = foodTotal >= 50 ? 0 : 20;
                time = '20-30 Minutes';
            } else {
                const km = parseFloat(kmInput.value) || 0;
                if (foodTotal < 50) {
                    deliveryTimeEl.textContent = 'Min ₹50 order needed';
                    totalPriceEl.textContent = `₹${foodTotal}`;
                    deliveryChargeEl.textContent = '⚠️ Not eligible (min ₹50)';
                    grandTotalEl.textContent = `₹${foodTotal}`;
                    return;
                } else if (km > 5) {
                    contactNeeded = true;
                    time = 'Confirm on WhatsApp';
                } else {
                    charge = km > 0 ? Math.round(km * 10) : 0;
                    time = '30-40 Minutes';
                }
            }
        }

        totalPriceEl.textContent = `₹${foodTotal}`;
        deliveryTimeEl.textContent = time;

        if (contactNeeded) {
            deliveryChargeEl.textContent = '📞 Contact on WhatsApp';
            grandTotalEl.textContent = `₹${foodTotal} + Delivery (confirm on WhatsApp)`;
        } else {
            deliveryChargeEl.textContent = `₹${charge}`;
            grandTotalEl.textContent = `₹${foodTotal + charge}`;
        }
    }

    document.getElementById('clearCart').addEventListener('click', () => {
        cart = [];
        saveCart();
        renderCart();
    });

    /* ---------------- PLACE ORDER (WhatsApp) ---------------- */
    document.getElementById('placeOrder').addEventListener('click', () => {
        if (!isAcceptingOrders()) {
            updateOrderAvailability();
            alert('Sorry, we are currently closed for orders. You can order between 11:00 AM and 10:00 PM.');
            return;
        }

        if (cart.length === 0) {
            alert('Please add at least one item to your order.');
            return;
        }

        const name = document.getElementById('customerName').value.trim();
        const mobile = document.getElementById('customerMobile').value.trim();
        const deliveryType = document.querySelector('input[name="deliveryType"]:checked').value;

        if (!name || !mobile) {
            alert('Please enter your name and mobile number.');
            return;
        }

        let address = '';
        let areaLabel = '';
        let beyondRange = false;
        let km = 0;

        if (deliveryType === 'Delivery') {
            address = document.getElementById('customerAddress').value.trim();
            if (!address) {
                alert('Please enter your delivery address.');
                return;
            }

            const areaType = document.querySelector('input[name="areaType"]:checked').value;
            if (areaType === 'local') {
                areaLabel = '📍 Within Birsinghpur';
            } else {
                const foodTotalCheck = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
                if (foodTotalCheck < 50) {
                    alert('Minimum ₹50 order is required for delivery outside Birsinghpur.');
                    return;
                }

                km = parseFloat(kmInput.value) || 0;
                if (km <= 0) {
                    alert('Please enter the approximate delivery distance in KM.');
                    return;
                }
                if (km > 5) {
                    beyondRange = true;
                    areaLabel = `📍 Outside Birsinghpur (~${km} KM)`;
                } else {
                    areaLabel = `📍 Outside Birsinghpur (~${km} KM)`;
                }
            }
        }

        const foodTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        let message = `Hello B.Tech Pani Puri Wala! 🙏\nI would like to place an order:\n\n`;
        cart.forEach(item => {
            message += `• ${item.name}${item.size ? ' (' + item.size + ')' : ''} x${item.qty} - ₹${item.price * item.qty}\n`;
        });

        message += `\nFood Total: ₹${foodTotal}`;

        if (beyondRange) {
            message += `\nDelivery Charge: Please confirm (distance is ${km} KM, more than 5 KM)`;
            message += `\nGrand Total: ₹${foodTotal} + delivery charge (to be confirmed)`;
        } else {
            const charge = parseInt(deliveryChargeEl.textContent.replace('₹', '')) || 0;
            const grandTotal = foodTotal + charge;
            message += `\nDelivery Charge: ₹${charge}`;
            message += `\nGrand Total: ₹${grandTotal}`;
        }

        message += `\n\nOrder Type: ${deliveryType === 'Pickup' ? '🏪 Pickup from Shop' : '🛵 Home Delivery'}`;

        if (deliveryType === 'Delivery') {
            message += `\nArea: ${areaLabel}`;
            message += `\nAddress: ${address}`;
        }

        message += `\n\nName: ${name}`;
        message += `\nMobile: ${mobile}`;

        const url = `https://wa.me/918103402824?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');

        // Order placed — clear the cart and reset the form for the next order
        cart = [];
        saveCart();
        renderCart();
        document.getElementById('customerName').value = '';
        document.getElementById('customerMobile').value = '';
        document.getElementById('customerAddress').value = '';
        document.querySelector('input[name="deliveryType"][value="Pickup"]').checked = true;
        document.querySelector('input[name="areaType"][value="local"]').checked = true;
        deliveryAreaBox.style.display = 'none';
        addressBox.style.display = 'none';
        kmBox.style.display = 'none';
        kmInput.value = '';
        cartPopup.classList.remove('active');
    });

    /* Initial render */
    updateCartCount();
});

/* ---------------- COPY UPI ID (called from inline onclick) ---------------- */
function copyUPI() {
    const upiId = document.getElementById('upiId').textContent.trim();
    navigator.clipboard.writeText(upiId).then(() => {
        alert('UPI ID Copied: ' + upiId);
    }).catch(() => {
        alert('Could not copy automatically. UPI ID: ' + upiId);
    });
}