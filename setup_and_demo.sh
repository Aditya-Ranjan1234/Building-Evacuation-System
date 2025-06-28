#!/bin/bash

# Building Evacuation System - Setup and Demo Script
# This script sets up both prototypes and provides demo instructions

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_step() {
    echo -e "${CYAN}🔧 $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main setup function
main() {
    print_header "🏢 Building Evacuation System Setup"
    echo -e "${CYAN}Welcome to the Building Evacuation System using Optimized Path Planning!${NC}"
    echo ""
    echo "This script will help you set up and run both prototypes:"
    echo "1. 🐍 Matplotlib Prototype (Python)"
    echo "2. 🌐 Web Prototype (Angular + Three.js)"
    echo ""

    # Check system requirements
    check_requirements

    # Show menu
    show_menu
}

# Check system requirements
check_requirements() {
    print_header "🔍 Checking System Requirements"
    
    # Check Python
    if command_exists python3; then
        PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
        print_success "Python 3 found: $PYTHON_VERSION"
    else
        print_error "Python 3 not found. Please install Python 3.7 or higher."
        exit 1
    fi

    # Check pip
    if command_exists pip3; then
        print_success "pip3 found"
    else
        print_warning "pip3 not found. Installing packages may fail."
    fi

    # Check Node.js
    if command_exists node; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
    else
        print_warning "Node.js not found. Web prototype will not work."
        print_info "Install Node.js 18+ from: https://nodejs.org/"
    fi

    # Check npm
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        print_success "npm found: $NPM_VERSION"
    else
        print_warning "npm not found. Web prototype will not work."
    fi

    echo ""
}

# Show main menu
show_menu() {
    while true; do
        print_header "📋 Main Menu"
        echo "1. 🐍 Setup Matplotlib Prototype"
        echo "2. 🌐 Setup Web Prototype"
        echo "3. 🚀 Run Matplotlib Demo"
        echo "4. 🌍 Run Web Demo"
        echo "5. 📊 Compare Prototypes"
        echo "6. 🧹 Clean All"
        echo "7. ❓ Help"
        echo "8. 🚪 Exit"
        echo ""
        read -p "Select option (1-8): " choice

        case $choice in
            1) setup_matplotlib_prototype ;;
            2) setup_web_prototype ;;
            3) run_matplotlib_demo ;;
            4) run_web_demo ;;
            5) compare_prototypes ;;
            6) clean_all ;;
            7) show_help ;;
            8) exit 0 ;;
            *) print_error "Invalid option. Please select 1-8." ;;
        esac
        echo ""
        read -p "Press Enter to continue..."
    done
}

# Setup Matplotlib prototype
setup_matplotlib_prototype() {
    print_header "🐍 Setting up Matplotlib Prototype"
    
    if [ ! -d "matplotlib_prototype" ]; then
        print_error "matplotlib_prototype directory not found!"
        return 1
    fi

    cd matplotlib_prototype

    print_step "Creating virtual environment..."
    python3 -m venv venv
    
    print_step "Activating virtual environment..."
    source venv/bin/activate

    print_step "Installing Python dependencies..."
    pip install -r requirements.txt

    print_success "Matplotlib prototype setup complete!"
    print_info "To run: cd matplotlib_prototype && source venv/bin/activate && python src/main.py"
    
    cd ..
}

# Setup Web prototype
setup_web_prototype() {
    print_header "🌐 Setting up Web Prototype"
    
    if [ ! -d "web_prototype" ]; then
        print_error "web_prototype directory not found!"
        return 1
    fi

    if ! command_exists node || ! command_exists npm; then
        print_error "Node.js and npm are required for the web prototype."
        print_info "Install from: https://nodejs.org/"
        return 1
    fi

    cd web_prototype

    print_step "Installing Angular CLI globally..."
    npm install -g @angular/cli

    print_step "Installing project dependencies..."
    npm install

    print_success "Web prototype setup complete!"
    print_info "To run: cd web_prototype && npm start"
    
    cd ..
}

# Run Matplotlib demo
run_matplotlib_demo() {
    print_header "🚀 Running Matplotlib Demo"
    
    if [ ! -d "matplotlib_prototype/venv" ]; then
        print_warning "Virtual environment not found. Setting up first..."
        setup_matplotlib_prototype
    fi

    cd matplotlib_prototype
    
    print_step "Activating virtual environment..."
    source venv/bin/activate
    
    print_step "Starting Matplotlib prototype..."
    print_info "Demo Instructions:"
    echo "1. Select option 1 for Interactive Mode"
    echo "2. Left-click to place fire"
    echo "3. Press 'C' to calculate paths"
    echo "4. Press Spacebar to start simulation"
    echo "5. Press 'R' to reset"
    echo ""
    
    python src/main.py
    
    cd ..
}

# Run Web demo
run_web_demo() {
    print_header "🌍 Running Web Demo"
    
    if [ ! -d "web_prototype/node_modules" ]; then
        print_warning "Dependencies not installed. Setting up first..."
        setup_web_prototype
    fi

    cd web_prototype
    
    print_step "Starting development server..."
    print_info "Demo Instructions:"
    echo "1. Browser will open automatically at http://localhost:4200"
    echo "2. Use sidebar controls to configure simulation"
    echo "3. Add people and start fire using coordinate inputs"
    echo "4. Click 'Calculate Paths' then 'Start Simulation'"
    echo "5. Switch to Analysis tab for algorithm comparison"
    echo ""
    print_warning "Press Ctrl+C to stop the server"
    
    npm start
    
    cd ..
}

# Compare prototypes
compare_prototypes() {
    print_header "📊 Prototype Comparison"
    
    echo -e "${CYAN}Feature Comparison:${NC}"
    echo ""
    printf "%-25s %-20s %-20s\n" "Feature" "Matplotlib" "Web"
    printf "%-25s %-20s %-20s\n" "-------" "----------" "---"
    printf "%-25s %-20s %-20s\n" "Platform" "Desktop" "Web Browser"
    printf "%-25s %-20s %-20s\n" "Technology" "Python" "Angular+Three.js"
    printf "%-25s %-20s %-20s\n" "3D Graphics" "CPU Rendering" "GPU Accelerated"
    printf "%-25s %-20s %-20s\n" "Interactivity" "Basic" "Advanced"
    printf "%-25s %-20s %-20s\n" "Mobile Support" "No" "Yes"
    printf "%-25s %-20s %-20s\n" "Setup Complexity" "Simple" "Moderate"
    printf "%-25s %-20s %-20s\n" "Performance" "Good" "Excellent"
    printf "%-25s %-20s %-20s\n" "Deployment" "Local" "Web/Cloud"
    echo ""
    
    echo -e "${CYAN}Use Case Recommendations:${NC}"
    echo ""
    echo -e "${GREEN}Choose Matplotlib when:${NC}"
    echo "• Rapid prototyping and algorithm testing"
    echo "• Research and educational use"
    echo "• Python-based workflow"
    echo "• Simple visualization needs"
    echo ""
    echo -e "${GREEN}Choose Web when:${NC}"
    echo "• Production deployment"
    echo "• Professional presentations"
    echo "• Multi-user access"
    echo "• Modern user interface"
    echo "• Mobile device support"
    echo ""
    
    if [ -f "docs/prototype_comparison.md" ]; then
        print_info "Detailed comparison available in: docs/prototype_comparison.md"
    fi
}

# Clean all installations
clean_all() {
    print_header "🧹 Cleaning All Installations"
    
    read -p "This will remove all installed dependencies. Continue? (y/N): " confirm
    if [[ $confirm != [yY] ]]; then
        print_info "Cleanup cancelled."
        return
    fi

    print_step "Cleaning Matplotlib prototype..."
    if [ -d "matplotlib_prototype/venv" ]; then
        rm -rf matplotlib_prototype/venv
        print_success "Removed Python virtual environment"
    fi

    print_step "Cleaning Web prototype..."
    if [ -d "web_prototype/node_modules" ]; then
        rm -rf web_prototype/node_modules
        print_success "Removed Node.js dependencies"
    fi
    
    if [ -d "web_prototype/dist" ]; then
        rm -rf web_prototype/dist
        print_success "Removed build artifacts"
    fi

    print_success "Cleanup complete!"
}

# Show help
show_help() {
    print_header "❓ Help & Documentation"
    
    echo -e "${CYAN}Project Structure:${NC}"
    echo "📁 matplotlib_prototype/    - Python-based prototype"
    echo "📁 web_prototype/          - Angular+Three.js prototype"
    echo "📁 docs/                   - Documentation"
    echo "📄 README.md               - Main project documentation"
    echo ""
    
    echo -e "${CYAN}Quick Start:${NC}"
    echo "1. Run this script: ./setup_and_demo.sh"
    echo "2. Choose option 1 or 2 to setup prototypes"
    echo "3. Choose option 3 or 4 to run demos"
    echo ""
    
    echo -e "${CYAN}Manual Setup:${NC}"
    echo ""
    echo -e "${YELLOW}Matplotlib Prototype:${NC}"
    echo "cd matplotlib_prototype"
    echo "python3 -m venv venv"
    echo "source venv/bin/activate"
    echo "pip install -r requirements.txt"
    echo "python src/main.py"
    echo ""
    
    echo -e "${YELLOW}Web Prototype:${NC}"
    echo "cd web_prototype"
    echo "npm install"
    echo "npm start"
    echo ""
    
    echo -e "${CYAN}Documentation:${NC}"
    echo "• README.md - Main project overview"
    echo "• matplotlib_prototype/README.md - Python prototype guide"
    echo "• web_prototype/README.md - Web prototype guide"
    echo "• docs/prototype_comparison.md - Detailed comparison"
    echo ""
    
    echo -e "${CYAN}Troubleshooting:${NC}"
    echo "• Ensure Python 3.7+ is installed"
    echo "• Ensure Node.js 18+ is installed"
    echo "• Check internet connection for package downloads"
    echo "• Run with sudo if permission errors occur"
    echo ""
    
    echo -e "${CYAN}Support:${NC}"
    echo "• Check documentation in docs/ folder"
    echo "• Review error messages carefully"
    echo "• Ensure all system requirements are met"
}

# Make script executable and run
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
