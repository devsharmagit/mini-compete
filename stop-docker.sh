#!/bin/bash

# Stop Mini Compete Application
echo "🛑 Stopping Mini Compete Application..."

# Stop all services
docker-compose down

echo "✅ All services have been stopped."
echo ""
echo "📋 To start again, run: ./start-docker.sh"
echo "🗑️  To remove all data (including database), run: docker-compose down -v"
