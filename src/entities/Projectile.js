import * as THREE from 'three';

export class Projectile {
  constructor(scene, x, y, z) {
    this.scene = scene;
    this.speed = 50; // Units per second

    // Create projectile mesh (glowing blue/white beam)
    const geometry = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 8);
    geometry.rotateX(Math.PI / 2); // Point forward

    const material = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.9
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(x, y, z);
    scene.add(this.mesh);

    // Add glow effect (larger transparent cylinder)
    const glowGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.8, 8);
    glowGeometry.rotateX(Math.PI / 2);

    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.3
    });

    this.glow = new THREE.Mesh(glowGeometry, glowMaterial);
    this.mesh.add(this.glow);

    // Bounding box for collision
    this.boundingBox = new THREE.Box3();
  }

  update(dt, gameSpeed) {
    // Move projectile forward (positive Z direction)
    this.mesh.position.z += this.speed * dt;

    // Update bounding box
    this.boundingBox.setFromObject(this.mesh);
  }

  dispose() {
    this.scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.glow.geometry.dispose();
    this.glow.material.dispose();
  }
}
