#!/bin/bash

# Nesto Development Setup Script
# Quick setup for developers

set -e

echo "🚀 Setting up Nesto development environment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if we're in the right directory
if [ ! -f "dfx.json" ]; then
    echo "❌ Error: dfx.json not found. Please run this script from the project root."
    exit 1
fi

echo -e "${BLUE}📦 Installing dependencies...${NC}"

# Install frontend dependencies
if [ -d "src/Nisto_frontend" ]; then
    echo "Installing frontend dependencies..."
    cd src/Nisto_frontend
    npm install
    cd ../..
else
    echo -e "${YELLOW}⚠️  Frontend directory not found${NC}"
fi

echo -e "${BLUE}🔧 Building project...${NC}"

# Build the project
dfx build

echo -e "${BLUE}🌐 Starting local network...${NC}"

# Start local network in background
dfx start --clean --background

echo -e "${BLUE}🚀 Deploying canisters...${NC}"

# Deploy the project
dfx deploy

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "🎉 Nesto is now running!"
echo ""
echo "📱 To install the dapp:"
echo "   1. Open http://localhost:4943"
echo "   2. Click 'Install Nesto'"
echo "   3. Follow your browser's installation prompt"
echo ""
echo "🔗 Frontend: http://localhost:4943"
echo "🔗 Backend: http://localhost:4943/?canisterId=$(dfx canister id Nisto_backend)"
echo ""
echo "📋 Useful commands:"
echo "   dfx stop                    # Stop the local network"
echo "   dfx canister call Nisto_backend method_name '()'  # Call backend methods"
echo "   dfx canister status        # Check canister status"
echo "   dfx logs                   # View logs"
echo ""
echo "Happy coding! 🚀"
