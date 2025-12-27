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

    // Randomly add bonus decoration (40% chance)
    if (Math.random() < 0.4) {
      this.addBonusDecoration(crateSize);
    }

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

  addBonusDecoration(crateSize) {
    const decorationType = Math.floor(Math.random() * 4);

    switch (decorationType) {
      case 0:
        this.addGem(crateSize);
        break;
      case 1:
        this.addRibbon(crateSize);
        break;
      case 2:
        this.addChains(crateSize);
        break;
      case 3:
        this.addPadlock(crateSize);
        break;
    }
  }

  addGem(crateSize) {
    // Small gem on the side
    const gemGeometry = new THREE.OctahedronGeometry(0.15, 0);
    const gemColors = [0xff1744, 0x00e676, 0x2979ff, 0xffea00];
    const gemMaterial = new THREE.MeshStandardMaterial({
      color: gemColors[Math.floor(Math.random() * gemColors.length)],
      metalness: 0.5,
      roughness: 0.1,
      emissive: gemColors[Math.floor(Math.random() * gemColors.length)],
      emissiveIntensity: 0.3
    });
    const gem = new THREE.Mesh(gemGeometry, gemMaterial);
    gem.position.set(0, crateSize / 2, crateSize / 2 + 0.1);
    gem.rotation.x = Math.PI / 4;
    this.mesh.add(gem);
  }

  addRibbon(crateSize) {
    const ribbonMaterial = new THREE.MeshStandardMaterial({ color: 0xe74c3c });

    // Horizontal ribbon
    const hRibbon = new THREE.Mesh(
      new THREE.BoxGeometry(crateSize + 0.1, 0.15, 0.05),
      ribbonMaterial
    );
    hRibbon.position.set(0, crateSize / 2, crateSize / 2 + 0.03);
    this.mesh.add(hRibbon);

    // Vertical ribbon
    const vRibbon = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, crateSize + 0.1, 0.05),
      ribbonMaterial
    );
    vRibbon.position.set(0, crateSize / 2, crateSize / 2 + 0.03);
    this.mesh.add(vRibbon);

    // Bow
    const bowGeometry = new THREE.TorusGeometry(0.12, 0.04, 8, 12);
    const bow1 = new THREE.Mesh(bowGeometry, ribbonMaterial);
    bow1.position.set(-0.15, crateSize + 0.1, crateSize / 2 + 0.05);
    bow1.rotation.y = Math.PI / 4;
    this.mesh.add(bow1);

    const bow2 = new THREE.Mesh(bowGeometry, ribbonMaterial);
    bow2.position.set(0.15, crateSize + 0.1, crateSize / 2 + 0.05);
    bow2.rotation.y = -Math.PI / 4;
    this.mesh.add(bow2);
  }

  addChains(crateSize) {
    const chainMaterial = new THREE.MeshStandardMaterial({
      color: 0x7f8c8d,
      metalness: 0.8,
      roughness: 0.3
    });

    // Chain links across front
    const linkGeometry = new THREE.TorusGeometry(0.08, 0.02, 8, 12);
    for (let i = -2; i <= 2; i++) {
      const link = new THREE.Mesh(linkGeometry, chainMaterial);
      link.position.set(i * 0.2, crateSize / 2, crateSize / 2 + 0.05);
      link.rotation.y = i % 2 === 0 ? 0 : Math.PI / 2;
      this.mesh.add(link);
    }
  }

  addPadlock(crateSize) {
    const group = new THREE.Group();
    group.position.set(0, crateSize / 2, crateSize / 2 + 0.1);

    // Lock body
    const bodyGeometry = new THREE.BoxGeometry(0.2, 0.25, 0.1);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xf39c12,
      metalness: 0.7,
      roughness: 0.3
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    group.add(body);

    // Lock shackle
    const shackleGeometry = new THREE.TorusGeometry(0.08, 0.02, 8, 12, Math.PI);
    const shackleMaterial = new THREE.MeshStandardMaterial({
      color: 0x7f8c8d,
      metalness: 0.9,
      roughness: 0.2
    });
    const shackle = new THREE.Mesh(shackleGeometry, shackleMaterial);
    shackle.position.y = 0.12;
    shackle.rotation.z = Math.PI;
    group.add(shackle);

    // Keyhole
    const keyholeGeometry = new THREE.CircleGeometry(0.03, 8);
    const keyholeMaterial = new THREE.MeshBasicMaterial({ color: 0x2d3436 });
    const keyhole = new THREE.Mesh(keyholeGeometry, keyholeMaterial);
    keyhole.position.z = 0.051;
    group.add(keyhole);

    this.mesh.add(group);
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
