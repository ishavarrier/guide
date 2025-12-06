#!/bin/bash

# Script to test Render deployment locally
# This simulates the production build and deployment process

set -e  # Exit on error

echo "🧪 Testing Render Deployment Locally"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "   Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi
echo -e "${GREEN}✅ Docker found${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm found: $(npm --version)${NC}"

# Check .env file
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo "   Creating .env file template..."
    echo "GOOGLE_MAPS_API_KEY=your_api_key_here" > .env
    echo -e "${YELLOW}   Please edit .env and add your Google Maps API key${NC}"
    exit 1
fi
echo -e "${GREEN}✅ .env file found${NC}"

# Load environment variables
echo ""
echo "📝 Loading environment variables..."
set -a
source .env
set +a

if [ -z "$GOOGLE_MAPS_API_KEY" ]; then
    echo -e "${RED}❌ GOOGLE_MAPS_API_KEY not set in .env file${NC}"
    exit 1
fi
echo -e "${GREEN}✅ GOOGLE_MAPS_API_KEY loaded${NC}"

echo ""
echo "===================================="
echo "Step 1: Building Frontend (like Render)"
echo "===================================="
echo ""

# Clean and build frontend (same as Render)
echo "🧹 Cleaning previous build..."
rm -rf node_modules package-lock.json dist

echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

echo "🏗️  Building frontend for web..."
npm run build:web

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed - dist directory not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Frontend built successfully${NC}"

echo ""
echo "===================================="
echo "Step 2: Building Backend Docker Image"
echo "===================================="
echo ""

# Build Docker image for backend
echo "🐳 Building backend Docker image..."
cd backend
docker build -t midpoint-backend:local .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Backend Docker image built${NC}"

cd "$SCRIPT_DIR"

echo ""
echo "===================================="
echo "Step 3: Starting Services"
echo "===================================="
echo ""

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker stop midpoint-backend-local 2>/dev/null || true
docker rm midpoint-backend-local 2>/dev/null || true

# Start backend in Docker
echo "🚀 Starting backend in Docker..."
docker run -d \
    --name midpoint-backend-local \
    -p 8080:8080 \
    -e GOOGLE_MAPS_API_KEY="$GOOGLE_MAPS_API_KEY" \
    -e PORT=8080 \
    -e SPRING_PROFILES_ACTIVE=production \
    midpoint-backend:local

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Check if backend is running
for i in {1..30}; do
    if curl -s http://localhost:8080/api/places/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is running on http://localhost:8080${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Backend failed to start${NC}"
        echo "   Check logs: docker logs midpoint-backend-local"
        exit 1
    fi
    sleep 1
done

# Set frontend environment variables
export PORT=3000
export NODE_ENV=production
export EXPO_PUBLIC_API_BASE_URL="http://localhost:8080/api/places"

echo ""
echo "🚀 Starting frontend server..."
echo "   Frontend will be available at: http://localhost:3000"
echo "   Backend is available at: http://localhost:8080"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both services${NC}"
echo ""

# Start frontend server
npm run serve

