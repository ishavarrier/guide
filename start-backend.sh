#!/bin/bash

# Startup script for Midpoint Backend
# This script sets up the Google Maps API key and starts the backend

set -e  # Exit on error

echo "🔧 Starting Midpoint Backend..."

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install Maven (using Homebrew on macOS)
install_maven() {
    echo "📦 Installing Maven..."
    if command_exists brew; then
        brew install maven
    else
        echo "❌ Homebrew not found. Please install Maven manually from https://maven.apache.org/"
        exit 1
    fi
}

# Check and install Maven if needed
if ! command_exists mvn; then
    echo "⚠️  Maven (mvn) not found."
    read -p "Install Maven now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        install_maven
    else
        echo "❌ Maven is required. Please install it manually."
        exit 1
    fi
else
    MVN_VERSION=$(mvn --version | head -n 1)
    echo "✅ Maven found: $MVN_VERSION"
fi

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
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
    echo "  BACKEND_GOOGLE_MAPS_API_KEY=your_backend_google_maps_api_key_here"
    echo ""
    echo "You can copy .env.example to .env and fill in your keys:"
    echo "  cp .env.example .env"
    echo ""
    exit 1
fi

# Export Google Maps API key
# Check for GOOGLE_MAPS_API_KEY first (direct), then BACKEND_GOOGLE_MAPS_API_KEY (aliased)
if [ -n "$GOOGLE_MAPS_API_KEY" ]; then
    # Already set in .env as GOOGLE_MAPS_API_KEY
    export GOOGLE_MAPS_API_KEY="$GOOGLE_MAPS_API_KEY"
    echo "✅ Google Maps API key exported from .env (GOOGLE_MAPS_API_KEY)"
elif [ -n "$BACKEND_GOOGLE_MAPS_API_KEY" ]; then
    # Set as BACKEND_GOOGLE_MAPS_API_KEY in .env
    export GOOGLE_MAPS_API_KEY="$BACKEND_GOOGLE_MAPS_API_KEY"
    echo "✅ Google Maps API key exported from .env (BACKEND_GOOGLE_MAPS_API_KEY)"
else
    echo "❌ GOOGLE_MAPS_API_KEY not set in .env file!"
    echo "   Please add it to your .env file:"
    echo "   GOOGLE_MAPS_API_KEY=your_key_here"
    echo "   (or BACKEND_GOOGLE_MAPS_API_KEY=your_key_here)"
    exit 1
fi

echo ""
echo "📋 Environment Variables Set:"
echo "   GOOGLE_MAPS_API_KEY=*** (loaded from .env)"
echo ""

# Navigate to backend directory
cd "$BACKEND_DIR"

# Check if start.sh exists and is executable
if [ ! -f "./start.sh" ]; then
    echo "⚠️  start.sh not found. Using mvn spring-boot:run instead..."
    START_CMD="mvn spring-boot:run"
else
    chmod +x ./start.sh
    START_CMD="./start.sh"
fi

# Start backend
echo "🚀 Starting Spring Boot backend..."
echo "   Backend will run on http://localhost:8080"
echo ""

$START_CMD
