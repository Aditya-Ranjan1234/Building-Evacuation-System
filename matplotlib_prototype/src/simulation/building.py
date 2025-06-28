"""
Building simulation module for evacuation system.
Handles building layout, fire spread, and environment dynamics.
"""

import numpy as np
import random
from typing import Tuple, List, Set
import time


class Building:
    """Represents a multi-floor building with dynamic fire simulation."""
    
    def __init__(self, width: int = 20, height: int = 20, floors: int = 3):
        """
        Initialize building.
        
        Args:
            width: Building width in grid units
            height: Building height in grid units  
            floors: Number of floors
        """
        self.width = width
        self.height = height
        self.floors = floors
        self.shape = (width, height, floors)
        
        # Building map: 0=walkable, 1=wall, 2=fire, 3=stairs, 4=exit
        self.map = np.zeros(self.shape, dtype=int)
        self.fire_positions = set()
        self.fire_spread_rate = 0.1  # Probability of fire spreading per timestep
        self.fire_start_time = None
        
        self._generate_building_layout()
        
    def _generate_building_layout(self):
        """Generate a realistic building layout with rooms, corridors, and stairs."""
        
        # Add walls around perimeter
        self.map[0, :, :] = 1  # Left wall
        self.map[-1, :, :] = 1  # Right wall
        self.map[:, 0, :] = 1  # Bottom wall
        self.map[:, -1, :] = 1  # Top wall
        
        # Add some internal walls to create rooms
        for floor in range(self.floors):
            # Vertical walls
            self.map[self.width//3, 2:self.height//2, floor] = 1
            self.map[2*self.width//3, self.height//2:self.height-2, floor] = 1
            
            # Horizontal walls
            self.map[2:self.width//2, self.height//3, floor] = 1
            self.map[self.width//2:self.width-2, 2*self.height//3, floor] = 1
            
            # Add some doors (gaps in walls)
            self.map[self.width//3, self.height//4, floor] = 0
            self.map[2*self.width//3, 3*self.height//4, floor] = 0
            self.map[self.width//4, self.height//3, floor] = 0
            self.map[3*self.width//4, 2*self.height//3, floor] = 0
        
        # Add stairs connecting floors
        stair_x, stair_y = self.width//2, self.height//2
        for floor in range(self.floors):
            self.map[stair_x:stair_x+2, stair_y:stair_y+2, floor] = 3
        
        # Add exits on ground floor
        self.map[1, self.height//2, 0] = 4  # Left exit
        self.map[self.width-2, self.height//2, 0] = 4  # Right exit
        
    def start_fire(self, position: Tuple[int, int, int]):
        """
        Start fire at specified position.
        
        Args:
            position: (x, y, floor) coordinates to start fire
        """
        x, y, floor = position
        if (0 <= x < self.width and 0 <= y < self.height and 
            0 <= floor < self.floors and self.map[x, y, floor] == 0):
            
            self.map[x, y, floor] = 2
            self.fire_positions.add(position)
            self.fire_start_time = time.time()
            
    def spread_fire(self):
        """Simulate fire spreading to adjacent walkable areas."""
        new_fire_positions = set()
        
        for fire_pos in self.fire_positions.copy():
            x, y, floor = fire_pos
            
            # Check 8 adjacent positions
            for dx in [-1, 0, 1]:
                for dy in [-1, 0, 1]:
                    if dx == 0 and dy == 0:
                        continue
                        
                    new_x, new_y = x + dx, y + dy
                    
                    if (0 <= new_x < self.width and 0 <= new_y < self.height and
                        self.map[new_x, new_y, floor] == 0):  # Walkable area
                        
                        if random.random() < self.fire_spread_rate:
                            self.map[new_x, new_y, floor] = 2
                            new_fire_positions.add((new_x, new_y, floor))
        
        self.fire_positions.update(new_fire_positions)
        
    def get_safe_positions(self) -> List[Tuple[int, int, int]]:
        """Get all safe (walkable) positions in the building."""
        safe_positions = []
        
        for x in range(self.width):
            for y in range(self.height):
                for floor in range(self.floors):
                    if self.map[x, y, floor] in [0, 3, 4]:  # walkable, stairs, or exit
                        safe_positions.append((x, y, floor))
        
        return safe_positions
    
    def get_exit_positions(self) -> List[Tuple[int, int, int]]:
        """Get all exit positions."""
        exits = []
        
        for x in range(self.width):
            for y in range(self.height):
                for floor in range(self.floors):
                    if self.map[x, y, floor] == 4:
                        exits.append((x, y, floor))
        
        return exits
    
    def is_position_safe(self, position: Tuple[int, int, int]) -> bool:
        """Check if a position is safe (not on fire)."""
        x, y, floor = position
        return self.map[x, y, floor] != 2
    
    def get_fire_positions(self) -> Set[Tuple[int, int, int]]:
        """Get all current fire positions."""
        return self.fire_positions.copy()
    
    def reset_fire(self):
        """Reset fire simulation."""
        # Remove all fire from map
        self.map[self.map == 2] = 0
        self.fire_positions.clear()
        self.fire_start_time = None
        
    def get_building_info(self) -> dict:
        """Get building information for display."""
        return {
            'dimensions': (self.width, self.height, self.floors),
            'total_walkable_area': np.sum(self.map == 0),
            'fire_area': len(self.fire_positions),
            'exits': len(self.get_exit_positions()),
            'stairs': np.sum(self.map == 3)
        }


class Person:
    """Represents a person in the building that needs to be evacuated."""
    
    def __init__(self, position: Tuple[int, int, int], name: str = "Person"):
        """
        Initialize person.
        
        Args:
            position: Starting position (x, y, floor)
            name: Person's name/identifier
        """
        self.position = position
        self.name = name
        self.path = []
        self.current_path_index = 0
        self.is_evacuated = False
        self.movement_speed = 1  # positions per timestep
        
    def set_evacuation_path(self, path: List[Tuple[int, int, int]]):
        """Set the evacuation path for this person."""
        self.path = path
        self.current_path_index = 0
        
    def move_along_path(self) -> bool:
        """
        Move person along their evacuation path.
        
        Returns:
            True if person reached destination, False otherwise
        """
        if not self.path or self.current_path_index >= len(self.path):
            return True
            
        # Move to next position in path
        if self.current_path_index < len(self.path) - 1:
            self.current_path_index += self.movement_speed
            if self.current_path_index >= len(self.path):
                self.current_path_index = len(self.path) - 1
                
            self.position = self.path[self.current_path_index]
            
        return self.current_path_index >= len(self.path) - 1
    
    def get_current_position(self) -> Tuple[int, int, int]:
        """Get current position of the person."""
        return self.position


class EvacuationSimulation:
    """Main simulation class coordinating building, fire, and evacuation."""
    
    def __init__(self, building: Building):
        """Initialize simulation with a building."""
        self.building = building
        self.people = []
        self.timestep = 0
        self.simulation_running = False
        
    def add_person(self, position: Tuple[int, int, int], name: str = None) -> Person:
        """Add a person to the simulation."""
        if name is None:
            name = f"Person_{len(self.people) + 1}"
            
        person = Person(position, name)
        self.people.append(person)
        return person
    
    def step(self):
        """Advance simulation by one timestep."""
        if not self.simulation_running:
            return
            
        # Spread fire
        self.building.spread_fire()
        
        # Move people along their paths
        for person in self.people:
            if not person.is_evacuated:
                reached_exit = person.move_along_path()
                if reached_exit:
                    # Check if person reached an actual exit
                    pos = person.get_current_position()
                    if pos in self.building.get_exit_positions():
                        person.is_evacuated = True
        
        self.timestep += 1
        
    def start_simulation(self):
        """Start the simulation."""
        self.simulation_running = True
        self.timestep = 0
        
    def stop_simulation(self):
        """Stop the simulation."""
        self.simulation_running = False
        
    def reset_simulation(self):
        """Reset simulation to initial state."""
        self.building.reset_fire()
        self.people.clear()
        self.timestep = 0
        self.simulation_running = False
        
    def get_simulation_stats(self) -> dict:
        """Get current simulation statistics."""
        evacuated_count = sum(1 for person in self.people if person.is_evacuated)
        
        return {
            'timestep': self.timestep,
            'total_people': len(self.people),
            'evacuated_people': evacuated_count,
            'people_remaining': len(self.people) - evacuated_count,
            'fire_area': len(self.building.fire_positions),
            'simulation_running': self.simulation_running
        }
