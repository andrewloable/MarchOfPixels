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

    // Create player group for cartoon character
    this.mesh = new THREE.Group();
    this.mesh.position.set(0, 0, 0);

    // Colors - bright cyan/teal for friendly player
    const bodyColor = 0x00cec9;
    const helmetColor = 0x0984e3;
    const skinColor = 0xffeaa7;
    const bootColor = 0x2d3436;

    // Helmet (rounded top)
    const helmetGeometry = new THREE.SphereGeometry(0.45, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const helmetMaterial = new THREE.MeshStandardMaterial({ color: helmetColor });
    const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
    helmet.position.y = 2.3;
    this.mesh.add(helmet);

    // Head (sphere)
    const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ color: skinColor });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.0;
    this.mesh.add(head);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x2d3436 });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.15, 2.05, 0.35);
    this.mesh.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.15, 2.05, 0.35);
    this.mesh.add(rightEye);

    // Body (rounded cylinder)
    const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.4, 1.2, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: bodyColor });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.2;
    this.mesh.add(body);

    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.8, 8);
    const armMaterial = new THREE.MeshStandardMaterial({ color: bodyColor });

    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.65, 1.3, 0);
    leftArm.rotation.z = 0.3;
    this.mesh.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.65, 1.3, 0);
    rightArm.rotation.z = -0.3;
    this.mesh.add(rightArm);

    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.6, 8);
    const legMaterial = new THREE.MeshStandardMaterial({ color: bodyColor });

    this.leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    this.leftLeg.position.set(-0.2, 0.35, 0);
    this.mesh.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    this.rightLeg.position.set(0.2, 0.35, 0);
    this.mesh.add(this.rightLeg);

    // Boots
    const bootGeometry = new THREE.BoxGeometry(0.25, 0.15, 0.35);
    const bootMaterial = new THREE.MeshStandardMaterial({ color: bootColor });

    const leftBoot = new THREE.Mesh(bootGeometry, bootMaterial);
    leftBoot.position.set(-0.2, 0.08, 0.05);
    this.mesh.add(leftBoot);

    const rightBoot = new THREE.Mesh(bootGeometry, bootMaterial);
    rightBoot.position.set(0.2, 0.08, 0.05);
    this.mesh.add(rightBoot);

    // Gun (held in front)
    const gunBody = new THREE.BoxGeometry(0.15, 0.15, 0.6);
    const gunMaterial = new THREE.MeshStandardMaterial({ color: 0x636e72 });
    const gun = new THREE.Mesh(gunBody, gunMaterial);
    gun.position.set(0, 1.2, 0.5);
    this.mesh.add(gun);

    // Gun barrel
    const barrelGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8);
    const barrel = new THREE.Mesh(barrelGeometry, gunMaterial);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 1.2, 0.9);
    this.mesh.add(barrel);

    scene.add(this.mesh);

    // Animation time
    this.animTime = 0;

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

    // Walking animation - legs swing
    this.animTime += dt * 8;
    const legSwing = Math.sin(this.animTime) * 0.3;
    if (this.leftLeg && this.rightLeg) {
      this.leftLeg.rotation.x = legSwing;
      this.rightLeg.rotation.x = -legSwing;
    }

    // Subtle body bob
    this.mesh.position.y = Math.abs(Math.sin(this.animTime)) * 0.05;

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
    this.mesh.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });

    for (const projectile of this.projectiles) {
      this.scene.remove(projectile.mesh);
      projectile.dispose();
    }
    this.projectiles = [];
  }
}
