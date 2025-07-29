#!/bin/bash
echo "🔄 Updating Windows 11 Readiness App..."

# Pull latest changes
echo "📥 Pulling latest changes from GitHub..."
git pull origin master

# Build new image
echo "🔨 Building new Docker image..."
docker build --no-cache -t windows11-readiness-app .

# Stop and remove old container
echo "🛑 Stopping old container..."
docker stop windows11-app 2>/dev/null
docker rm windows11-app 2>/dev/null

# Start new container
echo "🚀 Starting new container..."
docker run -d -p 3000:3000 -v $(pwd)/data:/app/data --name windows11-app windows11-readiness-app

# Show status
echo ""
echo "✅ Update complete!"
echo "📊 App is running at http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "📋 Container status:"
docker ps --filter name=windows11-app

echo ""
echo "📝 To view logs: docker logs windows11-app"
echo "🛑 To stop: docker stop windows11-app" 