# Building Evacuation System - Web Prototype

## Overview

This prototype implements a modern web-based building evacuation simulation using Angular and Three.js. It provides an interactive 3D visualization with a comprehensive suite of pathfinding algorithms and comprehensive performance analysis.

## Features

### 🌐 Modern Web Interface
- **Angular 17**: Latest Angular framework with standalone components
- **Three.js**: Hardware-accelerated 3D graphics
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Reactive data flow with RxJS observables

### 🏢 Advanced Building Simulation
- **Interactive 3D Building**: Click and drag to navigate
- **Dynamic Fire Simulation**: Real-time fire spread with visual effects
- **Multi-floor Support**: Up to 10 floors with stair connections
- **Realistic Layouts**: Procedurally generated rooms and corridors

### 🤖 Comprehensive Pathfinding Algorithms

#### 📚 Basic Algorithms
- **A* Algorithm**: Heuristic-based optimal pathfinding
- **Dijkstra's Algorithm**: Guaranteed shortest path finding
- **Breadth-First Search (BFS)**: Uniform cost, optimal for unweighted graphs
- **Depth-First Search (DFS)**: Explores all routes (not optimal for shortest path)
- **Greedy Best-First Search**: Uses heuristic, faster but not always optimal

#### 🚀 Advanced Algorithms
- **Bidirectional Search**: Runs search from both source and goal
- **Jump Point Search (JPS)**: Optimized A* for uniform-cost grids
- **Theta***: Variant of A* allowing any-angle movement
- **Fringe Search**: Memory-efficient alternative to A*

#### ⚡ Dynamic/Real-time Algorithms
- **Anytime A* / ARA***: Returns good-enough path quickly and improves over time
- **Weighted A***: Adjustable heuristic weight for performance tuning

#### 🧠 Bio-Inspired/Evolutionary Algorithms
- **Ant Colony Optimization (ACO)**: Agents find optimal paths via pheromone trails
- **Genetic Algorithms (GA)**: Evolves a set of possible paths
- **Swarm Intelligence**: Models collective behavior for crowd evacuation

### 📊 Comprehensive Analysis
- **Algorithm Comparison**: Side-by-side performance analysis of all algorithms
- **Multiple Test Scenarios**: Predefined and custom test cases
- **Statistical Reports**: Execution time, path length, success rates
- **Visual Charts**: Interactive performance visualizations

### 🎮 Interactive Controls
- **Drag & Drop**: Place people and fire with mouse
- **Real-time Configuration**: Adjust simulation parameters on the fly
- **Camera Controls**: 360° navigation, zoom, and preset views
- **Export Capabilities**: Save simulation states and results

## Installation

### Prerequisites
- **Node.js**: 18.0 or higher
- **npm**: 9.0 or higher
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+

### Quick Start

1. **Navigate to web prototype directory:**
   ```bash
   cd web_prototype
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm start
   ```

4. **Open browser:**
   ```
   http://localhost:4200
   ```

### Production Build

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Usage Guide

### 🎮 Simulation Mode

1. **Building Setup**
   - Configure building dimensions (width × height × floors)
   - Click "Regenerate Building" to create new layout
   - Building automatically includes rooms, corridors, stairs, and exits

2. **People Management**
   - Enter coordinates (X, Y, Floor) for person placement
   - Click "Add Person" to place evacuation candidates
   - People appear as blue capsules in 3D view

3. **Fire Control**
   - Set fire starting position with coordinates
   - Adjust fire spread rate (0-100%)
   - Click "Start Fire" to begin fire simulation
   - Fire appears as red spheres with lighting effects

4. **Path Planning**
   - Click "Calculate Paths" to compute evacuation routes
   - Primary paths shown in red, alternates in blue
   - Paths automatically update when fire blocks routes

5. **Simulation Control**
   - Adjust simulation speed (100-3000ms per step)
   - Start/pause simulation with play button
   - Reset to clear fire and return people to start positions

### 📊 Analysis Mode

1. **Test Configuration**
   - Set building dimensions for consistent testing
   - Select test scenarios from predefined list
   - Choose algorithms to compare (all available algorithms)

2. **Running Analysis**
   - Click "Run Analysis" to start automated testing
   - Progress bar shows current test status
   - Results appear in real-time as tests complete

3. **Results Interpretation**
   - **Path Length**: Total distance of evacuation route
   - **Execution Time**: Algorithm computation time in milliseconds
   - **Floor Changes**: Number of times path changes floors
   - **Estimated Time**: Real-world evacuation time estimate
   - **Winner**: Algorithm with best overall performance

### 🎨 3D Visualization Controls

| Control | Action |
|---------|--------|
| **Mouse Drag** | Rotate camera around building |
| **Mouse Wheel** | Zoom in/out |
| **Reset View** | Return to default camera position |
| **Toggle Shadows** | Enable/disable realistic lighting |
| **Toggle Animation** | Enable/disable fire flickering effects |

## Architecture

### Component Structure
```
src/app/
├── components/
│   ├── simulation/          # Main simulation interface
│   └── analysis/            # Algorithm performance analysis
├── services/
│   ├── building.service.ts  # Building and fire simulation
│   ├── pathfinding.service.ts # All pathfinding algorithms
│   └── three-visualization.service.ts # 3D rendering
└── app.component.ts         # Root component with navigation
```

### Service Architecture

#### BuildingService
- **Reactive State Management**: RxJS observables for real-time updates
- **Building Generation**: Procedural layout creation
- **Fire Simulation**: Dynamic spread with configurable parameters
- **Person Management**: Add, remove, and track evacuation candidates

#### PathfindingService
- **Comprehensive Algorithm Implementations**: All basic, advanced, and bio-inspired algorithms
- **Path Validation**: Check for fire blockages and recalculate
- **Performance Metrics**: Detailed statistics for analysis
- **Multi-path Support**: Primary and alternate route calculation
- **Algorithm Comparison**: Side-by-side performance analysis

#### ThreeVisualizationService
- **3D Rendering**: Hardware-accelerated graphics with Three.js
- **Real-time Updates**: Efficient scene graph management
- **Interactive Controls**: Mouse/touch navigation
- **Visual Effects**: Lighting, shadows, and animations

## Algorithm Details

### 📚 Basic Algorithms

#### A* Implementation
```typescript
// Heuristic function for 3D pathfinding
calculateHeuristic(pos1: Position, pos2: Position): number {
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;
  const dz = (pos2.floor - pos1.floor) * 10; // Floor penalty
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
```

**Features:**
- 3D Euclidean distance heuristic
- Floor change penalties
- 8-directional movement
- Stair traversal support
- **Time Complexity**: O((V + E) log V)
- **Space Complexity**: O(V)

#### Dijkstra Implementation
```typescript
// Guaranteed shortest path without heuristic
findPathDijkstra(start: Position, goal: Position, buildingMap: number[][][])
```

**Features:**
- Uniform cost search
- Optimal path guarantee
- No heuristic bias
- Complete graph exploration
- **Time Complexity**: O((V + E) log V)
- **Space Complexity**: O(V)

#### Breadth-First Search (BFS)
```typescript
findPathBFS(start: Position, goal: Position, buildingMap: number[][][])
```

**Features:**
- Guaranteed shortest path in unweighted graphs
- Explores all nodes at current depth before moving deeper
- **Time Complexity**: O(V + E)
- **Space Complexity**: O(V)

#### Depth-First Search (DFS)
```typescript
findPathDFS(start: Position, goal: Position, buildingMap: number[][][])
```

**Features:**
- Explores deep paths first
- Not optimal for shortest path
- Good for exploring all possible routes
- **Time Complexity**: O(V + E)
- **Space Complexity**: O(V)

#### Greedy Best-First Search
```typescript
findPathGreedyBestFirst(start: Position, goal: Position, buildingMap: number[][][])
```

**Features:**
- Uses only heuristic function
- Fast but not always optimal
- Good for quick approximate solutions
- **Time Complexity**: O((V + E) log V)
- **Space Complexity**: O(V)

### 🚀 Advanced Algorithms

#### Bidirectional Search
```typescript
findPathBidirectional(start: Position, goal: Position, buildingMap: number[][][])
```

**Features:**
- Searches from both start and goal simultaneously
- Efficient when goal is known
- **Time Complexity**: O(b^(d/2)) where b is branching factor, d is depth
- **Space Complexity**: O(b^(d/2))

#### Jump Point Search (JPS)
```typescript
findPathJPS(start: Position, goal: Position, buildingMap: number[][][])
```

**Features:**
- Optimized A* for uniform-cost grids
- Skips unnecessary nodes
- **Time Complexity**: O(log n) in open areas
- **Space Complexity**: O(n)

#### Theta*
```typescript
findPathThetaStar(start: Position, goal: Position, buildingMap: number[][][])
```

**Features:**
- Any-angle movement
- Smoother paths than grid-based algorithms
- **Time Complexity**: O((V + E) log V)
- **Space Complexity**: O(V)

#### Fringe Search
```typescript
findPathFringe(start: Position, goal: Position, buildingMap: number[][][])
```

**Features:**
- Memory-efficient alternative to A*
- Good for large-scale maps
- **Time Complexity**: O((V + E) log V)
- **Space Complexity**: O(V)

### ⚡ Dynamic/Real-time Algorithms

#### Anytime A* / ARA*
```typescript
findPathAnytimeAStar(start: Position, goal: Position, buildingMap: number[][][], timeLimitMs: number = 100)
```

**Features:**
- Returns good-enough path quickly
- Improves solution over time
- Good for real-time applications
- **Time Complexity**: Variable (improves over time)
- **Space Complexity**: O(V)

#### Weighted A*
```typescript
findPathAStarWeighted(start: Position, goal: Position, buildingMap: number[][][], weight: number = 1.0)
```

**Features:**
- Adjustable heuristic weight
- Performance tuning capability
- **Time Complexity**: O((V + E) log V)
- **Space Complexity**: O(V)

### 🧠 Bio-Inspired Algorithms

#### Ant Colony Optimization (ACO)
```typescript
findPathACO(start: Position, goal: Position, buildingMap: number[][][], iterations: number = 10, antCount: number = 10)
```

**Features:**
- Agents find optimal paths via pheromone trails
- Good for multi-agent or complex terrain settings
- **Time Complexity**: O(I × A × N) where I=iterations, A=ants, N=nodes
- **Space Complexity**: O(V)

#### Genetic Algorithms (GA)
```typescript
findPathGA(start: Position, goal: Position, buildingMap: number[][][], populationSize: number = 10, generations: number = 10)
```

**Features:**
- Evolves a set of possible paths
- Good for complex environments
- **Time Complexity**: O(G × P × N) where G=generations, P=population, N=nodes
- **Space Complexity**: O(P × N)

#### Swarm Intelligence
```typescript
findPathSwarm(start: Position, goal: Position, buildingMap: number[][][], swarmSize: number = 10, iterations: number = 10)
```

**Features:**
- Models collective behavior
- Good for crowd evacuation simulation
- **Time Complexity**: O(S × I × N) where S=swarm size, I=iterations, N=nodes
- **Space Complexity**: O(S × N)

## Algorithm Usage Examples

### Basic Usage
```typescript
// Use any algorithm from the service
const pathfinder = this.pathfindingService;

// Basic algorithms
const aStarPath = pathfinder.findPathAStar(start, goal, buildingMap);
const dijkstraPath = pathfinder.findPathDijkstra(start, goal, buildingMap);
const bfsPath = pathfinder.findPathBFS(start, goal, buildingMap);
const dfsPath = pathfinder.findPathDFS(start, goal, buildingMap);
const greedyPath = pathfinder.findPathGreedyBestFirst(start, goal, buildingMap);

// Advanced algorithms
const bidirectionalPath = pathfinder.findPathBidirectional(start, goal, buildingMap);
const jpsPath = pathfinder.findPathJPS(start, goal, buildingMap);
const thetaPath = pathfinder.findPathThetaStar(start, goal, buildingMap);
const fringePath = pathfinder.findPathFringe(start, goal, buildingMap);

// Dynamic algorithms
const anytimePath = pathfinder.findPathAnytimeAStar(start, goal, buildingMap, 500);
const weightedPath = pathfinder.findPathAStarWeighted(start, goal, buildingMap, 1.5);

// Bio-inspired algorithms
const acoPath = pathfinder.findPathACO(start, goal, buildingMap, 20, 15);
const gaPath = pathfinder.findPathGA(start, goal, buildingMap, 50, 25);
const swarmPath = pathfinder.findPathSwarm(start, goal, buildingMap, 20, 15);
```

### Performance Comparison
```typescript
// Compare multiple algorithms
const algorithms = [
  { name: 'A*', method: (s, g, m) => pathfinder.findPathAStar(s, g, m) },
  { name: 'Dijkstra', method: (s, g, m) => pathfinder.findPathDijkstra(s, g, m) },
  { name: 'BFS', method: (s, g, m) => pathfinder.findPathBFS(s, g, m) },
  { name: 'Greedy BFS', method: (s, g, m) => pathfinder.findPathGreedyBestFirst(s, g, m) },
  { name: 'Bidirectional', method: (s, g, m) => pathfinder.findPathBidirectional(s, g, m) },
  { name: 'ACO', method: (s, g, m) => pathfinder.findPathACO(s, g, m, 10, 10) },
  { name: 'Genetic', method: (s, g, m) => pathfinder.findPathGA(s, g, m, 20, 10) },
  { name: 'Swarm', method: (s, g, m) => pathfinder.findPathSwarm(s, g, m, 15, 10) }
];

const results = algorithms.map(alg => {
  const startTime = performance.now();
  const path = alg.method(start, goal, buildingMap);
  const endTime = performance.now();
  
  return {
    algorithm: alg.name,
    pathLength: path ? path.length : null,
    executionTime: endTime - startTime,
    success: path !== null
  };
});
```

## Performance Characteristics

### Algorithm Performance Summary
| Algorithm | Time Complexity | Space Complexity | Optimal | Best For |
|-----------|----------------|------------------|---------|----------|
| **A*** | O((V + E) log V) | O(V) | Yes | General purpose |
| **Dijkstra** | O((V + E) log V) | O(V) | Yes | Guaranteed shortest |
| **BFS** | O(V + E) | O(V) | Yes* | Unweighted graphs |
| **DFS** | O(V + E) | O(V) | No | Exploration |
| **Greedy BFS** | O((V + E) log V) | O(V) | No | Quick solutions |
| **Bidirectional** | O(b^(d/2)) | O(b^(d/2)) | Yes | Known goals |
| **JPS** | O(log n) | O(n) | Yes | Uniform grids |
| **Theta*** | O((V + E) log V) | O(V) | Yes | Smooth paths |
| **Fringe** | O((V + E) log V) | O(V) | Yes | Large maps |
| **Anytime A*** | Variable | O(V) | Improves | Real-time |
| **ACO** | O(I × A × N) | O(V) | Approximate | Complex terrain |
| **GA** | O(G × P × N) | O(P × N) | Approximate | Complex environments |
| **Swarm** | O(S × I × N) | O(S × N) | Approximate | Crowd simulation |

*Optimal for unweighted graphs

## Future Enhancements

- Machine Learning integration for adaptive pathfinding
- VR/AR support for immersive visualization
- Multi-agent crowd behavior modeling
- Real-time sensor data integration
- Advanced bio-inspired algorithms
- Cloud computing for distributed simulation
- Enhanced 3D visualization with advanced lighting
- Mobile app development
- API for external integrations

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is for educational purposes. See main repository for license details.
