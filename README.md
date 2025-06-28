# Building Evacuation System using Optimized Path Planning

## Project Overview

This project implements a building evacuation system with optimized path planning, featuring two different prototypes with a comprehensive suite of 17 pathfinding algorithms:

1. **Matplotlib Prototype**: Python-based 3D visualization with real-time path planning
2. **Web Prototype**: Angular + Three.js web application with interactive 3D visualization

## Features

- Multi-floor building representation
- Dynamic fire spread simulation
- **17 Path Planning Algorithms** across 4 categories
- Real-time path re-routing when fire blocks routes
- Interactive fire starting position selection
- 3D visualization with animated rescue agent
- Comprehensive performance comparison of all algorithms
- Bio-inspired and evolutionary algorithms

## Project Structure

```
daa_see/
├── matplotlib_prototype/          # Python-based prototype
│   ├── src/
│   │   ├── algorithms/           # Path planning algorithms
│   │   │   ├── pathfinding.py           # Original algorithms (A*, Dijkstra, RRT*)
│   │   │   └── pathfinding_enhanced.py  # All enhanced algorithms (17 total)
│   │   ├── simulation/           # Fire spread and building models
│   │   ├── visualization/        # 3D plotting and animation
│   │   └── main.py              # Main application entry point
│   ├── requirements.txt
│   └── README.md
├── web_prototype/                # Angular + Three.js prototype
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/      # UI components
│   │   │   ├── services/        # Business logic services
│   │   │   │   └── pathfinding.service.ts # All 14 algorithms
│   │   │   └── app.component.ts # Root component
│   │   ├── assets/
│   │   └── environments/
│   ├── package.json
│   └── README.md
├── docs/                        # Documentation and analysis
│   └── prototype_comparison.md
├── setup_and_demo.sh            # Automated setup script
└── README.md
```

## 🤖 Comprehensive Pathfinding Algorithms

### 📚 Basic Algorithms
- **A* Algorithm**: Heuristic-based optimal pathfinding
- **Dijkstra's Algorithm**: Guaranteed shortest path
- **Breadth-First Search (BFS)**: Uniform cost, optimal for unweighted graphs
- **Depth-First Search (DFS)**: Explores all routes (not optimal for shortest path)
- **Greedy Best-First Search**: Uses heuristic, faster but not always optimal

### 🚀 Advanced Algorithms
- **Bidirectional Search**: Runs search from both source and goal
- **Jump Point Search (JPS)**: Optimized A* for uniform-cost grids
- **Theta***: Variant of A* allowing any-angle movement
- **Fringe Search**: Memory-efficient alternative to A*
- **RRT* Algorithm**: Continuous space exploration

### ⚡ Dynamic/Real-time Algorithms
- **D* (Dynamic A*)**: Recalculates path when environment changes
- **D* Lite**: Simplified and faster version of D*
- **LPA* (Lifelong Planning A*)**: Keeps data between path changes
- **Anytime A* / ARA***: Returns good-enough path quickly and improves over time

### 🧠 Bio-Inspired/Evolutionary Algorithms
- **Ant Colony Optimization (ACO)**: Agents find optimal paths via pheromone trails
- **Genetic Algorithms (GA)**: Evolves a set of possible paths
- **Swarm Intelligence**: Models collective behavior for crowd evacuation

## 🚀 Getting Started

### Prerequisites

#### For Matplotlib Prototype
- **Python**: 3.7 or higher
- **pip**: Python package installer
- **RAM**: 4GB minimum, 8GB recommended
- **Display**: OpenGL-capable graphics

#### For Web Prototype
- **Node.js**: 18.0 or higher
- **npm**: 9.0 or higher
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+

### Quick Setup (Automated)

Use the provided setup script for both prototypes:

```bash
# Make script executable (Linux/Mac)
chmod +x setup_and_demo.sh

# Run setup script
./setup_and_demo.sh
```

The script will:
1. Check system requirements
2. Set up both prototypes
3. Provide interactive menu for running demos
4. Compare prototype performance

### Manual Setup

#### 🐍 Matplotlib Prototype Setup

1. **Navigate to matplotlib prototype directory:**
   ```bash
   cd matplotlib_prototype
   ```

2. **Create virtual environment (recommended):**
   ```bash
   python -m venv venv
   
   # Activate virtual environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application:**
   ```bash
   python src/main.py
   ```

#### 🌐 Web Prototype Setup

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
   # or
   ng serve
   ```

4. **Open browser:**
   ```
   http://localhost:4200
   ```

### 🎮 Usage Instructions

#### Matplotlib Prototype Usage

1. **Interactive Mode** (Recommended)
   - Run `python src/main.py`
   - Select "Interactive Mode" from menu
   - Click on building to place fire
   - Use keyboard controls:
     - **Left Click**: Place fire
     - **Spacebar**: Start/Stop simulation
     - **R**: Reset simulation
     - **C**: Calculate paths
     - **H**: Show help

2. **Demo Scenario**
   - Run `python src/main.py`
   - Select "Demo Scenario" from menu
   - Watch predefined fire scenario

3. **Algorithm Analysis**
   - Run `python src/main.py`
   - Select "Algorithm Analysis" from menu
   - Compare performance of all algorithms

#### Web Prototype Usage

1. **Simulation Mode**
   - Open `http://localhost:4200`
   - Configure building dimensions
   - Add people and fire
   - Calculate evacuation paths
   - Start simulation

2. **Analysis Mode**
   - Click "Analysis" tab
   - Configure test parameters
   - Run algorithm comparison
   - View performance results

### 🔧 Advanced Usage

#### Using Specific Algorithms (Matplotlib)

```python
from src.algorithms.pathfinding_enhanced import EnhancedPathFinder
import numpy as np

# Create building map
building_map = np.zeros((20, 20, 3))  # 20x20x3 building
pathfinder = EnhancedPathFinder(building_map)

# Define start and goal positions
start = (5, 5, 0)
goal = (15, 15, 2)

# Use specific algorithms
a_star_path = pathfinder.a_star(start, goal)
dijkstra_path = pathfinder.dijkstra(start, goal)
aco_path = pathfinder.ant_colony_optimization(start, goal, iterations=50)
ga_path = pathfinder.genetic_algorithm(start, goal, population_size=100)
swarm_path = pathfinder.swarm_intelligence(start, goal, swarm_size=30)

# Compare all algorithms
results = pathfinder.get_algorithm_performance(start, goal)
```

#### Using Specific Algorithms (Web)

```typescript
// In your Angular component
constructor(private pathfindingService: PathfindingService) {}

calculatePaths() {
  const start: Position = { x: 5, y: 5, floor: 0 };
  const goal: Position = { x: 15, y: 15, floor: 2 };
  
  // Use specific algorithms
  const aStarPath = this.pathfindingService.findPathAStar(start, goal, this.buildingMap);
  const dijkstraPath = this.pathfindingService.findPathDijkstra(start, goal, this.buildingMap);
  const acoPath = this.pathfindingService.findPathACO(start, goal, this.buildingMap, 20, 15);
  const gaPath = this.pathfindingService.findPathGA(start, goal, this.buildingMap, 50, 25);
  const swarmPath = this.pathfindingService.findPathSwarm(start, goal, this.buildingMap, 20, 15);
}
```

## 📊 Algorithm Performance Summary

| Category | Algorithm | Time Complexity | Space Complexity | Optimal | Best Use Case |
|----------|-----------|----------------|------------------|---------|---------------|
| **Basic** | A* | O((V + E) log V) | O(V) | Yes | General purpose |
| **Basic** | Dijkstra | O((V + E) log V) | O(V) | Yes | Guaranteed shortest |
| **Basic** | BFS | O(V + E) | O(V) | Yes* | Unweighted graphs |
| **Basic** | DFS | O(V + E) | O(V) | No | Exploration |
| **Basic** | Greedy BFS | O((V + E) log V) | O(V) | No | Quick solutions |
| **Advanced** | Bidirectional | O(b^(d/2)) | O(b^(d/2)) | Yes | Known goals |
| **Advanced** | JPS | O(log n) | O(n) | Yes | Uniform grids |
| **Advanced** | Theta* | O((V + E) log V) | O(V) | Yes | Smooth paths |
| **Advanced** | Fringe | O((V + E) log V) | O(V) | Yes | Large maps |
| **Dynamic** | D* | O((V + E) log V) | O(V) | Yes | Dynamic environments |
| **Dynamic** | Anytime A* | Variable | O(V) | Improves | Real-time |
| **Bio** | ACO | O(I × A × N) | O(V) | Approximate | Complex terrain |
| **Bio** | GA | O(G × P × N) | O(P × N) | Approximate | Complex environments |
| **Bio** | Swarm | O(S × I × N) | O(S × N) | Approximate | Crowd simulation |

*Optimal for unweighted graphs

## 🎯 Domain: Route Optimization

This project focuses on real-time route optimization in emergency scenarios, demonstrating dynamic path planning with moving obstacles. The comprehensive algorithm suite allows for:

- **Emergency Response**: Real-time evacuation planning
- **Building Safety**: Emergency preparedness analysis
- **Algorithm Research**: Performance comparison and analysis
- **Educational Purposes**: Learning different pathfinding approaches
- **Crowd Simulation**: Multi-agent evacuation modeling

## 🔧 Troubleshooting

### Common Issues

#### Matplotlib Prototype
- **Import Errors**: Ensure virtual environment is activated and dependencies installed
- **Display Issues**: Update matplotlib and check backend configuration
- **Performance Issues**: Reduce building size or increase animation interval

#### Web Prototype
- **Node.js Version**: Ensure Node.js 18+ is installed
- **Port Conflicts**: Change port with `ng serve --port 4201`
- **Build Issues**: Clear cache with `npm cache clean --force`

### System Requirements

- **Operating System**: Windows 10+, macOS 10.14+, Ubuntu 18.04+
- **Memory**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **Network**: Required for npm packages (first run only)

## 📚 Documentation

- **Matplotlib Prototype**: See `matplotlib_prototype/README.md`
- **Web Prototype**: See `web_prototype/README.md`
- **Prototype Comparison**: See `docs/prototype_comparison.md`
- **Algorithm Details**: Comprehensive documentation in each prototype's README

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests for new algorithms
5. Update documentation
6. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Academic research in pathfinding algorithms
- Open source libraries (Matplotlib, Three.js, Angular)
- Building safety standards and guidelines
- Community contributions and feedback
