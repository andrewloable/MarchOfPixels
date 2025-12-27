import * as THREE from 'three';
import { Scene } from './Scene.js';
import { Input } from './Input.js';
import { Player } from '../entities/Player.js';
import { Spawner } from '../systems/Spawner.js';
import { Collision } from '../systems/Collision.js';
import { HUD } from '../ui/HUD.js';

export class Game {
  constructor() {
    this.container = document.getElementById('game-container');
    this.scene = new Scene(this.container);
    this.input = new Input(this.container);
    this.hud = new HUD();

    this.player = null;
    this.spawner = null;
    this.collision = null;

    this.isRunning = false;
    this.score = 0;
    this.strength = 10;
    this.gameSpeed = 10;
    this.lastTime = 0;

    // Bind the game loop
    this.gameLoop = this.gameLoop.bind(this);

    // Handle resize
    window.addEventListener('resize', () => this.scene.resize());
  }

  start() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');

    this.reset();
    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.gameLoop);
  }

  restart() {
    document.getElementById('game-over-screen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');

    this.reset();
    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.gameLoop);
  }

  reset() {
    // Clear existing entities
    this.scene.clearEntities();

    // Reset game state
    this.score = 0;
    this.strength = 10;
    this.gameSpeed = 10;

    // Create player
    this.player = new Player(this.scene.scene);

    // Create systems
    this.spawner = new Spawner(this.scene.scene, this.gameSpeed);
    this.collision = new Collision();

    // Update HUD
    this.hud.updateStrength(this.strength);
    this.hud.updateScore(this.score);
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
      this.score += gate.value * 10;
      this.spawner.removeGate(gate);
    }

    // Handle enemy collisions with projectiles
    for (const result of collisionResults.enemyHits) {
      result.enemy.health -= result.damage;
      if (result.enemy.health <= 0) {
        this.score += result.enemy.value * 5;
        this.spawner.removeEnemy(result.enemy);
      }
      this.player.removeProjectile(result.projectile);
    }

    // Handle barrel collisions with projectiles
    for (const result of collisionResults.barrelHits) {
      result.barrel.health -= result.damage;
      if (result.barrel.health <= 0) {
        this.strength += result.barrel.value;
        this.score += result.barrel.value * 5;
        this.spawner.removeBarrel(result.barrel);
      }
      this.player.removeProjectile(result.projectile);
    }

    // Handle player-enemy collision (game over)
    if (collisionResults.playerHit) {
      this.gameOver();
      return;
    }

    // Update HUD
    this.hud.updateStrength(this.strength);
    this.hud.updateScore(this.score);

    // Gradually increase game speed
    this.gameSpeed = 10 + (this.score / 1000);
    this.spawner.gameSpeed = this.gameSpeed;
  }

  gameOver() {
    this.isRunning = false;
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('game-over-screen').classList.remove('hidden');
    document.getElementById('final-score').textContent = `Score: ${this.score}`;
  }
}
