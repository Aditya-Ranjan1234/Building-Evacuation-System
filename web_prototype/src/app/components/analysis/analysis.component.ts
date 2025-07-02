import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BuildingService } from '../../services/building.service';
import { PathfindingService, Position, CellType } from '../../services/pathfinding.service';

interface AlgorithmResult {
  algorithm: string;
  pathLength: number;
  executionTime: number;
  pathFound: boolean;
  floorChanges: number;
  estimatedTime: number;
}

interface TestScenario {
  name: string;
  description: string;
  firePosition: Position;
  personPositions: Position[];
}

interface ComparisonResult {
  scenario: string;
  results: AlgorithmResult[];
  winner: string;
}

@Component({
  selector: 'app-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="analysis-container">
      <div class="header-section">
        <h2>📊 Algorithm Performance Analysis</h2>
        <p>Compare pathfinding algorithms across different evacuation scenarios</p>
      </div>

      <div class="content-grid">
        <!-- Test Configuration -->
        <div class="config-panel">
          <h3>🧪 Test Configuration</h3>
          
          <div class="control-group">
            <label>Building Size</label>
            <div class="input-row">
              <input type="number" [(ngModel)]="buildingWidth" min="10" max="50" placeholder="Width">
              <input type="number" [(ngModel)]="buildingHeight" min="10" max="50" placeholder="Height">
              <input type="number" [(ngModel)]="buildingFloors" min="1" max="5" placeholder="Floors">
            </div>
          </div>

          <div class="control-group">
            <label>Test Scenarios</label>
            <div class="scenario-list">
              <div *ngFor="let scenario of testScenarios; let i = index" 
                   class="scenario-item"
                   [class.selected]="selectedScenarios.has(i)"
                   (click)="toggleScenario(i)">
                <div class="scenario-name">{{scenario.name}}</div>
                <div class="scenario-desc">{{scenario.description}}</div>
              </div>
            </div>
          </div>

          <div class="control-group">
            <label>Algorithms to Test</label>
            <div class="algorithm-list">
              <label class="checkbox-item">
                <input type="checkbox" [(ngModel)]="testAStar">
                <span>A* Algorithm</span>
              </label>
              <label class="checkbox-item">
                <input type="checkbox" [(ngModel)]="testDijkstra">
                <span>Dijkstra's Algorithm</span>
              </label>
              <label class="checkbox-item">
                <input type="checkbox" [(ngModel)]="testBFS">
                <span>Breadth-First Search (BFS)</span>
              </label>
              <label class="checkbox-item">
                <input type="checkbox" [(ngModel)]="testDFS">
                <span>Depth-First Search (DFS)</span>
              </label>
              <label class="checkbox-item">
                <input type="checkbox" [(ngModel)]="testGreedy">
                <span>Greedy Best-First Search</span>
              </label>
              <label class="checkbox-item">
                <input type="checkbox" [(ngModel)]="testBidirectional">
                <span>Bidirectional Search</span>
              </label>
              <label class="checkbox-item">
                <input type="checkbox" [(ngModel)]="testWeightedAStar">
                <span>Weighted A*</span>
              </label>
            </div>
          </div>

          <div class="control-group">
            <button (click)="runAnalysis()" 
                    [disabled]="isRunning || selectedScenarios.size === 0"
                    class="run-button">
              {{isRunning ? '⏳ Running...' : '🚀 Run Analysis'}}
            </button>
          </div>

          <div class="control-group" *ngIf="isRunning">
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="progress"></div>
            </div>
            <div class="progress-text">{{progressText}}</div>
          </div>
        </div>

        <!-- Results Display -->
        <div class="results-panel">
          <h3>📈 Analysis Results</h3>
          
          <div *ngIf="comparisonResults.length === 0 && !isRunning" class="no-results">
            <p>No analysis results yet. Configure and run tests to see performance comparison.</p>
          </div>

          <div *ngFor="let result of comparisonResults" class="result-section">
            <h4>{{result.scenario}}</h4>
            
            <div class="results-table">
              <div class="table-header">
                <div>Algorithm</div>
                <div>Path Length</div>
                <div>Execution Time</div>
                <div>Floor Changes</div>
                <div>Est. Time</div>
                <div>Status</div>
              </div>
              
              <div *ngFor="let algorithmResult of result.results" 
                   class="table-row"
                   [class.winner]="algorithmResult.algorithm === result.winner">
                <div class="algorithm-name">
                  {{algorithmResult.algorithm}}
                  <span *ngIf="algorithmResult.algorithm === result.winner" class="winner-badge">🏆</span>
                </div>
                <div>{{algorithmResult.pathFound ? algorithmResult.pathLength : 'N/A'}}</div>
                <div>{{algorithmResult.executionTime.toFixed(2)}}ms</div>
                <div>{{algorithmResult.pathFound ? algorithmResult.floorChanges : 'N/A'}}</div>
                <div>{{algorithmResult.pathFound ? algorithmResult.estimatedTime.toFixed(1) + 's' : 'N/A'}}</div>
                <div class="status" [class.success]="algorithmResult.pathFound" [class.error]="!algorithmResult.pathFound">
                  {{algorithmResult.pathFound ? '✅ Found' : '❌ Failed'}}
                </div>
              </div>
            </div>
          </div>

          <!-- Summary Statistics -->
          <div *ngIf="comparisonResults.length > 0" class="summary-section">
            <h4>📊 Summary Statistics</h4>
            
            <div class="summary-grid">
              <div class="summary-card">
                <div class="summary-title">Total Tests</div>
                <div class="summary-value">{{getTotalTests()}}</div>
              </div>
              
              <div class="summary-card">
                <div class="summary-title">Successful Paths</div>
                <div class="summary-value">{{getSuccessfulPaths()}}</div>
              </div>
              
              <div class="summary-card">
                <div class="summary-title">Fastest Algorithm</div>
                <div class="summary-value">{{getFastestAlgorithm()}}</div>
              </div>
              
              <div class="summary-card">
                <div class="summary-title">Most Reliable</div>
                <div class="summary-value">{{getMostReliableAlgorithm()}}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .analysis-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header-section {
      text-align: center;
      margin-bottom: 2rem;
    }

    .header-section h2 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .config-panel, .results-panel {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .control-group {
      margin-bottom: 1.5rem;
    }

    .control-group label {
      display: block;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #2c3e50;
    }

    .input-row {
      display: flex;
      gap: 0.5rem;
    }

    .input-row input {
      flex: 1;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .scenario-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .scenario-item {
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .scenario-item:hover {
      background: #f8f9fa;
    }

    .scenario-item.selected {
      background: #e3f2fd;
      border-color: #2196f3;
    }

    .scenario-name {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .scenario-desc {
      font-size: 0.9rem;
      color: #666;
    }

    .algorithm-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .checkbox-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      border: 1px solid #eee;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .checkbox-item:hover {
      background: #f8f9fa;
    }

    .run-button {
      width: 100%;
      padding: 1rem;
      background: #27ae60;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .run-button:hover:not(:disabled) {
      background: #229954;
    }

    .run-button:disabled {
      background: #bdc3c7;
      cursor: not-allowed;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: #ecf0f1;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: #3498db;
      transition: width 0.3s;
    }

    .progress-text {
      text-align: center;
      margin-top: 0.5rem;
      font-size: 0.9rem;
      color: #666;
    }

    .results-table {
      border: 1px solid #ddd;
      border-radius: 4px;
      overflow: hidden;
    }

    .table-header {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
      background: #34495e;
      color: white;
      font-weight: 600;
      padding: 0.75rem;
    }

    .table-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
      padding: 0.75rem;
      border-bottom: 1px solid #eee;
      transition: background 0.2s;
    }

    .table-row:hover {
      background: #f8f9fa;
    }

    .table-row.winner {
      background: #e8f5e8;
      border-left: 4px solid #27ae60;
    }

    .algorithm-name {
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .winner-badge {
      color: #f39c12;
      font-size: 1.2rem;
    }

    .status.success {
      color: #27ae60;
      font-weight: 600;
    }

    .status.error {
      color: #e74c3c;
      font-weight: 600;
    }

    .summary-section {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 2px solid #ecf0f1;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .summary-card {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 4px;
      text-align: center;
    }

    .summary-title {
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 0.5rem;
    }

    .summary-value {
      font-size: 1.5rem;
      font-weight: 600;
      color: #2c3e50;
    }

    .no-results {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    @media (max-width: 768px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
      
      .table-header, .table-row {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }
      
      .table-header > div {
        font-weight: 600;
        color: #2c3e50;
      }
    }
  `]
})
export class AnalysisComponent implements OnInit {
  // Building configuration
  buildingWidth = 20;
  buildingHeight = 20;
  buildingFloors = 3;

  // Test scenarios
  testScenarios: TestScenario[] = [
    {
      name: "Ground Floor Fire",
      description: "Fire starts on ground floor, testing basic evacuation",
      firePosition: { x: 5, y: 5, floor: 0 },
      personPositions: [
        { x: 10, y: 10, floor: 0 },
        { x: 15, y: 15, floor: 1 },
        { x: 8, y: 12, floor: 2 }
      ]
    },
    {
      name: "Multi-Floor Fire",
      description: "Fire spreads across multiple floors",
      firePosition: { x: 10, y: 10, floor: 1 },
      personPositions: [
        { x: 5, y: 5, floor: 0 },
        { x: 15, y: 15, floor: 1 },
        { x: 8, y: 12, floor: 2 }
      ]
    },
    {
      name: "Exit Blocked",
      description: "Fire blocks primary exit, testing alternate routes",
      firePosition: { x: 18, y: 18, floor: 0 },
      personPositions: [
        { x: 5, y: 5, floor: 0 },
        { x: 10, y: 10, floor: 1 }
      ]
    },
    {
      name: "High Traffic",
      description: "Multiple people evacuating simultaneously",
      firePosition: { x: 8, y: 8, floor: 1 },
      personPositions: [
        { x: 3, y: 3, floor: 0 },
        { x: 7, y: 7, floor: 0 },
        { x: 12, y: 12, floor: 1 },
        { x: 16, y: 16, floor: 1 },
        { x: 5, y: 15, floor: 2 }
      ]
    }
  ];

  selectedScenarios = new Set<number>([0, 1]); // Default selection

  // Algorithm selection
  testAStar = true;
  testDijkstra = true;
  testBFS = false;
  testDFS = false;
  testGreedy = false;
  testBidirectional = false;
  testWeightedAStar = false;

  isRunning = false;
  progress = 0;
  progressText = '';
  comparisonResults: ComparisonResult[] = [];

  constructor(
    private buildingService: BuildingService,
    private pathfindingService: PathfindingService
  ) {}

  ngOnInit(): void {
    this.initializeTestScenarios();
    // Automatically run analysis on init if no results are present
    if (this.comparisonResults.length === 0) {
      this.runAnalysis();
    }
  }

  trackByScenario(index: number, scenario: TestScenario): string {
    return scenario.name + index;
  }

  trackByComparisonResult(index: number, result: ComparisonResult): string {
    return result.scenario + index;
  }

  trackByAlgorithmResult(index: number, result: AlgorithmResult): string {
    return result.algorithm + index;
  }

  /**
   * Prepare test scenarios. If scenarios are already defined (e.g. via the
   * default hard-coded list above) we leave them untouched. This prevents the
   * placeholder array that previously overrode the real scenarios from wiping
   * them out and breaking the analysis view.
   */
  initializeTestScenarios(): void {
    if (this.testScenarios.length === 0) {
      // Fallback in case the default scenarios are ever removed.
      this.testScenarios = [
        {
          name: 'Default Scenario',
          description: 'Fallback scenario when none provided',
          firePosition: { x: 5, y: 5, floor: 0 },
          personPositions: [{ x: 10, y: 10, floor: 0 }]
        }
      ];
    }

    // Ensure the selectedScenarios set reflects current scenarios
    this.selectedScenarios.clear();
    this.testScenarios.forEach((_, i) => this.selectedScenarios.add(i));

    // Ensure at least A* and Dijkstra are enabled by default; leave others off by default
    this.testAStar = true;
    this.testDijkstra = true;
    this.testBFS = false;
    this.testDFS = false;
    this.testGreedy = false;
    this.testBidirectional = false;
    this.testWeightedAStar = false;
  }

  toggleScenario(index: number): void {
    if (this.selectedScenarios.has(index)) {
      this.selectedScenarios.delete(index);
    } else {
      this.selectedScenarios.add(index);
    }
  }

  async runAnalysis(): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;
    this.progress = 0;
    this.comparisonResults = [];
    let relocatedPeople = false;

    const selectedAlgorithms = this.getSelectedAlgorithms();
    const selectedScenarios = Array.from(this.selectedScenarios).map(i => this.testScenarios[i]);

    const totalTests = selectedScenarios.length * selectedAlgorithms.length;
    let completedTests = 0;

    try {
      for (const scenario of selectedScenarios) {
        this.progressText = `Testing scenario: ${scenario.name}`;

        // Reset building
        this.buildingService.initializeBuilding(
          this.buildingWidth,
          this.buildingHeight,
          this.buildingFloors
        );

        // Start fire
        this.buildingService.startFire(scenario.firePosition);

        // Add people, relocating if needed
        scenario.personPositions.forEach(pos => {
          let validPos = { ...pos };
          const map = this.buildingService.getBuildingMap();
          const cellType = map[validPos.x]?.[validPos.y]?.[validPos.floor];
          if (cellType !== CellType.WALKABLE) {
            // Find nearest walkable cell in the entire building
            let minDist = Infinity;
            let foundPos = null;
            for (let x = 0; x < this.buildingWidth; x++) {
              for (let y = 0; y < this.buildingHeight; y++) {
                for (let f = 0; f < this.buildingFloors; f++) {
                  if (map[x]?.[y]?.[f] === CellType.WALKABLE) {
                    const dist = Math.abs(x - pos.x) + Math.abs(y - pos.y) + Math.abs(f - pos.floor);
                    if (dist < minDist) {
                      minDist = dist;
                      foundPos = { x, y, floor: f };
                    }
                  }
                }
              }
            }
            if (foundPos) {
              validPos = foundPos;
              relocatedPeople = true;
            } else {
              // No walkable cell found, skip this person
              return;
            }
          }
          this.buildingService.addPerson(validPos);
        });
        
        const result = await this.testScenario(scenario);
        this.comparisonResults.push(result);
        completedTests += selectedAlgorithms.length;
        this.progress = (completedTests / totalTests) * 100;
      }
      this.progressText = 'Analysis completed!';
      if (relocatedPeople) {
        alert('Some people were relocated to the nearest walkable cell for analysis.');
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      this.progressText = 'Analysis failed!';
    } finally {
      this.isRunning = false;
    }
  }

  private getSelectedAlgorithms(): string[] {
    const algorithms: string[] = [];
    if (this.testAStar) algorithms.push('A*');
    if (this.testDijkstra) algorithms.push('Dijkstra');
    if (this.testBFS) algorithms.push('BFS');
    if (this.testDFS) algorithms.push('DFS');
    if (this.testGreedy) algorithms.push('Greedy BFS');
    if (this.testBidirectional) algorithms.push('Bidirectional');
    if (this.testWeightedAStar) algorithms.push('Weighted A*');
    return algorithms;
  }

  /**
   * Execute algorithm tests for a given scenario. This function now performs
   * person-placement validation (relocation if needed) in the same way as the
   * outer loop so that we don’t attempt to spawn people on non-walkable cells
   * when the scenario is executed individually.
   */
  private async testScenario(scenario: TestScenario): Promise<ComparisonResult> {
    // Reset building
    this.buildingService.initializeBuilding(
      this.buildingWidth,
      this.buildingHeight,
      this.buildingFloors
    );

    // Start fire
    this.buildingService.startFire(scenario.firePosition);

    // Add people (relocate if starting cell isn’t walkable)
    scenario.personPositions.forEach(pos => {
      let validPos = { ...pos };
      const map = this.buildingService.getBuildingMap();
      const cellType = map[validPos.x]?.[validPos.y]?.[validPos.floor];
      if (cellType !== CellType.WALKABLE && cellType !== CellType.STAIRS && cellType !== CellType.EXIT) {
        // Find nearest walkable cell in the entire building
        let minDist = Infinity;
        let foundPos: Position | null = null;
        for (let x = 0; x < this.buildingWidth; x++) {
          for (let y = 0; y < this.buildingHeight; y++) {
            for (let f = 0; f < this.buildingFloors; f++) {
              if (map[x]?.[y]?.[f] === CellType.WALKABLE || map[x]?.[y]?.[f] === CellType.STAIRS || map[x]?.[y]?.[f] === CellType.EXIT) {
                const dist = Math.abs(x - pos.x) + Math.abs(y - pos.y) + Math.abs(f - pos.floor);
                if (dist < minDist) {
                  minDist = dist;
                  foundPos = { x, y, floor: f };
                }
              }
            }
          }
        }
        if (foundPos) {
          validPos = foundPos;
        } else {
          // No walkable cell found – skip this person
          return;
        }
      }
      this.buildingService.addPerson(validPos);
    });

    const buildingMap = this.buildingService.getBuildingMap();
    const exits = this.buildingService.getExitPositions();
    const selectedAlgorithms = this.getSelectedAlgorithms();

    const results: AlgorithmResult[] = [];

    for (const algorithmName of selectedAlgorithms) {
      const result = await this.testAlgorithm(algorithmName, scenario.personPositions[0], exits, buildingMap);
      results.push(result);
    }

    const winner = this.determineWinner(results);

    return {
      scenario: scenario.name,
      results,
      winner
    };
  }

  private async testAlgorithm(
    algorithmName: string, 
    startPos: Position, 
    exits: Position[], 
    buildingMap: number[][][]
  ): Promise<AlgorithmResult> {
    const startTime = performance.now();
    let path: Position[] | null = null;
    let pathFound = false;

    try {
      // Find closest exit
      let bestPath: Position[] | null = null;
      let minDistance = Infinity;

      for (const exit of exits) {
        let currentPath: Position[] | null = null;

        switch (algorithmName) {
          case "A*":
            currentPath = this.pathfindingService.findPathAStar(startPos, exit, buildingMap);
            break;
          case "Dijkstra":
            currentPath = this.pathfindingService.findPathDijkstra(startPos, exit, buildingMap);
            break;
          case "BFS":
            currentPath = this.pathfindingService.findPathBFS(startPos, exit, buildingMap);
            break;
          case "DFS":
            currentPath = this.pathfindingService.findPathDFS(startPos, exit, buildingMap);
            break;
          case "Greedy BFS":
            currentPath = this.pathfindingService.findPathGreedyBestFirst(startPos, exit, buildingMap);
            break;
          case "Bidirectional":
            currentPath = this.pathfindingService.findPathBidirectional(startPos, exit, buildingMap);
            break;
          case "Weighted A*":
            currentPath = this.pathfindingService.findPathAStarWeighted(startPos, exit, buildingMap, 1.5);
            break;
          default:
            currentPath = null;
        }

        if (currentPath && currentPath.length < minDistance) {
          minDistance = currentPath.length;
          bestPath = currentPath;
        }
      }

      path = bestPath;
      pathFound = path !== null;

    } catch (error) {
      console.error(`Error testing ${algorithmName}:`, error);
      pathFound = false;
    }

    const executionTime = performance.now() - startTime;

    let pathLength = 0;
    let floorChanges = 0;
    let estimatedTime = 0;

    if (path && path.length > 0) {
      pathLength = path.length;
      const stats = this.pathfindingService.calculatePathStats(path);
      floorChanges = stats.floorChanges;
      estimatedTime = stats.estimatedTime;
    }

    return {
      algorithm: algorithmName,
      pathLength,
      executionTime,
      pathFound,
      floorChanges,
      estimatedTime
    };
  }

  private determineWinner(results: AlgorithmResult[]): string {
    const successfulResults = results.filter(r => r.pathFound);
    
    if (successfulResults.length === 0) {
      return 'None';
    }

    // Sort by execution time (faster is better)
    successfulResults.sort((a, b) => a.executionTime - b.executionTime);
    
    return successfulResults[0].algorithm;
  }

  getTotalTests(): number {
    return this.comparisonResults.reduce((total, result) => total + result.results.length, 0);
  }

  getSuccessfulPaths(): number {
    return this.comparisonResults.reduce((total, result) => 
      total + result.results.filter(r => r.pathFound).length, 0);
  }

  getFastestAlgorithm(): string {
    const allResults = this.comparisonResults.flatMap(r => r.results);
    const successful = allResults.filter(r => r.pathFound);
    
    if (successful.length === 0) return 'None';
    
    const fastest = successful.reduce((min, current) => 
      current.executionTime < min.executionTime ? current : min);
    
    return fastest.algorithm;
  }

  getMostReliableAlgorithm(): string {
    const allResults = this.comparisonResults.flatMap(r => r.results);
    const algorithmStats = new Map<string, { success: number; total: number }>();
    
    allResults.forEach(result => {
      const stats = algorithmStats.get(result.algorithm) || { success: 0, total: 0 };
      stats.total++;
      if (result.pathFound) stats.success++;
      algorithmStats.set(result.algorithm, stats);
    });
    
    let mostReliable = 'None';
    let bestRate = 0;
    
    algorithmStats.forEach((stats, algorithm) => {
      const rate = stats.success / stats.total;
      if (rate > bestRate) {
        bestRate = rate;
        mostReliable = algorithm;
      }
    });
    
    return mostReliable;
  }
}
