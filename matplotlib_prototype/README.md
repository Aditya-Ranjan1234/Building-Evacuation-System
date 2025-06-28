# Building Evacuation System - Matplotlib Prototype

## Overview

This prototype implements a 3D building evacuation simulation using Python and Matplotlib. It demonstrates a comprehensive suite of path planning algorithms with dynamic fire spread and real-time path re-routing.

## Features

### 🏢 Building Simulation
- Multi-floor building with realistic layout (rooms, corridors, stairs)
- Dynamic fire spread simulation
- Interactive fire placement
- Multiple exit points

### 🤖 Comprehensive Path Planning Algorithms

#### 📚 Basic Algorithms
- **A* Algorithm**: Heuristic-based optimal pathfinding
- **Dijkstra's Algorithm**: Guaranteed shortest path
- **Breadth-First Search (BFS)**: Uniform cost, optimal for unweighted graphs
- **Depth-First Search (DFS)**: Explores all routes (not optimal for shortest path)
- **Greedy Best-First Search**: Uses heuristic, faster but not always optimal

#### 🚀 Advanced Algorithms
- **Bidirectional Search**: Runs search from both source and goal
- **Jump Point Search (JPS)**: Optimized A* for uniform-cost grids
- **Theta***: Variant of A* allowing any-angle movement
- **Fringe Search**: Memory-efficient alternative to A*
- **RRT* Algorithm**: Continuous space exploration (basic implementation)

#### ⚡ Dynamic/Real-Time Algorithms
- **D* (Dynamic A*)**: Recalculates path when environment changes
- **D* Lite**: Simplified and faster version of D*
- **LPA* (Lifelong Planning A*)**: Keeps data between path changes
- **Anytime A* / ARA***: Returns good-enough path quickly and improves over time

#### 🧠 Bio-Inspired/Evolutionary Algorithms
- **Ant Colony Optimization (ACO)**: Agents find optimal paths via pheromone trails
- **Genetic Algorithms (GA)**: Evolves a set of possible paths
- **Swarm Intelligence**: Models collective behavior for crowd evacuation

### 📊 3D Visualization
- Real-time 3D matplotlib visualization
- Animated rescue agent movement
- Dynamic fire spread animation
- Multiple path visualization (primary and alternate)
- Interactive controls

### 🎮 Interactive Features
- Click to place fire anywhere in the building
- Keyboard controls for simulation management
- Real-time algorithm performance comparison
- Save simulation states

## Installation

1. **Clone the repository:**
   ```bash
   cd matplotlib_prototype
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

## Usage

### Quick Start
```bash
python src/main.py
```

### Interactive Controls

| Control | Action |
|---------|--------|
| **Left Click** | Place fire at clicked position |
| **Spacebar** | Start/Stop simulation |
| **R** | Reset simulation |
| **C** | Calculate evacuation paths |
| **H** | Show help |

### Menu Options

1. **Interactive Mode** (Recommended)
   - Full interactive 3D simulation
   - Real-time fire placement and path planning
   - Animated evacuation simulation

2. **Demo Scenario**
   - Predefined fire scenario
   - Automatic path calculation
   - Static visualization

3. **Algorithm Analysis**
   - Performance comparison of all algorithms
   - Multiple test scenarios
   - Timing and path length analysis

4. **Save Current State**
   - Export current simulation as PNG image

## Architecture

```
matplotlib_prototype/
├── src/
│   ├── algorithms/
│   │   ├── pathfinding.py           # Original A*, Dijkstra, RRT* implementations
│   │   └── pathfinding_enhanced.py  # All enhanced algorithms
│   ├── simulation/
│   │   └── building.py              # Building, fire, and person simulation
│   ├── visualization/
│   │   └── plotter.py               # 3D matplotlib visualization
│   └── main.py                      # Main application entry point
├── requirements.txt
└── README.md
```

## Algorithm Details

### 📚 Basic Algorithms

#### A* Algorithm
- **Time Complexity**: O((V + E) log V)
- **Space Complexity**: O(V)
- **Best for**: Scenarios with good heuristic (Euclidean distance)
- **Features**: Fast, optimal paths, heuristic-guided search

#### Dijkstra's Algorithm
- **Time Complexity**: O((V + E) log V)
- **Space Complexity**: O(V)
- **Best for**: Guaranteed shortest paths, dense graphs
- **Features**: Optimal, no heuristic needed, explores uniformly

#### Breadth-First Search (BFS)
- **Time Complexity**: O(V + E)
- **Space Complexity**: O(V)
- **Best for**: Unweighted graphs, shortest path in terms of steps
- **Features**: Guaranteed shortest path in unweighted graphs

#### Depth-First Search (DFS)
- **Time Complexity**: O(V + E)
- **Space Complexity**: O(V)
- **Best for**: Exploring all possible routes
- **Features**: Not optimal for shortest path, explores deep paths first

#### Greedy Best-First Search
- **Time Complexity**: O((V + E) log V)
- **Space Complexity**: O(V)
- **Best for**: Quick approximate solutions
- **Features**: Fast but not always optimal, uses only heuristic

### 🚀 Advanced Algorithms

#### Bidirectional Search
- **Time Complexity**: O(b^(d/2)) where b is branching factor, d is depth
- **Space Complexity**: O(b^(d/2))
- **Best for**: Known goal positions
- **Features**: Efficient when goal is known, searches from both ends

#### Jump Point Search (JPS)
- **Time Complexity**: O(log n) in open areas
- **Space Complexity**: O(n)
- **Best for**: Uniform-cost grids
- **Features**: Optimized A* that skips unnecessary nodes

#### Theta*
- **Time Complexity**: O((V + E) log V)
- **Space Complexity**: O(V)
- **Best for**: Grid maps with diagonals
- **Features**: Any-angle movement, smoother paths

#### Fringe Search
- **Time Complexity**: O((V + E) log V)
- **Space Complexity**: O(V)
- **Best for**: Large-scale maps
- **Features**: Memory-efficient alternative to A*

### ⚡ Dynamic/Real-Time Algorithms

#### D* (Dynamic A*)
- **Time Complexity**: O((V + E) log V) for initial path
- **Space Complexity**: O(V)
- **Best for**: Dynamic environments
- **Features**: Recalculates path when environment changes

#### D* Lite
- **Time Complexity**: O((V + E) log V)
- **Space Complexity**: O(V)
- **Best for**: Dynamic environments
- **Features**: Simplified and faster version of D*

#### LPA* (Lifelong Planning A*)
- **Time Complexity**: O((V + E) log V)
- **Space Complexity**: O(V)
- **Best for**: Repeated pathfinding in changing environments
- **Features**: Keeps data between path changes for faster updates

#### Anytime A* / ARA*
- **Time Complexity**: Variable (improves over time)
- **Space Complexity**: O(V)
- **Best for**: Real-time applications
- **Features**: Returns good-enough path quickly and improves over time

### 🧠 Bio-Inspired Algorithms

#### Ant Colony Optimization (ACO)
- **Time Complexity**: O(I × A × N) where I=iterations, A=ants, N=nodes
- **Space Complexity**: O(V)
- **Best for**: Multi-agent or complex terrain settings
- **Features**: Agents find optimal paths via pheromone trails

#### Genetic Algorithms (GA)
- **Time Complexity**: O(G × P × N) where G=generations, P=population, N=nodes
- **Space Complexity**: O(P × N)
- **Best for**: Complex environments
- **Features**: Evolves a set of possible paths, good for complex environments

#### Swarm Intelligence
- **Time Complexity**: O(S × I × N) where S=swarm size, I=iterations, N=nodes
- **Space Complexity**: O(S × N)
- **Best for**: Crowd evacuation simulation
- **Features**: Models collective behavior (birds, fish)

### Dynamic Re-routing
- Continuous path validation against fire spread
- Automatic switching to alternate paths
- Real-time recalculation when all paths blocked

## Building Layout

The simulation creates a realistic multi-floor building with:

- **Walls**: Gray blocks representing structural barriers
- **Walkable Areas**: Open spaces for movement
- **Stairs**: Green blocks connecting floors
- **Exits**: Yellow blocks on ground floor
- **Fire**: Red stars showing fire spread
- **People**: Blue circles (active) / Green triangles (evacuated)

## Fire Simulation

- **Dynamic Spread**: Fire spreads to adjacent walkable cells
- **Configurable Rate**: Adjustable spread probability
- **Interactive Placement**: Click anywhere to start fire
- **Multi-floor**: Fire can spread within floors

## Performance Features

- **Real-time Visualization**: 60 FPS animation capability
- **Efficient Pathfinding**: Optimized algorithms for real-time use
- **Memory Management**: Efficient data structures
- **Scalable**: Supports buildings up to 50x50x10 (tested)
- **Algorithm Comparison**: Comprehensive performance analysis

## Example Scenarios

### Scenario 1: Ground Floor Fire
- Fire starts on ground floor
- People on upper floors must use stairs
- Tests vertical evacuation paths

### Scenario 2: Stairwell Fire
- Fire blocks main stairwell
- Forces use of alternate routes
- Tests dynamic re-routing

### Scenario 3: Multiple Fires
- Multiple fire sources
- Complex path planning required
- Tests algorithm robustness

## Customization

### Building Parameters
```python
building = Building(width=30, height=30, floors=5)
```

### Fire Spread Rate
```python
building.fire_spread_rate = 0.2  # 20% chance per timestep
```

### Animation Speed
```python
animation = visualizer.animate_simulation(interval=500)  # 500ms per frame
```

### Algorithm Selection
```python
# Use specific algorithm
pathfinder = EnhancedPathFinder(building_map)
path = pathfinder.ant_colony_optimization(start, goal, iterations=50)
path = pathfinder.genetic_algorithm(start, goal, population_size=100)
path = pathfinder.swarm_intelligence(start, goal, swarm_size=30)
```

## Troubleshooting

### Common Issues

1. **Import Errors**
   - Ensure all dependencies are installed
   - Check Python path configuration

2. **Visualization Issues**
   - Update matplotlib to latest version
   - Check display backend configuration

3. **Performance Issues**
   - Reduce building size for better performance
   - Increase animation interval
   - Use simpler algorithms for large buildings

### System Requirements

- **Python**: 3.7+
- **RAM**: 4GB minimum, 8GB recommended
- **Display**: OpenGL-capable graphics
- **OS**: Windows, macOS, Linux

## Future Enhancements

- Machine Learning integration for adaptive pathfinding
- VR/AR support for immersive visualization
- Multi-agent crowd behavior modeling
- Real-time sensor data integration
- Advanced bio-inspired algorithms
- Cloud computing for distributed simulation

## Contributing

Feel free to contribute improvements:

1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Submit pull request

## License

This project is for educational purposes. See main repository for license details.
