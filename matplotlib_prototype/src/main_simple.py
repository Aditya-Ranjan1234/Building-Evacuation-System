#!/usr/bin/env python3
"""
Simple version of the Building Evacuation System that works without display issues.
"""

import sys
import os
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
from typing import Tuple, List

# Add src directory to path for imports
src_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, src_dir)

from simulation.building import Building, EvacuationSimulation
from algorithms.pathfinding_enhanced import EnhancedPathFinder


class SimpleEvacuationApp:
    """Simple evacuation application that works without display."""

    def __init__(self):
        """Initialize the simple evacuation application."""
        self.building = None
        self.simulation = None
        self.pathfinder = None

        self._setup_application()

    def _setup_application(self):
        """Setup the application components."""
        print("🏢 Building Evacuation System - Simple Mode")
        print("=" * 60)

        # Create building
        self.building = Building(width=20, height=20, floors=3)
        print(f"✅ Building created: {self.building.width}x{self.building.height}x{self.building.floors}")

        # Create simulation
        self.simulation = EvacuationSimulation(self.building)
        print("✅ Simulation initialized")

        # Add some people to evacuate
        self._add_sample_people()

        # Create pathfinder
        self.pathfinder = EnhancedPathFinder(self.building.map)
        print("✅ Enhanced PathFinder created")

        # Display building info
        self._display_building_info()

    def _add_sample_people(self):
        """Add sample people to the building for demonstration."""
        # Add people on different floors
        sample_positions = [
            (5, 5, 0),   # Ground floor
            (15, 15, 1), # First floor
            (8, 12, 2),  # Second floor
            (12, 8, 1),  # First floor
        ]

        for i, pos in enumerate(sample_positions):
            if self.building.map[pos] == 0:  # Ensure position is walkable
                person = self.simulation.add_person(pos, f"Person_{i+1}")
                print(f"👤 Added {person.name} at position {pos}")

    def _display_building_info(self):
        """Display building information."""
        info = self.building.get_building_info()
        print("\n🏗️  Building Information:")
        print(f"   Dimensions: {info['dimensions']}")
        print(f"   Walkable area: {info['total_walkable_area']} cells")
        print(f"   Exits: {info['exits']}")
        print(f"   Stairs: {info['stairs']} cells")

    def run_demo_scenario(self):
        """Run a predefined demo scenario."""
        print("\n🔥 Running Demo Scenario...")

        # Start fire at a specific location
        fire_position = (10, 10, 1)  # First floor
        self.building.start_fire(fire_position)
        print(f"🔥 Fire started at {fire_position}")

        # Calculate evacuation paths for all people
        exits = self.building.get_exit_positions()
        print(f"🗺️  Found {len(exits)} exits")

        for person in self.simulation.people:
            if person.is_evacuated:
                continue

            start_pos = person.position
            print(f"\n👤 Calculating path for {person.name} from {start_pos}")

            # Test different algorithms
            algorithms = [
                ("A*", self.pathfinder.a_star),
                ("Dijkstra", self.pathfinder.dijkstra),
                ("BFS", self.pathfinder.breadth_first_search),
                ("DFS", self.pathfinder.depth_first_search),
                ("Greedy BFS", self.pathfinder.greedy_best_first_search),
            ]

            best_path = None
            best_algorithm = None
            min_distance = float('inf')

            for alg_name, alg_func in algorithms:
                try:
                    for exit_pos in exits:
                        path = alg_func(start_pos, exit_pos)
                        if path and len(path) < min_distance:
                            min_distance = len(path)
                            best_path = path
                            best_algorithm = alg_name
                except Exception as e:
                    print(f"   ❌ {alg_name} failed: {e}")

            if best_path:
                person.set_evacuation_path(best_path)
                print(f"   ✅ {best_algorithm} found path: {len(best_path)} steps")
            else:
                print(f"   ❌ No path found for {person.name}")

        # Run simulation for a few steps
        print("\n▶️  Running simulation for 10 steps...")
        for step in range(10):
            self.simulation.step()
            stats = self.simulation.get_simulation_stats()
            print(f"   Step {step + 1}: {stats['people_remaining']} people remaining, {stats['fire_area']} fire cells")

        # Show final results
        final_stats = self.simulation.get_simulation_stats()
        print(f"\n📊 Final Results:")
        print(f"   People evacuated: {final_stats['evacuated_people']}/{final_stats['total_people']}")
        print(f"   Fire area: {final_stats['fire_area']} cells")
        print(f"   Simulation completed successfully!")

        return True

    def run_algorithm_comparison(self):
        """Run algorithm comparison."""
        print("\n📊 Running Algorithm Comparison...")

        # Test different scenarios
        scenarios = [
            {"fire_pos": (5, 5, 0), "name": "Ground Floor Fire"},
            {"fire_pos": (10, 10, 1), "name": "First Floor Fire"},
            {"fire_pos": (15, 15, 2), "name": "Top Floor Fire"},
        ]

        algorithms = [
            ("A*", self.pathfinder.a_star),
            ("Dijkstra", self.pathfinder.dijkstra),
            ("BFS", self.pathfinder.breadth_first_search),
            ("DFS", self.pathfinder.depth_first_search),
            ("Greedy BFS", self.pathfinder.greedy_best_first_search),
        ]

        for scenario in scenarios:
            print(f"\n🧪 Testing: {scenario['name']}")

            # Reset building
            self.building.reset_fire()
            self.building.start_fire(scenario['fire_pos'])

            # Test pathfinding for each person
            for person in self.simulation.people:
                start_pos = person.position
                exits = self.building.get_exit_positions()

                print(f"   Testing {person.name}: {start_pos}")

                for alg_name, alg_func in algorithms:
                    try:
                        start_time = time.time()
                        path = None
                        
                        for exit_pos in exits:
                            result = alg_func(start_pos, exit_pos)
                            if result and (path is None or len(result) < len(path)):
                                path = result
                        
                        execution_time = time.time() - start_time
                        
                        if path:
                            print(f"     ✅ {alg_name}: {len(path)} steps, {execution_time*1000:.2f}ms")
                        else:
                            print(f"     ❌ {alg_name}: No path found, {execution_time*1000:.2f}ms")
                            
                    except Exception as e:
                        print(f"     ❌ {alg_name}: Error - {e}")

    def show_menu(self):
        """Show the main menu."""
        while True:
            print("\n" + "=" * 60)
            print("🏢 Building Evacuation System - Simple Mode Menu")
            print("=" * 60)
            print("1. Run Demo Scenario")
            print("2. Run Algorithm Comparison")
            print("3. Exit")
            print("")

            try:
                choice = input("Select option (1-3): ").strip()
                
                if choice == '1':
                    self.run_demo_scenario()
                elif choice == '2':
                    self.run_algorithm_comparison()
                elif choice == '3':
                    print("👋 Goodbye!")
                    break
                else:
                    print("❌ Invalid option. Please select 1-3.")
                    
            except KeyboardInterrupt:
                print("\n👋 Application interrupted by user. Goodbye!")
                break
            except Exception as e:
                print(f"❌ Error: {e}")


def main():
    """Main function for simple mode."""
    try:
        import time
        app = SimpleEvacuationApp()
        app.show_menu()
    except Exception as e:
        print(f"❌ Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main() 