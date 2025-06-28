"""
Headless version of the Building Evacuation System for systems without display.
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
from visualization.plotter import BuildingVisualizer
from algorithms.pathfinding_enhanced import EnhancedPathFinder


class HeadlessEvacuationApp:
    """Headless version of the evacuation application."""

    def __init__(self):
        """Initialize the headless evacuation application."""
        self.building = None
        self.simulation = None
        self.visualizer = None
        self.pathfinder = None

        self._setup_application()

    def _setup_application(self):
        """Setup the application components."""
        print("🏢 Building Evacuation System - Headless Mode")
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

    def run_algorithm_comparison(self):
        """Run comprehensive algorithm comparison."""
        print("\n📊 Running Comprehensive Algorithm Comparison...")

        # Test different scenarios
        scenarios = [
            {"fire_pos": (5, 5, 0), "name": "Ground Floor Fire"},
            {"fire_pos": (10, 10, 1), "name": "First Floor Fire"},
            {"fire_pos": (15, 15, 2), "name": "Top Floor Fire"},
        ]

        all_results = {}

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
                    print(f"   Testing {person.name}: {start_pos} -> {exit_pos}")
                    
                    # Compare all algorithms
                    results = self.pathfinder.get_algorithm_performance(start_pos, exit_pos)
                    
                    scenario_key = f"{scenario['name']}_{person.name}_{exit_pos}"
                    all_results[scenario_key] = results

        # Display comprehensive results
        self._display_comprehensive_results(all_results)
        return all_results

    def _display_comprehensive_results(self, all_results):
        """Display comprehensive algorithm comparison results."""
        print("\n📈 Comprehensive Algorithm Performance Results:")
        print("=" * 100)
        
        # Collect all algorithms
        all_algorithms = set()
        for results in all_results.values():
            all_algorithms.update(results.keys())
        
        # Print header
        header = f"{'Scenario':<30} {'Algorithm':<20} {'Path Length':<12} {'Time (ms)':<12} {'Success':<8}"
        print(header)
        print("-" * 100)

        # Print results
        for scenario_key, results in all_results.items():
            for algorithm_name, result in results.items():
                if 'error' in result:
                    print(f"{scenario_key:<30} {algorithm_name:<20} {'ERROR':<12} {'ERROR':<12} {'No':<8}")
                elif result['path'] is None:
                    print(f"{scenario_key:<30} {algorithm_name:<20} {'No Path':<12} {result['execution_time']*1000:.2f} {'No':<8}")
                else:
                    print(f"{scenario_key:<30} {algorithm_name:<20} {result['path_length']:<12} {result['execution_time']*1000:.2f} {'Yes':<8}")

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

        # Run simulation for a few steps
        print("▶️  Running simulation for 10 steps...")
        for step in range(10):
            self.simulation.step()
            stats = self.simulation.get_simulation_stats()
            print(f"   Step {step + 1}: {stats['people_remaining']} people remaining, {stats['fire_area']} fire cells")

        # Save final state
        self.visualizer.save_visualization("demo_scenario_final.png")
        print("💾 Final state saved to demo_scenario_final.png")

        return True

    def save_current_state(self):
        """Save current simulation state."""
        print("\n💾 Saving current simulation state...")
        self.visualizer.save_visualization("current_state.png")
        print("✅ State saved to current_state.png")

    def show_menu(self):
        """Show the main menu."""
        while True:
            print("\n" + "=" * 60)
            print("🏢 Building Evacuation System - Headless Mode Menu")
            print("=" * 60)
            print("1. Run Demo Scenario")
            print("2. Run Comprehensive Algorithm Analysis")
            print("3. Save Current State")
            print("4. Exit")
            print("")

            try:
                choice = input("Select option (1-4): ").strip()
                
                if choice == '1':
                    self.run_demo_scenario()
                elif choice == '2':
                    self.run_algorithm_comparison()
                elif choice == '3':
                    self.save_current_state()
                elif choice == '4':
                    print("👋 Goodbye!")
                    break
                else:
                    print("❌ Invalid option. Please select 1-4.")
                    
            except KeyboardInterrupt:
                print("\n👋 Application interrupted by user. Goodbye!")
                break
            except Exception as e:
                print(f"❌ Error: {e}")


def main():
    """Main function for headless mode."""
    try:
        app = HeadlessEvacuationApp()
        app.show_menu()
    except Exception as e:
        print(f"❌ Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main() 