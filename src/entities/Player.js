import * as THREE from 'three';
import { Projectile } from './Projectile.js';
import { Soldier } from './Soldier.js';

export class Player {
  constructor(scene, fireRateMultiplier = 1, initialStrength = 10) {
    this.scene = scene;
    this.fireRateMultiplier = fireRateMultiplier;

    // Lane configuration (inverted X for camera view from behind)
    this.lanePositions = [4.5, 0, -4.5]; // Left, Center, Right (screen perspective)
    this.currentLane = 1; // Start in center (index 1)
    this.targetX = 0;
    this.currentX = 0;
    this.laneChangeSpeed = 15;

    // Base position (center of army)
    this.basePosition = new THREE.Vector3(0, 0, 0);

    // Army of soldiers
    this.soldiers = [];
    this.currentStrength = 0;

    // Initialize army with starting strength
    this.setStrength(initialStrength);

    // Projectile system
    this.projectiles = [];
    this.baseFireRate = 0.15; // Base seconds between shots
    this.fireRate = this.baseFireRate / this.fireRateMultiplier;
    this.fireTimer = 0;
    this.currentShooterIndex = 0; // For staggered shooting

    // Bounding box for collision (encompasses all soldiers)
    this.boundingBox = new THREE.Box3();
  }

  // Calculate formation positions for soldiers
  getFormationPositions(count) {
    const positions = [];

    if (count === 0) return positions;

    // Spiral/cluster formation
    const spacing = 1.2; // Space between soldiers

    // Leader at center
    positions.push({ x: 0, z: 0 });

    if (count === 1) return positions;

    // Arrange remaining soldiers in rings
    let ring = 1;
    let index = 1;

    while (index < count) {
      const soldiersInRing = Math.min(ring * 6, count - index);
      const angleStep = (Math.PI * 2) / soldiersInRing;

      for (let i = 0; i < soldiersInRing && index < count; i++) {
        const angle = i * angleStep;
        const radius = ring * spacing;
        positions.push({
          x: Math.sin(angle) * radius,
          z: -Math.cos(angle) * radius * 0.6 // Slightly compressed in Z
        });
        index++;
      }
      ring++;
    }

    return positions;
  }

  setStrength(newStrength) {
    const targetCount = Math.max(0, Math.min(newStrength, 100)); // Cap at 100 soldiers for performance

    // Add soldiers if needed
    while (this.soldiers.length < targetCount) {
      const index = this.soldiers.length;
      const soldier = new Soldier(this.scene, 0, 0, index);
      this.soldiers.push(soldier);
    }

    // Remove soldiers if needed
    while (this.soldiers.length > targetCount) {
      const soldier = this.soldiers.pop();
      soldier.dispose();
    }

    // Update formation positions
    const positions = this.getFormationPositions(this.soldiers.length);
    for (let i = 0; i < this.soldiers.length; i++) {
      this.soldiers[i].setTargetOffset(positions[i].x, positions[i].z);
    }

    this.currentStrength = targetCount;
  }

  addStrength(amount) {
    this.setStrength(this.currentStrength + amount);
  }

  removeStrength(amount) {
    this.setStrength(this.currentStrength - amount);
    return this.currentStrength <= 0;
  }

  getStrength() {
    return this.currentStrength;
  }

  update(dt, targetLane) {
    // Update target position based on lane
    this.targetX = this.lanePositions[targetLane + 1]; // Convert -1,0,1 to 0,1,2

    // Smoothly move to target lane
    const diff = this.targetX - this.currentX;
    if (Math.abs(diff) > 0.01) {
      this.currentX += diff * this.laneChangeSpeed * dt;
    } else {
      this.currentX = this.targetX;
    }

    // Update base position
    this.basePosition.set(this.currentX, 0, 0);

    // Update all soldiers
    for (const soldier of this.soldiers) {
      soldier.update(dt, this.basePosition.x, this.basePosition.y, this.basePosition.z);
    }

    // Auto-fire projectiles (staggered across soldiers)
    this.fireTimer += dt;
    if (this.fireTimer >= this.fireRate && this.soldiers.length > 0) {
      this.fireTimer = 0;
      this.fireProjectiles();
    }

    // Update bounding box to encompass all soldiers
    this.updateBoundingBox();
  }

  fireProjectiles() {
    if (this.soldiers.length === 0) return;

    // Fire from multiple soldiers (up to 5 at a time for balance)
    const shootersPerVolley = Math.min(5, this.soldiers.length);

    for (let i = 0; i < shootersPerVolley; i++) {
      const soldierIndex = (this.currentShooterIndex + i) % this.soldiers.length;
      const soldier = this.soldiers[soldierIndex];
      const pos = soldier.getWorldPosition();

      const projectile = new Projectile(
        this.scene,
        pos.x,
        0.7, // Gun barrel height (scaled soldier)
        pos.z + 0.6
      );
      this.projectiles.push(projectile);
    }

    // Rotate to next set of shooters
    this.currentShooterIndex = (this.currentShooterIndex + shootersPerVolley) % this.soldiers.length;
  }

  updateProjectiles(dt, gameSpeed) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      projectile.update(dt, gameSpeed);

      // Remove projectiles that are too far
      if (projectile.mesh.position.z > 80) {
        this.removeProjectile(projectile);
      }
    }
  }

  removeProjectile(projectile) {
    const index = this.projectiles.indexOf(projectile);
    if (index > -1) {
      this.projectiles.splice(index, 1);
      this.scene.remove(projectile.mesh);
      projectile.dispose();
    }
  }

  updateBoundingBox() {
    if (this.soldiers.length === 0) {
      this.boundingBox.makeEmpty();
      return;
    }

    // Start with first soldier's position
    const firstPos = this.soldiers[0].mesh.position;
    this.boundingBox.min.set(firstPos.x - 0.5, 0, firstPos.z - 0.5);
    this.boundingBox.max.set(firstPos.x + 0.5, 2, firstPos.z + 0.5);

    // Expand to include all soldiers
    for (let i = 1; i < this.soldiers.length; i++) {
      const pos = this.soldiers[i].mesh.position;
      this.boundingBox.min.x = Math.min(this.boundingBox.min.x, pos.x - 0.5);
      this.boundingBox.min.z = Math.min(this.boundingBox.min.z, pos.z - 0.5);
      this.boundingBox.max.x = Math.max(this.boundingBox.max.x, pos.x + 0.5);
      this.boundingBox.max.z = Math.max(this.boundingBox.max.z, pos.z + 0.5);
    }
  }

  // Get position for collision checks (center of army)
  get mesh() {
    // Return a fake mesh object for compatibility
    return {
      position: this.basePosition
    };
  }

  dispose() {
    // Dispose all soldiers
    for (const soldier of this.soldiers) {
      soldier.dispose();
    }
    this.soldiers = [];

    // Dispose all projectiles
    for (const projectile of this.projectiles) {
      this.scene.remove(projectile.mesh);
      projectile.dispose();
    }
    this.projectiles = [];
  }
}
