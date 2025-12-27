import * as THREE from 'three';

export class Scene {
  constructor(container) {
    this.container = container;

    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);
    this.scene.fog = new THREE.Fog(0x1a1a2e, 30, 80);

    // Create camera (behind and above player, looking forward)
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 8, -10);
    this.camera.lookAt(0, 0, 20);

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.insertBefore(this.renderer.domElement, container.firstChild);

    // Add lights
    this.setupLights();

    // Create ground
    this.createGround();

    // Create lane markers
    this.createLaneMarkers();

    // Store entities for cleanup
    this.entities = [];
  }

  setupLights() {
    // Ambient light
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);

    // Directional light (sun)
    const directional = new THREE.DirectionalLight(0xffffff, 0.8);
    directional.position.set(5, 10, -5);
    this.scene.add(directional);
  }

  createGround() {
    // Create a large ground plane
    const groundGeometry = new THREE.PlaneGeometry(20, 200);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x2d3436,
      roughness: 0.8
    });
    this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.position.z = 80;
    this.scene.add(this.ground);

    // Side walls
    const wallGeometry = new THREE.BoxGeometry(1, 3, 200);
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x6c5ce7 });

    const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
    leftWall.position.set(-10, 1.5, 80);
    this.scene.add(leftWall);

    const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
    rightWall.position.set(10, 1.5, 80);
    this.scene.add(rightWall);
  }

  createLaneMarkers() {
    // Lane divider lines
    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0x636e72 });

    for (let x = -3; x <= 3; x += 3) {
      if (x === 0) continue;
      const lineGeometry = new THREE.PlaneGeometry(0.1, 200);
      const line = new THREE.Mesh(lineGeometry, lineMaterial);
      line.rotation.x = -Math.PI / 2;
      line.position.set(x, 0.01, 80);
      this.scene.add(line);
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
