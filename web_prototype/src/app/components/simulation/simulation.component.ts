import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, combineLatest } from 'rxjs';

import { BuildingService, Person, SimulationStats } from '../../services/building.service';
import { PathfindingService, Position } from '../../services/pathfinding.service';
import { ThreeVisualizationService } from '../../services/three-visualization.service';
import { FallbackVisualizationService } from '../../services/fallback-visualization.service';

@Component({
  selector: 'app-simulation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="simulation-container">
      <!-- Sidebar Controls -->
      <div class="sidebar">
        <div class="control-section">
          <h3>🏗️ Building Setup</h3>

          <div class="control-group">
            <label>Building Dimensions</label>
            <div style="display: flex; gap: 0.5rem;">
              <input type="number" [(ngModel)]="buildingWidth" min="10" max="50" placeholder="Width">
              <input type="number" [(ngModel)]="buildingHeight" min="10" max="50" placeholder="Height">
              <input type="number" [(ngModel)]="buildingFloors" min="1" max="10" placeholder="Floors">
            </div>
            <button (click)="regenerateBuilding()" [disabled]="isSimulationRunning">
              🔄 Regenerate Building
            </button>
          </div>
        </div>

        <div class="control-section">
          <h3>👥 People Management</h3>

          <div class="control-group">
            <label>Add Person</label>
            <div style="display: flex; gap: 0.5rem;">
              <input type="number" [(ngModel)]="newPersonX" min="1" [max]="buildingWidth-2" placeholder="X">
              <input type="number" [(ngModel)]="newPersonY" min="1" [max]="buildingHeight-2" placeholder="Y">
              <input type="number" [(ngModel)]="newPersonFloor" min="0" [max]="buildingFloors-1" placeholder="Floor">
            </div>
            <button (click)="addPerson()" [disabled]="isSimulationRunning">
              ➕ Add Person
            </button>
          </div>

          <div class="control-group">
            <button (click)="calculateEvacuationPaths()" [disabled]="people.length === 0">
              🗺️ Calculate Paths
            </button>
          </div>
        </div>

        <div class="control-section">
          <h3>🔥 Fire Control</h3>

          <div class="control-group">
            <label>Fire Spread Rate</label>
            <input type="range" [(ngModel)]="fireSpreadRate" min="0" max="1" step="0.1"
                   (ngModelChange)="updateFireSpreadRate($event)">
            <span>{{(fireSpreadRate * 100).toFixed(0)}}%</span>
          </div>

          <div class="control-group">
            <label>Start Fire At</label>
            <div style="display: flex; gap: 0.5rem;">
              <input type="number" [(ngModel)]="fireX" min="1" [max]="buildingWidth-2" placeholder="X">
              <input type="number" [(ngModel)]="fireY" min="1" [max]="buildingHeight-2" placeholder="Y">
              <input type="number" [(ngModel)]="fireFloor" min="0" [max]="buildingFloors-1" placeholder="Floor">
            </div>
            <button (click)="startFire()" class="danger">
              🔥 Start Fire
            </button>
          </div>
        </div>

        <div class="control-section">
          <h3>⚙️ Simulation Control</h3>

          <div class="control-group">
            <label>Simulation Speed</label>
            <input type="range" [(ngModel)]="simulationSpeed" min="100" max="3000" step="100"
                   (ngModelChange)="updateSimulationSpeed($event)">
            <span>{{simulationSpeed}}ms</span>
          </div>

          <div class="control-group">
            <button (click)="toggleSimulation()"
                    [class]="isSimulationRunning ? 'danger' : 'success'">
              {{isSimulationRunning ? '⏸️ Pause' : '▶️ Start'}} Simulation
            </button>
          </div>

          <div class="control-group">
            <button (click)="resetSimulation()">
              🔄 Reset Simulation
            </button>
          </div>
        </div>

        <div class="control-section">
          <h3>📊 Statistics</h3>
          <div class="stats">
            <div class="stat-item">
              <span class="label">Timestep:</span>
              <span class="value">{{stats.timestep}}</span>
            </div>
            <div class="stat-item">
              <span class="label">People:</span>
              <span class="value">{{stats.peopleRemaining}}/{{stats.totalPeople}}</span>
            </div>
            <div class="stat-item">
              <span class="label">Evacuated:</span>
              <span class="value">{{stats.evacuatedPeople}}</span>
            </div>
            <div class="stat-item">
              <span class="label">Fire Area:</span>
              <span class="value">{{stats.fireArea}} cells</span>
            </div>
            <div class="stat-item">
              <span class="label">Status:</span>
              <span class="value" [style.color]="isSimulationRunning ? '#00b894' : '#666'">
                {{isSimulationRunning ? 'Running' : 'Stopped'}}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 3D Visualization -->
      <div class="visualization-container">
        <div #visualizationContainer class="three-container"></div>

        <div class="loading" *ngIf="!isVisualizationReady">
          <div class="spinner"></div>
          <p>Loading 3D Visualization...</p>
        </div>

        <!-- Overlay Controls -->
        <div class="controls-overlay">
          <button (click)="resetCamera()">📷 Reset View</button>
          <button (click)="toggleShadows()">
            {{shadowsEnabled ? '🌞' : '🌙'}} Shadows
          </button>
          <button (click)="toggleAnimation()">
            {{animationEnabled ? '🎬' : '📷'}} Animation
          </button>
        </div>
      </div>
    </div>

    <!-- Notifications -->
    <div class="notification success" *ngIf="showSuccessNotification">
      <div class="title">Success!</div>
      <div class="message">{{successMessage}}</div>
    </div>

    <div class="notification error" *ngIf="showErrorNotification">
      <div class="title">Error!</div>
      <div class="message">{{errorMessage}}</div>
    </div>
  `,
  styles: [`
    .simulation-container {
      display: flex;
      height: 100vh;
      width: 100vw;
    }

    .three-container {
      width: 100%;
      height: 100%;
      position: relative;
    }

    .notification {
      position: fixed;
      top: 2rem;
      right: 2rem;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class SimulationComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('visualizationContainer', { static: true })
  visualizationContainer!: ElementRef<HTMLElement>;

  private destroy$ = new Subject<void>();

  // Component state
  isVisualizationReady = false;
  isSimulationRunning = false;
  shadowsEnabled = true;
  animationEnabled = true;

  // Building configuration
  buildingWidth = 20;
  buildingHeight = 20;
  buildingFloors = 3;

  // Person management
  newPersonX = 5;
  newPersonY = 5;
  newPersonFloor = 0;
  people: Person[] = [];

  // Fire configuration
  fireX = 10;
  fireY = 10;
  fireFloor = 1;
  fireSpreadRate = 0.1;

  // Simulation configuration
  simulationSpeed = 1000;

  // Statistics
  stats: SimulationStats = {
    timestep: 0,
    totalPeople: 0,
    evacuatedPeople: 0,
    peopleRemaining: 0,
    fireArea: 0,
    isRunning: false
  };

  // Notifications
  showSuccessNotification = false;
  showErrorNotification = false;
  successMessage = '';
  errorMessage = '';

  // Current paths for visualization
  currentPaths: { primary?: Position[]; alternates?: Position[][] } = {};

  // Visualization services
  private currentVisualizationService: any;
  private usingFallback = false;

  constructor(
    private buildingService: BuildingService,
    private pathfindingService: PathfindingService,
    private visualizationService: ThreeVisualizationService,
    private fallbackVisualizationService: FallbackVisualizationService
  ) {
    this.currentVisualizationService = this.visualizationService;
  }

  ngOnInit(): void {
    this.subscribeToServices();
  }

  ngAfterViewInit(): void {
    this.initializeVisualization();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.currentVisualizationService && this.currentVisualizationService.dispose) {
      this.currentVisualizationService.dispose();
    }
  }

  private subscribeToServices(): void {
    // Subscribe to building service observables
    combineLatest([
      this.buildingService.buildingMap$,
      this.buildingService.firePositions$,
      this.buildingService.people$,
      this.buildingService.simulationStats$
    ]).pipe(takeUntil(this.destroy$))
    .subscribe(([buildingMap, firePositions, people, stats]) => {
      this.people = people;
      this.stats = stats;
      this.isSimulationRunning = stats.isRunning;

      if (this.isVisualizationReady) {
        this.updateVisualization(buildingMap, firePositions, people);
      }
    });
  }

  private async initializeVisualization(): Promise<void> {
    try {
      console.log('Initializing 3D visualization...');

      // Check if container is available
      if (!this.visualizationContainer?.nativeElement) {
        throw new Error('Visualization container not found');
      }

      await this.visualizationService.initialize(this.visualizationContainer);
      this.isVisualizationReady = true;

      // Initial visualization update
      const buildingMap = this.buildingService.getBuildingMap();
      this.visualizationService.updateBuilding(buildingMap);

      this.showSuccess('3D Visualization initialized successfully!');
      console.log('3D visualization initialized successfully');

    } catch (error) {
      console.error('Failed to initialize 3D visualization:', error);
      console.log('Attempting to use 2D fallback visualization...');

      try {
        // Try fallback visualization
        this.fallbackVisualizationService.initialize(this.visualizationContainer);
        this.currentVisualizationService = this.fallbackVisualizationService;
        this.usingFallback = true;
        this.isVisualizationReady = true;

        // Initial visualization update
        const buildingMap = this.buildingService.getBuildingMap();
        this.currentVisualizationService.updateBuilding(buildingMap);

        this.showSuccess('2D Fallback visualization initialized successfully!');
        console.log('2D fallback visualization initialized successfully');

      } catch (fallbackError) {
        console.error('Fallback visualization also failed:', fallbackError);
        this.isVisualizationReady = false;

        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        this.showError(`Both 3D and 2D visualization failed: ${errorMessage}`);
        this.showFallbackVisualization();
      }
    }
  }

  private showFallbackVisualization(): void {
    if (this.visualizationContainer?.nativeElement) {
      this.visualizationContainer.nativeElement.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: #f0f0f0; color: #666;">
          <h3>3D Visualization Unavailable</h3>
          <p>WebGL is not supported or failed to initialize.</p>
          <p>You can still use the simulation controls on the left.</p>
          <div style="margin-top: 20px;">
            <button onclick="location.reload()" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Try Again
            </button>
          </div>
        </div>
      `;
    }
  }

  private updateVisualization(
    buildingMap: number[][][],
    firePositions: Set<string>,
    people: Person[]
  ): void {
    if (!this.isVisualizationReady || !this.currentVisualizationService) {
      return;
    }

    const dimensions = {
      width: buildingMap.length,
      height: buildingMap[0]?.length || 0,
      floors: buildingMap[0]?.[0]?.length || 0
    };

    try {
      this.currentVisualizationService.updateBuilding(buildingMap);
      this.currentVisualizationService.updateFire(firePositions, dimensions);
      this.currentVisualizationService.updatePeople(people, dimensions);
      this.currentVisualizationService.updatePaths(this.currentPaths, dimensions);
    } catch (error) {
      console.error('Error updating visualization:', error);
    }
  }

  // Building management
  regenerateBuilding(): void {
    console.log('Regenerating building...', {
      width: this.buildingWidth,
      height: this.buildingHeight,
      floors: this.buildingFloors
    });

    this.buildingService.initializeBuilding(
      this.buildingWidth,
      this.buildingHeight,
      this.buildingFloors
    );
    this.currentPaths = {};
    this.showSuccess('Building regenerated successfully!');
  }

  // Person management
  addPerson(): void {
    const position: Position = {
      x: this.newPersonX,
      y: this.newPersonY,
      floor: this.newPersonFloor
    };

    console.log('Adding person at position:', position);

    const buildingMap = this.buildingService.getBuildingMap();
    const cellType = buildingMap[position.x]?.[position.y]?.[position.floor];

    console.log('Cell type at position:', cellType);

    if (cellType === 0) { // Walkable
      const person = this.buildingService.addPerson(position);
      console.log('Person added:', person);
      this.showSuccess(`Person added at (${position.x}, ${position.y}, ${position.floor})`);
    } else {
      this.showError(`Cannot place person at that location (cell type: ${cellType})`);
    }
  }

  calculateEvacuationPaths(): void {
    const buildingMap = this.buildingService.getBuildingMap();
    const exits = this.buildingService.getExitPositions();

    if (exits.length === 0) {
      this.showError('No exits found in building');
      return;
    }

    let pathsCalculated = 0;
    this.currentPaths = { alternates: [] };

    for (const person of this.people) {
      if (person.isEvacuated) continue;

      // Find best path to nearest exit
      let bestPath: Position[] | null = null;
      let shortestDistance = Infinity;

      for (const exit of exits) {
        const path = this.pathfindingService.findPathAStar(
          person.position,
          exit,
          buildingMap
        );

        if (path && path.length < shortestDistance) {
          bestPath = path;
          shortestDistance = path.length;
        }
      }

      if (bestPath) {
        this.buildingService.setPersonPath(person.id, bestPath);

        // Store primary path for visualization
        if (!this.currentPaths.primary) {
          this.currentPaths.primary = bestPath;
        }

        // Find alternate paths
        const alternatePaths = this.pathfindingService.findAlternatePaths(
          person.position,
          bestPath[bestPath.length - 1],
          buildingMap,
          2
        );

        if (alternatePaths.length > 1) {
          this.currentPaths.alternates = alternatePaths.slice(1);
        }

        pathsCalculated++;
      }
    }

    if (pathsCalculated > 0) {
      this.showSuccess(`Calculated evacuation paths for ${pathsCalculated} people`);
    } else {
      this.showError('No valid evacuation paths found');
    }
  }

  // Fire management
  startFire(): void {
    const position: Position = {
      x: this.fireX,
      y: this.fireY,
      floor: this.fireFloor
    };

    console.log('Starting fire at position:', position);

    if (this.buildingService.startFire(position)) {
      console.log('Fire started successfully');
      this.showSuccess(`Fire started at (${position.x}, ${position.y}, ${position.floor})`);
    } else {
      console.log('Failed to start fire');
      this.showError('Cannot start fire at that location');
    }
  }

  updateFireSpreadRate(rate: number): void {
    this.buildingService.setFireSpreadRate(rate);
  }

  // Simulation control
  toggleSimulation(): void {
    if (this.isSimulationRunning) {
      this.buildingService.stopSimulation();
    } else {
      this.buildingService.startSimulation();
    }
  }

  resetSimulation(): void {
    this.buildingService.resetSimulation();
    this.currentPaths = {};
    this.showSuccess('Simulation reset');
  }

  updateSimulationSpeed(speed: number): void {
    this.buildingService.setSimulationSpeed(speed);
  }

  // Visualization controls
  resetCamera(): void {
    // Reset camera to default position
    this.showSuccess('Camera view reset');
  }

  toggleShadows(): void {
    this.shadowsEnabled = !this.shadowsEnabled;
    if (this.currentVisualizationService && this.currentVisualizationService.updateConfig) {
      this.currentVisualizationService.updateConfig({ enableShadows: this.shadowsEnabled });
    }
    this.showSuccess(`Shadows ${this.shadowsEnabled ? 'enabled' : 'disabled'}`);
  }

  toggleAnimation(): void {
    this.animationEnabled = !this.animationEnabled;
    if (this.currentVisualizationService && this.currentVisualizationService.updateConfig) {
      this.currentVisualizationService.updateConfig({ enableAnimation: this.animationEnabled });
    }
    this.showSuccess(`Animation ${this.animationEnabled ? 'enabled' : 'disabled'}`);
  }

  // Notification helpers
  private showSuccess(message: string): void {
    this.successMessage = message;
    this.showSuccessNotification = true;
    setTimeout(() => {
      this.showSuccessNotification = false;
    }, 3000);
  }

  private showError(message: string): void {
    this.errorMessage = message;
    this.showErrorNotification = true;
    setTimeout(() => {
      this.showErrorNotification = false;
    }, 3000);
  }
}
