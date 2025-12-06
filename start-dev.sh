#!/bin/bash

# Startup script for Midpoint development
# This script sets up environment variables and starts the frontend

set -e  # Exit on error

echo "🚀 Starting Midpoint Development Environment..."

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install Node.js (using Homebrew on macOS)
install_node() {
    echo "📦 Installing Node.js..."
    if command_exists brew; then
        brew install node
    else
        echo "❌ Homebrew not found. Please install Node.js manually from https://nodejs.org/"
        exit 1
    fi
}

# Check and install Node.js if needed
if ! command_exists node; then
    echo "⚠️  Node.js not found."
    read -p "Install Node.js now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        install_node
    else
        echo "❌ Node.js is required. Please install it manually."
        exit 1
    fi
else
    NODE_VERSION=$(node --version)
    echo "✅ Node.js found: $NODE_VERSION"
fi

# Check and install npm if needed (usually comes with Node.js)
if ! command_exists npm; then
    echo "❌ npm not found. This should come with Node.js."
    exit 1
else
    NPM_VERSION=$(npm --version)
    echo "✅ npm found: $NPM_VERSION"
fi

# Check if npx is available (Expo can be run via npx without global install)
if ! command_exists npx; then
    echo "❌ npx not found. This should come with npm/Node.js."
    exit 1
else
    echo "✅ npx available (can run Expo without global install)"
fi

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
FRONTEND_DIR="$SCRIPT_DIR"
BACKEND_DIR="$SCRIPT_DIR/backend"

# Check if .env file exists for API keys
if [ -f "$SCRIPT_DIR/.env" ]; then
    echo "📝 Loading API keys from .env file..."
    # Source the .env file (this exports the variables)
    set -a  # Automatically export all variables
    source "$SCRIPT_DIR/.env"
    set +a  # Stop automatically exporting
    echo "✅ .env file loaded"
else
    echo "❌ No .env file found!"
    echo ""
    echo "Please create a .env file in the root directory ($SCRIPT_DIR) with:"
    echo "  FRONTEND_API_KEY=your_frontend_api_key_here"
    echo "  BACKEND_GOOGLE_MAPS_API_KEY=your_backend_google_maps_api_key_here"
    echo ""
    echo "You can copy .env.example to .env and fill in your keys:"
    echo "  cp .env.example .env"
    echo ""
    exit 1
fi

# Get IP address automatically using ipconfig
echo "🌐 Getting your IP address..."
DEVICE_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "")

# If not found, try other common interfaces
if [ -z "$DEVICE_IP" ]; then
    DEVICE_IP=$(ipconfig getifaddr en2 2>/dev/null || ipconfig getifaddr en3 2>/dev/null || echo "")
fi

# If still not found, try using ifconfig as fallback
if [ -z "$DEVICE_IP" ]; then
    DEVICE_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1 | sed 's/addr://' 2>/dev/null || echo "")
fi

# If still not found, use localhost
if [ -z "$DEVICE_IP" ]; then
    DEVICE_IP="localhost"
    echo "⚠️  Could not automatically detect IP address. Using localhost."
    echo "   You may need to manually set EXPO_PUBLIC_DEVICE_IP in .env"
else
    echo "✅ Found IP address: $DEVICE_IP"
fi

# Export IP address for Expo (required for device connection)
export EXPO_PUBLIC_DEVICE_IP="$DEVICE_IP"

# Export environment variables for frontend
echo "🔧 Setting up frontend environment variables..."

# Export Google Maps API key for frontend (from GOOGLE_MAPS_API_KEY in .env)
if [ -n "$GOOGLE_MAPS_API_KEY" ]; then
    export EXPO_PUBLIC_GOOGLE_MAPS_API_KEY="$GOOGLE_MAPS_API_KEY"
    echo "✅ Google Maps API key exported for frontend (EXPO_PUBLIC_GOOGLE_MAPS_API_KEY)"
elif [ -n "$FRONTEND_GOOGLE_MAPS_API_KEY" ]; then
    export EXPO_PUBLIC_GOOGLE_MAPS_API_KEY="$FRONTEND_GOOGLE_MAPS_API_KEY"
    echo "✅ Google Maps API key exported for frontend (FRONTEND_GOOGLE_MAPS_API_KEY)"
else
    echo "⚠️  GOOGLE_MAPS_API_KEY not set in .env file."
    echo "   Please add GOOGLE_MAPS_API_KEY to your .env file if needed"
fi

# Check and export Frontend API key (if separate from Google Maps)
if [ -n "$FRONTEND_API_KEY" ]; then
    export EXPO_PUBLIC_API_KEY="$FRONTEND_API_KEY"
    echo "✅ Frontend API key exported from .env"
fi

echo ""
echo "📋 Environment Variables Set:"
echo "   EXPO_PUBLIC_DEVICE_IP=$EXPO_PUBLIC_DEVICE_IP"
if [ -n "$GOOGLE_MAPS_API_KEY" ] || [ -n "$FRONTEND_GOOGLE_MAPS_API_KEY" ]; then
    echo "   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=*** (loaded from .env)"
fi
if [ -n "$FRONTEND_API_KEY" ]; then
    echo "   EXPO_PUBLIC_API_KEY=*** (loaded from .env)"
fi
echo ""

# Navigate to frontend directory (root, where React Native code now lives)
echo "📱 Starting Expo..."
cd "$FRONTEND_DIR"

# Check if node_modules exists, if not, install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 node_modules not found. Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    
    # Fix package versions to match Expo SDK
    echo "🔧 Fixing package versions to match Expo SDK..."
    npx expo install --fix
    echo "✅ Package versions fixed"
else
    echo "✅ Dependencies already installed"
    
    # Check and fix package versions on each start (quick check)
    echo "🔧 Checking package versions..."
    npx expo install --check || npx expo install --fix
fi

# Start Expo
echo "🎉 Starting Expo development server..."
echo "   Make sure your backend is running separately with:"
echo "   ./start-backend.sh"
echo ""

npx expo start
