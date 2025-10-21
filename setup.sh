#!/bin/bash

# Mini Compete Setup Script
echo "🚀 Setting up Mini Compete..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm first:"
    echo "npm install -g pnpm"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Create environment files
echo "🔧 Setting up environment files..."

# Backend .env
if [ ! -f "apps/backend/.env" ]; then
    cat > apps/backend/.env << EOF
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mini_compete?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Application
NODE_ENV=development
PORT=3001

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
FRONTEND_URL="http://localhost:3000"
EOF
    echo "✅ Created apps/backend/.env"
else
    echo "⚠️  apps/backend/.env already exists, skipping..."
fi

# Frontend .env.local
if [ ! -f "apps/frontend/.env.local" ]; then
    cat > apps/frontend/.env.local << EOF
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
EOF
    echo "✅ Created apps/frontend/.env.local"
else
    echo "⚠️  apps/frontend/.env.local already exists, skipping..."
fi

# Start infrastructure
echo "🐳 Starting PostgreSQL and Redis..."
docker-compose up -d postgres redis

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 15

# Check if services are healthy
echo "🔍 Checking service health..."
if ! docker-compose ps | grep -q "postgres.*healthy"; then
    echo "❌ PostgreSQL is not healthy. Please check the logs:"
    echo "docker-compose logs postgres"
    exit 1
fi

if ! docker-compose ps | grep -q "redis.*healthy"; then
    echo "❌ Redis is not healthy. Please check the logs:"
    echo "docker-compose logs redis"
    exit 1
fi

echo "✅ Infrastructure services are healthy"

# Setup database
echo "🗄️  Setting up database..."
cd apps/backend

# Run migrations
echo "📊 Running database migrations..."
npx prisma migrate deploy

# Seed database
echo "🌱 Seeding database..."
npx prisma db seed

cd ../..

echo "✅ Database setup complete"

echo ""
echo "🎉 Setup complete! You can now start the applications:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd apps/backend && pnpm run start:dev"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd apps/frontend && pnpm run dev"
echo ""
echo "Or use Docker Compose for full deployment:"
echo "  docker-compose up -d"
echo ""
echo "🌐 Access the application:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:3001/api"
echo ""
echo "📚 Test the API with the Postman collection:"
echo "  Mini_Compete_API.postman_collection.json"
echo ""
echo "🔑 Default login credentials (from seed data):"
echo "  Organizers:"
echo "    alice@example.com / password123"
echo "    bob@example.com / password123"
echo "  Participants:"
echo "    participant1@example.com / password123"
echo "    participant2@example.com / password123"
echo "    participant3@example.com / password123"
echo "    participant4@example.com / password123"
echo "    participant5@example.com / password123"
