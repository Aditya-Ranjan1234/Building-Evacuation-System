import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { Position, CellType, PathfindingService } from './pathfinding.service';

// Local CellType enum for consistency
enum LocalCellType {
  WALKABLE = 0,
  WALL = 1,
  FIRE = 2,
  STAIRS = 3,
  EXIT = 4
}

export interface Person {
  id: string;
  name: string;
  position: Position;
  targetPosition?: Position;
  path: Position[];
  currentPathIndex: number;
  isEvacuated: boolean;
  movementSpeed: number;
  trapped?: boolean;
}

export interface BuildingStats {
  dimensions: { width: number; height: number; floors: number };
  totalWalkableArea: number;
  fireArea: number;
  exits: number;
  stairs: number;
  people: number;
  evacuatedPeople: number;
}

export interface SimulationStats {
  timestep: number;
  totalPeople: number;
  evacuatedPeople: number;
  peopleRemaining: number;
  fireArea: number;
  isRunning: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BuildingService {
  private buildingMap: number[][][] = [];
  private firePositions: Set<string> = new Set();
  private people: Person[] = [];
  private timestep = 0;
  private isSimulationRunning = false;
  private simulationSubscription?: Subscription;

  // Observables for reactive updates
  private buildingMapSubject = new BehaviorSubject<number[][][]>([]);
  private firePositionsSubject = new BehaviorSubject<Set<string>>(new Set());
  private peopleSubject = new BehaviorSubject<Person[]>([]);
  private simulationStatsSubject = new BehaviorSubject<SimulationStats>({
    timestep: 0,
    totalPeople: 0,
    evacuatedPeople: 0,
    peopleRemaining: 0,
    fireArea: 0,
    isRunning: false
  });

  // Configuration
  private fireSpreadRate = 0.1; // Probability of fire spreading per timestep
  private simulationSpeed = 1000; // Milliseconds per timestep

  constructor(
    private pathfindingService: PathfindingService
  ) {
    this.initializeBuilding(20, 20, 3);
  }

  // Observables
  get buildingMap$(): Observable<number[][][]> {
    return this.buildingMapSubject.asObservable();
  }

  get firePositions$(): Observable<Set<string>> {
    return this.firePositionsSubject.asObservable();
  }

  get people$(): Observable<Person[]> {
    return this.peopleSubject.asObservable();
  }

  get simulationStats$(): Observable<SimulationStats> {
    return this.simulationStatsSubject.asObservable();
  }

  /**
   * Initialize building with specified dimensions
   */
  initializeBuilding(width: number, height: number, floors: number): void {
    this.buildingMap = this.generateBuildingLayout(width, height, floors);
    this.firePositions.clear();
    this.people = [];
    this.timestep = 0;
    this.isSimulationRunning = false;

    this.updateObservables();
  }

  /**
   * Generate realistic building layout
   */
  private generateBuildingLayout(width: number, height: number, floors: number): number[][][] {
    const map: number[][][] = Array(width).fill(null).map(() =>
      Array(height).fill(null).map(() =>
        Array(floors).fill(CellType.WALKABLE)
      )
    );

    // Add walls around perimeter
    for (let floor = 0; floor < floors; floor++) {
      for (let x = 0; x < width; x++) {
        map[x][0][floor] = CellType.WALL; // Bottom wall
        map[x][height - 1][floor] = CellType.WALL; // Top wall
      }
      for (let y = 0; y < height; y++) {
        map[0][y][floor] = CellType.WALL; // Left wall
        map[width - 1][y][floor] = CellType.WALL; // Right wall
      }
    }

    // Add internal walls to create rooms
    for (let floor = 0; floor < floors; floor++) {
      // Vertical walls
      const wall1X = Math.floor(width / 3);
      const wall2X = Math.floor(2 * width / 3);

      for (let y = 2; y < Math.floor(height / 2); y++) {
        map[wall1X][y][floor] = CellType.WALL;
      }

      for (let y = Math.floor(height / 2); y < height - 2; y++) {
        map[wall2X][y][floor] = CellType.WALL;
      }

      // Horizontal walls
      const wall1Y = Math.floor(height / 3);
      const wall2Y = Math.floor(2 * height / 3);

      for (let x = 2; x < Math.floor(width / 2); x++) {
        map[x][wall1Y][floor] = CellType.WALL;
      }

      for (let x = Math.floor(width / 2); x < width - 2; x++) {
        map[x][wall2Y][floor] = CellType.WALL;
      }

      // Add doors (gaps in walls)
      map[wall1X][Math.floor(height / 4)][floor] = CellType.WALKABLE;
      map[wall2X][Math.floor(3 * height / 4)][floor] = CellType.WALKABLE;
      map[Math.floor(width / 4)][wall1Y][floor] = CellType.WALKABLE;
      map[Math.floor(3 * width / 4)][wall2Y][floor] = CellType.WALKABLE;
    }

    // Add stairs connecting floors
    const stairX = Math.floor(width / 2);
    const stairY = Math.floor(height / 2);

    for (let floor = 0; floor < floors; floor++) {
      for (let dx = 0; dx < 2; dx++) {
        for (let dy = 0; dy < 2; dy++) {
          if (stairX + dx < width && stairY + dy < height) {
            map[stairX + dx][stairY + dy][floor] = CellType.STAIRS;
          }
        }
      }
    }

    // Add exits on ground floor
    map[1][Math.floor(height / 2)][0] = CellType.EXIT; // Left exit
    map[width - 2][Math.floor(height / 2)][0] = CellType.EXIT; // Right exit

    return map;
  }

  /**
   * Start fire at specified position
   */
  startFire(position: Position): boolean {
    const { x, y, floor } = position;

    if (this.isValidPosition(x, y, floor) &&
        this.buildingMap[x][y][floor] === CellType.WALKABLE) {

      this.buildingMap[x][y][floor] = CellType.FIRE;
      this.firePositions.add(this.positionToKey(position));

      this.updateObservables();
      return true;
    }

    return false;
  }

  /**
   * Simulate fire spreading
   */
  private spreadFire(): void {
    const newFirePositions: Position[] = [];

    for (const fireKey of this.firePositions) {
      const firePos = this.keyToPosition(fireKey);

      // Check 8 adjacent positions
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;

          const newX = firePos.x + dx;
          const newY = firePos.y + dy;
          const newPos = { x: newX, y: newY, floor: firePos.floor };

          if (this.isValidPosition(newX, newY, firePos.floor) &&
              this.buildingMap[newX][newY][firePos.floor] === CellType.WALKABLE &&
              Math.random() < this.fireSpreadRate) {

            newFirePositions.push(newPos);
          }
        }
      }
    }

    // Apply new fire positions
    for (const pos of newFirePositions) {
      this.buildingMap[pos.x][pos.y][pos.floor] = CellType.FIRE;
      this.firePositions.add(this.positionToKey(pos));
    }
  }

  /**
   * Add person to simulation
   */
  addPerson(position: Position, name?: string): Person {
    console.log('BuildingService: Adding person at position:', position);
    console.log('BuildingService: Building map dimensions:', {
      width: this.buildingMap.length,
      height: this.buildingMap[0]?.length || 0,
      floors: this.buildingMap[0]?.[0]?.length || 0
    });

    // Validate position
    if (!this.isValidPosition(position.x, position.y, position.floor)) {
      console.error('Invalid position for person placement:', position);
      throw new Error(`Invalid position: (${position.x}, ${position.y}, ${position.floor})`);
    }

    const cellType = this.buildingMap[position.x][position.y][position.floor];
    console.log('BuildingService: Cell type at position:', cellType);

    if (cellType !== CellType.WALKABLE && cellType !== CellType.STAIRS && cellType !== CellType.EXIT) {
      console.error('Position is not walkable:', position, 'Cell type:', cellType);
      throw new Error(`Position is not walkable (cell type: ${cellType})`);
    }

    const person: Person = {
      id: `person_${Date.now()}_${Math.random()}`,
      name: name || `Person ${this.people.length + 1}`,
      position,
      path: [],
      currentPathIndex: 0,
      isEvacuated: false,
      movementSpeed: 1
    };

    this.people.push(person);
    console.log('BuildingService: Person added successfully:', person);
    this.updateObservables();

    return person;
  }

  /**
   * Remove person from simulation
   */
  removePerson(personId: string): void {
    this.people = this.people.filter(p => p.id !== personId);
    this.updateObservables();
  }

  /**
   * Set evacuation path for person
   */
  setPersonPath(personId: string, path: Position[]): void {
    const person = this.people.find(p => p.id === personId);
    if (person) {
      person.path = path;
      person.currentPathIndex = 0;
      if (path.length > 0) {
        person.targetPosition = path[path.length - 1];
      }
      this.updateObservables();
    }
  }

  /**
   * Move people along their paths
   */
  private movePeople(): void {
    for (const person of this.people) {
      if (person.isEvacuated || person.path.length === 0 || person.trapped) {
        continue;
      }

      // Move along path
      if (person.currentPathIndex < person.path.length - 1) {
        const nextIndex = person.currentPathIndex + person.movementSpeed;
        const targetIndex = Math.min(nextIndex, person.path.length - 1);
        const nextPosition = person.path[targetIndex];
        const { x, y, floor } = nextPosition;
        
        // Don't move if next position is on fire
        if (this.buildingMap[x][y][floor] === CellType.FIRE) {
          // Try to find alternate path to any exit
          const exits = this.getExitPositions();
          let foundPath = false;
          for (const exit of exits) {
            const newPath = this.pathfindingService.findPathAStar(person.position, exit, this.buildingMap);
            if (newPath && newPath.length > 1 && !newPath.some((pos: Position) => this.buildingMap[pos.x][pos.y][pos.floor] === CellType.FIRE)) {
              person.path = newPath;
              person.currentPathIndex = 0;
              foundPath = true;
              break;
            }
          }
          if (!foundPath) {
            person.trapped = true;
            console.warn(`Person ${person.name} is trapped and cannot escape!`);
          }
          continue;
        }
        
        person.currentPathIndex = targetIndex;
        person.position = nextPosition;

        // Check if reached exit
        if (this.buildingMap[x][y][floor] === CellType.EXIT) {
          person.isEvacuated = true;
          console.log(`Person ${person.name} evacuated successfully!`);
        }
      }
    }
  }

  /**
   * Start simulation
   */
  startSimulation(): void {
    if (this.isSimulationRunning) return;

    this.isSimulationRunning = true;
    this.simulationSubscription = interval(this.simulationSpeed).subscribe(() => {
      this.step();
    });

    this.updateObservables();
  }

  /**
   * Stop simulation
   */
  stopSimulation(): void {
    this.isSimulationRunning = false;
    if (this.simulationSubscription) {
      this.simulationSubscription.unsubscribe();
    }

    this.updateObservables();
  }

  /**
   * Reset simulation
   */
  resetSimulation(): void {
    this.stopSimulation();

    // Reset fire
    for (const fireKey of this.firePositions) {
      const pos = this.keyToPosition(fireKey);
      this.buildingMap[pos.x][pos.y][pos.floor] = CellType.WALKABLE;
    }
    this.firePositions.clear();

    // Reset people
    for (const person of this.people) {
      person.isEvacuated = false;
      person.path = [];
      person.currentPathIndex = 0;
    }

    this.timestep = 0;
    this.updateObservables();
  }

  /**
   * Advance simulation by one step
   */
  private step(): void {
    this.spreadFire();
    this.recalculateBlockedPaths();
    this.movePeople();
    this.timestep++;
    this.updateObservables();
  }

  /**
   * Get current building map
   */
  getBuildingMap(): number[][][] {
    return this.buildingMap;
  }

  /**
   * Get all exit positions
   */
  getExitPositions(): Position[] {
    const exits: Position[] = [];

    for (let x = 0; x < this.buildingMap.length; x++) {
      for (let y = 0; y < this.buildingMap[0].length; y++) {
        for (let floor = 0; floor < this.buildingMap[0][0].length; floor++) {
          if (this.buildingMap[x][y][floor] === CellType.EXIT) {
            exits.push({ x, y, floor });
          }
        }
      }
    }

    return exits;
  }

  /**
   * Get building statistics
   */
  getBuildingStats(): BuildingStats {
    const dimensions = {
      width: this.buildingMap.length,
      height: this.buildingMap[0]?.length || 0,
      floors: this.buildingMap[0]?.[0]?.length || 0
    };

    let totalWalkableArea = 0;
    let exits = 0;
    let stairs = 0;

    for (let x = 0; x < dimensions.width; x++) {
      for (let y = 0; y < dimensions.height; y++) {
        for (let floor = 0; floor < dimensions.floors; floor++) {
          const cellType = this.buildingMap[x][y][floor];
          if (cellType === CellType.WALKABLE) totalWalkableArea++;
          else if (cellType === CellType.EXIT) exits++;
          else if (cellType === CellType.STAIRS) stairs++;
        }
      }
    }

    return {
      dimensions,
      totalWalkableArea,
      fireArea: this.firePositions.size,
      exits,
      stairs,
      people: this.people.length,
      evacuatedPeople: this.people.filter(p => p.isEvacuated).length
    };
  }

  /**
   * Update all observables
   */
  private updateObservables(): void {
    this.buildingMapSubject.next([...this.buildingMap]);
    this.firePositionsSubject.next(new Set(this.firePositions));
    this.peopleSubject.next([...this.people]);

    const stats: SimulationStats = {
      timestep: this.timestep,
      totalPeople: this.people.length,
      evacuatedPeople: this.people.filter(p => p.isEvacuated).length,
      peopleRemaining: this.people.filter(p => !p.isEvacuated).length,
      fireArea: this.firePositions.size,
      isRunning: this.isSimulationRunning
    };

    this.simulationStatsSubject.next(stats);
  }

  /**
   * Utility methods
   */
  private isValidPosition(x: number, y: number, floor: number): boolean {
    return x >= 0 && x < this.buildingMap.length &&
           y >= 0 && y < this.buildingMap[0].length &&
           floor >= 0 && floor < this.buildingMap[0][0].length;
  }

  private positionToKey(position: Position): string {
    return `${position.x},${position.y},${position.floor}`;
  }

  private keyToPosition(key: string): Position {
    const [x, y, floor] = key.split(',').map(Number);
    return { x, y, floor };
  }

  /**
   * Configuration setters
   */
  setFireSpreadRate(rate: number): void {
    this.fireSpreadRate = Math.max(0, Math.min(1, rate));
  }

  setSimulationSpeed(speed: number): void {
    this.simulationSpeed = Math.max(100, speed);

    // Restart simulation with new speed if running
    if (this.isSimulationRunning) {
      this.stopSimulation();
      this.startSimulation();
    }
  }

  /**
   * Recalculate (or calculate) evacuation paths for people whose current paths are missing
   * or have become blocked by fire. Attempts to find the safest *shortest* path to ANY exit.
   * If no path can be found the person is marked as `trapped`.
   */
  recalculateBlockedPaths(): void {
    const exits = this.getExitPositions();

    for (const person of this.people) {
      if (person.isEvacuated) {
        continue;
      }

      // Determine whether the person needs a new path
      const hasNoPath = person.path.length === 0;
      const remainingPath = person.path.slice(person.currentPathIndex);
      const pathBlocked = remainingPath.some(pos => this.buildingMap[pos.x][pos.y][pos.floor] === CellType.FIRE);
      if (!hasNoPath && !pathBlocked) {
        // Current path still looks safe – continue using it
        continue;
      }

      console.log(`Recalculating path for ${person.name} – current path ${hasNoPath ? 'missing' : 'blocked'}`);

      let bestPath: Position[] | null = null;
      let shortest = Infinity;

      for (const exit of exits) {
        const candidate = this.pathfindingService.findPathAStar(person.position, exit, this.buildingMap);
        if (candidate && !this.pathfindingService.isPathBlockedByFire(candidate, this.buildingMap)) {
          if (candidate.length < shortest) {
            bestPath = candidate;
            shortest = candidate.length;
          }
        }
      }

      if (bestPath) {
        person.path = bestPath;
        person.currentPathIndex = 0;
        person.trapped = false;
      } else {
        // No viable path – mark as trapped so UI can indicate the issue
        person.trapped = true;
      }
    }
  }
}
