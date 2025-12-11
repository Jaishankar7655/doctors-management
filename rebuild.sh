#!/bin/bash

# Quick Rebuild Script - Optimized for faster builds
echo "🔄 Rebuilding Docker containers with optimized settings..."
echo ""

# Stop current containers
echo "⏹️  Stopping current containers..."
docker-compose down

# Rebuild with no cache (optional - remove --no-cache for even faster builds)
echo "🔨 Rebuilding containers..."
docker-compose build

# Start services
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "✅ Rebuild complete!"
echo ""
echo "📊 Check status:"
echo "   docker-compose ps"
echo ""
echo "📝 View logs:"
echo "   docker-compose logs -f"
