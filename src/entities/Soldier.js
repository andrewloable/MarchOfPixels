import * as THREE from 'three';

export class Soldier {
  constructor(scene, offsetX, offsetZ, index) {
    this.scene = scene;
    this.offsetX = offsetX;
    this.offsetZ = offsetZ;
    this.index = index;
    this.targetOffsetX = offsetX;
    this.targetOffsetZ = offsetZ;

    // Create soldier mesh (smaller cartoon character)
    this.mesh = new THREE.Group();
    this.mesh.scale.set(0.6, 0.6, 0.6); // Smaller than main player

    // Colors - bright cyan/teal for friendly soldiers
    const bodyColor = 0x00cec9;
    const helmetColor = 0x0984e3;
    const skinColor = 0xffeaa7;
    const bootColor = 0x2d3436;

    // Helmet (rounded top)
    const helmetGeometry = new THREE.SphereGeometry(0.45, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const helmetMaterial = new THREE.MeshStandardMaterial({ color: helmetColor });
    const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
    helmet.position.y = 2.3;
    this.mesh.add(helmet);

    // Head (sphere)
    const headGeometry = new THREE.SphereGeometry(0.4, 12, 12);
    const headMaterial = new THREE.MeshStandardMaterial({ color: skinColor });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.0;
    this.mesh.add(head);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.08, 6, 6);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x2d3436 });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.15, 2.05, 0.35);
    this.mesh.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.15, 2.05, 0.35);
    this.mesh.add(rightEye);

    // Body (rounded cylinder)
    const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.4, 1.2, 12);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: bodyColor });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.2;
    this.mesh.add(body);

    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.8, 6);
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
    const legGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.6, 6);
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
    const barrelGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 6);
    const barrel = new THREE.Mesh(barrelGeometry, gunMaterial);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 1.2, 0.9);
    this.mesh.add(barrel);

    scene.add(this.mesh);

    // Animation
    this.animTime = Math.random() * Math.PI * 2; // Random start phase
  }

  update(dt, baseX, baseY, baseZ) {
    // Smoothly move to target offset position
    const lerpSpeed = 8 * dt;
    this.offsetX += (this.targetOffsetX - this.offsetX) * lerpSpeed;
    this.offsetZ += (this.targetOffsetZ - this.offsetZ) * lerpSpeed;

    // Position relative to player base position
    this.mesh.position.set(
      baseX + this.offsetX,
      baseY,
      baseZ + this.offsetZ
    );

    // Walking animation - legs swing
    this.animTime += dt * 8;
    const legSwing = Math.sin(this.animTime) * 0.3;
    if (this.leftLeg && this.rightLeg) {
      this.leftLeg.rotation.x = legSwing;
      this.rightLeg.rotation.x = -legSwing;
    }

    // Subtle body bob
    this.mesh.position.y = baseY + Math.abs(Math.sin(this.animTime)) * 0.03;
  }

  getWorldPosition() {
    return this.mesh.position.clone();
  }

  setTargetOffset(x, z) {
    this.targetOffsetX = x;
    this.targetOffsetZ = z;
  }

  dispose() {
    this.scene.remove(this.mesh);
    this.mesh.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
  }
}
