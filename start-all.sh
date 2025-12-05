#!/bin/bash

# Master startup script for Midpoint
# Opens two terminal windows and runs backend and frontend

set -e  # Exit on error

echo "🚀 Starting Midpoint - Opening terminals..."

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Make scripts executable (just in case)
chmod +x "$SCRIPT_DIR/start-backend.sh"
chmod +x "$SCRIPT_DIR/start-dev.sh"

# Check if we're on macOS (for Terminal.app)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📱 Opening Terminal windows..."
    
    # Open backend in new Terminal window
    osascript -e "tell application \"Terminal\" to do script \"cd '$SCRIPT_DIR' && ./start-backend.sh\""
    
    # Wait a moment for the first window to open
    sleep 1
    
    # Open frontend in new Terminal window
    osascript -e "tell application \"Terminal\" to do script \"cd '$SCRIPT_DIR' && ./start-dev.sh\""
    
    echo "✅ Opened two Terminal windows:"
    echo "   - Backend (Spring Boot)"
    echo "   - Frontend (Expo)"
    echo ""
    echo "💡 Tip: You can close this window now - the other two will keep running"
    
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux - try to use gnome-terminal or xterm
    if command -v gnome-terminal &> /dev/null; then
        echo "📱 Opening gnome-terminal windows..."
        gnome-terminal -- bash -c "cd '$SCRIPT_DIR' && ./start-backend.sh; exec bash" &
        sleep 1
        gnome-terminal -- bash -c "cd '$SCRIPT_DIR' && ./start-dev.sh; exec bash" &
    elif command -v xterm &> /dev/null; then
        echo "📱 Opening xterm windows..."
        xterm -e "cd '$SCRIPT_DIR' && ./start-backend.sh" &
        sleep 1
        xterm -e "cd '$SCRIPT_DIR' && ./start-dev.sh" &
    else
        echo "❌ No supported terminal found. Please run scripts manually:"
        echo "   Terminal 1: ./start-backend.sh"
        echo "   Terminal 2: ./start-dev.sh"
        exit 1
    fi
else
    echo "⚠️  Unsupported OS. Please run scripts manually:"
    echo "   Terminal 1: ./start-backend.sh"
    echo "   Terminal 2: ./start-dev.sh"
    exit 1
fi
