#!/usr/bin/env python3
"""
Test script to verify all imports work correctly.
Run this first to check if the environment is set up properly.
"""

import sys
import os

# Add src directory to path
src_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src')
sys.path.insert(0, src_dir)

def test_imports():
    """Test all module imports."""
    print("🧪 Testing imports...")
    
    try:
        print("  📦 Testing core libraries...")
        import numpy as np
        import matplotlib.pyplot as plt
        import scipy
        import networkx as nx
        print("  ✅ Core libraries imported successfully")
        
        print("  🏗️  Testing building simulation...")
        from simulation.building import Building, EvacuationSimulation, Person
        print("  ✅ Building simulation imported successfully")
        
        print("  🤖 Testing pathfinding algorithms...")
        from algorithms.pathfinding import PathFinder, Node
        print("  ✅ Pathfinding algorithms imported successfully")
        
        print("  📊 Testing visualization...")
        from visualization.plotter import BuildingVisualizer, InteractiveController
        print("  ✅ Visualization modules imported successfully")
        
        print("\n🎉 All imports successful! The environment is ready.")
        return True
        
    except ImportError as e:
        print(f"\n❌ Import error: {e}")
        print("\n🔧 Try installing missing packages:")
        print("   pip install numpy matplotlib scipy networkx")
        return False
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        return False

def test_basic_functionality():
    """Test basic functionality of core modules."""
    print("\n🧪 Testing basic functionality...")
    
    try:
        # Test building creation
        from simulation.building import Building
        building = Building(width=10, height=10, floors=2)
        print("  ✅ Building creation works")
        
        # Test pathfinding
        from algorithms.pathfinding import PathFinder
        pathfinder = PathFinder(building.map)
        print("  ✅ Pathfinding initialization works")
        
        # Test basic path calculation
        start = (2, 2, 0)
        goal = (8, 8, 0)
        path = pathfinder.a_star(start, goal)
        if path:
            print(f"  ✅ A* pathfinding works (found path with {len(path)} steps)")
        else:
            print("  ⚠️  A* pathfinding returned no path (this might be normal)")
        
        print("\n🎉 Basic functionality test passed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Functionality test failed: {e}")
        return False

def main():
    """Main test function."""
    print("🏢 Building Evacuation System - Import Test")
    print("=" * 50)
    
    # Test imports
    if not test_imports():
        return False
    
    # Test basic functionality
    if not test_basic_functionality():
        return False
    
    print("\n✅ All tests passed! You can now run the main application:")
    print("   python src/main.py")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
