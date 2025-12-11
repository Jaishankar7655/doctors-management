#!/bin/bash

# Healthcare Platform - Quick Deployment Script
# This script automates the deployment process

echo "🏥 Healthcare Platform Deployment Script"
echo "=========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update the .env file with your configuration"
    echo ""
fi

# Build all containers
echo "🔨 Building Docker containers..."
docker-compose build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

echo "✅ Build completed successfully"
echo ""

# Start all services
echo "🚀 Starting all services..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "❌ Failed to start services. Please check the errors above."
    exit 1
fi

echo "✅ All services started successfully"
echo ""

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Create superuser
echo "👤 Creating superuser account..."
echo "Please enter the superuser details:"
docker-compose exec backend python manage.py createsuperuser

echo ""
echo "🎉 Deployment Complete!"
echo "======================="
echo ""
echo "📱 Access your application at:"
echo "   Patient Portal:  http://40.81.224.249/"
echo "   Admin Portal:    http://40.81.224.249/admin-portal"
echo "   Doctor Portal:   http://40.81.224.249/doctor-portal"
echo "   Django Admin:    http://40.81.224.249/django-admin"
echo ""
echo "📊 View logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Stop services:"
echo "   docker-compose down"
echo ""
