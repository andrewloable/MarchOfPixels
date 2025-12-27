export class UpgradeMenu {
  constructor() {
    this.screen = document.getElementById('upgrade-screen');
    this.coinsDisplay = document.getElementById('upgrade-coins');
    this.upgradeList = document.getElementById('upgrade-list');
    this.closeBtn = document.getElementById('close-upgrade-btn');

    // Define available upgrades
    this.upgrades = [
      {
        id: 'starting_strength',
        name: 'Starting Power',
        description: 'Increase starting strength',
        icon: '💪',
        baseValue: 1,
        increment: 2,
        maxLevel: 10,
        baseCost: 50,
        costMultiplier: 1.5
      },
      {
        id: 'fire_rate',
        name: 'Fire Rate',
        description: 'Shoot faster projectiles',
        icon: '🔥',
        baseValue: 1,
        increment: 0.15,
        maxLevel: 8,
        baseCost: 75,
        costMultiplier: 1.6
      },
      {
        id: 'projectile_damage',
        name: 'Projectile Power',
        description: 'Deal more damage per hit',
        icon: '⚡',
        baseValue: 5,
        increment: 2,
        maxLevel: 5,
        baseCost: 100,
        costMultiplier: 2.0
      },
      {
        id: 'coin_multiplier',
        name: 'Coin Bonus',
        description: 'Earn more coins from crates',
        icon: '🪙',
        baseValue: 1,
        increment: 0.25,
        maxLevel: 8,
        baseCost: 100,
        costMultiplier: 1.8
      },
      {
        id: 'score_multiplier',
        name: 'Score Bonus',
        description: 'Earn more score points',
        icon: '⭐',
        baseValue: 1,
        increment: 0.1,
        maxLevel: 10,
        baseCost: 60,
        costMultiplier: 1.4
      }
    ];

    // Load saved upgrade levels
    this.levels = this.loadLevels();

    // Callback for coin updates
    this.onCoinsChanged = null;
  }

  loadLevels() {
    try {
      const saved = localStorage.getItem('mop_upgrades');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore errors
    }

    // Default all upgrades to level 0
    const levels = {};
    for (const upgrade of this.upgrades) {
      levels[upgrade.id] = 0;
    }
    return levels;
  }

  saveLevels() {
    try {
      localStorage.setItem('mop_upgrades', JSON.stringify(this.levels));
    } catch {
      // localStorage not available
    }
  }

  getUpgradeValue(upgradeId) {
    const upgrade = this.upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return 0;

    const level = this.levels[upgradeId] || 0;
    return upgrade.baseValue + (upgrade.increment * level);
  }

  getUpgradeCost(upgradeId) {
    const upgrade = this.upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return Infinity;

    const level = this.levels[upgradeId] || 0;
    if (level >= upgrade.maxLevel) return Infinity;

    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, level));
  }

  canAfford(upgradeId, coins) {
    return coins >= this.getUpgradeCost(upgradeId);
  }

  isMaxLevel(upgradeId) {
    const upgrade = this.upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return true;
    return (this.levels[upgradeId] || 0) >= upgrade.maxLevel;
  }

  purchaseUpgrade(upgradeId, coins) {
    if (this.isMaxLevel(upgradeId)) return { success: false, coins };

    const cost = this.getUpgradeCost(upgradeId);
    if (coins < cost) return { success: false, coins };

    this.levels[upgradeId] = (this.levels[upgradeId] || 0) + 1;
    this.saveLevels();

    return { success: true, coins: coins - cost };
  }

  show(coins, onCoinsChanged) {
    this.currentCoins = coins;
    this.onCoinsChanged = onCoinsChanged;

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

    // Clear and render upgrade list
    if (this.upgradeList) {
      this.upgradeList.innerHTML = '';

      for (const upgrade of this.upgrades) {
        const level = this.levels[upgrade.id] || 0;
        const isMax = level >= upgrade.maxLevel;
        const cost = this.getUpgradeCost(upgrade.id);
        const canAfford = this.currentCoins >= cost;
        const currentValue = this.getUpgradeValue(upgrade.id);
        const nextValue = isMax ? currentValue : currentValue + upgrade.increment;

        const row = document.createElement('div');
        row.className = 'upgrade-row';

        row.innerHTML = `
          <div class="upgrade-icon">${upgrade.icon}</div>
          <div class="upgrade-info">
            <div class="upgrade-name">${upgrade.name}</div>
            <div class="upgrade-desc">${upgrade.description}</div>
            <div class="upgrade-value">
              ${this.formatValue(upgrade.id, currentValue)}
              ${!isMax ? ` → ${this.formatValue(upgrade.id, nextValue)}` : ''}
            </div>
          </div>
          <div class="upgrade-action">
            <div class="upgrade-level">Lv ${level}/${upgrade.maxLevel}</div>
            <button class="upgrade-btn ${isMax ? 'maxed' : ''} ${!canAfford && !isMax ? 'disabled' : ''}"
                    data-id="${upgrade.id}"
                    ${isMax || !canAfford ? 'disabled' : ''}>
              ${isMax ? 'MAX' : `🪙 ${cost}`}
            </button>
          </div>
        `;

        this.upgradeList.appendChild(row);
      }

      // Add click handlers
      this.upgradeList.querySelectorAll('.upgrade-btn:not([disabled])').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const upgradeId = e.target.dataset.id;
          this.handlePurchase(upgradeId);
        });
      });
    }
  }

  formatValue(upgradeId, value) {
    switch (upgradeId) {
      case 'starting_strength':
        return `+${Math.floor(value)}`;
      case 'fire_rate':
        return `${value.toFixed(2)}x`;
      case 'projectile_damage':
        return `${Math.floor(value)} dmg`;
      case 'coin_multiplier':
      case 'score_multiplier':
        return `${value.toFixed(2)}x`;
      default:
        return value.toString();
    }
  }

  handlePurchase(upgradeId) {
    const result = this.purchaseUpgrade(upgradeId, this.currentCoins);

    if (result.success) {
      this.currentCoins = result.coins;

      // Notify game of coin change
      if (this.onCoinsChanged) {
        this.onCoinsChanged(this.currentCoins);
      }

      // Re-render
      this.render();
    }
  }

  // Get all upgrade values for game to apply
  getUpgradeStats() {
    return {
      startingStrength: Math.floor(this.getUpgradeValue('starting_strength')),
      fireRate: this.getUpgradeValue('fire_rate'),
      projectileDamage: Math.floor(this.getUpgradeValue('projectile_damage')),
      coinMultiplier: this.getUpgradeValue('coin_multiplier'),
      scoreMultiplier: this.getUpgradeValue('score_multiplier')
    };
  }
}
