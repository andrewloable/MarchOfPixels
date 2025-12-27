import * as THREE from 'three';

export class Scene {
  constructor(container) {
    this.container = container;

    // Create scene with bright sky blue background
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb); // Sky blue
    this.scene.fog = new THREE.Fog(0x87ceeb, 40, 100);

    // Create camera (behind and above player, looking forward)
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      150
    );
    this.camera.position.set(0, 10, -12);
    this.camera.lookAt(0, 0, 25);

    // Create renderer with shadows
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.insertBefore(this.renderer.domElement, container.firstChild);

    // Add lights
    this.setupLights();

    // Create ground
    this.createGround();

    // Create lane markers
    this.createLaneMarkers();

    // Create decorative elements
    this.createDecorations();

    // Store entities for cleanup
    this.entities = [];
  }

  setupLights() {
    // Bright ambient light for cartoon look
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambient);

    // Warm directional light (sun)
    const directional = new THREE.DirectionalLight(0xfffaf0, 1.0);
    directional.position.set(10, 20, 10);
    directional.castShadow = true;
    directional.shadow.mapSize.width = 2048;
    directional.shadow.mapSize.height = 2048;
    directional.shadow.camera.near = 1;
    directional.shadow.camera.far = 100;
    directional.shadow.camera.left = -30;
    directional.shadow.camera.right = 30;
    directional.shadow.camera.top = 30;
    directional.shadow.camera.bottom = -30;
    this.scene.add(directional);

    // Fill light from the side
    const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.3);
    fillLight.position.set(-10, 5, 0);
    this.scene.add(fillLight);

    // Hemisphere light for natural sky/ground coloring
    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x55aa55, 0.4);
    this.scene.add(hemiLight);
  }

  createGround() {
    // Grass sides
    const grassGeometry = new THREE.PlaneGeometry(50, 200);
    const grassMaterial = new THREE.MeshStandardMaterial({
      color: 0x55aa55, // Bright green
      roughness: 0.9
    });

    const leftGrass = new THREE.Mesh(grassGeometry, grassMaterial);
    leftGrass.rotation.x = -Math.PI / 2;
    leftGrass.position.set(-30, -0.1, 80);
    leftGrass.receiveShadow = true;
    this.scene.add(leftGrass);

    const rightGrass = new THREE.Mesh(grassGeometry, grassMaterial);
    rightGrass.rotation.x = -Math.PI / 2;
    rightGrass.position.set(30, -0.1, 80);
    rightGrass.receiveShadow = true;
    this.scene.add(rightGrass);

    // Main path (dirt/sand color)
    const pathGeometry = new THREE.PlaneGeometry(16, 200);
    const pathMaterial = new THREE.MeshStandardMaterial({
      color: 0xdeb887, // Burlywood/sand
      roughness: 0.8
    });
    this.ground = new THREE.Mesh(pathGeometry, pathMaterial);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.position.z = 80;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);

    // Path borders (darker brown)
    const borderGeometry = new THREE.BoxGeometry(0.5, 0.2, 200);
    const borderMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });

    const leftBorder = new THREE.Mesh(borderGeometry, borderMaterial);
    leftBorder.position.set(-8, 0.1, 80);
    this.scene.add(leftBorder);

    const rightBorder = new THREE.Mesh(borderGeometry, borderMaterial);
    rightBorder.position.set(8, 0.1, 80);
    this.scene.add(rightBorder);
  }

  createLaneMarkers() {
    // Lane divider dashed lines
    const lineMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

    // Create dashed lane markers
    for (let x = -2.25; x <= 2.25; x += 4.5) {
      for (let z = 0; z < 200; z += 4) {
        const dashGeometry = new THREE.PlaneGeometry(0.15, 1.5);
        const dash = new THREE.Mesh(dashGeometry, lineMaterial);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(x, 0.02, z);
        this.scene.add(dash);
      }
    }
  }

  createDecorations() {
    // Add decorative trees on the sides
    const treePositions = [
      { x: -15, z: 20 }, { x: 15, z: 20 },
      { x: -18, z: 40 }, { x: 18, z: 40 },
      { x: -14, z: 60 }, { x: 14, z: 60 },
      { x: -17, z: 80 }, { x: 17, z: 80 },
      { x: -15, z: 100 }, { x: 15, z: 100 }
    ];

    for (const pos of treePositions) {
      this.createTree(pos.x, pos.z);
    }

    // Add clouds
    this.createClouds();
  }

  createTree(x, z) {
    const tree = new THREE.Group();

    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 2, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1;
    trunk.castShadow = true;
    tree.add(trunk);

    // Foliage (stacked spheres for cartoon look)
    const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });

    const foliage1 = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 8), foliageMaterial);
    foliage1.position.y = 3;
    foliage1.castShadow = true;
    tree.add(foliage1);

    const foliage2 = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 8), foliageMaterial);
    foliage2.position.y = 4.2;
    foliage2.castShadow = true;
    tree.add(foliage2);

    const foliage3 = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 8), foliageMaterial);
    foliage3.position.y = 5;
    foliage3.castShadow = true;
    tree.add(foliage3);

    tree.position.set(x, 0, z);
    // Slight random rotation for variety
    tree.rotation.y = Math.random() * Math.PI * 2;
    this.scene.add(tree);
  }

  createClouds() {
    const cloudMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9
    });

    const cloudPositions = [
      { x: -20, y: 25, z: 50 },
      { x: 25, y: 28, z: 30 },
      { x: -10, y: 30, z: 80 },
      { x: 15, y: 26, z: 100 }
    ];

    for (const pos of cloudPositions) {
      const cloud = new THREE.Group();

      // Create puffy cloud from spheres
      const sizes = [2, 1.5, 1.8, 1.3, 1.6];
      const offsets = [
        { x: 0, y: 0, z: 0 },
        { x: 1.5, y: 0.3, z: 0 },
        { x: -1.3, y: 0.2, z: 0.3 },
        { x: 0.8, y: -0.2, z: 0.5 },
        { x: -0.5, y: 0.4, z: -0.3 }
      ];

      for (let i = 0; i < sizes.length; i++) {
        const puff = new THREE.Mesh(
          new THREE.SphereGeometry(sizes[i], 8, 8),
          cloudMaterial
        );
        puff.position.set(offsets[i].x, offsets[i].y, offsets[i].z);
        cloud.add(puff);
      }

      cloud.position.set(pos.x, pos.y, pos.z);
      this.scene.add(cloud);
    }
  }

  clearEntities() {
    for (const entity of this.entities) {
      this.scene.remove(entity);
      if (entity.geometry) entity.geometry.dispose();
      if (entity.material) {
        if (Array.isArray(entity.material)) {
          entity.material.forEach(m => m.dispose());
        } else {
          entity.material.dispose();
        }
      }
    }
    this.entities = [];
  }

  addEntity(mesh) {
    this.entities.push(mesh);
    this.scene.add(mesh);
  }

  removeEntity(mesh) {
    const index = this.entities.indexOf(mesh);
    if (index > -1) {
      this.entities.splice(index, 1);
    }
    this.scene.remove(mesh);
    if (mesh.geometry) mesh.geometry.dispose();
    if (mesh.material) {
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(m => m.dispose());
      } else {
        mesh.material.dispose();
      }
    }
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
