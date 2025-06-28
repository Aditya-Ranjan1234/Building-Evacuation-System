# Building Evacuation System using Optimized Path Planning

## Project Overview

This project implements a building evacuation system with optimized path planning, featuring two different prototypes:

1. **Matplotlib Prototype**: Python-based 3D visualization with real-time path planning
2. **Web Prototype**: Angular + Three.js web application with interactive 3D visualization

## Features

- Multi-floor building representation
- Dynamic fire spread simulation
- Multiple path planning algorithms (A*, Dijkstra's, RRT*)
- Real-time path re-routing when fire blocks routes
- Interactive fire starting position selection
- 3D visualization with animated rescue agent
- Performance comparison of different algorithms

## Project Structure

```
daa_see/
├── matplotlib_prototype/          # Python-based prototype
│   ├── src/
│   │   ├── algorithms/           # Path planning algorithms
│   │   ├── simulation/           # Fire spread and building models
│   │   ├── visualization/        # 3D plotting and animation
│   │   └── main.py              # Main application entry point
│   ├── requirements.txt
│   └── README.md
├── web_prototype/                # Angular + Three.js prototype
│   ├── src/
│   │   ├── app/
│   │   ├── assets/
│   │   └── environments/
│   ├── package.json
│   └── README.md
└── docs/                        # Documentation and analysis
    ├── algorithm_comparison.md
    └── performance_analysis.md
```

## Getting Started

### Matplotlib Prototype
```bash
cd matplotlib_prototype
pip install -r requirements.txt
python src/main.py
```

### Web Prototype
```bash
cd web_prototype
npm install
ng serve
```

## Algorithms Implemented

| Algorithm | Time Complexity | Space Complexity | Use Case |
|-----------|----------------|------------------|----------|
| A* | O((V + E) log V) | O(V) | Heuristic-based optimal pathfinding |
| Dijkstra's | O((V + E) log V) | O(V) | Guaranteed shortest path |
| RRT* | O(n log n) | O(n) | Continuous space exploration |

## Domain: Route Optimization

This project focuses on real-time route optimization in emergency scenarios, demonstrating dynamic path planning with moving obstacles.
