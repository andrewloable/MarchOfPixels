import * as THREE from 'three';

export class Enemy {
  constructor(scene, x, z, value) {
    this.scene = scene;
    this.value = value;
    this.health = value;
    this.speed = 0; // Enemies don't move, world moves toward player

    // Create enemy group
    this.mesh = new THREE.Group();
    this.mesh.position.set(x, 0, z);

    // Body (red soldier)
    const bodyGeometry = new THREE.BoxGeometry(0.6, 1.2, 0.4);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xc0392b }); // Red
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.8;
    this.mesh.add(body);

    // Head
    const headGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xf5cba7 }); // Skin tone
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.6;
    this.mesh.add(head);

    // Helmet (red)
    const helmetGeometry = new THREE.BoxGeometry(0.5, 0.25, 0.5);
    const helmetMaterial = new THREE.MeshStandardMaterial({ color: 0xe74c3c }); // Bright red
    const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
    helmet.position.y = 1.9;
    this.mesh.add(helmet);

    // Legs
    const legGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.3);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 }); // Brown pants

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.15, 0.3, 0);
    this.mesh.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.15, 0.3, 0);
    this.mesh.add(rightLeg);

    scene.add(this.mesh);

    // Bounding box for collision
    this.boundingBox = new THREE.Box3();
    this.updateBoundingBox();
  }

  update(dt, gameSpeed) {
    // Move enemy toward player (negative Z direction as world scrolls)
    this.mesh.position.z -= gameSpeed * dt;

    // Simple march animation (bob up and down)
    this.mesh.position.y = Math.abs(Math.sin(Date.now() * 0.01)) * 0.1;

    this.updateBoundingBox();
  }

  updateBoundingBox() {
    this.boundingBox.setFromObject(this.mesh);
  }

  takeDamage(amount) {
    this.health -= amount;
    return this.health <= 0;
  }

  dispose() {
    this.scene.remove(this.mesh);
    this.mesh.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
  }
}
