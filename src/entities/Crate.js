import * as THREE from 'three';

export class Crate {
  constructor(scene, x, z, coinValue) {
    this.scene = scene;
    this.coinValue = coinValue;
    this.health = 3; // Takes 3 hits to destroy

    // Create crate group
    this.mesh = new THREE.Group();
    this.mesh.position.set(x, 0, z);

    // Wooden crate body
    const crateSize = 1.2;
    const crateGeometry = new THREE.BoxGeometry(crateSize, crateSize, crateSize);

    // Wood material
    const woodMaterial = new THREE.MeshStandardMaterial({
      color: 0xcd853f, // Peru/wood color
      roughness: 0.9
    });

    const crate = new THREE.Mesh(crateGeometry, woodMaterial);
    crate.position.y = crateSize / 2;
    crate.castShadow = true;
    this.mesh.add(crate);

    // Wood plank edges (darker strips)
    const plankMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });

    // Corner strips
    const stripGeometry = new THREE.BoxGeometry(0.08, crateSize + 0.02, 0.08);
    const corners = [
      { x: -crateSize/2, z: -crateSize/2 },
      { x: crateSize/2, z: -crateSize/2 },
      { x: -crateSize/2, z: crateSize/2 },
      { x: crateSize/2, z: crateSize/2 }
    ];

    for (const pos of corners) {
      const strip = new THREE.Mesh(stripGeometry, plankMaterial);
      strip.position.set(pos.x, crateSize / 2, pos.z);
      this.mesh.add(strip);
    }

    // Top cross strips
    const crossGeometry = new THREE.BoxGeometry(crateSize + 0.02, 0.08, 0.1);
    const cross1 = new THREE.Mesh(crossGeometry, plankMaterial);
    cross1.position.set(0, crateSize + 0.04, 0);
    this.mesh.add(cross1);

    const cross2 = new THREE.Mesh(crossGeometry, plankMaterial);
    cross2.position.set(0, crateSize + 0.04, 0);
    cross2.rotation.y = Math.PI / 2;
    this.mesh.add(cross2);

    // Coin icon floating above
    const coinGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.08, 16);
    const coinMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0xffd700,
      emissiveIntensity: 0.3
    });
    const coin = new THREE.Mesh(coinGeometry, coinMaterial);
    coin.rotation.x = Math.PI / 2;
    coin.position.y = crateSize + 0.7;
    this.coinMesh = coin;
    this.mesh.add(coin);

    // Coin value text
    this.valueSprite = this.createValueSprite(coinValue);
    this.valueSprite.position.set(0.4, crateSize + 0.7, 0);
    this.mesh.add(this.valueSprite);

    scene.add(this.mesh);

    // Animation
    this.animTime = Math.random() * Math.PI * 2;

    // Bounding box for collision
    this.boundingBox = new THREE.Box3();
    this.updateBoundingBox();
  }

  createValueSprite(value) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffd700';
    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = 2;
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const text = `+${value}`;
    ctx.strokeText(text, canvas.width / 2, canvas.height / 2);
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(0.8, 0.4, 1);

    return sprite;
  }

  update(dt, gameSpeed) {
    // Move toward player
    this.mesh.position.z -= gameSpeed * dt;

    // Animate coin rotation and bob
    this.animTime += dt * 3;
    if (this.coinMesh) {
      this.coinMesh.rotation.z += dt * 2;
      this.coinMesh.position.y = 1.9 + Math.sin(this.animTime) * 0.1;
    }
    if (this.valueSprite) {
      this.valueSprite.position.y = 1.9 + Math.sin(this.animTime) * 0.1;
    }

    this.updateBoundingBox();
  }

  updateBoundingBox() {
    this.boundingBox.setFromObject(this.mesh);
  }

  takeDamage(amount) {
    this.health -= amount;

    // Visual feedback - shake
    this.mesh.position.x += (Math.random() - 0.5) * 0.1;

    return this.health <= 0;
  }

  dispose() {
    this.scene.remove(this.mesh);
    this.mesh.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (child.material.map) child.material.map.dispose();
        child.material.dispose();
      }
    });
  }
}
