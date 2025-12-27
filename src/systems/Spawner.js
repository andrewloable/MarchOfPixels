import { Enemy } from '../entities/Enemy.js';
import { Gate } from '../entities/Gate.js';
import { Barrel } from '../entities/Barrel.js';
import { Crate } from '../entities/Crate.js';

export class Spawner {
  constructor(scene, gameSpeed) {
    this.scene = scene;
    this.gameSpeed = gameSpeed;

    // Entity arrays
    this.enemies = [];
    this.gates = [];
    this.barrels = [];
    this.crates = [];

    // Spawn timers
    this.enemySpawnTimer = 0;
    this.gateSpawnTimer = 0;
    this.barrelSpawnTimer = 0;
    this.crateSpawnTimer = 0;

    // Spawn intervals (seconds)
    this.enemySpawnInterval = 3;
    this.gateSpawnInterval = 5;
    this.barrelSpawnInterval = 4;
    this.crateSpawnInterval = 6;

    // Spawn distance (how far ahead to spawn)
    this.spawnDistance = 60;

    // Lane positions (inverted X for camera view from behind)
    this.lanes = [4.5, 0, -4.5];

    // Difficulty scaling
    this.difficultyMultiplier = 1;
  }

  update(dt, gameSpeed) {
    this.gameSpeed = gameSpeed;

    // Update difficulty based on game speed
    this.difficultyMultiplier = 1 + (gameSpeed - 10) / 20;

    // Update spawn timers
    this.enemySpawnTimer += dt;
    this.gateSpawnTimer += dt;
    this.barrelSpawnTimer += dt;
    this.crateSpawnTimer += dt;

    // Spawn enemies
    if (this.enemySpawnTimer >= this.enemySpawnInterval / this.difficultyMultiplier) {
      this.enemySpawnTimer = 0;
      this.spawnEnemyGroup();
    }

    // Spawn gates
    if (this.gateSpawnTimer >= this.gateSpawnInterval) {
      this.gateSpawnTimer = 0;
      this.spawnGate();
    }

    // Spawn barrels
    if (this.barrelSpawnTimer >= this.barrelSpawnInterval) {
      this.barrelSpawnTimer = 0;
      this.spawnBarrel();
    }

    // Spawn crates
    if (this.crateSpawnTimer >= this.crateSpawnInterval) {
      this.crateSpawnTimer = 0;
      this.spawnCrate();
    }

    // Update all entities
    this.updateEntities(dt, gameSpeed);

    // Remove off-screen entities
    this.cleanupEntities();
  }

  spawnEnemyGroup() {
    // Random lane
    const lane = this.lanes[Math.floor(Math.random() * this.lanes.length)];

    // Enemy value scales with difficulty
    const baseValue = Math.floor(10 + Math.random() * 20 * this.difficultyMultiplier);

    // Spawn a group of enemies (3-8 based on difficulty)
    const groupSize = Math.floor(3 + Math.random() * 5 * this.difficultyMultiplier);

    for (let i = 0; i < groupSize; i++) {
      const offsetX = (Math.random() - 0.5) * 2;
      const offsetZ = i * 1.5;
      const enemy = new Enemy(
        this.scene,
        lane + offsetX,
        this.spawnDistance + offsetZ,
        baseValue
      );
      this.enemies.push(enemy);
    }
  }

  spawnGate() {
    // Random lane
    const lane = this.lanes[Math.floor(Math.random() * this.lanes.length)];

    // Gate value (positive bonus)
    const value = Math.floor(20 + Math.random() * 50 * this.difficultyMultiplier);

    const gate = new Gate(this.scene, lane, this.spawnDistance, value);
    this.gates.push(gate);
  }

  spawnBarrel() {
    // Random lane
    const lane = this.lanes[Math.floor(Math.random() * this.lanes.length)];

    // Barrel value
    const value = Math.floor(10 + Math.random() * 30);

    const barrel = new Barrel(this.scene, lane, this.spawnDistance, value);
    this.barrels.push(barrel);
  }

  spawnCrate() {
    // Random lane
    const lane = this.lanes[Math.floor(Math.random() * this.lanes.length)];

    // Coin value (scales with difficulty)
    const coinValue = Math.floor(5 + Math.random() * 15 * this.difficultyMultiplier);

    const crate = new Crate(this.scene, lane, this.spawnDistance, coinValue);
    this.crates.push(crate);
  }

  updateEntities(dt, gameSpeed) {
    // Update enemies
    for (const enemy of this.enemies) {
      enemy.update(dt, gameSpeed);
    }

    // Update gates
    for (const gate of this.gates) {
      gate.update(dt, gameSpeed);
    }

    // Update barrels
    for (const barrel of this.barrels) {
      barrel.update(dt, gameSpeed);
    }

    // Update crates
    for (const crate of this.crates) {
      crate.update(dt, gameSpeed);
    }
  }

  cleanupEntities() {
    const removeDistance = -10;

    // Remove enemies behind player
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      if (this.enemies[i].mesh.position.z < removeDistance) {
        this.enemies[i].dispose();
        this.enemies.splice(i, 1);
      }
    }

    // Remove gates behind player
    for (let i = this.gates.length - 1; i >= 0; i--) {
      if (this.gates[i].mesh.position.z < removeDistance) {
        this.gates[i].dispose();
        this.gates.splice(i, 1);
      }
    }

    // Remove barrels behind player
    for (let i = this.barrels.length - 1; i >= 0; i--) {
      if (this.barrels[i].mesh.position.z < removeDistance) {
        this.barrels[i].dispose();
        this.barrels.splice(i, 1);
      }
    }

    // Remove crates behind player
    for (let i = this.crates.length - 1; i >= 0; i--) {
      if (this.crates[i].mesh.position.z < removeDistance) {
        this.crates[i].dispose();
        this.crates.splice(i, 1);
      }
    }
  }

  removeGate(gate) {
    const index = this.gates.indexOf(gate);
    if (index > -1) {
      this.gates[index].dispose();
      this.gates.splice(index, 1);
    }
  }

  removeEnemy(enemy) {
    const index = this.enemies.indexOf(enemy);
    if (index > -1) {
      this.enemies[index].dispose();
      this.enemies.splice(index, 1);
    }
  }

  removeBarrel(barrel) {
    const index = this.barrels.indexOf(barrel);
    if (index > -1) {
      this.barrels[index].dispose();
      this.barrels.splice(index, 1);
    }
  }

  removeCrate(crate) {
    const index = this.crates.indexOf(crate);
    if (index > -1) {
      this.crates[index].dispose();
      this.crates.splice(index, 1);
    }
  }

  clear() {
    // Dispose all entities
    for (const enemy of this.enemies) {
      enemy.dispose();
    }
    for (const gate of this.gates) {
      gate.dispose();
    }
    for (const barrel of this.barrels) {
      barrel.dispose();
    }
    for (const crate of this.crates) {
      crate.dispose();
    }

    this.enemies = [];
    this.gates = [];
    this.barrels = [];
    this.crates = [];
  }
}
