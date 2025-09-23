#!/bin/bash

echo "🚀 NESTO DEPLOYMENT TO INTERNET COMPUTER"
echo "======================================"

# Function to check dfx installation
check_dfx() {
    if ! command -v dfx &> /dev/null; then
        echo "❌ dfx not found. Installing..."
        sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
        export PATH="$HOME/bin:$PATH"
    fi
    echo "✅ dfx version: $(dfx --version)"
}

# Function to deploy to IC mainnet
deploy_to_ic() {
    echo "🌐 Deploying to IC mainnet..."
    
    # Create a new identity if needed
    dfx identity whoami || dfx identity new default
    dfx identity use default
    
    # Configure for IC mainnet
    dfx stop
    dfx start --clean --background
    
    echo "🔨 Building canisters..."
    dfx build
    
    echo "🚀 Deploying to IC mainnet..."
    dfx deploy --network ic
    
    echo "📋 Deployment Information:"
    echo "Backend Canister ID: $(dfx canister --network ic id Nisto_backend)"
    echo "Frontend Canister ID: $(dfx canister --network ic id Nisto_frontend)"
}

# Main execution
check_dfx
deploy_to_ic

echo "✅ Deployment complete!"
