#!/bin/bash
echo "🔄 Updating Windows 11 Readiness App..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Pull latest code
echo "📥 Pulling latest code from repository..."
git pull origin master

if [ $? -ne 0 ]; then
    echo "❌ Failed to pull latest code. Please check your git repository status."
    exit 1
fi

# Build new Docker image (no cache to ensure fresh build)
echo "🔨 Building new Docker image..."
docker build --no-cache -t windows11-readiness-app .

if [ $? -ne 0 ]; then
    echo "❌ Failed to build Docker image."
    exit 1
fi

# Stop and remove existing container
echo "🛑 Stopping existing container..."
docker stop windows11-app 2>/dev/null
docker rm windows11-app 2>/dev/null

# Start new container with updated image
echo "🚀 Starting updated container..."
docker run -d -p 3000:3000 -v $(pwd)/data:/app/data --name windows11-app windows11-readiness-app

# Show status
echo ""
echo "✅ Update complete!"
echo "📊 App is running at http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "📋 Container status:"
docker ps --filter name=windows11-app

echo ""
echo "📝 Useful commands:"
echo "  View logs: docker logs windows11-app"
echo "  Stop app:  docker stop windows11-app"
echo "  Start app: docker start windows11-app"