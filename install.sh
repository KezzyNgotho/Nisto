#!/bin/bash

# Nesto Project Installation Script
# This script sets up the complete development environment for the Nesto project

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to detect OS
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command_exists apt-get; then
            echo "ubuntu"
        elif command_exists yum; then
            echo "centos"
        elif command_exists pacman; then
            echo "arch"
        else
            echo "linux"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        echo "windows"
    else
        echo "unknown"
    fi
}

# Function to install system dependencies
install_system_deps() {
    local os=$(detect_os)
    print_status "Installing system dependencies for $os..."
    
    case $os in
        "ubuntu"|"linux")
            if ! command_exists curl; then
                sudo apt-get update && sudo apt-get install -y curl
            fi
            if ! command_exists git; then
                sudo apt-get install -y git
            fi
            if ! command_exists build-essential; then
                sudo apt-get install -y build-essential
            fi
            ;;
        "macos")
            if ! command_exists brew; then
                print_warning "Homebrew not found. Please install it first: https://brew.sh"
                exit 1
            fi
            if ! command_exists curl; then
                brew install curl
            fi
            if ! command_exists git; then
                brew install git
            fi
            ;;
        "centos")
            if ! command_exists curl; then
                sudo yum install -y curl
            fi
            if ! command_exists git; then
                sudo yum install -y git
            fi
            if ! command_exists gcc; then
                sudo yum groupinstall -y "Development Tools"
            fi
            ;;
        *)
            print_warning "Unsupported OS: $os. Please install curl, git, and build tools manually."
            ;;
    esac
}

# Function to install Node.js
install_nodejs() {
    if command_exists node; then
        local node_version=$(node --version)
        print_status "Node.js already installed: $node_version"
        return 0
    fi
    
    print_status "Installing Node.js..."
    
    # Install Node.js using nvm (Node Version Manager)
    if ! command_exists nvm; then
        print_status "Installing nvm..."
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        
        # Source nvm
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    fi
    
    # Install latest LTS version of Node.js
    nvm install --lts
    nvm use --lts
    
    print_success "Node.js installed successfully"
}

# Function to install DFX
install_dfx() {
    if command_exists dfx; then
        local dfx_version=$(dfx --version)
        print_status "DFX already installed: $dfx_version"
        return 0
    fi
    
    print_status "Installing DFX..."
    
    # Install DFX using the official installer
    sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
    
    # Source the DFX environment
    export PATH="$HOME/bin:$PATH"
    
    print_success "DFX installed successfully"
}

# Function to install project dependencies
install_project_deps() {
    print_status "Installing project dependencies..."
    
    # Install frontend dependencies
    if [ -d "src/Nisto_frontend" ]; then
        print_status "Installing frontend dependencies..."
        cd src/Nisto_frontend
        
        # Remove existing node_modules and package-lock.json for clean install
        if [ -d "node_modules" ]; then
            rm -rf node_modules
        fi
        if [ -f "package-lock.json" ]; then
            rm package-lock.json
        fi
        
        npm install
        cd ../..
        print_success "Frontend dependencies installed"
    else
        print_warning "Frontend directory not found"
    fi
}

# Function to build the project
build_project() {
    print_status "Building the project..."
    
    # Build frontend
    if [ -d "src/Nisto_frontend" ]; then
        print_status "Building frontend..."
        cd src/Nisto_frontend
        npm run build
        cd ../..
        print_success "Frontend built successfully"
    fi
    
    # Build DFX project
    print_status "Building DFX project..."
    dfx build
    print_success "DFX project built successfully"
}

# Function to start local network
start_local_network() {
    print_status "Starting local Internet Computer network..."
    
    # Stop any existing network
    dfx stop 2>/dev/null || true
    
    # Start local network
    dfx start --clean --background
    
    print_success "Local network started successfully"
}

# Function to deploy the project
deploy_project() {
    print_status "Deploying the project..."
    
    # Deploy all canisters
    dfx deploy
    
    print_success "Project deployed successfully"
}

# Function to display next steps
show_next_steps() {
    echo
    print_success "Installation completed successfully!"
    echo
    echo "Next steps:"
    echo "1. Start the local network: dfx start --clean --background"
    echo "2. Deploy the project: dfx deploy"
    echo "3. Open the frontend: dfx canister open Nisto_frontend"
    echo
    echo "Useful commands:"
    echo "- dfx stop                    # Stop the local network"
    echo "- dfx canister call Nisto_backend method_name '()'  # Call backend methods"
    echo "- dfx canister status        # Check canister status"
    echo
}

# Main installation function
main() {
    echo "=========================================="
    echo "    Nesto Project Installation Script"
    echo "=========================================="
    echo
    
    # Check if we're in the right directory
    if [ ! -f "dfx.json" ]; then
        print_error "dfx.json not found. Please run this script from the project root directory."
        exit 1
    fi
    
    # Install system dependencies
    install_system_deps
    
    # Install Node.js
    install_nodejs
    
    # Install DFX
    install_dfx
    
    # Install project dependencies
    install_project_deps
    
    # Build the project
    build_project
    
    # Show next steps
    show_next_steps
}

# Run main function
main "$@"
