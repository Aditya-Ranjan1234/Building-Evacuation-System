#!/usr/bin/env python3
"""
Simple test script to verify matplotlib display is working correctly.
"""

import sys
import os

def test_matplotlib_backends():
    """Test different matplotlib backends to find one that works."""
    print("Testing matplotlib backends...")
    
    # Try different backends in order of preference
    backends_to_try = ['TkAgg', 'Qt5Agg', 'Qt4Agg', 'GTK3Agg', 'GTK3Cairo', 'Agg']
    
    for backend in backends_to_try:
        try:
            print(f"  Trying backend: {backend}")
            import matplotlib
            matplotlib.use(backend)
            import matplotlib.pyplot as plt
            import numpy as np
            
            # Test if we can create a simple plot
            fig = plt.figure(figsize=(8, 6))
            ax = fig.add_subplot(111, projection='3d')
            
            # Create some sample data
            x = np.linspace(0, 10, 100)
            y = np.linspace(0, 10, 100)
            X, Y = np.meshgrid(x, y)
            Z = np.sin(X) * np.cos(Y)
            
            # Plot the surface
            ax.plot_surface(X, Y, Z, cmap='viridis')
            ax.set_title('Matplotlib 3D Test')
            ax.set_xlabel('X')
            ax.set_ylabel('Y')
            ax.set_zlabel('Z')
            
            print(f"✅ Backend {backend} works!")
            
            # Try to show the plot
            try:
                plt.show()
                print("✅ Display test completed successfully!")
                return True
            except Exception as e:
                print(f"⚠️  Backend {backend} works but display failed: {e}")
                # Save the plot instead
                plt.savefig(f"test_plot_{backend}.png", dpi=150, bbox_inches='tight')
                print(f"💾 Plot saved as test_plot_{backend}.png")
                plt.close()
                return True
                
        except Exception as e:
            print(f"❌ Backend {backend} failed: {e}")
            continue
    
    print("❌ No interactive backends available")
    return False

def test_headless_mode():
    """Test headless mode with Agg backend."""
    print("\nTesting headless mode...")
    
    try:
        import matplotlib
        matplotlib.use('Agg')  # Non-interactive backend
        import matplotlib.pyplot as plt
        import numpy as np
        
        # Create a simple 3D plot
        fig = plt.figure(figsize=(8, 6))
        ax = fig.add_subplot(111, projection='3d')
        
        # Create some sample data
        x = np.linspace(0, 10, 100)
        y = np.linspace(0, 10, 100)
        X, Y = np.meshgrid(x, y)
        Z = np.sin(X) * np.cos(Y)
        
        # Plot the surface
        ax.plot_surface(X, Y, Z, cmap='viridis')
        ax.set_title('Matplotlib 3D Test (Headless)')
        ax.set_xlabel('X')
        ax.set_ylabel('Y')
        ax.set_zlabel('Z')
        
        # Save the plot
        plt.savefig("test_plot_headless.png", dpi=150, bbox_inches='tight')
        print("✅ Headless mode works! Plot saved as test_plot_headless.png")
        plt.close()
        return True
        
    except Exception as e:
        print(f"❌ Headless mode failed: {e}")
        return False

def test_basic_imports():
    """Test if basic matplotlib imports work."""
    print("Testing basic matplotlib imports...")
    
    try:
        import matplotlib
        import matplotlib.pyplot as plt
        import numpy as np
        print("✅ Basic imports successful")
        return True
    except Exception as e:
        print(f"❌ Basic imports failed: {e}")
        return False

def main():
    """Main test function."""
    print("🧪 Matplotlib Display Test")
    print("=" * 50)
    
    # Test basic imports first
    if not test_basic_imports():
        print("\n❌ Matplotlib is not properly installed")
        print("Please install matplotlib: pip install matplotlib")
        return False
    
    # Test different backends
    interactive_works = test_matplotlib_backends()
    
    # Test headless mode
    headless_works = test_headless_mode()
    
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print(f"   Interactive display: {'✅ Working' if interactive_works else '❌ Not available'}")
    print(f"   Headless mode: {'✅ Working' if headless_works else '❌ Failed'}")
    
    if interactive_works:
        print("\n🎉 Great! You can use interactive matplotlib mode.")
        print("   Run: python src/main.py")
    elif headless_works:
        print("\n💡 Interactive display not available, but headless mode works.")
        print("   Use headless mode: python src/main_headless.py")
        print("   Or install tkinter for interactive mode:")
        print("   Windows: Install Python with tkinter support")
        print("   Linux: sudo apt-get install python3-tk")
    else:
        print("\n❌ Both interactive and headless modes failed.")
        print("   Please check your matplotlib installation.")
    
    return interactive_works or headless_works

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 