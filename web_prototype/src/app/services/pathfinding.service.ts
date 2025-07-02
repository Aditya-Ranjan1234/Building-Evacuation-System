import { Injectable } from '@angular/core';

export interface Position {
  x: number;
  y: number;
  floor: number;
}

export interface PathNode {
  position: Position;
  parent?: PathNode;
  gCost: number;
  hCost: number;
  fCost: number;
}

export enum CellType {
  WALKABLE = 0,
  WALL = 1,
  FIRE = 2,
  STAIRS = 3,
  EXIT = 4
}

@Injectable({
  providedIn: 'root'
})
export class PathfindingService {

  constructor() { }

  /**
   * A* pathfinding algorithm implementation
   */
  findPathAStar(
    start: Position,
    goal: Position,
    buildingMap: number[][][]
  ): Position[] | null {
    const openSet: PathNode[] = [];
    const closedSet: Set<string> = new Set();

    const startNode: PathNode = {
      position: start,
      gCost: 0,
      hCost: this.calculateHeuristic(start, goal),
      fCost: 0
    };
    startNode.fCost = startNode.gCost + startNode.hCost;

    openSet.push(startNode);

    while (openSet.length > 0) {
      // Find node with lowest fCost
      openSet.sort((a, b) => a.fCost - b.fCost);
      const currentNode = openSet.shift()!;

      const currentKey = this.positionToKey(currentNode.position);

      if (this.positionsEqual(currentNode.position, goal)) {
        // Reconstruct path
        return this.reconstructPath(currentNode);
      }

      closedSet.add(currentKey);

      // Check neighbors
      const neighbors = this.getNeighbors(currentNode.position, buildingMap);

      for (const neighborPos of neighbors) {
        const neighborKey = this.positionToKey(neighborPos);

        if (closedSet.has(neighborKey)) {
          continue;
        }

        const gCost = currentNode.gCost + this.getMovementCost(currentNode.position, neighborPos);
        const hCost = this.calculateHeuristic(neighborPos, goal);
        const fCost = gCost + hCost;

        // Check if this path to neighbor is better
        const existingNode = openSet.find(node =>
          this.positionsEqual(node.position, neighborPos)
        );

        if (!existingNode || gCost < existingNode.gCost) {
          const neighborNode: PathNode = {
            position: neighborPos,
            parent: currentNode,
            gCost,
            hCost,
            fCost
          };

          if (!existingNode) {
            openSet.push(neighborNode);
          } else {
            // Update existing node
            existingNode.parent = currentNode;
            existingNode.gCost = gCost;
            existingNode.fCost = fCost;
          }
        }
      }
    }

    return null; // No path found
  }

  /**
   * Dijkstra's algorithm implementation
   */
  findPathDijkstra(
    start: Position,
    goal: Position,
    buildingMap: number[][][]
  ): Position[] | null {
    const distances: Map<string, number> = new Map();
    const previous: Map<string, Position> = new Map();
    const unvisited: Set<string> = new Set();

    // Initialize distances
    for (let x = 0; x < buildingMap.length; x++) {
      for (let y = 0; y < buildingMap[0].length; y++) {
        for (let floor = 0; floor < buildingMap[0][0].length; floor++) {
          if (buildingMap[x][y][floor] === CellType.WALKABLE ||
              buildingMap[x][y][floor] === CellType.STAIRS ||
              buildingMap[x][y][floor] === CellType.EXIT) {
            const pos = { x, y, floor };
            const key = this.positionToKey(pos);
            distances.set(key, Infinity);
            unvisited.add(key);
          }
        }
      }
    }

    const startKey = this.positionToKey(start);
    distances.set(startKey, 0);

    while (unvisited.size > 0) {
      // Find unvisited node with minimum distance
      let currentKey = '';
      let minDistance = Infinity;

      for (const key of unvisited) {
        const distance = distances.get(key) || Infinity;
        if (distance < minDistance) {
          minDistance = distance;
          currentKey = key;
        }
      }

      if (currentKey === '') break; // No reachable nodes left

      const currentPos = this.keyToPosition(currentKey);

      if (this.positionsEqual(currentPos, goal)) {
        // Reconstruct path
        return this.reconstructPathDijkstra(start, goal, previous);
      }

      unvisited.delete(currentKey);

      const neighbors = this.getNeighbors(currentPos, buildingMap);

      for (const neighborPos of neighbors) {
        const neighborKey = this.positionToKey(neighborPos);

        if (!unvisited.has(neighborKey)) continue;

        const altDistance = (distances.get(currentKey) || 0) +
                           this.getMovementCost(currentPos, neighborPos);

        if (altDistance < (distances.get(neighborKey) || Infinity)) {
          distances.set(neighborKey, altDistance);
          previous.set(neighborKey, currentPos);
        }
      }
    }

    return null; // No path found
  }

  /**
   * Get valid neighboring positions
   */
  private getNeighbors(position: Position, buildingMap: number[][][]): Position[] {
    const neighbors: Position[] = [];
    const { x, y, floor } = position;

    // 8-directional movement on same floor
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];

    for (const [dx, dy] of directions) {
      const newX = x + dx;
      const newY = y + dy;

      if (this.isValidPosition(newX, newY, floor, buildingMap)) {
        neighbors.push({ x: newX, y: newY, floor });
      }
    }

    // Stairs movement (up/down floors)
    if (buildingMap[x][y][floor] === CellType.STAIRS) {
      for (const newFloor of [floor - 1, floor + 1]) {
        if (newFloor >= 0 && newFloor < buildingMap[0][0].length &&
            buildingMap[x][y][newFloor] === CellType.STAIRS) {
          neighbors.push({ x, y, floor: newFloor });
        }
      }
    }

    return neighbors;
  }

  /**
   * Check if position is valid and walkable
   */
  private isValidPosition(x: number, y: number, floor: number, buildingMap: number[][][]): boolean {
    if (!this.isValidMapPosition(x, y, floor, buildingMap)) {
      return false;
    }
    const cellType = buildingMap[x][y][floor];
    return cellType === CellType.WALKABLE ||
           cellType === CellType.STAIRS ||
           cellType === CellType.EXIT;
    // Explicitly exclude FIRE from valid paths
  }

  /**
   * Calculate heuristic distance (3D Euclidean)
   */
  private calculateHeuristic(pos1: Position, pos2: Position): number {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const dz = (pos2.floor - pos1.floor) * 10; // Floor change penalty

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Calculate movement cost between adjacent positions
   */
  private getMovementCost(pos1: Position, pos2: Position): number {
    const dx = Math.abs(pos2.x - pos1.x);
    const dy = Math.abs(pos2.y - pos1.y);
    const dz = Math.abs(pos2.floor - pos1.floor);

    let cost = 1.0;

    // Diagonal movement costs more
    if (dx + dy === 2) {
      cost = 1.414; // sqrt(2)
    }

    // Floor change penalty
    if (dz > 0) {
      cost += 5.0;
    }

    return cost;
  }

  /**
   * Reconstruct path from A* result
   */
  private reconstructPath(node: PathNode): Position[] {
    const path: Position[] = [];
    let current: PathNode | undefined = node;

    while (current) {
      path.unshift(current.position);
      current = current.parent;
    }

    return path;
  }

  /**
   * Reconstruct path from Dijkstra result
   */
  private reconstructPathDijkstra(
    start: Position,
    goal: Position,
    previous: Map<string, Position>
  ): Position[] {
    const path: Position[] = [];
    let current = goal;

    while (!this.positionsEqual(current, start)) {
      path.unshift(current);
      const currentKey = this.positionToKey(current);
      const prev = previous.get(currentKey);
      if (!prev) break;
      current = prev;
    }

    path.unshift(start);
    return path;
  }

  /**
   * Convert position to string key
   */
  private positionToKey(position: Position): string {
    return `${position.x},${position.y},${position.floor}`;
  }

  /**
   * Convert string key to position
   */
  private keyToPosition(key: string): Position {
    const [x, y, floor] = key.split(',').map(Number);
    return { x, y, floor };
  }

  /**
   * Check if two positions are equal
   */
  private positionsEqual(pos1: Position, pos2: Position): boolean {
    return pos1.x === pos2.x && pos1.y === pos2.y && pos1.floor === pos2.floor;
  }

  /**
   * Check if path is blocked by fire
   */
  isPathBlockedByFire(path: Position[], buildingMap: number[][][]): boolean {
    return path.some(pos => buildingMap[pos.x][pos.y][pos.floor] === CellType.FIRE);
  }

  /**
   * Find multiple alternate paths
   */
  findAlternatePaths(
    start: Position,
    goal: Position,
    buildingMap: number[][][],
    numPaths: number = 3
  ): Position[][] {
    const paths: Position[][] = [];

    // Primary path using A*
    const primaryPath = this.findPathAStar(start, goal, buildingMap);
    if (primaryPath) {
      paths.push(primaryPath);
    }

    // Alternate path using Dijkstra
    if (paths.length < numPaths) {
      const dijkstraPath = this.findPathDijkstra(start, goal, buildingMap);
      if (dijkstraPath && !this.pathsEqual(dijkstraPath, primaryPath)) {
        paths.push(dijkstraPath);
      }
    }

    return paths;
  }

  /**
   * Check if two paths are equal
   */
  private pathsEqual(path1: Position[] | null, path2: Position[] | null): boolean {
    if (!path1 || !path2 || path1.length !== path2.length) {
      return false;
    }

    return path1.every((pos, index) =>
      this.positionsEqual(pos, path2[index])
    );
  }

  /**
   * Calculate path statistics
   */
  calculatePathStats(path: Position[]): {
    length: number;
    floorChanges: number;
    estimatedTime: number;
  } {
    if (path.length === 0) {
      return { length: 0, floorChanges: 0, estimatedTime: 0 };
    }

    let totalDistance = 0;
    let floorChanges = 0;

    for (let i = 1; i < path.length; i++) {
      const prev = path[i - 1];
      const curr = path[i];

      totalDistance += this.getMovementCost(prev, curr);

      if (prev.floor !== curr.floor) {
        floorChanges++;
      }
    }

    // Estimate time (assuming 1 unit = 1 meter, walking speed = 1.4 m/s)
    const estimatedTime = totalDistance / 1.4;

    return {
      length: Math.round(totalDistance * 100) / 100,
      floorChanges,
      estimatedTime: Math.round(estimatedTime * 100) / 100
    };
  }

  /**
   * Breadth-First Search (BFS) - Uniform cost, only works well in unweighted graphs
   */
  findPathBFS(start: Position, goal: Position, buildingMap: number[][][]): Position[] | null {
    const queue: {pos: Position, path: Position[]}[] = [{pos: start, path: [start]}];
    const visited = new Set<string>();
    while (queue.length > 0) {
      const {pos, path} = queue.shift()!;
      if (this.positionsEqual(pos, goal)) return path;
      const key = this.positionToKey(pos);
      if (visited.has(key)) continue;
      visited.add(key);
      for (const neighbor of this.getNeighbors(pos, buildingMap)) {
        if (!visited.has(this.positionToKey(neighbor))) {
          queue.push({pos: neighbor, path: [...path, neighbor]});
        }
      }
    }
    return null;
  }

  /**
   * Depth-First Search (DFS) - Not suitable for shortest path, but explores all routes
   */
  findPathDFS(start: Position, goal: Position, buildingMap: number[][][]): Position[] | null {
    const stack: {pos: Position, path: Position[]}[] = [{pos: start, path: [start]}];
    const visited = new Set<string>();
    while (stack.length > 0) {
      const {pos, path} = stack.pop()!;
      if (this.positionsEqual(pos, goal)) return path;
      const key = this.positionToKey(pos);
      if (visited.has(key)) continue;
      visited.add(key);
      for (const neighbor of this.getNeighbors(pos, buildingMap)) {
        if (!visited.has(this.positionToKey(neighbor))) {
          stack.push({pos: neighbor, path: [...path, neighbor]});
        }
      }
    }
    return null;
  }

  /**
   * Greedy Best-First Search - Uses heuristic, faster but not always optimal
   */
  findPathGreedyBestFirst(start: Position, goal: Position, buildingMap: number[][][]): Position[] | null {
    const openSet: PathNode[] = [];
    const closedSet: Set<string> = new Set();
    const startNode: PathNode = {
      position: start,
      gCost: 0,
      hCost: this.calculateHeuristic(start, goal),
      fCost: 0
    };
    startNode.fCost = startNode.hCost;
    openSet.push(startNode);
    while (openSet.length > 0) {
      openSet.sort((a, b) => a.fCost - b.fCost);
      const currentNode = openSet.shift()!;
      if (this.positionsEqual(currentNode.position, goal)) {
        return this.reconstructPath(currentNode);
      }
      closedSet.add(this.positionToKey(currentNode.position));
      for (const neighborPos of this.getNeighbors(currentNode.position, buildingMap)) {
        const neighborKey = this.positionToKey(neighborPos);
        if (closedSet.has(neighborKey)) continue;
        const hCost = this.calculateHeuristic(neighborPos, goal);
        const neighborNode: PathNode = {
          position: neighborPos,
          parent: currentNode,
          gCost: 0,
          hCost,
          fCost: hCost
        };
        if (!openSet.find(n => this.positionsEqual(n.position, neighborPos))) {
          openSet.push(neighborNode);
        }
      }
    }
    return null;
  }

  /**
   * Bidirectional Search - Runs search from both source and goal
   */
  findPathBidirectional(start: Position, goal: Position, buildingMap: number[][][]): Position[] | null {
    const queueStart: {pos: Position, path: Position[]}[] = [{pos: start, path: [start]}];
    const queueGoal: {pos: Position, path: Position[]}[] = [{pos: goal, path: [goal]}];
    const visitedStart = new Map<string, Position[]>();
    const visitedGoal = new Map<string, Position[]>();
    visitedStart.set(this.positionToKey(start), [start]);
    visitedGoal.set(this.positionToKey(goal), [goal]);
    while (queueStart.length > 0 && queueGoal.length > 0) {
      // Expand from start
      const {pos: posS, path: pathS} = queueStart.shift()!;
      for (const neighbor of this.getNeighbors(posS, buildingMap)) {
        const key = this.positionToKey(neighbor);
        if (!visitedStart.has(key)) {
          visitedStart.set(key, [...pathS, neighbor]);
          queueStart.push({pos: neighbor, path: [...pathS, neighbor]});
          if (visitedGoal.has(key)) {
            // Path found
            const pathG = visitedGoal.get(key)!;
            return [...pathS, ...pathG.slice(0, -1).reverse()];
          }
        }
      }
      // Expand from goal
      const {pos: posG, path: pathG} = queueGoal.shift()!;
      for (const neighbor of this.getNeighbors(posG, buildingMap)) {
        const key = this.positionToKey(neighbor);
        if (!visitedGoal.has(key)) {
          visitedGoal.set(key, [...pathG, neighbor]);
          queueGoal.push({pos: neighbor, path: [...pathG, neighbor]});
          if (visitedStart.has(key)) {
            const pathS = visitedStart.get(key)!;
            return [...pathS, ...pathG.slice(0, -1).reverse()];
          }
        }
      }
    }
    return null;
  }

  /**
   * Jump Point Search (JPS) - Optimized A* for uniform-cost grids (basic version)
   */
  findPathJPS(start: Position, goal: Position, buildingMap: number[][][]): Position[] | null {
    // For demonstration, use A* as a placeholder for JPS
    return this.findPathAStar(start, goal, buildingMap);
  }

  /**
   * Theta* - Variant of A* allowing any-angle movement (basic version)
   */
  findPathThetaStar(start: Position, goal: Position, buildingMap: number[][][]): Position[] | null {
    // For demonstration, use A* as a placeholder for Theta*
    return this.findPathAStar(start, goal, buildingMap);
  }

  /**
   * Fringe Search - Memory-efficient alternative to A*
   */
  findPathFringe(start: Position, goal: Position, buildingMap: number[][][]): Position[] | null {
    // For demonstration, use A* as a placeholder for Fringe Search
    return this.findPathAStar(start, goal, buildingMap);
  }

  /**
   * Anytime A* / ARA* - Returns a good-enough path quickly and improves over time
   */
  findPathAnytimeAStar(start: Position, goal: Position, buildingMap: number[][][], timeLimitMs: number = 100): Position[] | null {
    // For demonstration, run A* with a time limit (not truly anytime)
    const startTime = Date.now();
    let bestPath: Position[] | null = null;
    let epsilon = 2.0;
    while (Date.now() - startTime < timeLimitMs) {
      const path = this.findPathAStarWeighted(start, goal, buildingMap, epsilon);
      if (path) bestPath = path;
      if (epsilon <= 1.0) break;
      epsilon = Math.max(1.0, epsilon * 0.8);
    }
    return bestPath;
  }

  /**
   * Weighted A* (helper for Anytime A*)
   */
  findPathAStarWeighted(start: Position, goal: Position, buildingMap: number[][][], weight: number = 1.0): Position[] | null {
    const openSet: PathNode[] = [];
    const closedSet: Set<string> = new Set();
    const startNode: PathNode = {
      position: start,
      gCost: 0,
      hCost: this.calculateHeuristic(start, goal),
      fCost: 0
    };
    startNode.fCost = startNode.gCost + startNode.hCost * weight;
    openSet.push(startNode);
    while (openSet.length > 0) {
      openSet.sort((a, b) => a.fCost - b.fCost);
      const currentNode = openSet.shift()!;
      if (this.positionsEqual(currentNode.position, goal)) {
        return this.reconstructPath(currentNode);
      }
      closedSet.add(this.positionToKey(currentNode.position));
      for (const neighborPos of this.getNeighbors(currentNode.position, buildingMap)) {
        const neighborKey = this.positionToKey(neighborPos);
        if (closedSet.has(neighborKey)) continue;
        const gCost = currentNode.gCost + this.getMovementCost(currentNode.position, neighborPos);
        const hCost = this.calculateHeuristic(neighborPos, goal);
        const fCost = gCost + hCost * weight;
        const existingNode = openSet.find(node => this.positionsEqual(node.position, neighborPos));
        if (!existingNode || gCost < existingNode.gCost) {
          const neighborNode: PathNode = {
            position: neighborPos,
            parent: currentNode,
            gCost,
            hCost,
            fCost
          };
          if (!existingNode) {
            openSet.push(neighborNode);
          } else {
            existingNode.parent = currentNode;
            existingNode.gCost = gCost;
            existingNode.fCost = fCost;
          }
        }
      }
    }
    return null;
  }

  /**
   * Ant Colony Optimization (ACO) - Basic illustrative version
   */
  findPathACO(start: Position, goal: Position, buildingMap: number[][][], iterations: number = 10, antCount: number = 10): Position[] | null {
    let bestPath: Position[] | null = null;
    let bestLength = Infinity;
    for (let iter = 0; iter < iterations; iter++) {
      for (let ant = 0; ant < antCount; ant++) {
        const path = this.findPathRandomWalk(start, goal, buildingMap, 100);
        if (path && path.length < bestLength) {
          bestLength = path.length;
          bestPath = path;
        }
      }
    }
    return bestPath;
  }

  /**
   * Genetic Algorithm (GA) - Basic illustrative version
   */
  findPathGA(start: Position, goal: Position, buildingMap: number[][][], populationSize: number = 10, generations: number = 10): Position[] | null {
    let population: Position[][] = [];
    for (let i = 0; i < populationSize; i++) {
      const path = this.findPathRandomWalk(start, goal, buildingMap, 100);
      if (path) population.push(path);
    }
    let bestPath: Position[] | null = null;
    let bestLength = Infinity;
    for (let gen = 0; gen < generations; gen++) {
      population.sort((a, b) => a.length - b.length);
      if (population[0] && population[0].length < bestLength) {
        bestLength = population[0].length;
        bestPath = population[0];
      }
      // Crossover and mutation (simple)
      const newPop: Position[][] = [population[0]];
      while (newPop.length < populationSize) {
        const parent1 = population[Math.floor(Math.random() * population.length)];
        const parent2 = population[Math.floor(Math.random() * population.length)];
        const crossoverPoint = Math.floor(parent1.length / 2);
        let child = parent1.slice(0, crossoverPoint);
        if (parent2.length > 0) {
          child = child.concat(parent2.slice(-Math.floor(parent2.length / 2)));
        }
        // Mutation: random walk from last
        if (Math.random() < 0.3 && child.length > 0) {
          const last = child[child.length - 1];
          const walk = this.findPathRandomWalk(last, goal, buildingMap, 20);
          if (walk) child = child.concat(walk.slice(1));
        }
        newPop.push(child);
      }
      population = newPop;
    }
    return bestPath;
  }

  /**
   * Swarm Intelligence - Basic illustrative version
   */
  findPathSwarm(start: Position, goal: Position, buildingMap: number[][][], swarmSize: number = 10, iterations: number = 10): Position[] | null {
    let bestPath: Position[] | null = null;
    let bestLength = Infinity;
    for (let i = 0; i < swarmSize; i++) {
      let agentPos = start;
      let path: Position[] = [start];
      for (let j = 0; j < iterations; j++) {
        const neighbors = this.getNeighbors(agentPos, buildingMap);
        if (neighbors.length === 0) break;
        agentPos = neighbors[Math.floor(Math.random() * neighbors.length)];
        path.push(agentPos);
        if (this.positionsEqual(agentPos, goal)) break;
      }
      if (this.positionsEqual(agentPos, goal) && path.length < bestLength) {
        bestLength = path.length;
        bestPath = path;
      }
    }
    return bestPath;
  }

  /**
   * Helper: Random Walk (for ACO, GA, Swarm)
   */
  findPathRandomWalk(start: Position, goal: Position, buildingMap: number[][][], maxSteps: number = 100): Position[] | null {
    let current = start;
    const path: Position[] = [current];
    const visited = new Set<string>([this.positionToKey(current)]);
    for (let i = 0; i < maxSteps; i++) {
      if (this.positionsEqual(current, goal)) return path;
      const neighbors = this.getNeighbors(current, buildingMap).filter(n => !visited.has(this.positionToKey(n)));
      if (neighbors.length === 0) return null;
      current = neighbors[Math.floor(Math.random() * neighbors.length)];
      path.push(current);
      visited.add(this.positionToKey(current));
    }
    return null;
  }

  /**
   * Check if position is valid within map bounds
   */
  private isValidMapPosition(x: number, y: number, floor: number, buildingMap: number[][][]): boolean {
    return x >= 0 && x < buildingMap.length &&
           y >= 0 && y < buildingMap[0].length &&
           floor >= 0 && floor < buildingMap[0][0].length;
  }
}
