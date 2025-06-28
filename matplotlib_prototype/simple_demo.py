#!/usr/bin/env python3
"""
Simple demo script for Building Evacuation System.
This is a simplified version that's easier to run and debug.
"""

import sys
import os
import matplotlib.pyplot as plt
import numpy as np

# Add src directory to path
src_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src')
sys.path.insert(0, src_dir)

from simulation.building import Building, EvacuationSimulation
from algorithms.pathfinding import PathFinder

def simple_demo():
    """Run a simple demonstration of the evacuation system."""
    print("🏢 Building Evacuation System - Simple Demo")
    print("=" * 50)
    
    # Create building
    print("🏗️  Creating building...")
    building = Building(width=15, height=15, floors=2)
    print(f"✅ Building created: {building.width}x{building.height}x{building.floors}")
    
    # Create simulation
    print("🎮 Setting up simulation...")
    simulation = EvacuationSimulation(building)
    
    # Add some people
    people_positions = [
        (3, 3, 0),   # Ground floor
        (12, 12, 1), # First floor
        (6, 8, 1),   # First floor
    ]
    
    for i, pos in enumerate(people_positions):
        if building.map[pos[0]][pos[1]][pos[2]] == 0:  # Walkable
            person = simulation.add_person(pos, f"Person_{i+1}")
            print(f"👤 Added {person.name} at position {pos}")
    
    # Start fire
    fire_pos = (7, 7, 0)
    building.start_fire(fire_pos)
    print(f"🔥 Fire started at {fire_pos}")
    
    # Calculate paths
    print("🗺️  Calculating evacuation paths...")
    pathfinder = PathFinder(building.map)
    exits = building.get_exit_positions()
    
    paths_found = 0
    for person in simulation.people:
        # Find best path to nearest exit
        best_path = None
        min_length = float('inf')
        
        for exit in exits:
            path = pathfinder.a_star(person.position, exit)
            if path and len(path) < min_length:
                best_path = path
                min_length = len(path)
        
        if best_path:
            person.path = best_path
            paths_found += 1
            print(f"  ✅ Path found for {person.name}: {len(best_path)} steps")
        else:
            print(f"  ❌ No path found for {person.name}")
    
    print(f"📊 Paths calculated for {paths_found}/{len(simulation.people)} people")
    
    # Simple visualization
    print("📈 Creating simple visualization...")
    create_simple_plot(building, simulation)
    
    print("\n🎉 Demo completed successfully!")
    print("💡 For full interactive experience, try: python src/main.py")

def create_simple_plot(building, simulation):
    """Create a simple 2D plot of the building and evacuation."""
    fig, axes = plt.subplots(1, building.floors, figsize=(15, 5))
    if building.floors == 1:
        axes = [axes]
    
    for floor in range(building.floors):
        ax = axes[floor]
        
        # Create floor map for visualization
        floor_map = building.map[:, :, floor].T  # Transpose for correct orientation
        
        # Color map: 0=white (walkable), 1=black (wall), 2=red (fire), 3=green (stairs), 4=yellow (exit)
        colors = ['white', 'black', 'red', 'green', 'yellow']
        cmap = plt.matplotlib.colors.ListedColormap(colors)
        
        # Plot building layout
        im = ax.imshow(floor_map, cmap=cmap, vmin=0, vmax=4, origin='lower')
        
        # Plot people on this floor
        for person in simulation.people:
            if person.position[2] == floor:
                ax.plot(person.position[0], person.position[1], 'bo', markersize=10, label=person.name)
        
        # Plot paths
        for person in simulation.people:
            if hasattr(person, 'path') and person.path:
                # Extract path points for this floor
                floor_path = [(p[0], p[1]) for p in person.path if p[2] == floor]
                if len(floor_path) > 1:
                    path_x, path_y = zip(*floor_path)
                    ax.plot(path_x, path_y, 'r-', linewidth=2, alpha=0.7)
        
        ax.set_title(f'Floor {floor}')
        ax.set_xlabel('X')
        ax.set_ylabel('Y')
        ax.grid(True, alpha=0.3)
        
        # Add legend for first floor
        if floor == 0:
            legend_elements = [
                plt.Rectangle((0,0),1,1, facecolor='white', edgecolor='black', label='Walkable'),
                plt.Rectangle((0,0),1,1, facecolor='black', label='Wall'),
                plt.Rectangle((0,0),1,1, facecolor='red', label='Fire'),
                plt.Rectangle((0,0),1,1, facecolor='green', label='Stairs'),
                plt.Rectangle((0,0),1,1, facecolor='yellow', label='Exit'),
                plt.Line2D([0], [0], marker='o', color='w', markerfacecolor='blue', markersize=10, label='Person'),
                plt.Line2D([0], [0], color='red', linewidth=2, label='Evacuation Path')
            ]
            ax.legend(handles=legend_elements, bbox_to_anchor=(1.05, 1), loc='upper left')
    
    plt.tight_layout()
    plt.show()
    
    # Print some statistics
    print("\n📊 Simulation Statistics:")
    stats = simulation.get_simulation_stats()
    for key, value in stats.items():
        print(f"  {key}: {value}")

if __name__ == "__main__":
    try:
        simple_demo()
    except KeyboardInterrupt:
        print("\n\n👋 Demo interrupted by user.")
    except Exception as e:
        print(f"\n❌ Error occurred: {e}")
        import traceback
        traceback.print_exc()
        print("\n🔧 Try running the import test first: python test_imports.py")
