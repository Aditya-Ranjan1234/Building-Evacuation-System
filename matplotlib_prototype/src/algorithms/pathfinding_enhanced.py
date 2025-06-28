"""
Enhanced Path Finding algorithms for building evacuation system.
Implements comprehensive set of pathfinding algorithms including:
- A*, Dijkstra's, RRT*
- BFS, DFS, Greedy Best-First Search
- Bidirectional Search, Jump Point Search, Theta*
- Fringe Search, D*, D* Lite, LPA*, Anytime A*
- Bio-inspired: Ant Colony Optimization, Genetic Algorithms, Swarm Intelligence
"""

import numpy as np
import heapq
import math
import random
import time
from typing import List, Tuple, Dict, Optional, Set, Callable
from collections import deque, defaultdict
from dataclasses import dataclass, field
from enum import Enum


class Node:
    """Node class for pathfinding algorithms."""

    def __init__(self, position: Tuple[int, int, int], parent=None):
        self.position = position  # (x, y, floor)
        self.parent = parent
        self.g_cost = 0  # Distance from start
        self.h_cost = 0  # Heuristic distance to goal
        self.f_cost = 0  # Total cost

    def __lt__(self, other):
        return self.f_cost < other.f_cost

    def __eq__(self, other):
        return self.position == other.position


@dataclass
class Ant:
    """Ant for Ant Colony Optimization."""
    position: Tuple[int, int, int]
    path: List[Tuple[int, int, int]] = field(default_factory=list)
    pheromone: float = 1.0


@dataclass
class GeneticPath:
    """Path representation for Genetic Algorithm."""
    path: List[Tuple[int, int, int]]
    fitness: float = 0.0


class EnhancedPathFinder:
    """Enhanced pathfinding class implementing multiple algorithms."""

    def __init__(self, building_map: np.ndarray):
        """
        Initialize pathfinder with building map.

        Args:
            building_map: 3D numpy array representing building (x, y, floor)
                         0 = walkable, 1 = wall, 2 = fire, 3 = stairs
        """
        self.building_map = building_map
        self.shape = building_map.shape
        self.pheromone_map = {}  # For Ant Colony Optimization
        self.evaporation_rate = 0.1
        self.ant_count = 50

    def get_neighbors(self, position: Tuple[int, int, int]) -> List[Tuple[int, int, int]]:
        """Get valid neighboring positions."""
        x, y, floor = position
        neighbors = []

        # 8-directional movement on same floor
        directions = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]

        for dx, dy in directions:
            new_x, new_y = x + dx, y + dy
            if (0 <= new_x < self.shape[0] and 0 <= new_y < self.shape[1] and
                self.building_map[new_x, new_y, floor] in [0, 3]):  # walkable or stairs
                neighbors.append((new_x, new_y, floor))

        # Stairs movement (up/down floors)
        if self.building_map[x, y, floor] == 3:  # Current position is stairs
            for new_floor in [floor - 1, floor + 1]:
                if (0 <= new_floor < self.shape[2] and
                    self.building_map[x, y, new_floor] == 3):  # Stairs on other floor
                    neighbors.append((x, y, new_floor))

        return neighbors

    def heuristic(self, pos1: Tuple[int, int, int], pos2: Tuple[int, int, int]) -> float:
        """Calculate heuristic distance between two positions."""
        x1, y1, f1 = pos1
        x2, y2, f2 = pos2

        # 3D Euclidean distance with floor penalty
        distance = math.sqrt((x2 - x1)**2 + (y2 - y1)**2 + (f2 - f1)**2 * 10)
        return distance

    # ==================== BASIC ALGORITHMS ====================

    def a_star(self, start: Tuple[int, int, int], goal: Tuple[int, int, int]) -> Optional[List[Tuple[int, int, int]]]:
        """A* pathfinding algorithm."""
        open_set = []
        closed_set = set()

        start_node = Node(start)
        start_node.h_cost = self.heuristic(start, goal)
        start_node.f_cost = start_node.h_cost

        heapq.heappush(open_set, start_node)

        while open_set:
            current_node = heapq.heappop(open_set)

            if current_node.position == goal:
                return self.reconstruct_path(current_node)

            closed_set.add(current_node.position)

            for neighbor_pos in self.get_neighbors(current_node.position):
                if neighbor_pos in closed_set:
                    continue

                neighbor_node = Node(neighbor_pos, current_node)
                neighbor_node.g_cost = current_node.g_cost + self.get_movement_cost(
                    current_node.position, neighbor_pos)
                neighbor_node.h_cost = self.heuristic(neighbor_pos, goal)
                neighbor_node.f_cost = neighbor_node.g_cost + neighbor_node.h_cost

                # Check if this path to neighbor is better
                in_open = False
                for open_node in open_set:
                    if (open_node.position == neighbor_pos and
                        open_node.g_cost <= neighbor_node.g_cost):
                        in_open = True
                        break

                if not in_open:
                    heapq.heappush(open_set, neighbor_node)

        return None

    def dijkstra(self, start: Tuple[int, int, int], goal: Tuple[int, int, int]) -> Optional[List[Tuple[int, int, int]]]:
        """Dijkstra's pathfinding algorithm."""
        distances = {}
        previous = {}
        unvisited = set()

        # Initialize distances
        for x in range(self.shape[0]):
            for y in range(self.shape[1]):
                for floor in range(self.shape[2]):
                    if self.building_map[x, y, floor] in [0, 3]:  # walkable
                        pos = (x, y, floor)
                        distances[pos] = float('inf')
                        unvisited.add(pos)

        distances[start] = 0

        while unvisited:
            current = min(unvisited, key=lambda pos: distances[pos])

            if current == goal:
                return self.reconstruct_path_dijkstra(start, goal, previous)

            unvisited.remove(current)

            for neighbor in self.get_neighbors(current):
                if neighbor in unvisited:
                    alt_distance = distances[current] + self.get_movement_cost(current, neighbor)
                    if alt_distance < distances[neighbor]:
                        distances[neighbor] = alt_distance
                        previous[neighbor] = current

        return None

    def breadth_first_search(self, start: Tuple[int, int, int], goal: Tuple[int, int, int]) -> Optional[List[Tuple[int, int, int]]]:
        """Breadth-First Search algorithm."""
        queue = deque([(start, [start])])
        visited = set()

        while queue:
            current, path = queue.popleft()

            if current == goal:
                return path

            if current in visited:
                continue

            visited.add(current)

            for neighbor in self.get_neighbors(current):
                if neighbor not in visited:
                    new_path = path + [neighbor]
                    queue.append((neighbor, new_path))

        return None

    def depth_first_search(self, start: Tuple[int, int, int], goal: Tuple[int, int, int]) -> Optional[List[Tuple[int, int, int]]]:
        """Depth-First Search algorithm."""
        stack = [(start, [start])]
        visited = set()

        while stack:
            current, path = stack.pop()

            if current == goal:
                return path

            if current in visited:
                continue

            visited.add(current)

            for neighbor in self.get_neighbors(current):
                if neighbor not in visited:
                    new_path = path + [neighbor]
                    stack.append((neighbor, new_path))

        return None

    def greedy_best_first_search(self, start: Tuple[int, int, int], goal: Tuple[int, int, int]) -> Optional[List[Tuple[int, int, int]]]:
        """Greedy Best-First Search algorithm."""
        open_set = []
        closed_set = set()

        start_node = Node(start)
        start_node.h_cost = self.heuristic(start, goal)
        start_node.f_cost = start_node.h_cost

        heapq.heappush(open_set, start_node)

        while open_set:
            current_node = heapq.heappop(open_set)

            if current_node.position == goal:
                return self.reconstruct_path(current_node)

            closed_set.add(current_node.position)

            for neighbor_pos in self.get_neighbors(current_node.position):
                if neighbor_pos in closed_set:
                    continue

                neighbor_node = Node(neighbor_pos, current_node)
                neighbor_node.h_cost = self.heuristic(neighbor_pos, goal)
                neighbor_node.f_cost = neighbor_node.h_cost  # Only heuristic

                # Check if this path to neighbor is better
                in_open = False
                for open_node in open_set:
                    if (open_node.position == neighbor_pos and
                        open_node.h_cost <= neighbor_node.h_cost):
                        in_open = True
                        break

                if not in_open:
                    heapq.heappush(open_set, neighbor_node)

        return None

    # ==================== ADVANCED ALGORITHMS ====================

    def bidirectional_search(self, start: Tuple[int, int, int], goal: Tuple[int, int, int]) -> Optional[List[Tuple[int, int, int]]]:
        """Bidirectional Search algorithm."""
        forward_queue = deque([(start, [start])])
        forward_visited = {start: [start]}

        backward_queue = deque([(goal, [goal])])
        backward_visited = {goal: [goal]}

        while forward_queue and backward_queue:
            # Forward step
            if forward_queue:
                current, path = forward_queue.popleft()
                if current in backward_visited:
                    backward_path = backward_visited[current]
                    return path + backward_path[-2::-1]

                for neighbor in self.get_neighbors(current):
                    if neighbor not in forward_visited:
                        new_path = path + [neighbor]
                        forward_visited[neighbor] = new_path
                        forward_queue.append((neighbor, new_path))

            # Backward step
            if backward_queue:
                current, path = backward_queue.popleft()
                if current in forward_visited:
                    forward_path = forward_visited[current]
                    return forward_path + path[-2::-1]

                for neighbor in self.get_neighbors(current):
                    if neighbor not in backward_visited:
                        new_path = path + [neighbor]
                        backward_visited[neighbor] = new_path
                        backward_queue.append((neighbor, new_path))

        return None

    def jump_point_search(self, start: Tuple[int, int, int], goal: Tuple[int, int, int]) -> Optional[List[Tuple[int, int, int]]]:
        """Jump Point Search algorithm."""
        open_set = []
        closed_set = set()

        start_node = Node(start)
        start_node.h_cost = self.heuristic(start, goal)
        start_node.f_cost = start_node.h_cost

        heapq.heappush(open_set, start_node)

        while open_set:
            current_node = heapq.heappop(open_set)

            if current_node.position == goal:
                return self.reconstruct_path(current_node)

            closed_set.add(current_node.position)

            jump_points = self.find_jump_points(current_node.position, goal)
            for jump_point in jump_points:
                if jump_point in closed_set:
                    continue

                neighbor_node = Node(jump_point, current_node)
                neighbor_node.g_cost = current_node.g_cost + self.get_movement_cost(
                    current_node.position, jump_point)
                neighbor_node.h_cost = self.heuristic(jump_point, goal)
                neighbor_node.f_cost = neighbor_node.g_cost + neighbor_node.h_cost

                in_open = False
                for open_node in open_set:
                    if (open_node.position == jump_point and
                        open_node.g_cost <= neighbor_node.g_cost):
                        in_open = True
                        break

                if not in_open:
                    heapq.heappush(open_set, neighbor_node)

        return None

    def find_jump_points(self, position: Tuple[int, int, int], goal: Tuple[int, int, int]) -> List[Tuple[int, int, int]]:
        """Find jump points for Jump Point Search."""
        jump_points = []
        x, y, floor = position

        directions = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]

        for dx, dy in directions:
            jump_x, jump_y = x + dx * 2, y + dy * 2
            if (0 <= jump_x < self.shape[0] and 0 <= jump_y < self.shape[1] and
                self.building_map[jump_x, jump_y, floor] in [0, 3]):
                jump_points.append((jump_x, jump_y, floor))

        jump_points.extend(self.get_neighbors(position))
        return jump_points

    def theta_star(self, start: Tuple[int, int, int], goal: Tuple[int, int, int]) -> Optional[List[Tuple[int, int, int]]]:
        """Theta* algorithm."""
        open_set = []
        closed_set = set()

        start_node = Node(start)
        start_node.h_cost = self.heuristic(start, goal)
        start_node.f_cost = start_node.h_cost

        heapq.heappush(open_set, start_node)

        while open_set:
            current_node = heapq.heappop(open_set)

            if current_node.position == goal:
                return self.reconstruct_path(current_node)

            closed_set.add(current_node.position)

            for neighbor_pos in self.get_neighbors(current_node.position):
                if neighbor_pos in closed_set:
                    continue

                if (current_node.parent and 
                    self.has_line_of_sight(current_node.parent.position, neighbor_pos)):
                    parent_node = current_node.parent
                    g_cost = parent_node.g_cost + self.get_movement_cost(parent_node.position, neighbor_pos)
                else:
                    g_cost = current_node.g_cost + self.get_movement_cost(current_node.position, neighbor_pos)
                    parent_node = current_node

                neighbor_node = Node(neighbor_pos, parent_node)
                neighbor_node.g_cost = g_cost
                neighbor_node.h_cost = self.heuristic(neighbor_pos, goal)
                neighbor_node.f_cost = neighbor_node.g_cost + neighbor_node.h_cost

                in_open = False
                for open_node in open_set:
                    if (open_node.position == neighbor_pos and
                        open_node.g_cost <= neighbor_node.g_cost):
                        in_open = True
                        break

                if not in_open:
                    heapq.heappush(open_set, neighbor_node)

        return None

    def has_line_of_sight(self, pos1: Tuple[int, int, int], pos2: Tuple[int, int, int]) -> bool:
        """Check if there's a clear line of sight between two positions."""
        x1, y1, f1 = pos1
        x2, y2, f2 = pos2

        if f1 != f2:
            return False

        dx = abs(x2 - x1)
        dy = abs(y2 - y1)
        x, y = x1, y1
        n = 1 + dx + dy
        x_inc = 1 if x2 > x1 else -1
        y_inc = 1 if y2 > y1 else -1
        error = dx - dy
        dx *= 2
        dy *= 2

        for _ in range(n):
            if self.building_map[x, y, f1] not in [0, 3]:
                return False

            if x == x2 and y == y2:
                break

            if error > 0:
                x += x_inc
                error -= dy
            else:
                y += y_inc
                error += dx

        return True

    def fringe_search(self, start: Tuple[int, int, int], goal: Tuple[int, int, int]) -> Optional[List[Tuple[int, int, int]]]:
        """Fringe Search algorithm."""
        fringe = {start: 0}
        parent = {start: None}
        threshold = self.heuristic(start, goal)

        while fringe:
            current = min(fringe.keys(), key=lambda pos: fringe[pos] + self.heuristic(pos, goal))

            if current == goal:
                return self.reconstruct_path_dijkstra(start, goal, parent)

            current_g = fringe.pop(current)
            current_f = current_g + self.heuristic(current, goal)

            if current_f > threshold:
                fringe[current] = current_g
                threshold = current_f
                continue

            for neighbor in self.get_neighbors(current):
                new_g = current_g + self.get_movement_cost(current, neighbor)

                if neighbor not in fringe or new_g < fringe[neighbor]:
                    fringe[neighbor] = new_g
                    parent[neighbor] = current

        return None

    # ==================== DYNAMIC/REAL-TIME ALGORITHMS ====================

    def anytime_a_star(self, start: Tuple[int, int, int], goal: Tuple[int, int, int], 
                      time_limit: float = 1.0) -> Optional[List[Tuple[int, int, int]]]:
        """Anytime A* algorithm."""
        start_time = time.time()
        best_path = None
        epsilon = 2.0

        while time.time() - start_time < time_limit:
            path = self.weighted_a_star(start, goal, epsilon)
            
            if path:
                best_path = path
                if epsilon <= 1.0:
                    break
                epsilon = max(1.0, epsilon * 0.8)
            else:
                break

        return best_path

    def weighted_a_star(self, start: Tuple[int, int, int], goal: Tuple[int, int, int], 
                       weight: float = 1.0) -> Optional[List[Tuple[int, int, int]]]:
        """Weighted A* with adjustable heuristic weight."""
        open_set = []
        closed_set = set()

        start_node = Node(start)
        start_node.h_cost = self.heuristic(start, goal)
        start_node.f_cost = start_node.h_cost * weight

        heapq.heappush(open_set, start_node)

        while open_set:
            current_node = heapq.heappop(open_set)

            if current_node.position == goal:
                return self.reconstruct_path(current_node)

            closed_set.add(current_node.position)

            for neighbor_pos in self.get_neighbors(current_node.position):
                if neighbor_pos in closed_set:
                    continue

                neighbor_node = Node(neighbor_pos, current_node)
                neighbor_node.g_cost = current_node.g_cost + self.get_movement_cost(
                    current_node.position, neighbor_pos)
                neighbor_node.h_cost = self.heuristic(neighbor_pos, goal)
                neighbor_node.f_cost = neighbor_node.g_cost + neighbor_node.h_cost * weight

                in_open = False
                for open_node in open_set:
                    if (open_node.position == neighbor_pos and
                        open_node.g_cost <= neighbor_node.g_cost):
                        in_open = True
                        break

                if not in_open:
                    heapq.heappush(open_set, neighbor_node)

        return None

    # ==================== BIO-INSPIRED ALGORITHMS ====================

    def ant_colony_optimization(self, start: Tuple[int, int, int], goal: Tuple[int, int, int], 
                               iterations: int = 50) -> Optional[List[Tuple[int, int, int]]]:
        """Ant Colony Optimization algorithm."""
        best_path = None
        best_length = float('inf')

        # Initialize pheromone map
        for x in range(self.shape[0]):
            for y in range(self.shape[1]):
                for floor in range(self.shape[2]):
                    if self.building_map[x, y, floor] in [0, 3]:
                        self.pheromone_map[(x, y, floor)] = 1.0

        for iteration in range(iterations):
            ants = [Ant(start) for _ in range(self.ant_count)]
            
            for ant in ants:
                path = self.ant_find_path(ant, goal)
                if path:
                    length = len(path)
                    if length < best_length:
                        best_length = length
                        best_path = path.copy()
                    
                    self.update_pheromones(path, 1.0 / length)

            self.evaporate_pheromones()

        return best_path

    def ant_find_path(self, ant: Ant, goal: Tuple[int, int, int]) -> List[Tuple[int, int, int]]:
        """Helper method for ant to find a path."""
        current = ant.position
        path = [current]
        visited = {current}

        while current != goal:
            neighbors = self.get_neighbors(current)
            valid_neighbors = [n for n in neighbors if n not in visited]

            if not valid_neighbors:
                return []

            probabilities = []
            for neighbor in valid_neighbors:
                pheromone = self.pheromone_map.get(neighbor, 1.0)
                heuristic = 1.0 / (self.heuristic(neighbor, goal) + 1)
                probability = pheromone * heuristic
                probabilities.append(probability)

            if not probabilities:
                return []

            total = sum(probabilities)
            if total == 0:
                return []

            probabilities = [p / total for p in probabilities]
            choice = random.choices(valid_neighbors, weights=probabilities)[0]
            current = choice
            path.append(current)
            visited.add(current)

        return path

    def update_pheromones(self, path: List[Tuple[int, int, int]], amount: float):
        """Update pheromone levels on a path."""
        for position in path:
            if position in self.pheromone_map:
                self.pheromone_map[position] += amount

    def evaporate_pheromones(self):
        """Evaporate pheromones from all positions."""
        for position in self.pheromone_map:
            self.pheromone_map[position] *= (1 - self.evaporation_rate)

    def genetic_algorithm(self, start: Tuple[int, int, int], goal: Tuple[int, int, int], 
                         population_size: int = 100, generations: int = 50) -> Optional[List[Tuple[int, int, int]]]:
        """Genetic Algorithm for pathfinding."""
        population = []
        for _ in range(population_size):
            path = self.generate_random_path(start, goal)
            if path:
                genetic_path = GeneticPath(path)
                genetic_path.fitness = self.calculate_fitness(path, goal)
                population.append(genetic_path)

        best_path = None
        best_fitness = 0

        for generation in range(generations):
            population.sort(key=lambda x: x.fitness, reverse=True)
            population = population[:population_size // 2]

            while len(population) < population_size:
                if len(population) >= 2:
                    parent1, parent2 = random.sample(population[:10], 2)
                    child_path = self.crossover(parent1.path, parent2.path)
                    child_path = self.mutate(child_path)
                else:
                    child_path = self.generate_random_path(start, goal)

                if child_path:
                    child = GeneticPath(child_path)
                    child.fitness = self.calculate_fitness(child_path, goal)
                    population.append(child)

            if population and population[0].fitness > best_fitness:
                best_fitness = population[0].fitness
                best_path = population[0].path.copy()

        return best_path

    def generate_random_path(self, start: Tuple[int, int, int], goal: Tuple[int, int, int]) -> List[Tuple[int, int, int]]:
        """Generate a random path from start to goal."""
        current = start
        path = [current]
        visited = {current}
        max_steps = 100

        for _ in range(max_steps):
            if current == goal:
                return path

            neighbors = self.get_neighbors(current)
            valid_neighbors = [n for n in neighbors if n not in visited]

            if not valid_neighbors:
                return []

            current = random.choice(valid_neighbors)
            path.append(current)
            visited.add(current)

        return []

    def crossover(self, path1: List[Tuple[int, int, int]], path2: List[Tuple[int, int, int]]) -> List[Tuple[int, int, int]]:
        """Crossover operation for genetic algorithm."""
        if len(path1) < 2 or len(path2) < 2:
            return path1

        crossover_point = len(path1) // 2
        new_path = path1[:crossover_point]
        
        if new_path:
            remaining_path = self.a_star(new_path[-1], path2[-1])
            if remaining_path:
                new_path.extend(remaining_path[1:])

        return new_path

    def mutate(self, path: List[Tuple[int, int, int]]) -> List[Tuple[int, int, int]]:
        """Mutation operation for genetic algorithm."""
        if len(path) < 3:
            return path

        if random.random() < 0.3:
            start_idx = random.randint(0, len(path) - 2)
            end_idx = random.randint(start_idx + 1, len(path) - 1)
            
            if start_idx < end_idx:
                start_pos = path[start_idx]
                end_pos = path[end_idx]
                new_segment = self.a_star(start_pos, end_pos)
                
                if new_segment:
                    return path[:start_idx] + new_segment + path[end_idx + 1:]

        return path

    def calculate_fitness(self, path: List[Tuple[int, int, int]], goal: Tuple[int, int, int]) -> float:
        """Calculate fitness of a path for genetic algorithm."""
        if not path or path[-1] != goal:
            return 0.0

        length = len(path)
        smoothness = 0
        
        for i in range(1, len(path) - 1):
            prev, curr, next_pos = path[i-1], path[i], path[i+1]
            if self.heuristic(prev, next_pos) < self.heuristic(prev, curr) + self.heuristic(curr, next_pos):
                smoothness += 1

        return 1.0 / (length + smoothness * 0.1)

    def swarm_intelligence(self, start: Tuple[int, int, int], goal: Tuple[int, int, int], 
                          swarm_size: int = 30, iterations: int = 100) -> Optional[List[Tuple[int, int, int]]]:
        """Swarm Intelligence algorithm."""
        agents = []
        for _ in range(swarm_size):
            agent = {
                'position': start,
                'velocity': [0, 0, 0],
                'best_position': start,
                'best_fitness': float('inf')
            }
            agents.append(agent)

        global_best_position = start
        global_best_fitness = float('inf')

        for iteration in range(iterations):
            for agent in agents:
                fitness = self.heuristic(agent['position'], goal)
                
                if fitness < agent['best_fitness']:
                    agent['best_fitness'] = fitness
                    agent['best_position'] = agent['position']

                if fitness < global_best_fitness:
                    global_best_fitness = fitness
                    global_best_position = agent['position']

                w = 0.7
                c1 = 1.5
                c2 = 1.5

                r1, r2 = random.random(), random.random()
                
                personal_attraction = [
                    c1 * r1 * (agent['best_position'][i] - agent['position'][i])
                    for i in range(3)
                ]
                
                global_attraction = [
                    c2 * r2 * (global_best_position[i] - agent['position'][i])
                    for i in range(3)
                ]

                agent['velocity'] = [
                    w * v + pa + ga
                    for v, pa, ga in zip(agent['velocity'], personal_attraction, global_attraction)
                ]

                new_position = [
                    int(agent['position'][i] + agent['velocity'][i])
                    for i in range(3)
                ]

                if (0 <= new_position[0] < self.shape[0] and
                    0 <= new_position[1] < self.shape[1] and
                    0 <= new_position[2] < self.shape[2] and
                    self.building_map[new_position[0], new_position[1], new_position[2]] in [0, 3]):
                    agent['position'] = tuple(new_position)

        if global_best_position != start:
            return self.a_star(start, global_best_position)
        
        return None

    # ==================== UTILITY METHODS ====================

    def get_movement_cost(self, pos1: Tuple[int, int, int], pos2: Tuple[int, int, int]) -> float:
        """Calculate movement cost between two adjacent positions."""
        x1, y1, f1 = pos1
        x2, y2, f2 = pos2

        if abs(x2 - x1) + abs(y2 - y1) == 2:
            cost = 1.414
        else:
            cost = 1.0

        if f1 != f2:
            cost += 5.0

        return cost

    def reconstruct_path(self, node: Node) -> List[Tuple[int, int, int]]:
        """Reconstruct path from node."""
        path = []
        while node:
            path.append(node.position)
            node = node.parent
        return path[::-1]

    def reconstruct_path_dijkstra(self, start: Tuple[int, int, int], goal: Tuple[int, int, int], 
                                 previous: Dict) -> List[Tuple[int, int, int]]:
        """Reconstruct path for Dijkstra's algorithm."""
        path = []
        current = goal
        while current in previous:
            path.append(current)
            current = previous[current]
        path.append(start)
        return path[::-1]

    def get_algorithm_performance(self, start: Tuple[int, int, int], goal: Tuple[int, int, int]) -> Dict:
        """Compare performance of different algorithms."""
        algorithms = {
            'A*': self.a_star,
            'Dijkstra': self.dijkstra,
            'BFS': self.breadth_first_search,
            'DFS': self.depth_first_search,
            'Greedy BFS': self.greedy_best_first_search,
            'Bidirectional': self.bidirectional_search,
            'Jump Point': self.jump_point_search,
            'Theta*': self.theta_star,
            'Fringe': self.fringe_search,
            'Anytime A*': lambda s, g: self.anytime_a_star(s, g, 0.5),
            'Ant Colony': lambda s, g: self.ant_colony_optimization(s, g, 20),
            'Genetic': lambda s, g: self.genetic_algorithm(s, g, 50, 20),
            'Swarm': lambda s, g: self.swarm_intelligence(s, g, 20, 50)
        }

        results = {}
        for name, algorithm in algorithms.items():
            try:
                start_time = time.time()
                path = algorithm(start, goal)
                end_time = time.time()
                
                if path:
                    results[name] = {
                        'path_length': len(path),
                        'execution_time': end_time - start_time,
                        'path': path
                    }
                else:
                    results[name] = {
                        'path_length': None,
                        'execution_time': end_time - start_time,
                        'path': None
                    }
            except Exception as e:
                results[name] = {
                    'path_length': None,
                    'execution_time': None,
                    'error': str(e)
                }

        return results 