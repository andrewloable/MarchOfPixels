import * as THREE from 'three';

export class Effects {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
  }

  // Create death explosion effect
  createDeathEffect(position, color = 0xff0000, count = 8) {
    for (let i = 0; i < count; i++) {
      const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
      const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 1
      });
      const particle = new THREE.Mesh(geometry, material);

      particle.position.copy(position);
      particle.position.y += Math.random() * 1;

      // Random velocity
      particle.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        Math.random() * 6 + 2,
        (Math.random() - 0.5) * 8
      );
      particle.userData.rotationSpeed = new THREE.Vector3(
        Math.random() * 10,
        Math.random() * 10,
        Math.random() * 10
      );
      particle.userData.life = 1.0;
      particle.userData.decay = 1.5 + Math.random() * 0.5;

      this.scene.add(particle);
      this.particles.push(particle);
    }
  }

  // Create soldier death effect (blue particles)
  createSoldierDeathEffect(position) {
    this.createDeathEffect(position, 0x00cec9, 6);
  }

  // Create enemy death effect (red particles)
  createEnemyDeathEffect(position) {
    this.createDeathEffect(position, 0xe74c3c, 8);
  }

  // Create hit spark effect
  createHitEffect(position) {
    for (let i = 0; i < 4; i++) {
      const geometry = new THREE.SphereGeometry(0.1, 4, 4);
      const material = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 1
      });
      const particle = new THREE.Mesh(geometry, material);

      particle.position.copy(position);

      particle.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        Math.random() * 2,
        (Math.random() - 0.5) * 4
      );
      particle.userData.life = 1.0;
      particle.userData.decay = 4; // Fast decay

      this.scene.add(particle);
      this.particles.push(particle);
    }
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      // Apply velocity
      particle.position.x += particle.userData.velocity.x * dt;
      particle.position.y += particle.userData.velocity.y * dt;
      particle.position.z += particle.userData.velocity.z * dt;

      // Apply gravity
      particle.userData.velocity.y -= 15 * dt;

      // Rotate
      if (particle.userData.rotationSpeed) {
        particle.rotation.x += particle.userData.rotationSpeed.x * dt;
        particle.rotation.y += particle.userData.rotationSpeed.y * dt;
        particle.rotation.z += particle.userData.rotationSpeed.z * dt;
      }

      // Decay life
      particle.userData.life -= particle.userData.decay * dt;

      // Update opacity
      particle.material.opacity = Math.max(0, particle.userData.life);

      // Scale down as it dies
      const scale = Math.max(0.1, particle.userData.life);
      particle.scale.setScalar(scale);

      // Remove dead particles
      if (particle.userData.life <= 0) {
        this.scene.remove(particle);
        particle.geometry.dispose();
        particle.material.dispose();
        this.particles.splice(i, 1);
      }
    }
  }

  clear() {
    for (const particle of this.particles) {
      this.scene.remove(particle);
      particle.geometry.dispose();
      particle.material.dispose();
    }
    this.particles = [];
  }
}
