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
    this.showToast(`Added ${product.name} to cart`);
  }

  removeItem(id) {
    this.items = this.items.filter(item => item.id !== id);
    this.saveCart();
  }

  updateQuantity(id, qty) {
    const item = this.items.find(item => item.id === id);
    if (item) {
      item.quantity = Math.max(1, qty); // Prevent 0 or negative
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
    const count = this.getCount();
    badges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'block' : 'none';
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

  showToast(message) {
    // Check if toast container exists
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
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.animation = 'slideInRight 0.3s reverse forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Initialize global cart instance
window.cartManager = new CartManager();

