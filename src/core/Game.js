import * as THREE from 'three';
import { Scene } from './Scene.js';
import { Input } from './Input.js';
import { Player } from '../entities/Player.js';
import { Spawner } from '../systems/Spawner.js';
import { Collision } from '../systems/Collision.js';
import { HUD } from '../ui/HUD.js';
import { Audio } from '../ui/Audio.js';
import { Leaderboard } from '../ui/Leaderboard.js';
import { NameInput } from '../ui/NameInput.js';
import { UpgradeMenu } from '../ui/UpgradeMenu.js';

export class Game {
  constructor() {
    this.container = document.getElementById('game-container');
    this.scene = new Scene(this.container);
    this.input = new Input(this.container);
    this.hud = new HUD();
    this.audio = new Audio();
    this.leaderboard = new Leaderboard();
    this.nameInput = new NameInput();
    this.upgradeMenu = new UpgradeMenu();

    this.player = null;
    this.spawner = null;
    this.collision = null;

    this.isRunning = false;
    this.score = 0;
    this.strength = 10;
    this.coins = 0;
    this.distance = 0;
    this.gameSpeed = 10;
    this.lastTime = 0;

    // Bind the game loop
    this.gameLoop = this.gameLoop.bind(this);

    // Handle resize
    window.addEventListener('resize', () => this.scene.resize());

    // Setup mute button
    this.setupMuteButton();

    // Start menu music
    this.audio.playMenuMusic();
  }

  setupMuteButton() {
    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
      this.updateMuteButtonIcon();
      muteBtn.addEventListener('click', () => {
        this.audio.toggleMute();
        this.updateMuteButtonIcon();
      });
    }
  }

  updateMuteButtonIcon() {
    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
      muteBtn.textContent = this.audio.isMuted() ? '🔇' : '🔊';
    }
  }

  start() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');

    // Switch to game music
    this.audio.playGameMusic();

    this.reset();
    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.gameLoop);
  }

  restart() {
    document.getElementById('game-over-screen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');

    // Switch to game music
    this.audio.playGameMusic();

    this.reset();
    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.gameLoop);
  }

  reset() {
    // Clear existing entities
    this.scene.clearEntities();

    // Get upgrade stats
    const upgrades = this.upgradeMenu.getUpgradeStats();

    // Reset game state with upgrades applied
    this.score = 0;
    this.strength = upgrades.startingStrength;
    this.coins = this.loadCoins(); // Load saved coins
    this.distance = 0;
    this.gameSpeed = 10;

    // Store upgrade multipliers for use during gameplay
    this.coinMultiplier = upgrades.coinMultiplier;
    this.scoreMultiplier = upgrades.scoreMultiplier;
    this.projectileDamage = upgrades.projectileDamage;

    // Create player with upgraded fire rate
    this.player = new Player(this.scene.scene, upgrades.fireRate);

    // Create systems
    this.spawner = new Spawner(this.scene.scene, this.gameSpeed);
    this.collision = new Collision();

    // Update HUD
    this.hud.updateStrength(this.strength);
    this.hud.updateScore(this.score);
    this.hud.updateCoins(this.coins);
    this.hud.updateDistance(this.distance);
  }

  loadCoins() {
    try {
      return parseInt(localStorage.getItem('mop_coins') || '0', 10);
    } catch {
      return 0;
    }
  }

  saveCoins() {
    try {
      localStorage.setItem('mop_coins', this.coins.toString());
    } catch {
      // localStorage not available
    }
  }

  addCoins(amount) {
    this.coins += amount;
    this.saveCoins();
    this.hud.updateCoins(this.coins);
  }

  gameLoop(currentTime) {
    if (!this.isRunning) return;

    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Cap delta time to prevent huge jumps
    const dt = Math.min(deltaTime, 0.1);

    this.update(dt);
    this.scene.render();

    requestAnimationFrame(this.gameLoop);
  }

  update(dt) {
    // Update player position based on input
    const targetLane = this.input.getTargetLane();
    this.player.update(dt, targetLane);

    // Update spawner and entities
    this.spawner.update(dt, this.gameSpeed);

    // Update projectiles
    this.player.updateProjectiles(dt, this.gameSpeed);

    // Check collisions
    const collisionResults = this.collision.check(
      this.player,
      this.spawner,
      this.strength
    );

    // Handle gate collisions
    for (const gate of collisionResults.gateHits) {
      this.strength += gate.value;
      this.score += Math.floor(gate.value * 10 * this.scoreMultiplier);
      this.spawner.removeGate(gate);
    }

    // Handle enemy collisions with projectiles
    for (const result of collisionResults.enemyHits) {
      result.enemy.health -= this.projectileDamage;
      if (result.enemy.health <= 0) {
        this.score += Math.floor(result.enemy.value * 5 * this.scoreMultiplier);
        this.spawner.removeEnemy(result.enemy);
      }
      this.player.removeProjectile(result.projectile);
    }

    // Handle barrel collisions with projectiles
    for (const result of collisionResults.barrelHits) {
      result.barrel.health -= this.projectileDamage;
      if (result.barrel.health <= 0) {
        this.strength += result.barrel.value;
        this.score += Math.floor(result.barrel.value * 5 * this.scoreMultiplier);
        this.spawner.removeBarrel(result.barrel);
      }
      this.player.removeProjectile(result.projectile);
    }

    // Handle crate collisions with projectiles
    for (const result of collisionResults.crateHits) {
      result.crate.health -= this.projectileDamage;
      if (result.crate.health <= 0) {
        const coinAmount = Math.floor(result.crate.coinValue * this.coinMultiplier);
        this.addCoins(coinAmount);
        this.score += Math.floor(coinAmount * 2 * this.scoreMultiplier);
        this.spawner.removeCrate(result.crate);
      }
      this.player.removeProjectile(result.projectile);
    }

    // Handle player-enemy collision (game over)
    if (collisionResults.playerHit) {
      this.gameOver();
      return;
    }

    // Update distance traveled
    this.distance += this.gameSpeed * dt;

    // Update HUD
    this.hud.updateStrength(this.strength);
    this.hud.updateScore(this.score);
    this.hud.updateDistance(this.distance);

    // Gradually increase game speed
    this.gameSpeed = 10 + (this.score / 1000);
    this.spawner.gameSpeed = this.gameSpeed;
  }

  gameOver() {
    this.isRunning = false;
    document.getElementById('hud').classList.add('hidden');

    // Switch back to menu music
    this.audio.playMenuMusic();

    // Show name input modal first
    this.nameInput.show(
      // On submit
      async (name) => {
        const result = await this.leaderboard.submitScore(name, this.score, this.strength);
        if (result.success) {
          this.nameInput.submissionComplete();
          this.showGameOverScreen(result.rank);
        } else {
          this.nameInput.submissionFailed(result.error || 'Failed to submit score');
        }
      },
      // On skip
      () => {
        this.showGameOverScreen(null);
      }
    );
  }

  showGameOverScreen(rank) {
    document.getElementById('game-over-screen').classList.remove('hidden');
    document.getElementById('final-score').textContent = `Score: ${this.score.toLocaleString()}`;

    const rankEl = document.getElementById('player-rank');
    if (rank && rankEl) {
      rankEl.textContent = `Rank #${rank}`;
      rankEl.classList.remove('hidden');
    } else if (rankEl) {
      rankEl.classList.add('hidden');
    }
  }

  showLeaderboard() {
    this.leaderboard.show();
  }

  hideLeaderboard() {
    this.leaderboard.hide();
  }

  showUpgradeMenu() {
    this.upgradeMenu.show(this.loadCoins(), (newCoins) => {
      // Called when coins change from purchases
      this.saveCoinsValue(newCoins);
    });
  }

  hideUpgradeMenu() {
    this.upgradeMenu.hide();
  }

  saveCoinsValue(value) {
    try {
      localStorage.setItem('mop_coins', value.toString());
    } catch {
      // localStorage not available
    }
  }

  goToMenu() {
    document.getElementById('game-over-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');

    // Clear entities from scene
    this.scene.clearEntities();
    if (this.player) {
      this.player.dispose();
      this.player = null;
    }
    if (this.spawner) {
      this.spawner.clear();
      this.spawner = null;
    }

    // Menu music should already be playing from gameOver
  }
}
