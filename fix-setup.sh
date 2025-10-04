#!/bin/bash

# ICN Navigator Web Frontend - Quick Fix Script
# This script fixes common setup issues

echo "🔧 ICN Navigator Web Frontend - Quick Fix"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Stop any existing containers
echo "Stopping any existing containers..."
docker-compose down 2>/dev/null || true

# Remove any problematic containers
echo "Cleaning up old containers..."
docker rm -f icn-navigator-web 2>/dev/null || true

# Clear Docker build cache if needed
echo "Clearing Docker cache..."
docker system prune -f

# Rebuild the image
echo "Rebuilding Docker image..."
docker-compose build --no-cache

# Start containers
echo "Starting containers..."
docker-compose up -d

# Wait for container to be ready
echo "Waiting for container to be ready..."
sleep 3

# Check container status
echo ""
echo "Container status:"
docker-compose ps

# Check if container is running
if docker-compose ps | grep -q "icn-navigator-web.*Up"; then
    echo -e "${GREEN}✅ Container is running successfully!${NC}"
    echo ""
    echo "Running setup script inside container..."
    docker-compose exec icn-web-dev bash -c "chmod +x setup.sh && sed -i 's/\r$//' setup.sh && ./setup.sh"
    echo ""
    echo -e "${GREEN}✅ Setup completed successfully!${NC}"
    echo ""
    echo "You can now use:"
    echo "  make start   - Start the React development server"
    echo "  make shell   - Enter the container shell"
    echo "  make logs    - View container logs"
else
    echo -e "${RED}❌ Container failed to start${NC}"
    echo ""
    echo "Checking logs..."
    docker-compose logs --tail=20
    echo ""
    echo "Please check the error messages above and try:"
    echo "  1. Ensure Docker is running"
    echo "  2. Check port 3000 is not in use: lsof -i :3000"
    echo "  3. Try: docker system prune -a (warning: removes all Docker data)"
    exit 1
fi