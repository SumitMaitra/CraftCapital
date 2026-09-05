class CartManager {
  constructor() {
    this.storageKey = 'craftcapital_cart';
    this.items = this.loadCart();

    // Bind methods
    this.addItem = this.addItem.bind(this);
    this.removeItem = this.removeItem.bind(this);
    this.updateQuantity = this.updateQuantity.bind(this);
    this.clear = this.clear.bind(this);

    // Initial badge update
    this.updateBadge();

    // If on the cart page, render it
    if (document.getElementById('cart-items-container')) {
      this.renderCart();
      // Re-render whenever cart updates (e.g., qty change, remove)
      document.addEventListener('cart:updated', () => this.renderCart());
    }
  }

  loadCart() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to load cart', e);
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
      this.dispatchUpdateEvent();
      this.updateBadge();
    } catch (e) {
      console.error('Failed to save cart', e);
    }
  }

  dispatchUpdateEvent() {
    const event = new CustomEvent('cart:updated', { detail: { cart: this } });
    document.dispatchEvent(event);
  }

  addItem(product, qty = 1) {
    const existing = this.items.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += qty;
    } else {
      this.items.push({ ...product, quantity: qty });
    }
    this.saveCart();
    this.showToast(`✓ Added "${product.name}" to cart`);
  }

  removeItem(id) {
    this.items = this.items.filter(item => item.id !== id);
    this.saveCart();
  }

  updateQuantity(id, qty) {
    const item = this.items.find(item => item.id === id);
    if (item) {
      item.quantity = Math.max(1, qty);
      this.saveCart();
    }
  }

  getItems() {
    return this.items;
  }

  getTotal() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  clear() {
    this.items = [];
    this.saveCart();
  }

  updateBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    const count = this.items.length; // count unique items
    badges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-block' : 'none';
    });
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /* ─────────────── Cart Page Renderer ─────────────── */
  renderCart() {
    const container = document.getElementById('cart-items-container');
    const summarySubtotalEl = document.getElementById('summary-subtotal');
    const summaryFeeEl = document.getElementById('summary-fee');
    const summaryTotalEl = document.getElementById('summary-total');
    const pageTitleEl = document.getElementById('cart-page-title');
    const checkoutBtn = document.getElementById('checkout-btn');
    const emptyState = document.getElementById('cart-empty-state');
    const cartLayout = document.getElementById('cart-layout');

    if (!container) return;

    const items = this.items;
    const itemCount = items.length;

    // Update page title
    if (pageTitleEl) {
      pageTitleEl.textContent = itemCount === 0
        ? 'Your Cart'
        : `Your Cart (${itemCount} item${itemCount !== 1 ? 's' : ''})`;
    }

    // Show/hide empty state vs cart layout
    if (itemCount === 0) {
      if (emptyState) emptyState.style.display = 'block';
      if (cartLayout) cartLayout.style.display = 'none';
      return;
    } else {
      if (emptyState) emptyState.style.display = 'none';
      if (cartLayout) cartLayout.style.display = 'flex';
    }

    // Render items
    container.innerHTML = items.map(item => {
      const lineTotal = item.price * item.quantity;
      const imgHtml = item.image
        ? `<img src="${item.image}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`
        : `<span style="font-size:3rem;">🎨</span>`;
      return `
        <div class="cart-item" data-id="${item.id}">
          <div class="item-image">${imgHtml}</div>
          <div class="item-details">
            <div class="item-header">
              <div>
                <h3 class="item-title">${item.name}</h3>
                ${item.artisan ? `<div class="item-meta">Artisan: ${item.artisan}</div>` : ''}
              </div>
              <div class="item-price">${this.formatCurrency(lineTotal)}</div>
            </div>
            <div class="item-meta" style="margin-top:-0.5rem">${this.formatCurrency(item.price)} / unit</div>

            <div class="item-controls">
              <div class="qty-controls">
                <button class="qty-btn" onclick="cartManager.changeQty('${item.id}', -1)" aria-label="Decrease quantity">−</button>
                <input type="number" class="qty-input" value="${item.quantity}" min="1"
                  onchange="cartManager.updateQuantity('${item.id}', parseInt(this.value) || 1)" />
                <button class="qty-btn" onclick="cartManager.changeQty('${item.id}', 1)" aria-label="Increase quantity">+</button>
              </div>
              <button class="remove-btn" onclick="cartManager.removeItem('${item.id}')">🗑 Remove</button>
            </div>
          </div>
        </div>`;
    }).join('');

    // Update order summary
    const subtotal = this.getTotal();
    const fee = Math.round(subtotal * 0.10);
    const total = subtotal + fee;

    if (summarySubtotalEl) summarySubtotalEl.textContent = this.formatCurrency(subtotal);
    if (summaryFeeEl) summaryFeeEl.textContent = this.formatCurrency(fee);
    if (summaryTotalEl) summaryTotalEl.textContent = this.formatCurrency(total);

    // Enable/disable checkout button
    if (checkoutBtn) {
      checkoutBtn.classList.toggle('disabled', itemCount === 0);
    }
  }

  // Helper: increment/decrement qty by delta
  changeQty(id, delta) {
    const item = this.items.find(i => i.id === id);
    if (item) {
      const newQty = Math.max(1, item.quantity + delta);
      this.updateQuantity(id, newQty);
    }
  }

  /* ─────────────── Toast Notification ─────────────── */
  showToast(message) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideInRight 0.3s reverse forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Initialize global cart instance
window.cartManager = new CartManager();
