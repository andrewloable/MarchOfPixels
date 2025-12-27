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

    // Randomly add bonus decoration (30% chance)
    if (Math.random() < 0.3) {
      this.addBonusDecoration();
    }

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

  addBonusDecoration() {
    const decorationType = Math.floor(Math.random() * 4);

    switch (decorationType) {
      case 0:
        this.addTire();
        break;
      case 1:
        this.addMotorcycle();
        break;
      case 2:
        this.addCar();
        break;
      case 3:
        this.addToolbox();
        break;
    }
  }

  addTire() {
    // Rubber tire on top of barrel
    const tireGeometry = new THREE.TorusGeometry(0.35, 0.12, 8, 16);
    const tireMaterial = new THREE.MeshStandardMaterial({ color: 0x2d3436 });
    const tire = new THREE.Mesh(tireGeometry, tireMaterial);
    tire.rotation.x = Math.PI / 2;
    tire.position.y = 1.65;
    this.mesh.add(tire);

    // Hubcap
    const hubGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.08, 8);
    const hubMaterial = new THREE.MeshStandardMaterial({ color: 0xbdc3c7 });
    const hub = new THREE.Mesh(hubGeometry, hubMaterial);
    hub.position.y = 1.65;
    this.mesh.add(hub);
  }

  addMotorcycle() {
    const group = new THREE.Group();
    group.position.y = 1.5;
    group.rotation.y = Math.random() * Math.PI;

    // Body (simplified)
    const bodyGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xe74c3c });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.25;
    group.add(body);

    // Front wheel
    const wheelGeometry = new THREE.TorusGeometry(0.15, 0.04, 8, 12);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x2d3436 });
    const frontWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    frontWheel.position.set(0, 0.1, 0.35);
    group.add(frontWheel);

    // Rear wheel
    const rearWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    rearWheel.position.set(0, 0.1, -0.35);
    group.add(rearWheel);

    // Handlebars
    const handleGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.4, 6);
    const handleMaterial = new THREE.MeshStandardMaterial({ color: 0x7f8c8d });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.rotation.z = Math.PI / 2;
    handle.position.set(0, 0.45, 0.25);
    group.add(handle);

    this.mesh.add(group);
  }

  addCar() {
    const group = new THREE.Group();
    group.position.y = 1.5;
    group.rotation.y = Math.random() * Math.PI;
    group.scale.set(0.6, 0.6, 0.6);

    // Body
    const bodyGeometry = new THREE.BoxGeometry(0.8, 0.3, 1.2);
    const colors = [0x3498db, 0xe74c3c, 0xf39c12, 0x2ecc71, 0x9b59b6];
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: colors[Math.floor(Math.random() * colors.length)]
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.2;
    group.add(body);

    // Roof
    const roofGeometry = new THREE.BoxGeometry(0.6, 0.25, 0.6);
    const roof = new THREE.Mesh(roofGeometry, bodyMaterial);
    roof.position.set(0, 0.45, -0.1);
    group.add(roof);

    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 8);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x2d3436 });

    const positions = [
      { x: 0.4, z: 0.4 },
      { x: -0.4, z: 0.4 },
      { x: 0.4, z: -0.4 },
      { x: -0.4, z: -0.4 }
    ];

    for (const pos of positions) {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(pos.x, 0.08, pos.z);
      group.add(wheel);
    }

    this.mesh.add(group);
  }

  addToolbox() {
    const group = new THREE.Group();
    group.position.y = 1.55;
    group.rotation.y = Math.random() * Math.PI;

    // Main box
    const boxGeometry = new THREE.BoxGeometry(0.5, 0.25, 0.3);
    const boxMaterial = new THREE.MeshStandardMaterial({ color: 0xe74c3c });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    group.add(box);

    // Handle
    const handleGeometry = new THREE.BoxGeometry(0.3, 0.05, 0.05);
    const handleMaterial = new THREE.MeshStandardMaterial({ color: 0x2d3436 });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.y = 0.15;
    group.add(handle);

    // Metal clasp
    const claspGeometry = new THREE.BoxGeometry(0.08, 0.12, 0.32);
    const claspMaterial = new THREE.MeshStandardMaterial({ color: 0xbdc3c7 });
    const clasp = new THREE.Mesh(claspGeometry, claspMaterial);
    clasp.position.set(0, 0.02, 0);
    group.add(clasp);

    this.mesh.add(group);
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
