export class HUD {
  constructor() {
    this.strengthElement = document.getElementById('strength');
    this.scoreElement = document.getElementById('score');
  }

  updateStrength(value) {
    if (this.strengthElement) {
      this.strengthElement.textContent = value;
    }
  }

  updateScore(value) {
    if (this.scoreElement) {
      this.scoreElement.textContent = `Score: ${value}`;
    }
  }

  updateWave(value) {
    // TODO: Add wave indicator element
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
