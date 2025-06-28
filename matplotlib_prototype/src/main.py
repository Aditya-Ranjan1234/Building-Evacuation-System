"""
Main application for Building Evacuation System using Matplotlib.
Demonstrates optimized path planning with dynamic fire simulation.
"""

import sys
import os
import numpy as np
import matplotlib.pyplot as plt
from typing import Tuple, List

# Add src directory to path for imports
src_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, src_dir)

from simulation.building import Building, EvacuationSimulation
from visualization.plotter import BuildingVisualizer, InteractiveController
from algorithms.pathfinding import PathFinder


class EvacuationApp:
    """Main application class for the evacuation simulation."""

    def __init__(self):
        """Initialize the evacuation application."""
        self.building = None
        self.simulation = None
        self.visualizer = None
        self.controller = None

        self._setup_application()

    def _setup_application(self):
        """Setup the application components."""
        print("🏢 Building Evacuation System - Matplotlib Prototype")
        print("=" * 60)

        # Create building
        self.building = Building(width=20, height=20, floors=3)
        print(f"✅ Building created: {self.building.width}x{self.building.height}x{self.building.floors}")

        # Create simulation
        self.simulation = EvacuationSimulation(self.building)
        print("✅ Simulation initialized")

        # Add some people to evacuate
        self._add_sample_people()

        # Create visualizer
        self.visualizer = BuildingVisualizer(self.simulation)
        print("✅ 3D Visualizer created")

        # Create interactive controller
        self.controller = InteractiveController(self.visualizer)
        print("✅ Interactive controller ready")

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

        print("\n🎮 Interactive Controls:")
        print("   Left Click: Place fire at clicked position")
        print("   Spacebar: Start/Stop simulation")
        print("   R: Reset simulation")
        print("   C: Calculate evacuation paths")
        print("   H: Show help")

    def run_demo_scenario(self):
        """Run a predefined demo scenario."""
        print("\n🔥 Running Demo Scenario...")

        # Start fire at a specific location
        fire_position = (10, 10, 1)  # First floor
        self.building.start_fire(fire_position)
        print(f"🔥 Fire started at {fire_position}")

        # Calculate initial evacuation paths
        self.visualizer.calculate_evacuation_paths()
        print("🗺️  Initial evacuation paths calculated")

        # Update visualization
        self.visualizer.update_visualization()

        # Start simulation
        self.simulation.start_simulation()
        print("▶️  Simulation started")

        return True

    def run_interactive_mode(self):
        """Run the application in interactive mode."""
        print("\n🎮 Starting Interactive Mode...")
        print("Click on the building to place fire, then use keyboard controls.")

        # Show initial building layout
        self.visualizer.update_visualization()

        # Start animation
        animation = self.visualizer.animate_simulation(interval=1000)

        # Show the plot
        plt.show()

        return animation

    def run_static_analysis(self):
        """Run static analysis of different pathfinding algorithms."""
        print("\n📊 Running Algorithm Performance Analysis...")

        # Test different scenarios
        scenarios = [
            {"fire_pos": (5, 5, 0), "name": "Ground Floor Fire"},
            {"fire_pos": (10, 10, 1), "name": "First Floor Fire"},
            {"fire_pos": (15, 15, 2), "name": "Top Floor Fire"},
        ]

        pathfinder = PathFinder(self.building.map)
        results = []

        for scenario in scenarios:
            print(f"\n🧪 Testing: {scenario['name']}")

            # Reset building
            self.building.reset_fire()
            self.building.start_fire(scenario['fire_pos'])

            # Test pathfinding for each person
            for person in self.simulation.people:
                start_pos = person.position
                exits = self.building.get_exit_positions()

                for exit_pos in exits:
                    # Test A* algorithm
                    import time
                    start_time = time.time()
                    a_star_path = pathfinder.a_star(start_pos, exit_pos)
                    a_star_time = time.time() - start_time

                    # Test Dijkstra algorithm
                    start_time = time.time()
                    dijkstra_path = pathfinder.dijkstra(start_pos, exit_pos)
                    dijkstra_time = time.time() - start_time

                    if a_star_path and dijkstra_path:
                        results.append({
                            'scenario': scenario['name'],
                            'person': person.name,
                            'start': start_pos,
                            'exit': exit_pos,
                            'a_star_length': len(a_star_path),
                            'a_star_time': a_star_time,
                            'dijkstra_length': len(dijkstra_path),
                            'dijkstra_time': dijkstra_time
                        })

        # Display results
        self._display_analysis_results(results)

        return results

    def _display_analysis_results(self, results: List[dict]):
        """Display algorithm performance analysis results."""
        print("\n📈 Algorithm Performance Results:")
        print("-" * 80)
        print(f"{'Scenario':<20} {'Algorithm':<12} {'Path Length':<12} {'Time (ms)':<10}")
        print("-" * 80)

        for result in results:
            # A* results
            print(f"{result['scenario']:<20} {'A*':<12} {result['a_star_length']:<12} "
                  f"{result['a_star_time']*1000:.2f}")

            # Dijkstra results
            print(f"{'':<20} {'Dijkstra':<12} {result['dijkstra_length']:<12} "
                  f"{result['dijkstra_time']*1000:.2f}")
            print()

    def save_current_state(self, filename: str = "evacuation_simulation.png"):
        """Save current simulation state as image."""
        self.visualizer.save_visualization(filename)
        print(f"💾 Simulation state saved to {filename}")


def main():
    """Main function to run the evacuation application."""
    try:
        # Create application
        app = EvacuationApp()

        # Show menu
        while True:
            print("\n" + "="*60)
            print("🏢 Building Evacuation System - Main Menu")
            print("="*60)
            print("1. Run Interactive Mode (Recommended)")
            print("2. Run Demo Scenario")
            print("3. Run Algorithm Analysis")
            print("4. Save Current State")
            print("5. Exit")

            choice = input("\nSelect option (1-5): ").strip()

            if choice == '1':
                app.run_interactive_mode()
                break
            elif choice == '2':
                app.run_demo_scenario()
                app.visualizer.show_static_view()
            elif choice == '3':
                app.run_static_analysis()
            elif choice == '4':
                app.save_current_state()
            elif choice == '5':
                print("👋 Goodbye!")
                break
            else:
                print("❌ Invalid choice. Please select 1-5.")

    except KeyboardInterrupt:
        print("\n\n👋 Application interrupted by user. Goodbye!")
    except Exception as e:
        print(f"\n❌ An error occurred: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
