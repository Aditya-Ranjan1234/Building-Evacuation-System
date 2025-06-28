#!/usr/bin/env python3
"""
Simple demo script for the Building Evacuation System.
"""

import sys
import os
import time

# Add src directory to path for imports
src_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src')
sys.path.insert(0, src_dir)

from simulation.building import Building, EvacuationSimulation
from algorithms.pathfinding_enhanced import EnhancedPathFinder


def main():
    """Run a simple demo of the evacuation system."""
    print("🏢 Building Evacuation System - Simple Demo")
    print("=" * 60)

    # Create building
    building = Building(width=20, height=20, floors=3)
    print(f"✅ Building created: {building.width}x{building.height}x{building.floors}")

    # Create simulation
    simulation = EvacuationSimulation(building)
    print("✅ Simulation initialized")

    # Add people
    sample_positions = [
        (5, 5, 0),   # Ground floor
        (15, 15, 1), # First floor
        (8, 12, 2),  # Second floor
    ]

    for i, pos in enumerate(sample_positions):
        if building.map[pos] == 0:  # Ensure position is walkable
            person = simulation.add_person(pos, f"Person_{i+1}")
            print(f"👤 Added {person.name} at position {pos}")

    # Create pathfinder
    pathfinder = EnhancedPathFinder(building.map)
    print("✅ Enhanced PathFinder created")

    # Display building info
    info = building.get_building_info()
    print(f"\n🏗️  Building Information:")
    print(f"   Dimensions: {info['dimensions']}")
    print(f"   Walkable area: {info['total_walkable_area']} cells")
    print(f"   Exits: {info['exits']}")
    print(f"   Stairs: {info['stairs']} cells")

    # Start fire
    fire_position = (10, 10, 1)  # First floor
    building.start_fire(fire_position)
    print(f"\n🔥 Fire started at {fire_position}")

    # Calculate evacuation paths
    exits = building.get_exit_positions()
    print(f"🗺️  Found {len(exits)} exits")

    for person in simulation.people:
        if person.is_evacuated:
            continue

        start_pos = person.position
        print(f"\n👤 Calculating path for {person.name} from {start_pos}")

        # Test A* algorithm
        try:
            best_path = None
            min_distance = float('inf')

            for exit_pos in exits:
                path = pathfinder.a_star(start_pos, exit_pos)
                if path and len(path) < min_distance:
                    min_distance = len(path)
                    best_path = path

            if best_path:
                person.set_evacuation_path(best_path)
                print(f"   ✅ A* found path: {len(best_path)} steps")
            else:
                print(f"   ❌ No path found for {person.name}")
        except Exception as e:
            print(f"   ❌ Error calculating path: {e}")

    # Run simulation
    print("\n▶️  Running simulation for 10 steps...")
    for step in range(10):
        simulation.step()
        stats = simulation.get_simulation_stats()
        print(f"   Step {step + 1}: {stats['people_remaining']} people remaining, {stats['fire_area']} fire cells")

    # Show final results
    final_stats = simulation.get_simulation_stats()
    print(f"\n📊 Final Results:")
    print(f"   People evacuated: {final_stats['evacuated_people']}/{final_stats['total_people']}")
    print(f"   Fire area: {final_stats['fire_area']} cells")
    print(f"   Simulation completed successfully!")

    return True


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
