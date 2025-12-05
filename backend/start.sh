#!/bin/bash

# Midpoint Backend Startup Script

echo "🚀 Starting Midpoint Backend..."

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed. Please install Java 17 or higher."
    exit 1
fi

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven is not installed. Please install Maven 3.6 or higher."
    exit 1
fi

# Check if API key is set
if [ -z "$GOOGLE_MAPS_API_KEY" ]; then
    echo "⚠️  GOOGLE_MAPS_API_KEY environment variable is not set."
    echo "Please set your Google Maps API key:"
    echo "export GOOGLE_MAPS_API_KEY='your_api_key_here'"
    echo ""
    echo "Or edit src/main/resources/application.yml"
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Build the project
echo "📦 Building project..."
mvn clean install -q

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

echo "✅ Build successful!"

# Start the application
echo "🌐 Starting application on http://localhost:8080"
echo "📡 API endpoints:"
echo "   - Health: http://localhost:8080/api/places/health"
echo "   - Autocomplete: http://localhost:8080/api/places/autocomplete?input=test"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

mvn spring-boot:run
