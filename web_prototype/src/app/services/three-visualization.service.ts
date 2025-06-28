import { Injectable, ElementRef } from '@angular/core';
import * as THREE from 'three';
import { Position, CellType } from './pathfinding.service';
import { Person } from './building.service';

export interface VisualizationConfig {
  cellSize: number;
  floorHeight: number;
  cameraDistance: number;
  enableShadows: boolean;
  enableAnimation: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ThreeVisualizationService {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls: any; // OrbitControls

  private buildingGroup!: THREE.Group;
  private fireGroup!: THREE.Group;
  private peopleGroup!: THREE.Group;
  private pathGroup!: THREE.Group;

  private config: VisualizationConfig = {
    cellSize: 1,
    floorHeight: 3,
    cameraDistance: 50,
    enableShadows: true,
    enableAnimation: true
  };

  private animationId?: number;
  private isInitialized = false;

  // Materials
  private materials = {
    walkable: new THREE.MeshLambertMaterial({ color: 0xf0f0f0, transparent: true, opacity: 0.1 }),
    wall: new THREE.MeshLambertMaterial({ color: 0x666666 }),
    fire: new THREE.MeshBasicMaterial({ color: 0xff4444 }),
    stairs: new THREE.MeshLambertMaterial({ color: 0x44aa44 }),
    exit: new THREE.MeshLambertMaterial({ color: 0xffaa00 }),
    person: new THREE.MeshLambertMaterial({ color: 0x4444ff }),
    evacuated: new THREE.MeshLambertMaterial({ color: 0x44ff44 }),
    path: new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 3 }),
    alternatePath: new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 2 })
  };

  constructor() {}

  /**
   * Initialize Three.js scene
   */
  async initialize(container: ElementRef<HTMLElement>): Promise<void> {
    try {
      if (this.isInitialized) {
        this.dispose();
      }

      // Check if WebGL is supported
      if (!this.isWebGLSupported()) {
        throw new Error('WebGL is not supported in this browser');
      }

      // Scene setup
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x222222);
      this.scene.fog = new THREE.Fog(0x222222, 50, 200);

      // Camera setup
      const width = container.nativeElement.clientWidth || 800;
      const height = container.nativeElement.clientHeight || 600;
      const aspect = width / height;

      this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
      this.camera.position.set(
        this.config.cameraDistance,
        this.config.cameraDistance,
        this.config.cameraDistance
      );

      // Renderer setup with error handling
      try {
        this.renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true
        });
      } catch (error) {
        console.warn('WebGL renderer failed, falling back to basic renderer');
        this.renderer = new THREE.WebGLRenderer({
          antialias: false,
          alpha: false
        });
      }

      this.renderer.setSize(width, height);
      this.renderer.shadowMap.enabled = this.config.enableShadows;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      // Clear any existing canvas
      const existingCanvas = container.nativeElement.querySelector('canvas');
      if (existingCanvas) {
        existingCanvas.remove();
      }

      container.nativeElement.appendChild(this.renderer.domElement);

      // Controls setup
      await this.setupControls();

      // Lighting setup
      this.setupLighting();

      // Groups setup
      this.buildingGroup = new THREE.Group();
      this.fireGroup = new THREE.Group();
      this.peopleGroup = new THREE.Group();
      this.pathGroup = new THREE.Group();

      this.scene.add(this.buildingGroup);
      this.scene.add(this.fireGroup);
      this.scene.add(this.peopleGroup);
      this.scene.add(this.pathGroup);

      // Add a test cube to verify rendering works
      this.addTestCube();

      // Start render loop
      this.startRenderLoop();

      this.isInitialized = true;

    } catch (error) {
      console.error('Failed to initialize Three.js:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`3D Visualization initialization failed: ${errorMessage}`);
    }
  }

  /**
   * Check if WebGL is supported
   */
  private isWebGLSupported(): boolean {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!context;
    } catch (e) {
      return false;
    }
  }

  /**
   * Add a test cube to verify rendering works
   */
  private addTestCube(): void {
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 0, 0);
    this.scene.add(cube);
  }

  /**
   * Setup camera controls
   */
  private async setupControls(): Promise<void> {
    // In a real implementation, you would import OrbitControls
    // For now, we'll implement basic mouse controls
    let isMouseDown = false;
    let mouseX = 0;
    let mouseY = 0;

    this.renderer.domElement.addEventListener('mousedown', (event) => {
      isMouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;
    });

    this.renderer.domElement.addEventListener('mouseup', () => {
      isMouseDown = false;
    });

    this.renderer.domElement.addEventListener('mousemove', (event) => {
      if (!isMouseDown) return;

      const deltaX = event.clientX - mouseX;
      const deltaY = event.clientY - mouseY;

      // Rotate camera around scene center
      const spherical = new THREE.Spherical();
      spherical.setFromVector3(this.camera.position);
      spherical.theta -= deltaX * 0.01;
      spherical.phi += deltaY * 0.01;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

      this.camera.position.setFromSpherical(spherical);
      this.camera.lookAt(0, 0, 0);

      mouseX = event.clientX;
      mouseY = event.clientY;
    });

    // Zoom with mouse wheel
    this.renderer.domElement.addEventListener('wheel', (event) => {
      const scale = event.deltaY > 0 ? 1.1 : 0.9;
      this.camera.position.multiplyScalar(scale);
      this.camera.position.clampLength(10, 200);
    });
  }

  /**
   * Setup scene lighting
   */
  private setupLighting(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(ambientLight);

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = this.config.enableShadows;

    if (this.config.enableShadows) {
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      directionalLight.shadow.camera.near = 0.5;
      directionalLight.shadow.camera.far = 200;
      directionalLight.shadow.camera.left = -50;
      directionalLight.shadow.camera.right = 50;
      directionalLight.shadow.camera.top = 50;
      directionalLight.shadow.camera.bottom = -50;
    }

    this.scene.add(directionalLight);

    // Point lights for fire effect
    const fireLight = new THREE.PointLight(0xff4444, 1, 10);
    fireLight.position.set(0, 5, 0);
    this.fireGroup.add(fireLight);
  }

  /**
   * Update building visualization
   */
  updateBuilding(buildingMap: number[][][]): void {
    if (!this.isInitialized) {
      console.warn('Three.js not initialized, cannot update building');
      return;
    }

    console.log('Updating building visualization...', {
      width: buildingMap.length,
      height: buildingMap[0]?.length || 0,
      floors: buildingMap[0]?.[0]?.length || 0
    });

    // Clear existing building
    this.buildingGroup.clear();

    const width = buildingMap.length;
    const height = buildingMap[0]?.length || 0;
    const floors = buildingMap[0]?.[0]?.length || 0;

    if (width === 0 || height === 0 || floors === 0) {
      console.error('Invalid building dimensions');
      return;
    }

    let elementsAdded = 0;

    // Create building geometry
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        for (let floor = 0; floor < floors; floor++) {
          const cellType = buildingMap[x][y][floor];

          if (cellType !== 0) { // Not walkable (0)
            const mesh = this.createCellMesh(cellType);
            mesh.position.set(
              (x - width / 2) * this.config.cellSize,
              floor * this.config.floorHeight,
              (y - height / 2) * this.config.cellSize
            );

            if (this.config.enableShadows) {
              mesh.castShadow = true;
              mesh.receiveShadow = true;
            }

            this.buildingGroup.add(mesh);
            elementsAdded++;
          }
        }
      }
    }

    // Add floor planes for better visualization
    for (let floor = 0; floor < floors; floor++) {
      const floorGeometry = new THREE.PlaneGeometry(
        width * this.config.cellSize,
        height * this.config.cellSize
      );
      const floorMaterial = new THREE.MeshLambertMaterial({
        color: 0xcccccc,
        transparent: true,
        opacity: 0.2
      });
      const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);

      floorMesh.rotation.x = -Math.PI / 2;
      floorMesh.position.y = floor * this.config.floorHeight - 0.1;

      if (this.config.enableShadows) {
        floorMesh.receiveShadow = true;
      }

      this.buildingGroup.add(floorMesh);
      elementsAdded++;
    }

    console.log(`Building updated: ${elementsAdded} elements added to scene`);
  }

  /**
   * Create mesh for building cell
   */
  private createCellMesh(cellType: number): THREE.Mesh {
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;

    switch (cellType) {
      case 1: // WALL
        geometry = new THREE.BoxGeometry(
          this.config.cellSize,
          this.config.floorHeight,
          this.config.cellSize
        );
        material = this.materials.wall;
        break;

      case 2: // FIRE
        geometry = new THREE.SphereGeometry(this.config.cellSize * 0.4, 8, 6);
        material = this.materials.fire;
        break;

      case 3: // STAIRS
        geometry = new THREE.CylinderGeometry(
          this.config.cellSize * 0.3,
          this.config.cellSize * 0.3,
          this.config.floorHeight,
          8
        );
        material = this.materials.stairs;
        break;

      case 4: // EXIT
        geometry = new THREE.BoxGeometry(
          this.config.cellSize,
          this.config.floorHeight * 0.2,
          this.config.cellSize
        );
        material = this.materials.exit;
        break;

      default:
        geometry = new THREE.BoxGeometry(
          this.config.cellSize * 0.8,
          this.config.cellSize * 0.8,
          this.config.cellSize * 0.8
        );
        material = this.materials.walkable;
    }

    const mesh = new THREE.Mesh(geometry, material);

    // Ensure the mesh is visible
    mesh.visible = true;
    mesh.frustumCulled = false; // Disable frustum culling for debugging

    return mesh;
  }

  /**
   * Update fire visualization
   */
  updateFire(firePositions: Set<string>, buildingDimensions: { width: number; height: number; floors: number }): void {
    if (!this.isInitialized) {
      console.warn('Three.js not initialized, cannot update fire');
      return;
    }

    console.log('Updating fire visualization...', { fireCount: firePositions.size });

    // Clear existing fire
    this.fireGroup.clear();

    let fireElementsAdded = 0;

    // Add fire meshes
    for (const fireKey of firePositions) {
      const [x, y, floor] = fireKey.split(',').map(Number);

      // Fire particle system (simplified)
      const fireGeometry = new THREE.SphereGeometry(this.config.cellSize * 0.4, 8, 6);
      const fireMesh = new THREE.Mesh(fireGeometry, this.materials.fire);

      fireMesh.position.set(
        (x - buildingDimensions.width / 2) * this.config.cellSize,
        floor * this.config.floorHeight + this.config.cellSize * 0.5,
        (y - buildingDimensions.height / 2) * this.config.cellSize
      );

      // Add flickering animation
      if (this.config.enableAnimation) {
        const scale = 0.8 + Math.random() * 0.4;
        fireMesh.scale.setScalar(scale);
      }

      // Ensure visibility
      fireMesh.visible = true;
      fireMesh.frustumCulled = false;

      this.fireGroup.add(fireMesh);
      fireElementsAdded++;

      // Add point light for fire
      const fireLight = new THREE.PointLight(0xff4444, 0.5, 5);
      fireLight.position.copy(fireMesh.position);
      this.fireGroup.add(fireLight);
    }

    console.log(`Fire updated: ${fireElementsAdded} fire elements added`);
  }

  /**
   * Update people visualization
   */
  updatePeople(people: Person[], buildingDimensions: { width: number; height: number; floors: number }): void {
    if (!this.isInitialized) {
      console.warn('Three.js not initialized, cannot update people');
      return;
    }

    console.log('Updating people visualization...', { peopleCount: people.length });

    // Clear existing people
    this.peopleGroup.clear();

    let peopleElementsAdded = 0;

    for (const person of people) {
      // Use simpler geometry for better compatibility
      const personGeometry = new THREE.CylinderGeometry(
        this.config.cellSize * 0.2,
        this.config.cellSize * 0.2,
        this.config.cellSize * 0.8,
        8
      );

      const material = person.isEvacuated ? this.materials.evacuated : this.materials.person;
      const personMesh = new THREE.Mesh(personGeometry, material);

      personMesh.position.set(
        (person.position.x - buildingDimensions.width / 2) * this.config.cellSize,
        person.position.floor * this.config.floorHeight + this.config.cellSize * 0.4,
        (person.position.y - buildingDimensions.height / 2) * this.config.cellSize
      );

      // Ensure visibility
      personMesh.visible = true;
      personMesh.frustumCulled = false;

      if (this.config.enableShadows) {
        personMesh.castShadow = true;
      }

      this.peopleGroup.add(personMesh);
      peopleElementsAdded++;

      // Add simple name label using basic geometry instead of canvas texture
      const labelGeometry = new THREE.PlaneGeometry(1, 0.3);
      const labelMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
      });
      const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);

      labelMesh.position.copy(personMesh.position);
      labelMesh.position.y += this.config.cellSize * 0.8;
      labelMesh.lookAt(this.camera.position);

      this.peopleGroup.add(labelMesh);
    }

    console.log(`People updated: ${peopleElementsAdded} people elements added`);
  }

  /**
   * Update path visualization
   */
  updatePaths(paths: { primary?: Position[]; alternates?: Position[][] }, buildingDimensions: { width: number; height: number; floors: number }): void {
    if (!this.isInitialized) return;

    // Clear existing paths
    this.pathGroup.clear();

    // Draw primary path
    if (paths.primary && paths.primary.length > 1) {
      const pathLine = this.createPathLine(paths.primary, buildingDimensions, this.materials.path);
      this.pathGroup.add(pathLine);
    }

    // Draw alternate paths
    if (paths.alternates) {
      for (const alternatePath of paths.alternates) {
        if (alternatePath.length > 1) {
          const pathLine = this.createPathLine(alternatePath, buildingDimensions, this.materials.alternatePath);
          this.pathGroup.add(pathLine);
        }
      }
    }
  }

  /**
   * Create path line geometry
   */
  private createPathLine(path: Position[], buildingDimensions: { width: number; height: number; floors: number }, material: THREE.LineBasicMaterial): THREE.Line {
    const points: THREE.Vector3[] = [];

    for (const pos of path) {
      points.push(new THREE.Vector3(
        (pos.x - buildingDimensions.width / 2) * this.config.cellSize,
        pos.floor * this.config.floorHeight + this.config.cellSize * 0.1,
        (pos.y - buildingDimensions.height / 2) * this.config.cellSize
      ));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return new THREE.Line(geometry, material);
  }

  /**
   * Start render loop
   */
  private startRenderLoop(): void {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);

      // Animate fire flickering
      if (this.config.enableAnimation) {
        this.fireGroup.children.forEach((child, index) => {
          if (child instanceof THREE.Mesh) {
            const time = Date.now() * 0.005;
            const scale = 0.8 + Math.sin(time + index) * 0.2;
            child.scale.setScalar(scale);
          }
        });
      }

      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }

  /**
   * Handle window resize
   */
  onWindowResize(width: number, height: number): void {
    if (!this.isInitialized) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<VisualizationConfig>): void {
    this.config = { ...this.config, ...config };

    if (config.enableShadows !== undefined) {
      this.renderer.shadowMap.enabled = config.enableShadows;
    }
  }

  /**
   * Dispose of Three.js resources
   */
  dispose(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    if (this.renderer) {
      this.renderer.dispose();
    }

    // Dispose materials
    Object.values(this.materials).forEach(material => {
      material.dispose();
    });

    this.isInitialized = false;
  }

  /**
   * Get camera position for saving/loading views
   */
  getCameraPosition(): { position: THREE.Vector3; target: THREE.Vector3 } {
    return {
      position: this.camera.position.clone(),
      target: new THREE.Vector3(0, 0, 0) // Scene center
    };
  }

  /**
   * Set camera position
   */
  setCameraPosition(position: THREE.Vector3, target: THREE.Vector3): void {
    this.camera.position.copy(position);
    this.camera.lookAt(target);
  }
}
