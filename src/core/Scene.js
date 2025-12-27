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

    // Track road scroll offset
    this.roadScrollOffset = 0;
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
    // Create procedural road texture with stripes
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Base road color
    ctx.fillStyle = '#deb887';
    ctx.fillRect(0, 0, 128, 256);

    // Add subtle road stripes/variations
    ctx.fillStyle = '#d4a574';
    for (let y = 0; y < 256; y += 32) {
      ctx.fillRect(0, y, 128, 2);
    }

    // Add some texture noise
    ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 128;
      const y = Math.random() * 256;
      ctx.fillRect(x, y, 2, 2);
    }

    const roadTexture = new THREE.CanvasTexture(canvas);
    roadTexture.wrapS = THREE.RepeatWrapping;
    roadTexture.wrapT = THREE.RepeatWrapping;
    roadTexture.repeat.set(1, 25);
    this.roadTexture = roadTexture;

    // Grass sides with texture
    const grassCanvas = document.createElement('canvas');
    grassCanvas.width = 64;
    grassCanvas.height = 64;
    const grassCtx = grassCanvas.getContext('2d');
    grassCtx.fillStyle = '#55aa55';
    grassCtx.fillRect(0, 0, 64, 64);
    // Add grass variation
    for (let i = 0; i < 100; i++) {
      grassCtx.fillStyle = Math.random() > 0.5 ? '#4a9a4a' : '#60b060';
      grassCtx.fillRect(Math.random() * 64, Math.random() * 64, 3, 3);
    }
    const grassTexture = new THREE.CanvasTexture(grassCanvas);
    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(10, 40);
    this.grassTexture = grassTexture;

    const grassGeometry = new THREE.PlaneGeometry(50, 200);
    const grassMaterial = new THREE.MeshStandardMaterial({
      map: grassTexture,
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

    // Main path with scrolling texture
    const pathGeometry = new THREE.PlaneGeometry(16, 200);
    const pathMaterial = new THREE.MeshStandardMaterial({
      map: roadTexture,
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
    this.laneMarkers = [];
    this.laneMarkerSpacing = 4; // Distance between markers
    this.laneMarkerLength = 200; // Total length to cover

    // Create dashed lane markers
    for (let x = -2.25; x <= 2.25; x += 4.5) {
      for (let z = 0; z < this.laneMarkerLength; z += this.laneMarkerSpacing) {
        const dashGeometry = new THREE.PlaneGeometry(0.15, 1.5);
        const dash = new THREE.Mesh(dashGeometry, lineMaterial);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(x, 0.02, z);
        dash.userData.baseZ = z;
        this.scene.add(dash);
        this.laneMarkers.push(dash);
      }
    }
  }

  // Update road scrolling animation
  update(dt, gameSpeed) {
    // Scroll the road texture
    this.roadScrollOffset += gameSpeed * dt * 0.1;
    if (this.roadTexture) {
      this.roadTexture.offset.y = -this.roadScrollOffset;
    }
    if (this.grassTexture) {
      this.grassTexture.offset.y = -this.roadScrollOffset * 0.5;
    }

    // Animate lane markers
    for (const marker of this.laneMarkers) {
      // Move marker backward
      marker.position.z = marker.userData.baseZ - (this.roadScrollOffset % this.laneMarkerSpacing) * 10;

      // Wrap around when going off screen
      if (marker.position.z < -10) {
        marker.position.z += this.laneMarkerLength;
      }
    }

    // Animate clouds
    if (this.clouds) {
      for (const cloud of this.clouds) {
        cloud.position.z -= gameSpeed * dt * 0.3;
        if (cloud.position.z < -20) {
          cloud.position.z = 120;
          cloud.position.x = (Math.random() - 0.5) * 50;
        }
      }
    }

    // Animate side decorations (trees, rocks, etc.)
    if (this.sideDecorations) {
      for (const deco of this.sideDecorations) {
        deco.position.z -= gameSpeed * dt;
        if (deco.position.z < -10) {
          deco.position.z += 140;
        }
      }
    }
  }

  createDecorations() {
    this.sideDecorations = [];

    // Add decorative trees on the sides - more spread out for scrolling
    const treePositions = [];
    for (let z = 10; z < 140; z += 15) {
      const leftX = -12 - Math.random() * 6;
      const rightX = 12 + Math.random() * 6;
      treePositions.push({ x: leftX, z: z + Math.random() * 5 });
      treePositions.push({ x: rightX, z: z + Math.random() * 5 });
    }

    for (const pos of treePositions) {
      const tree = this.createTree(pos.x, pos.z);
      this.sideDecorations.push(tree);
    }

    // Add bushes and rocks
    for (let z = 5; z < 140; z += 20) {
      // Left side
      const leftBush = this.createBush(-10 - Math.random() * 3, z + Math.random() * 10);
      this.sideDecorations.push(leftBush);
      // Right side
      const rightRock = this.createRock(10 + Math.random() * 3, z + Math.random() * 10);
      this.sideDecorations.push(rightRock);
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
    // Random scale for variety
    const scale = 0.7 + Math.random() * 0.6;
    tree.scale.setScalar(scale);
    this.scene.add(tree);
    return tree;
  }

  createBush(x, z) {
    const bush = new THREE.Group();
    const bushMaterial = new THREE.MeshStandardMaterial({ color: 0x2d5a27 });

    // Create puffy bush from spheres
    const sizes = [0.6, 0.5, 0.4, 0.45];
    const offsets = [
      { x: 0, y: 0.4, z: 0 },
      { x: 0.4, y: 0.3, z: 0.2 },
      { x: -0.3, y: 0.35, z: 0.1 },
      { x: 0.1, y: 0.5, z: -0.2 }
    ];

    for (let i = 0; i < sizes.length; i++) {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(sizes[i], 6, 6),
        bushMaterial
      );
      puff.position.set(offsets[i].x, offsets[i].y, offsets[i].z);
      puff.castShadow = true;
      bush.add(puff);
    }

    bush.position.set(x, 0, z);
    const scale = 0.8 + Math.random() * 0.4;
    bush.scale.setScalar(scale);
    this.scene.add(bush);
    return bush;
  }

  createRock(x, z) {
    const rock = new THREE.Group();
    const rockMaterial = new THREE.MeshStandardMaterial({
      color: 0x808080,
      roughness: 0.9
    });

    // Main rock body
    const mainRock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.5, 0),
      rockMaterial
    );
    mainRock.position.y = 0.3;
    mainRock.rotation.set(Math.random(), Math.random(), Math.random());
    mainRock.castShadow = true;
    rock.add(mainRock);

    // Smaller rocks nearby
    const smallRock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.25, 0),
      rockMaterial
    );
    smallRock.position.set(0.4, 0.15, 0.2);
    smallRock.rotation.set(Math.random(), Math.random(), Math.random());
    smallRock.castShadow = true;
    rock.add(smallRock);

    rock.position.set(x, 0, z);
    const scale = 0.8 + Math.random() * 0.5;
    rock.scale.setScalar(scale);
    this.scene.add(rock);
    return rock;
  }

  createClouds() {
    this.clouds = [];
    const cloudMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9
    });

    // Create more clouds spread across the sky
    const cloudPositions = [];
    for (let z = 20; z < 140; z += 25) {
      cloudPositions.push({
        x: -15 - Math.random() * 15,
        y: 22 + Math.random() * 10,
        z: z + Math.random() * 15
      });
      cloudPositions.push({
        x: 15 + Math.random() * 15,
        y: 22 + Math.random() * 10,
        z: z + Math.random() * 15
      });
    }

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

      // Random scale for variety
      const scale = 0.6 + Math.random() * 0.8;
      cloud.scale.setScalar(scale);
      cloud.position.set(pos.x, pos.y, pos.z);
      this.scene.add(cloud);
      this.clouds.push(cloud);
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
