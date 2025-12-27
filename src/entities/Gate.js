import * as THREE from 'three';

export class Gate {
  constructor(scene, x, z, value) {
    this.scene = scene;
    this.value = value;

    // Create gate group
    this.mesh = new THREE.Group();
    this.mesh.position.set(x, 0, z);

    // Gate frame (arch shape)
    const pillarGeometry = new THREE.BoxGeometry(0.5, 4, 0.5);
    const pillarMaterial = new THREE.MeshStandardMaterial({ color: 0x7f8c8d }); // Gray stone

    // Left pillar
    const leftPillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
    leftPillar.position.set(-2, 2, 0);
    this.mesh.add(leftPillar);

    // Right pillar
    const rightPillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
    rightPillar.position.set(2, 2, 0);
    this.mesh.add(rightPillar);

    // Top beam
    const beamGeometry = new THREE.BoxGeometry(4.5, 0.5, 0.5);
    const beam = new THREE.Mesh(beamGeometry, pillarMaterial);
    beam.position.set(0, 4, 0);
    this.mesh.add(beam);

    // Gate fill (green glowing portal)
    const fillGeometry = new THREE.PlaneGeometry(3.5, 3.5);
    const fillMaterial = new THREE.MeshBasicMaterial({
      color: 0x2ecc71, // Green
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });
    const fill = new THREE.Mesh(fillGeometry, fillMaterial);
    fill.position.set(0, 2, 0);
    this.mesh.add(fill);

    // Create floating number text using canvas
    this.numberSprite = this.createNumberSprite(value);
    this.numberSprite.position.set(0, 2, 0.1);
    this.mesh.add(this.numberSprite);

    scene.add(this.mesh);

    // Bounding box for collision
    this.boundingBox = new THREE.Box3();
    this.updateBoundingBox();
  }

  createNumberSprite(value) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw text
    ctx.fillStyle = '#2ecc71'; // Green
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const text = value >= 0 ? `+${value}` : `${value}`;
    ctx.strokeText(text, canvas.width / 2, canvas.height / 2);
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    // Create sprite
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(3, 1.5, 1);

    return sprite;
  }

  update(dt, gameSpeed) {
    // Move gate toward player (negative Z direction)
    this.mesh.position.z -= gameSpeed * dt;
    this.updateBoundingBox();
  }

  updateBoundingBox() {
    this.boundingBox.setFromObject(this.mesh);
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
