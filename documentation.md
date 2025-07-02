# Fire Evacuation System Simulation: Design and Analysis of Algorithms

## Overview
This project is a comprehensive simulation platform for fire evacuation in buildings, focusing on the design and analysis of pathfinding algorithms. It integrates a modular simulation engine, multiple algorithmic strategies, and both headless and web-based visualization tools.

---

## Table of Contents
1. [Introduction](#introduction)
2. [System Architecture](#system-architecture)
3. [Simulation Engine](#simulation-engine)
4. [Pathfinding Algorithms](#pathfinding-algorithms)
5. [Visualization Modules](#visualization-modules)
6. [Web Prototype](#web-prototype)
7. [Experimental Scenarios](#experimental-scenarios)
8. [Design and Analysis of Algorithms](#design-and-analysis-of-algorithms)
9. [Usage Guide](#usage-guide)
10. [References](#references)

---

## 1. Introduction
Modern buildings require robust evacuation strategies to ensure occupant safety during emergencies such as fires. Static evacuation plans are often insufficient due to dynamic hazards and crowd behavior. This project addresses these challenges by simulating fire spread and evaluating a wide range of pathfinding algorithms in realistic, multi-floor building environments.

## 2. System Architecture
The system is organized into three main modules:
- **Building Simulation**: Models the building as a 3D grid, simulates fire spread, and manages agent movement.
- **Pathfinding Algorithms**: Implements and compares 17 algorithms, including classical, advanced, dynamic, and bio-inspired methods.
- **Visualization**: Provides both Matplotlib-based and web-based (Angular + Three.js) visualizations for simulation and analysis.

### Directory Structure
- `matplotlib_prototype/`: Python simulation and visualization engine.
- `web_prototype/`: Angular web app for interactive 3D visualization.
- `docs/`: Documentation and comparative analysis.
- `daa.tex`: Main LaTeX report (Design and Analysis of Algorithms theme).

## 3. Simulation Engine
### Building Representation
- 3D grid: Each cell is walkable, wall, fire, stairs, or exit.
- Multi-floor support: Stairs connect floors, exits are evacuation goals.

### Fire Spread
- Probabilistic model: Fire spreads to adjacent cells based on a configurable rate.
- Dynamic update: Fire positions are updated each simulation step, affecting available paths.

### Agent Model
- Agents represent evacuees with position, status, and path.
- Agents recalculate paths if blocked by fire.

## 4. Pathfinding Algorithms
Implemented in `matplotlib_prototype/src/algorithms/`:
- **Classical**: A*, Dijkstra, BFS, DFS
- **Advanced**: Jump Point Search, Theta*, Bidirectional, Fringe Search
- **Dynamic**: D*, D* Lite, LPA*, Anytime A*, ARA*
- **Bio-inspired**: Ant Colony Optimization, Genetic Algorithms, Swarm Intelligence

Each algorithm is encapsulated in a class with a unified interface for easy comparison.

## 5. Visualization Modules
### Matplotlib-based
- 3D rendering of building, fire, and agent paths.
- Animation of agent movement and fire spread.

### Web-based (Angular + Three.js)
- Interactive 3D visualization.
- Real-time simulation controls.
- Service-based architecture for building, pathfinding, and visualization.

## 6. Web Prototype
- Located in `web_prototype/`.
- Angular app with modular components for simulation and analysis.
- Services for building data, pathfinding, and fallback/3D visualization.

## 7. Experimental Scenarios
- **Scenario 1**: Simple building, static fire.
- **Scenario 2**: Complex building, static fire.
- **Scenario 3**: Dynamic fire spread.
- **Scenario 4**: Multiple evacuees.

Each scenario tests algorithm performance on path length, computation time, memory usage, adaptability, and success rate.

## 8. Design and Analysis of Algorithms
### Algorithmic Trade-offs
- **A***: Optimal with admissible heuristic, high memory usage.
- **Dijkstra**: Guarantees shortest path, slower in large graphs.
- **JPS**: Fast in open grids, complex implementation.
- **D* Lite/LPA***: Efficient in dynamic environments, higher initial cost.
- **ACO/GA/Swarm**: Adaptable, good for multiple agents, require tuning.

### Complexity Analysis
- Time and space complexity for each algorithm is analyzed in the LaTeX report (`daa.tex`).
- Trade-offs between computation time, path optimality, and adaptability are discussed.

### Guidelines
- Use A* or JPS for simple, static scenarios.
- Use D* Lite or LPA* for dynamic, changing environments.
- Use ACO or Swarm Intelligence for multiple agents and congestion reduction.

## 9. Usage Guide
### Python Simulation
- Install dependencies from `matplotlib_prototype/requirements.txt`.
- Run `main.py` or `main_headless.py` for simulation.
- Visualizations are saved as PNG or displayed interactively.

### Web App
- Install Node.js dependencies in `web_prototype/`.
- Run `ng serve` to start the Angular app.
- Access the simulation via browser for interactive 3D visualization.

## 10. References
- See the bibliography in `daa.tex` for academic references on algorithms and evacuation modeling.

---

*This documentation provides a technical overview and analysis of the Fire Evacuation System Simulation project, focusing on the design and analysis of algorithms for emergency evacuation.* 