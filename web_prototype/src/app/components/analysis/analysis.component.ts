import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BuildingService } from '../../services/building.service';
import { PathfindingService, Position } from '../../services/pathfinding.service';

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
                <div class="summary-title">A* Wins</div>
                <div class="summary-value">{{getAlgorithmWins('A*')}}</div>
              </div>
              
              <div class="summary-card">
                <div class="summary-title">Dijkstra Wins</div>
                <div class="summary-value">{{getAlgorithmWins('Dijkstra')}}</div>
              </div>
              
              <div class="summary-card">
                <div class="summary-title">Avg A* Time</div>
                <div class="summary-value">{{getAverageTime('A*').toFixed(2)}}ms</div>
              </div>
              
              <div class="summary-card">
                <div class="summary-title">Avg Dijkstra Time</div>
                <div class="summary-value">{{getAverageTime('Dijkstra').toFixed(2)}}ms</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Algorithm Information -->
      <div class="info-section">
        <h3>ℹ️ Algorithm Information</h3>
        
        <div class="algorithm-cards">
          <div class="algorithm-card">
            <h4>A* Algorithm</h4>
            <div class="algorithm-details">
              <p><strong>Time Complexity:</strong> O((V + E) log V)</p>
              <p><strong>Space Complexity:</strong> O(V)</p>
              <p><strong>Best Use Case:</strong> When you have a good heuristic function</p>
              <p><strong>Advantages:</strong> Fast, optimal paths, heuristic-guided search</p>
              <p><strong>Disadvantages:</strong> Performance depends on heuristic quality</p>
            </div>
          </div>
          
          <div class="algorithm-card">
            <h4>Dijkstra's Algorithm</h4>
            <div class="algorithm-details">
              <p><strong>Time Complexity:</strong> O((V + E) log V)</p>
              <p><strong>Space Complexity:</strong> O(V)</p>
              <p><strong>Best Use Case:</strong> When you need guaranteed shortest paths</p>
              <p><strong>Advantages:</strong> Optimal, no heuristic needed, explores uniformly</p>
              <p><strong>Disadvantages:</strong> No heuristic guidance, explores many nodes</p>
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
      
      h2 {
        color: #2c3e50;
        margin-bottom: 0.5rem;
      }
      
      p {
        color: #7f8c8d;
        font-size: 1.1rem;
      }
    }

    .content-grid {
      display: grid;
      grid-template-columns: 350px 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .config-panel, .results-panel {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .config-panel h3, .results-panel h3 {
      color: #2c3e50;
      margin-bottom: 1.5rem;
      font-size: 1.2rem;
    }

    .control-group {
      margin-bottom: 1.5rem;
      
      label {
        display: block;
        color: #555;
        font-weight: 500;
        margin-bottom: 0.5rem;
      }
    }

    .input-row {
      display: flex;
      gap: 0.5rem;
      
      input {
        flex: 1;
        padding: 0.5rem;
        border: 2px solid #e0e0e0;
        border-radius: 6px;
        font-size: 0.9rem;
        
        &:focus {
          outline: none;
          border-color: #667eea;
        }
      }
    }

    .scenario-list {
      max-height: 200px;
      overflow-y: auto;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
    }

    .scenario-item {
      padding: 0.75rem;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:hover {
        background: #f8f9fa;
      }
      
      &.selected {
        background: #667eea;
        color: white;
      }
      
      &:last-child {
        border-bottom: none;
      }
    }

    .scenario-name {
      font-weight: 500;
      margin-bottom: 0.25rem;
    }

    .scenario-desc {
      font-size: 0.85rem;
      opacity: 0.8;
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
      cursor: pointer;
      
      input[type="checkbox"] {
        margin: 0;
      }
    }

    .run-button {
      width: 100%;
      padding: 0.75rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
      }
      
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      transition: width 0.3s ease;
    }

    .progress-text {
      text-align: center;
      font-size: 0.9rem;
      color: #666;
    }

    .no-results {
      text-align: center;
      color: #999;
      padding: 2rem;
      font-style: italic;
    }

    .result-section {
      margin-bottom: 2rem;
      
      h4 {
        color: #2c3e50;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #e0e0e0;
      }
    }

    .results-table {
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      overflow: hidden;
    }

    .table-header, .table-row {
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr 1fr;
      gap: 1rem;
      padding: 0.75rem;
      align-items: center;
    }

    .table-header {
      background: #f8f9fa;
      font-weight: 500;
      color: #555;
      font-size: 0.9rem;
    }

    .table-row {
      border-top: 1px solid #f0f0f0;
      
      &.winner {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
      }
    }

    .algorithm-name {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
    }

    .winner-badge {
      font-size: 0.8rem;
    }

    .status {
      font-size: 0.9rem;
      
      &.success {
        color: #00b894;
      }
      
      &.error {
        color: #ff6b6b;
      }
    }

    .summary-section {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 2px solid #e0e0e0;
      
      h4 {
        color: #2c3e50;
        margin-bottom: 1rem;
      }
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }

    .summary-card {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 6px;
      text-align: center;
      
      .summary-title {
        font-size: 0.85rem;
        color: #666;
        margin-bottom: 0.5rem;
      }
      
      .summary-value {
        font-size: 1.5rem;
        font-weight: 600;
        color: #2c3e50;
      }
    }

    .info-section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      
      h3 {
        color: #2c3e50;
        margin-bottom: 1.5rem;
      }
    }

    .algorithm-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .algorithm-card {
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      padding: 1.5rem;
      
      h4 {
        color: #667eea;
        margin-bottom: 1rem;
      }
      
      .algorithm-details p {
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
        
        strong {
          color: #2c3e50;
        }
      }
    }

    @media (max-width: 1024px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
      
      .algorithm-cards {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AnalysisComponent implements OnInit {
  // Configuration
  buildingWidth = 20;
  buildingHeight = 20;
  buildingFloors = 3;
  
  testAStar = true;
  testDijkstra = true;
  
  // Test scenarios
  testScenarios: TestScenario[] = [
    {
      name: 'Ground Floor Fire',
      description: 'Fire starts on ground floor, people on upper floors',
      firePosition: { x: 5, y: 5, floor: 0 },
      personPositions: [
        { x: 15, y: 15, floor: 1 },
        { x: 8, y: 12, floor: 2 },
        { x: 12, y: 8, floor: 1 }
      ]
    },
    {
      name: 'Central Fire',
      description: 'Fire blocks main stairwell area',
      firePosition: { x: 10, y: 10, floor: 1 },
      personPositions: [
        { x: 5, y: 5, floor: 0 },
        { x: 15, y: 15, floor: 2 },
        { x: 3, y: 17, floor: 1 }
      ]
    },
    {
      name: 'Top Floor Fire',
      description: 'Fire starts on top floor, affects evacuation routes',
      firePosition: { x: 15, y: 15, floor: 2 },
      personPositions: [
        { x: 5, y: 5, floor: 2 },
        { x: 8, y: 12, floor: 1 },
        { x: 12, y: 8, floor: 0 }
      ]
    },
    {
      name: 'Multiple Exits Test',
      description: 'Test pathfinding with multiple available exits',
      firePosition: { x: 8, y: 8, floor: 0 },
      personPositions: [
        { x: 3, y: 3, floor: 0 },
        { x: 17, y: 17, floor: 0 },
        { x: 10, y: 15, floor: 1 }
      ]
    }
  ];
  
  selectedScenarios = new Set<number>([0, 1]); // Default selection
  
  // Analysis state
  isRunning = false;
  progress = 0;
  progressText = '';
  comparisonResults: ComparisonResult[] = [];

  constructor(
    private buildingService: BuildingService,
    private pathfindingService: PathfindingService
  ) {}

  ngOnInit(): void {
    // Initialize with default building
    this.buildingService.initializeBuilding(
      this.buildingWidth, 
      this.buildingHeight, 
      this.buildingFloors
    );
  }

  toggleScenario(index: number): void {
    if (this.selectedScenarios.has(index)) {
      this.selectedScenarios.delete(index);
    } else {
      this.selectedScenarios.add(index);
    }
  }

  async runAnalysis(): Promise<void> {
    if (this.isRunning || this.selectedScenarios.size === 0) return;
    
    this.isRunning = true;
    this.progress = 0;
    this.comparisonResults = [];
    
    // Regenerate building for consistent testing
    this.buildingService.initializeBuilding(
      this.buildingWidth, 
      this.buildingHeight, 
      this.buildingFloors
    );
    
    const selectedScenarioIndices = Array.from(this.selectedScenarios);
    const totalTests = selectedScenarioIndices.length;
    
    for (let i = 0; i < selectedScenarioIndices.length; i++) {
      const scenarioIndex = selectedScenarioIndices[i];
      const scenario = this.testScenarios[scenarioIndex];
      
      this.progressText = `Testing scenario: ${scenario.name}`;
      this.progress = (i / totalTests) * 100;
      
      // Small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = await this.testScenario(scenario);
      this.comparisonResults.push(result);
    }
    
    this.progress = 100;
    this.progressText = 'Analysis complete!';
    this.isRunning = false;
  }

  private async testScenario(scenario: TestScenario): Promise<ComparisonResult> {
    // Reset building and add fire
    this.buildingService.resetSimulation();
    this.buildingService.startFire(scenario.firePosition);
    
    const buildingMap = this.buildingService.getBuildingMap();
    const exits = this.buildingService.getExitPositions();
    
    const results: AlgorithmResult[] = [];
    
    // Test each algorithm
    for (const personPos of scenario.personPositions) {
      if (this.testAStar) {
        const astarResult = await this.testAlgorithm('A*', personPos, exits, buildingMap);
        results.push(astarResult);
      }
      
      if (this.testDijkstra) {
        const dijkstraResult = await this.testAlgorithm('Dijkstra', personPos, exits, buildingMap);
        results.push(dijkstraResult);
      }
    }
    
    // Determine winner (algorithm with best average performance)
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
    let bestPath: Position[] | null = null;
    let totalTime = 0;
    
    // Test pathfinding to each exit and pick the best
    for (const exit of exits) {
      const startTime = performance.now();
      
      let path: Position[] | null = null;
      if (algorithmName === 'A*') {
        path = this.pathfindingService.findPathAStar(startPos, exit, buildingMap);
      } else if (algorithmName === 'Dijkstra') {
        path = this.pathfindingService.findPathDijkstra(startPos, exit, buildingMap);
      }
      
      const endTime = performance.now();
      totalTime += endTime - startTime;
      
      if (path && (!bestPath || path.length < bestPath.length)) {
        bestPath = path;
      }
    }
    
    const pathStats = bestPath ? this.pathfindingService.calculatePathStats(bestPath) : {
      length: 0,
      floorChanges: 0,
      estimatedTime: 0
    };
    
    return {
      algorithm: algorithmName,
      pathLength: pathStats.length,
      executionTime: totalTime,
      pathFound: bestPath !== null,
      floorChanges: pathStats.floorChanges,
      estimatedTime: pathStats.estimatedTime
    };
  }

  private determineWinner(results: AlgorithmResult[]): string {
    const algorithmScores = new Map<string, number>();
    
    // Group results by algorithm
    const algorithmGroups = new Map<string, AlgorithmResult[]>();
    for (const result of results) {
      if (!algorithmGroups.has(result.algorithm)) {
        algorithmGroups.set(result.algorithm, []);
      }
      algorithmGroups.get(result.algorithm)!.push(result);
    }
    
    // Calculate average scores for each algorithm
    for (const [algorithm, algorithmResults] of algorithmGroups) {
      const validResults = algorithmResults.filter(r => r.pathFound);
      if (validResults.length === 0) {
        algorithmScores.set(algorithm, Infinity);
        continue;
      }
      
      const avgTime = validResults.reduce((sum, r) => sum + r.executionTime, 0) / validResults.length;
      const avgLength = validResults.reduce((sum, r) => sum + r.pathLength, 0) / validResults.length;
      
      // Combined score (lower is better)
      const score = avgTime + avgLength * 10; // Weight path length more heavily
      algorithmScores.set(algorithm, score);
    }
    
    // Find algorithm with lowest score
    let winner = '';
    let bestScore = Infinity;
    
    for (const [algorithm, score] of algorithmScores) {
      if (score < bestScore) {
        bestScore = score;
        winner = algorithm;
      }
    }
    
    return winner;
  }

  // Summary statistics methods
  getTotalTests(): number {
    return this.comparisonResults.length;
  }

  getAlgorithmWins(algorithm: string): number {
    return this.comparisonResults.filter(r => r.winner === algorithm).length;
  }

  getAverageTime(algorithm: string): number {
    const allResults = this.comparisonResults.flatMap(r => r.results);
    const algorithmResults = allResults.filter(r => r.algorithm === algorithm && r.pathFound);
    
    if (algorithmResults.length === 0) return 0;
    
    const totalTime = algorithmResults.reduce((sum, r) => sum + r.executionTime, 0);
    return totalTime / algorithmResults.length;
  }
}
