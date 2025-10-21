#!/bin/bash

# Start Mini Compete Application with Docker
echo "🚀 Starting Mini Compete Application..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f "apps/backend/.env" ]; then
    echo "📝 Creating .env file for backend..."
    cat > apps/backend/.env << EOF
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/mini_compete?schema=public"
REDIS_URL="redis://redis:6379"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=4000
NODE_ENV=production
FRONTEND_URL="http://localhost:3000"
EOF
fi

# Create .env.local file for frontend if it doesn't exist
if [ ! -f "apps/frontend/.env.local" ]; then
    echo "📝 Creating .env.local file for frontend..."
    cat > apps/frontend/.env.local << EOF
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
EOF
fi

# Build and start all services
echo "🔨 Building and starting all services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

echo ""
echo "✅ Mini Compete Application is now running!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:4000/api"
echo "🗄️  Database: localhost:5432"
echo "📦 Redis: localhost:6379"
echo ""
echo "📋 Useful commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Stop services: docker-compose down"
echo "  - Restart services: docker-compose restart"
echo "  - Rebuild and start: docker-compose up --build"
echo ""
echo "🎉 You can now visit http://localhost:3000 to see the application!"
