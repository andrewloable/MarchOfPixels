import * as THREE from 'three';

export class Crate {
  constructor(scene, x, z, weaponType) {
    this.scene = scene;
    this.health = 1; // One hit to destroy

    // Weapon types: positive = faster fire rate, negative = slower
    // Range: -0.3 to +0.5 fire rate multiplier
    this.weaponTypes = [
      { name: 'Rapid Fire', modifier: 0.5, color: 0x00ff00 },    // +50% faster
      { name: 'Quick Shot', modifier: 0.3, color: 0x7fff00 },    // +30% faster
      { name: 'Boost', modifier: 0.2, color: 0xffff00 },         // +20% faster
      { name: 'Standard', modifier: 0.1, color: 0xffa500 },      // +10% faster
      { name: 'Heavy', modifier: -0.1, color: 0xff8c00 },        // -10% slower
      { name: 'Sluggish', modifier: -0.2, color: 0xff4500 },     // -20% slower
      { name: 'Slow', modifier: -0.3, color: 0xff0000 }          // -30% slower
    ];

    // Select weapon type (weighted towards positive)
    const rand = Math.random();
    let typeIndex;
    if (rand < 0.15) typeIndex = 0;       // 15% Rapid Fire
    else if (rand < 0.35) typeIndex = 1;  // 20% Quick Shot
    else if (rand < 0.55) typeIndex = 2;  // 20% Boost
    else if (rand < 0.70) typeIndex = 3;  // 15% Standard
    else if (rand < 0.82) typeIndex = 4;  // 12% Heavy
    else if (rand < 0.92) typeIndex = 5;  // 10% Sluggish
    else typeIndex = 6;                    // 8% Slow

    this.weapon = this.weaponTypes[typeIndex];
    this.fireRateModifier = this.weapon.modifier;

    // Create crate group
    this.mesh = new THREE.Group();
    this.mesh.position.set(x, 0, z);

    // Weapon crate body (military style)
    const crateSize = 1.2;
    const crateGeometry = new THREE.BoxGeometry(crateSize, crateSize * 0.8, crateSize);

    // Metal material based on weapon quality
    const crateMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a5568,
      roughness: 0.7,
      metalness: 0.3
    });

    const crate = new THREE.Mesh(crateGeometry, crateMaterial);
    crate.position.y = crateSize * 0.4;
    crate.castShadow = true;
    this.mesh.add(crate);

    // Colored stripe based on weapon type
    const stripeGeometry = new THREE.BoxGeometry(crateSize + 0.02, 0.15, crateSize + 0.02);
    const stripeMaterial = new THREE.MeshStandardMaterial({
      color: this.weapon.color,
      emissive: this.weapon.color,
      emissiveIntensity: 0.3
    });
    const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
    stripe.position.y = crateSize * 0.4;
    this.mesh.add(stripe);

    // Gun icon on top
    const gunGroup = new THREE.Group();
    gunGroup.position.y = crateSize + 0.3;

    // Gun body
    const gunBodyGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.5);
    const gunMaterial = new THREE.MeshStandardMaterial({
      color: this.weapon.color,
      metalness: 0.8,
      roughness: 0.2,
      emissive: this.weapon.color,
      emissiveIntensity: 0.4
    });
    const gunBody = new THREE.Mesh(gunBodyGeometry, gunMaterial);
    gunGroup.add(gunBody);

    // Gun barrel
    const barrelGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8);
    barrelGeometry.rotateX(Math.PI / 2);
    const barrel = new THREE.Mesh(barrelGeometry, gunMaterial);
    barrel.position.z = 0.35;
    gunGroup.add(barrel);

    // Gun handle
    const handleGeometry = new THREE.BoxGeometry(0.08, 0.2, 0.1);
    const handle = new THREE.Mesh(handleGeometry, gunMaterial);
    handle.position.set(0, -0.12, -0.1);
    handle.rotation.x = 0.3;
    gunGroup.add(handle);

    this.gunMesh = gunGroup;
    this.mesh.add(gunGroup);

    // Modifier text
    this.modifierSprite = this.createModifierSprite();
    this.modifierSprite.position.set(0, crateSize + 0.8, 0);
    this.mesh.add(this.modifierSprite);

    scene.add(this.mesh);

    // Animation
    this.animTime = Math.random() * Math.PI * 2;

    // Bounding box for collision
    this.boundingBox = new THREE.Box3();
    this.updateBoundingBox();
  }

  createModifierSprite() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Determine text and color
    const isPositive = this.fireRateModifier >= 0;
    const percentage = Math.round(this.fireRateModifier * 100);
    const sign = isPositive ? '+' : '';
    const text = `${sign}${percentage}%`;

    ctx.fillStyle = isPositive ? '#00ff00' : '#ff4444';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.strokeText(text, canvas.width / 2, canvas.height / 2);
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(1.5, 0.6, 1);

    return sprite;
  }

  update(dt, gameSpeed) {
    // Move toward player
    this.mesh.position.z -= gameSpeed * dt;

    // Animate gun rotation and bob
    this.animTime += dt * 3;
    if (this.gunMesh) {
      this.gunMesh.rotation.y += dt * 2;
      this.gunMesh.position.y = 1.5 + Math.sin(this.animTime) * 0.1;
    }
    if (this.modifierSprite) {
      this.modifierSprite.position.y = 2.0 + Math.sin(this.animTime) * 0.1;
    }

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
      if (child.material) {
        if (child.material.map) child.material.map.dispose();
        child.material.dispose();
      }
    });
  }
}
