import * as THREE from 'three';
import { Projectile } from './Projectile.js';

export class Player {
  constructor(scene) {
    this.scene = scene;

    // Lane configuration
    this.lanePositions = [-4.5, 0, 4.5]; // Left, Center, Right
    this.currentLane = 1; // Start in center (index 1)
    this.targetX = 0;
    this.laneChangeSpeed = 15;

    // Create player mesh (a simple colored cube/character)
    const geometry = new THREE.BoxGeometry(1.5, 2, 1);
    const material = new THREE.MeshStandardMaterial({
      color: 0x00cec9,
      emissive: 0x00cec9,
      emissiveIntensity: 0.2
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(0, 1, 0);
    scene.add(this.mesh);

    // Projectile system
    this.projectiles = [];
    this.fireRate = 0.15; // Seconds between shots
    this.fireTimer = 0;

    // Bounding box for collision
    this.boundingBox = new THREE.Box3();
  }

  update(dt, targetLane) {
    // Update target position based on lane
    this.targetX = this.lanePositions[targetLane + 1]; // Convert -1,0,1 to 0,1,2

    // Smoothly move to target lane
    const diff = this.targetX - this.mesh.position.x;
    if (Math.abs(diff) > 0.01) {
      this.mesh.position.x += diff * this.laneChangeSpeed * dt;
    } else {
      this.mesh.position.x = this.targetX;
    }

    // Auto-fire projectiles
    this.fireTimer += dt;
    if (this.fireTimer >= this.fireRate) {
      this.fireTimer = 0;
      this.fireProjectile();
    }

    // Update bounding box
    this.boundingBox.setFromObject(this.mesh);
  }

  fireProjectile() {
    const projectile = new Projectile(
      this.scene,
      this.mesh.position.x,
      this.mesh.position.y,
      this.mesh.position.z + 1
    );
    this.projectiles.push(projectile);
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

  dispose() {
    this.scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();

    for (const projectile of this.projectiles) {
      this.scene.remove(projectile.mesh);
      projectile.dispose();
    }
    this.projectiles = [];
  }
}
