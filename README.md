# Mini Compete

A competitions service where organizers create events and participants register. Built with Next.js, NestJS, Prisma, and Redis for queueing.

## 🏗️ Architecture

This is a monorepo built with Turborepo containing:

- **Backend** (`apps/backend`): NestJS + Prisma + PostgreSQL + Redis + BullMQ
- **Frontend** (`apps/frontend`): Next.js with minimal UI
- **Shared packages**: TypeScript configs, ESLint configs, UI components

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Docker & Docker Compose
- pnpm (recommended) or npm

### 1. Clone and Install

```bash
git clone <repository-url>
cd mini-compete
pnpm install
```

### 2. Environment Setup

Create environment files:

```bash
# Backend environment
cp apps/backend/.env.example apps/backend/.env

# Frontend environment  
cp apps/frontend/.env.example apps/frontend/.env.local
```

**Backend Environment Variables:**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mini_compete?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
NODE_ENV=development
PORT=3001
```

**Frontend Environment Variables:**
```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

### 3. Start Infrastructure

```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Wait for services to be ready (about 10-15 seconds)
```

### 4. Database Setup

```bash
# Navigate to backend
cd apps/backend

# Run migrations
npx prisma migrate deploy

# Seed the database
npx prisma db seed
```

### 5. Start Applications

**Terminal 1 - Backend:**
```bash
cd apps/backend
pnpm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd apps/frontend  
pnpm run dev
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Database**: localhost:5432 (postgres/postgres)
- **Redis**: localhost:6379

## 📋 Features Implemented

### ✅ Core API Endpoints

1. **POST /api/auth/signup** - User registration with role (participant/organizer)
2. **POST /api/auth/login** - User authentication, returns JWT
3. **POST /api/competitions** - Create competition (organizer only)
4. **POST /api/competitions/:id/register** - Register for competition (participant only)
5. **GET /api/competitions** - List competitions with pagination and filtering
6. **GET /api/competitions/:id** - Get competition details
7. **GET /api/users/me/registrations** - Get user's registrations
8. **GET /api/users/me/mailbox** - Get user's mailbox (simulated emails)

### ✅ Advanced Features

- **Idempotency**: Registration endpoint supports `Idempotency-Key` header
- **Concurrency Control**: Redis distributed locks + database transactions prevent overselling
- **Worker Queue**: BullMQ processes registration confirmations and reminders
- **Cron Jobs**: Automated reminder notifications and cleanup tasks
- **Role-based Access**: JWT authentication with participant/organizer roles

## 🔧 Technical Implementation

### Concurrency & Idempotency

**Problem**: Prevent overselling under concurrent registration requests.

**Solution**: 
1. **Redis Distributed Lock**: Acquire lock before processing registration
2. **Database Transaction**: Use `Serializable` isolation level with row locking
3. **Idempotency Keys**: Cache responses for duplicate requests
4. **Capacity Validation**: Check available seats within transaction

**Trade-offs**:
- ✅ Prevents overselling completely
- ✅ Handles high concurrency gracefully  
- ⚠️ Redis dependency for distributed locks
- ⚠️ Slightly higher latency due to locking

### Worker Architecture

**BullMQ Integration**:
- **Registration Confirmation**: Processes after successful registration
- **Reminder Notifications**: Cron-triggered for upcoming competitions
- **Retry Logic**: Exponential backoff with 3 attempts
- **Dead Letter Queue**: Failed jobs stored in `FailedJobs` table

**Cron Jobs**:
- **Daily Reminders**: Notify users about competitions starting in 24 hours
- **Weekly Cleanup**: Purge old soft-deleted registrations
- **Key Cleanup**: Remove expired idempotency keys

### Database Schema

```sql
-- Core entities
User (id, name, email, password, role, timestamps)
Competition (id, title, description, tags, capacity, regDeadline, organizerId)
Registration (id, competitionId, userId, timestamps, softDelete)

-- Supporting tables  
MailBox (id, userId, to, subject, body, sentAt) -- Simulated emails
IdempotencyKey (id, key, response, expiresAt) -- Request deduplication
FailedJob (id, jobId, jobName, payload, error, attempts) -- DLQ
```

## 🧪 API Testing

### Sample cURL Commands

**1. Sign Up (Organizer)**
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Organizer",
    "email": "alice@example.com", 
    "password": "password123",
    "role": "ORGANIZER"
  }'
```

**2. Login**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "password123"
  }'
```

**3. Create Competition**
```bash
curl -X POST http://localhost:3001/api/competitions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Coding Challenge 2025",
    "description": "Test your coding skills",
    "tags": ["coding", "algorithms"],
    "capacity": 50,
    "regDeadline": "2025-02-15T23:59:59Z"
  }'
```

**4. Register for Competition (with Idempotency)**
```bash
curl -X POST http://localhost:3001/api/competitions/1/register \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Idempotency-Key: unique-key-123"
```

**5. Get Competitions**
```bash
curl "http://localhost:3001/api/competitions?page=1&limit=10&tags=coding"
```

### Postman Collection

Import the following collection for comprehensive API testing:

```json
{
  "info": {
    "name": "Mini Compete API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Signup",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Test User\",\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\",\n  \"role\": \"PARTICIPANT\"\n}"
            },
            "url": "{{baseUrl}}/api/auth/signup"
          }
        },
        {
          "name": "Login", 
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\"\n}"
            },
            "url": "{{baseUrl}}/api/auth/login"
          }
        }
      ]
    }
  ],
  "variable": [
    {"key": "baseUrl", "value": "http://localhost:3001"}
  ]
}
```

## 🐳 Docker Deployment

### Development with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment

```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml up -d

# Scale workers
docker-compose -f docker-compose.prod.yml up -d --scale worker=3
```

## 📊 Monitoring & Observability

### Logs
- **Application**: Structured JSON logs with correlation IDs
- **Worker**: Job processing logs with retry attempts
- **Cron**: Scheduled job execution logs

### Metrics
- **Queue Metrics**: Job counts, processing times, failure rates
- **Database**: Connection pool, query performance
- **Redis**: Memory usage, key expiration

### Health Checks
- **API Health**: `GET /health` endpoint
- **Database**: Connection and migration status
- **Redis**: Connection and queue status

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: DTO validation with class-validator
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **Rate Limiting**: Redis-based rate limiting (configurable)
- **CORS**: Configurable cross-origin resource sharing

## 🚀 Performance Optimizations

- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Prisma connection pool configuration
- **Redis Caching**: Session and idempotency key caching
- **Queue Processing**: Parallel job processing with BullMQ
- **Frontend**: Next.js optimization with code splitting

## 🧪 Testing

```bash
# Backend tests
cd apps/backend
pnpm run test
pnpm run test:e2e

# Frontend tests  
cd apps/frontend
pnpm run test

# All tests
pnpm run test
```

## 📝 Development Notes

### Database Migrations
```bash
# Create migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# Deploy migrations
npx prisma migrate deploy
```

### Worker Development
```bash
# Process jobs manually
npx prisma studio

# Monitor queues
redis-cli monitor
```

### Frontend Development
```bash
# Type checking
pnpm run check-types

# Linting
pnpm run lint

# Build
pnpm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using NestJS, Next.js, Prisma, and Redis**
