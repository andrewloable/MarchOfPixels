export class IAPStore {
  constructor() {
    this.screen = document.getElementById('iap-screen');
    this.coinsDisplay = document.getElementById('iap-coins');
    this.productList = document.getElementById('iap-products');
    this.closeBtn = document.getElementById('close-iap-btn');

    // Define IAP products
    this.products = [
      // Coin Packs
      {
        id: 'coins_small',
        name: 'Coin Pouch',
        description: '500 Coins',
        icon: '🪙',
        category: 'coins',
        price: '$0.99',
        priceValue: 0.99,
        coins: 500
      },
      {
        id: 'coins_medium',
        name: 'Coin Chest',
        description: '1,500 Coins + 10% Bonus',
        icon: '💰',
        category: 'coins',
        price: '$2.99',
        priceValue: 2.99,
        coins: 1650,
        popular: true
      },
      {
        id: 'coins_large',
        name: 'Coin Vault',
        description: '5,000 Coins + 25% Bonus',
        icon: '🏦',
        category: 'coins',
        price: '$9.99',
        priceValue: 9.99,
        coins: 6250
      },
      // Boost Packs
      {
        id: 'boost_starter',
        name: 'Starter Pack',
        description: '+50 Starting Strength (1 run)',
        icon: '🚀',
        category: 'boost',
        price: '$0.99',
        priceValue: 0.99,
        boostType: 'starting_strength',
        boostValue: 50
      },
      {
        id: 'boost_shield',
        name: 'Shield Pack',
        description: 'Survive 1 enemy hit (1 run)',
        icon: '🛡️',
        category: 'boost',
        price: '$1.99',
        priceValue: 1.99,
        boostType: 'shield',
        boostValue: 1
      },
      {
        id: 'boost_magnet',
        name: 'Coin Magnet',
        description: '2x coin collection (1 run)',
        icon: '🧲',
        category: 'boost',
        price: '$1.99',
        priceValue: 1.99,
        boostType: 'coin_magnet',
        boostValue: 2
      },
      // Premium/Time-Savers
      {
        id: 'unlock_all',
        name: 'Unlock All Upgrades',
        description: 'Max out all permanent upgrades',
        icon: '👑',
        category: 'premium',
        price: '$4.99',
        priceValue: 4.99,
        unlockAll: true,
        bestValue: true
      },
      {
        id: 'no_ads',
        name: 'Remove Ads',
        description: 'Remove all advertisements',
        icon: '🚫',
        category: 'premium',
        price: '$2.99',
        priceValue: 2.99,
        removeAds: true
      }
    ];

    // Load purchased items
    this.purchases = this.loadPurchases();

    // Load active boosts
    this.activeBoosts = this.loadActiveBoosts();

    // Callbacks
    this.onCoinsChanged = null;
    this.onPurchaseComplete = null;
  }

  loadPurchases() {
    try {
      const saved = localStorage.getItem('mop_purchases');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore errors
    }
    return {};
  }

  savePurchases() {
    try {
      localStorage.setItem('mop_purchases', JSON.stringify(this.purchases));
    } catch {
      // localStorage not available
    }
  }

  loadActiveBoosts() {
    try {
      const saved = localStorage.getItem('mop_active_boosts');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore errors
    }
    return {};
  }

  saveActiveBoosts() {
    try {
      localStorage.setItem('mop_active_boosts', JSON.stringify(this.activeBoosts));
    } catch {
      // localStorage not available
    }
  }

  // Get active boosts for current game run
  getActiveBoosts() {
    return { ...this.activeBoosts };
  }

  // Clear boosts after a run
  clearBoostsAfterRun() {
    this.activeBoosts = {};
    this.saveActiveBoosts();
  }

  // Check if a one-time purchase was made
  hasPurchased(productId) {
    return this.purchases[productId] === true;
  }

  show(coins, onCoinsChanged, onPurchaseComplete) {
    this.currentCoins = coins;
    this.onCoinsChanged = onCoinsChanged;
    this.onPurchaseComplete = onPurchaseComplete;

    this.render();

    if (this.screen) {
      this.screen.classList.remove('hidden');
    }
  }

  hide() {
    if (this.screen) {
      this.screen.classList.add('hidden');
    }
  }

  render() {
    // Update coins display
    if (this.coinsDisplay) {
      this.coinsDisplay.textContent = this.currentCoins.toLocaleString();
    }

    // Clear and render product list
    if (this.productList) {
      this.productList.innerHTML = '';

      // Group by category
      const categories = [
        { id: 'coins', name: 'Coin Packs', icon: '💰' },
        { id: 'boost', name: 'Boost Packs', icon: '⚡' },
        { id: 'premium', name: 'Premium', icon: '👑' }
      ];

      for (const category of categories) {
        const categoryProducts = this.products.filter(p => p.category === category.id);
        if (categoryProducts.length === 0) continue;

        // Category header
        const header = document.createElement('div');
        header.className = 'iap-category-header';
        header.innerHTML = `<span>${category.icon}</span> ${category.name}`;
        this.productList.appendChild(header);

        // Products
        for (const product of categoryProducts) {
          const isPurchased = this.hasPurchased(product.id);
          const isOneTime = product.removeAds || product.unlockAll;

          const row = document.createElement('div');
          row.className = 'iap-product';
          if (product.popular) row.classList.add('popular');
          if (product.bestValue) row.classList.add('best-value');

          row.innerHTML = `
            <div class="iap-product-icon">${product.icon}</div>
            <div class="iap-product-info">
              <div class="iap-product-name">
                ${product.name}
                ${product.popular ? '<span class="badge popular-badge">POPULAR</span>' : ''}
                ${product.bestValue ? '<span class="badge value-badge">BEST VALUE</span>' : ''}
              </div>
              <div class="iap-product-desc">${product.description}</div>
            </div>
            <button class="iap-buy-btn ${isPurchased && isOneTime ? 'purchased' : ''}"
                    data-id="${product.id}"
                    ${isPurchased && isOneTime ? 'disabled' : ''}>
              ${isPurchased && isOneTime ? 'OWNED' : product.price}
            </button>
          `;

          this.productList.appendChild(row);
        }
      }

      // Add click handlers
      this.productList.querySelectorAll('.iap-buy-btn:not([disabled])').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const productId = e.target.dataset.id;
          this.handlePurchase(productId);
        });
      });
    }
  }

  async handlePurchase(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    // In a real app, this would connect to a payment processor
    // For now, simulate the purchase flow
    const confirmed = await this.showPurchaseConfirmation(product);

    if (confirmed) {
      // Process the purchase
      this.processPurchase(product);
    }
  }

  showPurchaseConfirmation(product) {
    return new Promise((resolve) => {
      // Create confirmation modal
      const modal = document.createElement('div');
      modal.className = 'iap-confirm-modal';
      modal.innerHTML = `
        <div class="iap-confirm-content">
          <div class="iap-confirm-icon">${product.icon}</div>
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <div class="iap-confirm-price">${product.price}</div>
          <p class="iap-confirm-note">This is a simulated purchase for demo purposes.</p>
          <div class="iap-confirm-buttons">
            <button class="btn iap-confirm-yes">CONFIRM</button>
            <button class="btn btn-secondary iap-confirm-no">CANCEL</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      modal.querySelector('.iap-confirm-yes').addEventListener('click', () => {
        modal.remove();
        resolve(true);
      });

      modal.querySelector('.iap-confirm-no').addEventListener('click', () => {
        modal.remove();
        resolve(false);
      });
    });
  }

  processPurchase(product) {
    // Handle different product types
    if (product.category === 'coins') {
      // Add coins
      this.currentCoins += product.coins;
      if (this.onCoinsChanged) {
        this.onCoinsChanged(this.currentCoins);
      }
    } else if (product.category === 'boost') {
      // Add boost for next run
      this.activeBoosts[product.boostType] = product.boostValue;
      this.saveActiveBoosts();
    } else if (product.unlockAll) {
      // Unlock all upgrades
      this.purchases[product.id] = true;
      this.savePurchases();
      if (this.onPurchaseComplete) {
        this.onPurchaseComplete('unlock_all');
      }
    } else if (product.removeAds) {
      // Remove ads
      this.purchases[product.id] = true;
      this.savePurchases();
      if (this.onPurchaseComplete) {
        this.onPurchaseComplete('remove_ads');
      }
    }

    // Show success message
    this.showPurchaseSuccess(product);

    // Re-render
    this.render();
  }

  showPurchaseSuccess(product) {
    const toast = document.createElement('div');
    toast.className = 'iap-toast';
    toast.innerHTML = `
      <span class="iap-toast-icon">${product.icon}</span>
      <span>${product.name} purchased!</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  // Check if ads should be shown
  shouldShowAds() {
    return !this.hasPurchased('no_ads');
  }
}
