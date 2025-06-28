import { Injectable, ElementRef } from '@angular/core';
import { Position } from './pathfinding.service';
import { Person } from './building.service';

@Injectable({
  providedIn: 'root'
})
export class FallbackVisualizationService {
  private container!: HTMLElement;
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private currentFloor = 0;
  private cellSize = 20;
  private buildingDimensions = { width: 0, height: 0, floors: 0 };

  constructor() {}

  /**
   * Initialize 2D canvas fallback visualization
   */
  initialize(container: ElementRef<HTMLElement>): void {
    this.container = container.nativeElement;

    // Clear container
    this.container.innerHTML = '';

    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.container.clientWidth || 800;
    this.canvas.height = this.container.clientHeight || 600;
    this.canvas.style.border = '1px solid #ccc';
    this.canvas.style.background = '#f9f9f9';

    this.ctx = this.canvas.getContext('2d')!;
    this.container.appendChild(this.canvas);

    // Add floor controls
    this.addFloorControls();

    // Add instructions
    this.addInstructions();
  }

  /**
   * Add floor navigation controls
   */
  private addFloorControls(): void {
    const controlsDiv = document.createElement('div');
    controlsDiv.style.cssText = `
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(255, 255, 255, 0.9);
      padding: 10px;
      border-radius: 5px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    `;

    controlsDiv.innerHTML = `
      <div style="margin-bottom: 10px; font-weight: bold;">Floor Navigation</div>
      <button id="floorDown" style="margin-right: 5px; padding: 5px 10px;">⬇ Floor</button>
      <span id="currentFloor" style="margin: 0 10px; font-weight: bold;">Floor 0</span>
      <button id="floorUp" style="padding: 5px 10px;">Floor ⬆</button>
    `;

    this.container.appendChild(controlsDiv);

    // Add event listeners
    document.getElementById('floorDown')?.addEventListener('click', () => {
      if (this.currentFloor > 0) {
        this.currentFloor--;
        this.updateFloorDisplay();
        this.redraw();
      }
    });

    document.getElementById('floorUp')?.addEventListener('click', () => {
      if (this.currentFloor < this.buildingDimensions.floors - 1) {
        this.currentFloor++;
        this.updateFloorDisplay();
        this.redraw();
      }
    });
  }

  /**
   * Add instructions
   */
  private addInstructions(): void {
    const instructionsDiv = document.createElement('div');
    instructionsDiv.style.cssText = `
      position: absolute;
      bottom: 10px;
      left: 10px;
      background: rgba(255, 255, 255, 0.9);
      padding: 10px;
      border-radius: 5px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      font-size: 12px;
      max-width: 300px;
    `;

    instructionsDiv.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 5px;">2D Visualization</div>
      <div>🟫 Walls</div>
      <div>🟩 Stairs</div>
      <div>🟨 Exits</div>
      <div>🔴 Fire</div>
      <div>🔵 People</div>
      <div>— Paths</div>
    `;

    this.container.appendChild(instructionsDiv);
  }

  /**
   * Update floor display
   */
  private updateFloorDisplay(): void {
    const floorSpan = document.getElementById('currentFloor');
    if (floorSpan) {
      floorSpan.textContent = `Floor ${this.currentFloor}`;
    }
  }

  /**
   * Update building visualization
   */
  updateBuilding(buildingMap: number[][][]): void {
    console.log('Fallback: Updating building visualization...', {
      width: buildingMap.length,
      height: buildingMap[0]?.length || 0,
      floors: buildingMap[0]?.[0]?.length || 0
    });

    this.buildingDimensions = {
      width: buildingMap.length,
      height: buildingMap[0]?.length || 0,
      floors: buildingMap[0]?.[0]?.length || 0
    };

    // Store the building map for rendering
    this.buildingMap = buildingMap;

    // Calculate cell size to fit the canvas
    this.cellSize = Math.min(
      Math.floor((this.canvas.width - 40) / this.buildingDimensions.width),
      Math.floor((this.canvas.height - 40) / this.buildingDimensions.height),
      25
    );

    this.redraw();
  }

  // Store building map for rendering
  private buildingMap: number[][][] = [];
  private firePositions: Set<string> = new Set();
  private people: any[] = [];

  /**
   * Update fire visualization
   */
  updateFire(firePositions: Set<string>, buildingDimensions: any): void {
    console.log('Fallback: Updating fire...', { fireCount: firePositions.size });
    this.firePositions = firePositions;
    this.redraw();
  }

  /**
   * Update people visualization
   */
  updatePeople(people: any[], buildingDimensions: any): void {
    console.log('Fallback: Updating people...', { peopleCount: people.length });
    this.people = people;
    this.redraw();
  }

  /**
   * Update paths visualization
   */
  updatePaths(paths: any, buildingDimensions: any): void {
    this.redraw();
  }

  /**
   * Redraw the entire visualization
   */
  private redraw(): void {
    if (!this.ctx || this.buildingDimensions.width === 0) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid
    this.drawGrid();

    // Draw building elements for current floor
    this.drawBuildingElements();

    // Draw legend
    this.drawLegend();
  }

  /**
   * Draw grid
   */
  private drawGrid(): void {
    this.ctx.strokeStyle = '#ddd';
    this.ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x <= this.buildingDimensions.width; x++) {
      const pixelX = x * this.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(pixelX, 0);
      this.ctx.lineTo(pixelX, this.buildingDimensions.height * this.cellSize);
      this.ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= this.buildingDimensions.height; y++) {
      const pixelY = y * this.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(0, pixelY);
      this.ctx.lineTo(this.buildingDimensions.width * this.cellSize, pixelY);
      this.ctx.stroke();
    }
  }

  /**
   * Draw building elements
   */
  private drawBuildingElements(): void {
    if (!this.buildingMap || this.buildingMap.length === 0) {
      // Draw placeholder if no building data
      this.ctx.fillStyle = '#333';
      this.ctx.font = '14px Arial';
      this.ctx.textAlign = 'center';

      const centerX = this.canvas.width / 2;
      const centerY = this.canvas.height / 2;

      this.ctx.fillText(
        `Floor ${this.currentFloor} - Building Visualization`,
        centerX,
        centerY - 20
      );

      this.ctx.fillText(
        'Use sidebar controls to add people and fire',
        centerX,
        centerY + 20
      );
      return;
    }

    const offsetX = 20;
    const offsetY = 20;

    // Draw building elements for current floor
    for (let x = 0; x < this.buildingDimensions.width; x++) {
      for (let y = 0; y < this.buildingDimensions.height; y++) {
        const cellType = this.buildingMap[x][y][this.currentFloor];

        const pixelX = offsetX + x * this.cellSize;
        const pixelY = offsetY + y * this.cellSize;

        // Draw cell based on type
        switch (cellType) {
          case 1: // Wall
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(pixelX, pixelY, this.cellSize, this.cellSize);
            break;
          case 2: // Fire
            this.ctx.fillStyle = '#FF0000';
            this.ctx.fillRect(pixelX, pixelY, this.cellSize, this.cellSize);
            // Add fire effect
            this.ctx.fillStyle = '#FF4500';
            this.ctx.fillRect(pixelX + 2, pixelY + 2, this.cellSize - 4, this.cellSize - 4);
            break;
          case 3: // Stairs
            this.ctx.fillStyle = '#228B22';
            this.ctx.fillRect(pixelX, pixelY, this.cellSize, this.cellSize);
            // Add stairs pattern
            this.ctx.strokeStyle = '#006400';
            this.ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
              const stepY = pixelY + (i + 1) * (this.cellSize / 4);
              this.ctx.beginPath();
              this.ctx.moveTo(pixelX, stepY);
              this.ctx.lineTo(pixelX + this.cellSize, stepY);
              this.ctx.stroke();
            }
            break;
          case 4: // Exit
            this.ctx.fillStyle = '#FFD700';
            this.ctx.fillRect(pixelX, pixelY, this.cellSize, this.cellSize);
            // Add exit symbol
            this.ctx.fillStyle = '#000';
            this.ctx.font = `${this.cellSize * 0.6}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText('E', pixelX + this.cellSize/2, pixelY + this.cellSize * 0.7);
            break;
        }
      }
    }

    // Draw fire positions
    for (const fireKey of this.firePositions) {
      const [x, y, floor] = fireKey.split(',').map(Number);
      if (floor === this.currentFloor) {
        const pixelX = offsetX + x * this.cellSize;
        const pixelY = offsetY + y * this.cellSize;

        this.ctx.fillStyle = '#FF0000';
        this.ctx.beginPath();
        this.ctx.arc(pixelX + this.cellSize/2, pixelY + this.cellSize/2, this.cellSize * 0.4, 0, 2 * Math.PI);
        this.ctx.fill();
      }
    }

    // Draw people
    for (const person of this.people) {
      if (person.position.floor === this.currentFloor) {
        const pixelX = offsetX + person.position.x * this.cellSize;
        const pixelY = offsetY + person.position.y * this.cellSize;

        this.ctx.fillStyle = person.isEvacuated ? '#44ff44' : '#0000FF';
        this.ctx.beginPath();
        this.ctx.arc(pixelX + this.cellSize/2, pixelY + this.cellSize/2, this.cellSize * 0.3, 0, 2 * Math.PI);
        this.ctx.fill();

        // Add person label
        this.ctx.fillStyle = '#000';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(person.name, pixelX + this.cellSize/2, pixelY - 5);
      }
    }
  }

  /**
   * Draw legend
   */
  private drawLegend(): void {
    const legendX = this.canvas.width - 150;
    const legendY = 20;

    // Legend background
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.fillRect(legendX - 10, legendY - 10, 140, 120);

    this.ctx.strokeStyle = '#ccc';
    this.ctx.strokeRect(legendX - 10, legendY - 10, 140, 120);

    // Legend items
    this.ctx.fillStyle = '#333';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'left';

    const items = [
      { color: '#8B4513', text: 'Walls' },
      { color: '#228B22', text: 'Stairs' },
      { color: '#FFD700', text: 'Exits' },
      { color: '#FF0000', text: 'Fire' },
      { color: '#0000FF', text: 'People' }
    ];

    items.forEach((item, index) => {
      const y = legendY + index * 20;

      // Color square
      this.ctx.fillStyle = item.color;
      this.ctx.fillRect(legendX, y - 8, 12, 12);

      // Text
      this.ctx.fillStyle = '#333';
      this.ctx.fillText(item.text, legendX + 20, y);
    });
  }

  /**
   * Handle window resize
   */
  onWindowResize(width: number, height: number): void {
    if (this.canvas) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.redraw();
    }
  }

  /**
   * Update configuration (compatibility method)
   */
  updateConfig(config: any): void {
    // No-op for compatibility
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
