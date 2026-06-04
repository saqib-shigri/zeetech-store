// ========== CART STATE ==========
let cart = JSON.parse(localStorage.getItem('zeetech_cart')) || [];

const TAX_RATE = 0.08;

// ========== CART FUNCTIONS ==========

function saveCart() {
  localStorage.setItem('zeetech_cart', JSON.stringify(cart));
}

function updateCartBadge() {
  const badge = document.querySelector('.cart-badge');
  if (badge) {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'flex' : 'none';
  }
}

function addToCart(name, price) {
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  saveCart();
  updateCartBadge();

  // Show feedback
  showToast(`${name} added to cart!`);
}

// ========== CART PAGE FUNCTIONS ==========

function renderCart() {
  const container = document.getElementById('cartItemsContainer');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        <p>Your cart is empty</p>
        <a href="index.html#appliances" style="color: var(--accent-cyan); display: inline-block;">Continue Shopping</a>
      </div>
    `;
    recalcSummary();
    return;
  }

  container.innerHTML = cart.map((item, index) => `
    <div class="cart-item" data-product="${item.name}" data-price="${item.price}" data-index="${index}">
      <div class="cart-item-image">
        <img src="https://images.unsplash.com/photo-1571175443880-49e1d58b2c63?w=300&h=250&fit=crop" alt="${item.name}">
      </div>
      <div class="cart-item-details">
        <div class="cart-item-top">
          <div>
            <h3 class="cart-item-title">${item.name}</h3>
            <p class="cart-item-desc">Premium quality product from Zeetech.</p>
          </div>
          <button class="btn-remove" onclick="removeItem(${index})" aria-label="Remove item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
        <div class="cart-item-bottom">
          <div class="qty-control">
            <button onclick="updateQty(${index}, -1)">&minus;</button>
            <span class="qty-value">${item.qty}</span>
            <button onclick="updateQty(${index}, 1)">+</button>
          </div>
          <span class="cart-item-price">$${(item.price * item.qty).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
  `).join('');
  recalcSummary();
}

function updateQty(index, delta) {
  let newQty = cart[index].qty + delta;
  if (newQty < 1) newQty = 1;
  cart[index].qty = newQty;
  saveCart();
  renderCart();
  updateCartBadge();
}

function removeItem(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
  updateCartBadge();
  showToast('Item removed from cart');
}

function clearCart() {
  if (cart.length === 0) {
    showToast('Cart is already empty', 'error');
    return;
  }
  if (confirm('Are you sure you want to remove all items from cart?')) {
    cart = [];
    saveCart();
    renderCart();
    updateCartBadge();
    showToast('Cart cleared successfully');
  }
}

function recalcSummary() {
  const subtotalEl = document.getElementById('subtotal');
  const taxEl = document.getElementById('tax');
  const totalEl = document.getElementById('total');

  if (!subtotalEl) return;

  let subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  subtotalEl.textContent = `$${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  taxEl.textContent = `$${tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  totalEl.textContent = `$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function applyPromo() {
  const input = document.getElementById('promoInput');
  if (!input) return;
  
  const code = input.value.trim().toUpperCase();

  if (code === 'ZEETECH-2024') {
    let subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const discount = subtotal * 0.1;
    const newSubtotal = subtotal - discount;
    const newTax = newSubtotal * TAX_RATE;
    const newTotal = newSubtotal + newTax;

    document.getElementById('subtotal').textContent = `$${newSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    document.getElementById('tax').textContent = `$${newTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    document.getElementById('total').textContent = `$${newTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

    input.style.borderColor = 'var(--success)';
    showToast('Promo code applied! 10% off');
  } else if (code) {
    input.style.borderColor = 'var(--danger)';
    showToast('Invalid promo code', 'error');
    setTimeout(() => { input.style.borderColor = ''; }, 2000);
  }
}

function checkout() {
  if (cart.length === 0) {
    showToast('Your cart is empty', 'error');
    return;
  }
  showToast('Thank you for your order! Redirecting...');
  setTimeout(() => {
    cart = [];
    saveCart();
    updateCartBadge();
    window.location.href = 'index.html';
  }, 1500);
}

// ========== LOGIN FUNCTIONS ==========

function togglePassword() {
  const input = document.getElementById('password');
  const btn = document.querySelector('.toggle-password');
  if (!input || !btn) return;

  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94l9.88 9.88z"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19l-6.72-6.72z"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
  } else {
    input.type = 'password';
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
  }
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  
  if (!email.value || !password.value) {
    showToast('Please fill all fields', 'error');
    return;
  }
  if (!email.value.includes('@')) {
    showToast('Please enter a valid email', 'error');
    return;
  }
  if (password.value.length < 4) {
    showToast('Password must be at least 4 characters', 'error');
    return;
  }
  
  showToast(`Welcome back! Redirecting...`);
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1500);
}

// ========== NEWSLETTER ==========

function handleSubscribe(e) {
  e.preventDefault();
  const input = e.target.querySelector('input');
  if (input.value && input.value.includes('@')) {
    showToast('Thanks for subscribing!');
    input.value = '';
  } else {
    showToast('Please enter a valid email', 'error');
  }
}

// ========== TOAST NOTIFICATIONS ==========

function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  const bg = type === 'error'
    ? 'linear-gradient(135deg, #ef4444, #dc2626)'
    : 'linear-gradient(135deg, #00d4ff, #0099cc)';
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: ${bg};
    color: ${type === 'error' ? '#fff' : '#000'};
    padding: 14px 24px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 14px;
    z-index: 10000;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    animation: slideIn 0.3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ========== NAVBAR SCROLL ==========

function handleNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  if (window.scrollY > 20) {
    navbar.style.background = 'rgba(8, 12, 20, 0.95)';
    navbar.style.backdropFilter = 'blur(20px)';
  } else {
    navbar.style.background = 'rgba(8, 12, 20, 0.8)';
    navbar.style.backdropFilter = 'blur(20px)';
  }
}

// ========== ANIMATIONS ==========

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100px); opacity: 0; }
  }
`;
document.head.appendChild(styleSheet);

// ========== INTERSECTION OBSERVER ==========

function setupScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.stat-card, .collection-card, .product-card, .feature-item, .testimonial-card, .promo-card, .rec-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// ========== INIT ==========

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  setupScrollAnimations();
  window.addEventListener('scroll', handleNavbarScroll);
  
  // Cart page specific
  if (document.getElementById('cartItemsContainer')) {
    renderCart();
    
    // Clear cart button
    const clearBtn = document.getElementById('clearCartBtn');
    if (clearBtn) clearBtn.addEventListener('click', clearCart);
    
    // Checkout button
    const checkoutBtn = document.querySelector('.btn-checkout');
    if (checkoutBtn) checkoutBtn.addEventListener('click', checkout);
  }
  
  // Promo code enter key
  const promoInput = document.getElementById('promoInput');
  if (promoInput) {
    promoInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyPromo();
      }
    });
  }
});