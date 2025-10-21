# Docker Setup for Mini Compete

This guide explains how to run the Mini Compete application using Docker with a single command.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose installed
- At least 4GB of available RAM
- Ports 3000, 4000, 5432, and 6379 available

## Quick Start

### Option 1: Using the startup script (Recommended)

```bash
./start-docker.sh
```

### Option 2: Using Docker Compose directly

```bash
docker-compose up --build
```

## What the setup includes

- **Frontend**: Next.js application running on port 3000
- **Backend**: NestJS API server running on port 4000
- **Database**: PostgreSQL database running on port 5432
- **Cache**: Redis server running on port 6379

## Services

### Frontend (Next.js)
- **URL**: http://localhost:3000
- **Container**: mini-compete-frontend
- **Features**: Full UI for competition management

### Backend (NestJS)
- **URL**: http://localhost:4000/api
- **Container**: mini-compete-backend
- **Features**: REST API, authentication, database operations

### Database (PostgreSQL)
- **URL**: localhost:5432
- **Container**: mini-compete-postgres
- **Database**: mini_compete
- **Credentials**: postgres/postgres

### Cache (Redis)
- **URL**: localhost:6379
- **Container**: mini-compete-redis
- **Features**: Session storage, job queues

## Environment Variables

The setup automatically creates the necessary environment files:

### Backend (.env)
```
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/mini_compete?schema=public"
REDIS_URL="redis://redis:6379"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=4000
NODE_ENV=production
FRONTEND_URL="http://localhost:3000"
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
```

## Database Setup

The backend automatically:
1. Runs Prisma migrations on startup
2. Seeds the database with initial data
3. Connects to PostgreSQL and Redis

## Useful Commands

### Start the application
```bash
./start-docker.sh
```

### Stop the application
```bash
./stop-docker.sh
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Restart services
```bash
docker-compose restart
```

### Rebuild and start
```bash
docker-compose up --build
```

### Stop and remove all data
```bash
docker-compose down -v
```

### Access database directly
```bash
docker exec -it mini-compete-postgres psql -U postgres -d mini_compete
```

### Access Redis CLI
```bash
docker exec -it mini-compete-redis redis-cli
```

## Troubleshooting

### Port conflicts
If you get port conflicts, you can modify the ports in `docker-compose.yml`:
```yaml
ports:
  - '3001:3000'  # Frontend on port 3001
  - '4001:4000'  # Backend on port 4001
```

### Database connection issues
1. Wait for PostgreSQL to be fully ready (health check)
2. Check if the database container is running: `docker-compose ps`
3. View backend logs: `docker-compose logs backend`

### Frontend not loading
1. Check if the frontend container is running: `docker-compose ps`
2. View frontend logs: `docker-compose logs frontend`
3. Ensure the backend is running first

### Memory issues
If you encounter memory issues:
1. Increase Docker Desktop memory allocation
2. Close other applications
3. Use `docker-compose down` to free up resources

## Development

For development with hot reload, you can run services individually:

```bash
# Start only database and Redis
docker-compose up postgres redis

# Run backend in development mode
cd apps/backend
npm run start:dev

# Run frontend in development mode
cd apps/frontend
npm run dev
```

## Production Considerations

For production deployment:
1. Change the JWT_SECRET to a secure value
2. Use environment-specific database credentials
3. Configure proper CORS settings
4. Set up SSL/TLS certificates
5. Use a reverse proxy (nginx)
6. Configure proper logging and monitoring

## File Structure

```
mini-compete/
├── docker-compose.yml          # Main Docker Compose configuration
├── start-docker.sh            # Startup script
├── stop-docker.sh             # Stop script
├── apps/
│   ├── backend/
│   │   └── Dockerfile         # Backend Docker configuration
│   └── frontend/
│       └── Dockerfile         # Frontend Docker configuration
└── DOCKER_SETUP.md            # This file
```
