import * as THREE from 'three';

export class Barrel {
  constructor(scene, x, z, value) {
    this.scene = scene;
    this.value = value;
    this.health = value;

    // Create barrel group
    this.mesh = new THREE.Group();
    this.mesh.position.set(x, 0, z);

    // Barrel body (cylinder)
    const bodyGeometry = new THREE.CylinderGeometry(0.6, 0.6, 1.5, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 }); // Brown wood
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.75;
    this.mesh.add(body);

    // Metal bands
    const bandGeometry = new THREE.TorusGeometry(0.62, 0.05, 8, 32);
    const bandMaterial = new THREE.MeshStandardMaterial({ color: 0x7f8c8d }); // Gray metal

    const topBand = new THREE.Mesh(bandGeometry, bandMaterial);
    topBand.rotation.x = Math.PI / 2;
    topBand.position.y = 1.3;
    this.mesh.add(topBand);

    const middleBand = new THREE.Mesh(bandGeometry, bandMaterial);
    middleBand.rotation.x = Math.PI / 2;
    middleBand.position.y = 0.75;
    this.mesh.add(middleBand);

    const bottomBand = new THREE.Mesh(bandGeometry, bandMaterial);
    bottomBand.rotation.x = Math.PI / 2;
    bottomBand.position.y = 0.2;
    this.mesh.add(bottomBand);

    // Create floating number text
    this.numberSprite = this.createNumberSprite(value);
    this.numberSprite.position.set(0, 2.2, 0);
    this.mesh.add(this.numberSprite);

    scene.add(this.mesh);

    // Bounding box for collision
    this.boundingBox = new THREE.Box3();
    this.updateBoundingBox();
  }

  createNumberSprite(value) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw text
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const text = `${value}`;
    ctx.strokeText(text, canvas.width / 2, canvas.height / 2);
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    // Create sprite
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(1.5, 0.75, 1);

    return sprite;
  }

  update(dt, gameSpeed) {
    // Move barrel toward player
    this.mesh.position.z -= gameSpeed * dt;
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
