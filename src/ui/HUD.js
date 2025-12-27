export class HUD {
  constructor() {
    this.strengthElement = document.getElementById('strength');
    this.scoreElement = document.getElementById('score');
    this.coinsElement = document.getElementById('coins');
    this.distanceElement = document.getElementById('distance');
    this.progressBar = document.getElementById('progress-bar');
  }

  updateStrength(value) {
    if (this.strengthElement) {
      this.strengthElement.textContent = value;
    }
  }

  updateScore(value) {
    if (this.scoreElement) {
      this.scoreElement.textContent = `Score: ${value.toLocaleString()}`;
    }
  }

  updateCoins(value) {
    if (this.coinsElement) {
      this.coinsElement.textContent = value.toLocaleString();
    }
  }

  updateDistance(value) {
    if (this.distanceElement) {
      const meters = Math.floor(value);
      this.distanceElement.textContent = `${meters}m`;
    }

    // Update progress bar (cycles every 100m)
    if (this.progressBar) {
      const progress = (value % 100) / 100;
      this.progressBar.style.width = `${progress * 100}%`;
    }
  }

  show() {
    const hud = document.getElementById('hud');
    if (hud) {
      hud.classList.remove('hidden');
    }
  }

  hide() {
    const hud = document.getElementById('hud');
    if (hud) {
      hud.classList.add('hidden');
    }
  }
}
