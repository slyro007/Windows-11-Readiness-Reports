#!/bin/bash
echo "🚀 Deploying Windows 11 Readiness App..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Create data directory
echo "📁 Creating data directory..."
mkdir -p $(pwd)/data

# Build Docker image
echo "🔨 Building Docker image..."
docker build -t windows11-readiness-app .

# Stop any existing container
echo "🛑 Stopping any existing container..."
docker stop windows11-app 2>/dev/null
docker rm windows11-app 2>/dev/null

# Start the container
echo "🚀 Starting container..."
docker run -d -p 3000:3000 -v $(pwd)/data:/app/data --name windows11-app windows11-readiness-app

# Show status
echo ""
echo "✅ Deployment complete!"
echo "📊 App is running at http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "📋 Container status:"
docker ps --filter name=windows11-app

echo ""
echo "📝 Useful commands:"
echo "  View logs: docker logs windows11-app"
echo "  Stop app:  docker stop windows11-app"
echo "  Start app: docker start windows11-app"
echo "  Update:    ./update-app.sh" 