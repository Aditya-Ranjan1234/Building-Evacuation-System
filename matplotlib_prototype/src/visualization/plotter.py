"""
3D visualization module for building evacuation simulation.
"""

import matplotlib.pyplot as plt
import matplotlib.animation as animation
from mpl_toolkits.mplot3d import Axes3D
import numpy as np
from typing import List, Tuple, Dict, Optional
import time

# Try to use interactive backend, fallback to non-interactive
import matplotlib
try:
    matplotlib.use('TkAgg')  # Try TkAgg first
except:
    try:
        matplotlib.use('Qt5Agg')  # Try Qt5Agg
    except:
        matplotlib.use('Agg')  # Fallback to non-interactive

from simulation.building import Building, Person, EvacuationSimulation
from algorithms.pathfinding import PathFinder


class BuildingVisualizer:
    """3D visualization for building evacuation simulation."""

    def __init__(self, simulation: EvacuationSimulation):
        """
        Initialize visualizer.

        Args:
            simulation: EvacuationSimulation instance to visualize
        """
        self.simulation = simulation
        self.building = simulation.building
        self.pathfinder = PathFinder(self.building.map)

        # Visualization settings
        self.fig = plt.figure(figsize=(15, 10))
        self.ax = self.fig.add_subplot(111, projection='3d')

        # Color mapping
        self.colors = {
            0: 'lightblue',    # walkable
            1: 'gray',         # wall
            2: 'red',          # fire
            3: 'green',        # stairs
            4: 'yellow'        # exit
        }

        # Animation variables
        self.animation = None
        self.paths = {}  # Store paths for each person
        self.alternate_paths = {}  # Store alternate paths

        self._setup_plot()

    def _setup_plot(self):
        """Setup the 3D plot with proper labels and limits."""
        self.ax.set_xlabel('X')
        self.ax.set_ylabel('Y')
        self.ax.set_zlabel('Floor')

        self.ax.set_xlim(0, self.building.width)
        self.ax.set_ylim(0, self.building.height)
        self.ax.set_zlim(0, self.building.floors)

        self.ax.set_title('Building Evacuation Simulation')

    def plot_building_structure(self):
        """Plot the static building structure (walls, stairs, exits)."""
        self.ax.clear()
        self._setup_plot()

        # Plot building elements
        for x in range(self.building.width):
            for y in range(self.building.height):
                for floor in range(self.building.floors):
                    cell_type = self.building.map[x, y, floor]

                    if cell_type != 0:  # Don't plot walkable areas
                        color = self.colors.get(cell_type, 'black')
                        alpha = 0.7 if cell_type == 1 else 0.9  # Walls more transparent

                        self.ax.scatter([x], [y], [floor],
                                      c=color, s=100, alpha=alpha, marker='s')

        # Add legend
        legend_elements = []
        for cell_type, color in self.colors.items():
            if cell_type == 0:
                continue
            labels = {1: 'Wall', 2: 'Fire', 3: 'Stairs', 4: 'Exit'}
            legend_elements.append(plt.Line2D([0], [0], marker='s', color='w',
                                            markerfacecolor=color, markersize=10,
                                            label=labels.get(cell_type, f'Type {cell_type}')))

        self.ax.legend(handles=legend_elements, loc='upper right')

    def plot_fire(self):
        """Plot current fire positions."""
        fire_positions = list(self.building.fire_positions)
        if fire_positions:
            fire_x = [pos[0] for pos in fire_positions]
            fire_y = [pos[1] for pos in fire_positions]
            fire_z = [pos[2] for pos in fire_positions]

            self.ax.scatter(fire_x, fire_y, fire_z,
                          c='red', s=150, alpha=0.8, marker='*')

    def plot_people(self):
        """Plot current positions of all people."""
        for i, person in enumerate(self.simulation.people):
            if not person.is_evacuated:
                x, y, floor = person.get_current_position()
                color = 'blue' if not person.is_evacuated else 'green'
                marker = 'o' if not person.is_evacuated else '^'

                self.ax.scatter([x], [y], [floor],
                              c=color, s=200, alpha=1.0, marker=marker,
                              edgecolors='black', linewidth=2)

                # Add person label
                self.ax.text(x, y, floor + 0.1, person.name, fontsize=8)

    def plot_path(self, path: List[Tuple[int, int, int]], color: str = 'red',
                  linewidth: int = 3, alpha: float = 0.8, label: str = None):
        """
        Plot a path in 3D.

        Args:
            path: List of (x, y, floor) coordinates
            color: Line color
            linewidth: Line width
            alpha: Line transparency
            label: Path label for legend
        """
        if not path:
            return

        path_x = [pos[0] for pos in path]
        path_y = [pos[1] for pos in path]
        path_z = [pos[2] for pos in path]

        self.ax.plot(path_x, path_y, path_z,
                    color=color, linewidth=linewidth, alpha=alpha, label=label)

        # Mark start and end points
        self.ax.scatter([path_x[0]], [path_y[0]], [path_z[0]],
                       c='green', s=150, marker='o', edgecolors='black')
        self.ax.scatter([path_x[-1]], [path_y[-1]], [path_z[-1]],
                       c='orange', s=150, marker='s', edgecolors='black')

    def calculate_evacuation_paths(self):
        """Calculate evacuation paths for all people."""
        exits = self.building.get_exit_positions()

        for person in self.simulation.people:
            if person.is_evacuated:
                continue

            start_pos = person.get_current_position()

            # Find closest exit
            best_path = None
            min_distance = float('inf')

            for exit_pos in exits:
                path = self.pathfinder.a_star(start_pos, exit_pos)
                if path:
                    distance = len(path)
                    if distance < min_distance:
                        min_distance = distance
                        best_path = path

            if best_path:
                person.set_evacuation_path(best_path)
                self.paths[person.name] = best_path

                # Calculate alternate paths
                alternate_paths = self.pathfinder.find_alternate_paths(
                    start_pos, best_path[-1], num_paths=2)
                self.alternate_paths[person.name] = alternate_paths[1:] if len(alternate_paths) > 1 else []

    def update_visualization(self):
        """Update the complete visualization."""
        self.plot_building_structure()
        self.plot_fire()
        self.plot_people()

        # Plot paths
        for person_name, path in self.paths.items():
            person = next((p for p in self.simulation.people if p.name == person_name), None)
            if person and not person.is_evacuated:
                # Check if path is blocked by fire
                if self.pathfinder.is_path_blocked_by_fire(path):
                    # Use alternate path if available
                    if person_name in self.alternate_paths and self.alternate_paths[person_name]:
                        alternate_path = self.alternate_paths[person_name][0]
                        if not self.pathfinder.is_path_blocked_by_fire(alternate_path):
                            person.set_evacuation_path(alternate_path)
                            self.paths[person_name] = alternate_path
                            self.plot_path(alternate_path, color='blue', label='Alternate Path')
                        else:
                            # Recalculate path
                            self.calculate_evacuation_paths()
                    else:
                        # Recalculate path
                        self.calculate_evacuation_paths()
                else:
                    self.plot_path(path, color='red', label='Primary Path')

        # Add simulation info
        stats = self.simulation.get_simulation_stats()
        info_text = (f"Timestep: {stats['timestep']}\n"
                    f"People: {stats['people_remaining']}/{stats['total_people']}\n"
                    f"Fire Area: {stats['fire_area']} cells")

        self.ax.text2D(0.02, 0.98, info_text, transform=self.ax.transAxes,
                      fontsize=10, verticalalignment='top',
                      bbox=dict(boxstyle='round', facecolor='white', alpha=0.8))

        plt.draw()

    def animate_simulation(self, interval: int = 500):
        """
        Start animated simulation.

        Args:
            interval: Animation interval in milliseconds
        """
        def animate_frame(frame):
            if self.simulation.simulation_running:
                self.simulation.step()
                self.update_visualization()
            return []

        self.animation = animation.FuncAnimation(
            self.fig, animate_frame, interval=interval, blit=False, repeat=True, 
            save_count=100)  # Add save_count to fix warning

        return self.animation

    def show_static_view(self):
        """Show static view of current simulation state."""
        self.update_visualization()
        plt.show()

    def save_visualization(self, filename: str):
        """Save current visualization to file."""
        self.update_visualization()
        plt.savefig(filename, dpi=300, bbox_inches='tight')
        print(f"Visualization saved to {filename}")


class InteractiveController:
    """Interactive controller for the evacuation simulation."""

    def __init__(self, visualizer: BuildingVisualizer):
        """Initialize interactive controller."""
        self.visualizer = visualizer
        self.simulation = visualizer.simulation
        self.building = visualizer.building

        # Setup interactive controls
        self._setup_controls()

    def _setup_controls(self):
        """Setup interactive controls and event handlers."""
        # Connect mouse click events for fire placement
        self.visualizer.fig.canvas.mpl_connect('button_press_event', self._on_click)

        # Add control buttons
        self._add_control_buttons()

    def _add_control_buttons(self):
        """Add control buttons to the interface."""
        # This would be expanded with actual button widgets
        # For now, we'll use keyboard shortcuts
        self.visualizer.fig.canvas.mpl_connect('key_press_event', self._on_key_press)

    def _on_click(self, event):
        """Handle mouse click events for interactive fire placement."""
        if event.inaxes == self.visualizer.ax and event.button == 1:  # Left click
            # Convert click coordinates to grid position
            x, y = int(round(event.xdata)), int(round(event.ydata))
            floor = 0  # Default to ground floor, could be made interactive

            if (0 <= x < self.building.width and 0 <= y < self.building.height):
                self.building.start_fire((x, y, floor))
                self.visualizer.update_visualization()
                print(f"Fire started at position ({x}, {y}, {floor})")

    def _on_key_press(self, event):
        """Handle keyboard shortcuts."""
        if event.key == ' ':  # Spacebar to start/stop simulation
            if self.simulation.simulation_running:
                self.simulation.stop_simulation()
                print("Simulation paused")
            else:
                self.simulation.start_simulation()
                print("Simulation started")

        elif event.key == 'r':  # R to reset simulation
            self.simulation.reset_simulation()
            self.visualizer.paths.clear()
            self.visualizer.alternate_paths.clear()
            self.visualizer.update_visualization()
            print("Simulation reset")

        elif event.key == 'c':  # C to calculate paths
            self.visualizer.calculate_evacuation_paths()
            self.visualizer.update_visualization()
            print("Evacuation paths calculated")

        elif event.key == 'h':  # H for help
            self._show_help()

    def _show_help(self):
        """Show help information."""
        help_text = """
        Interactive Controls:
        - Left Click: Place fire at clicked position
        - Spacebar: Start/Stop simulation
        - R: Reset simulation
        - C: Calculate evacuation paths
        - H: Show this help
        """
        print(help_text)
