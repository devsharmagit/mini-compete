# Mini Compete API Documentation

## Base URL
- Development: `http://localhost:3001/api`
- Production: `https://your-domain.com/api`

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### POST /auth/signup
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "PARTICIPANT" | "ORGANIZER"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "PARTICIPANT"
  }
}
```

#### POST /auth/login
Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "PARTICIPANT"
  }
}
```

#### GET /auth/me
Get current user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "PARTICIPANT"
  }
}
```

### Competitions

#### POST /competitions
Create a new competition (Organizer only).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Coding Challenge 2025",
  "description": "Test your coding skills in this annual competition",
  "tags": ["coding", "algorithms", "competitive"],
  "capacity": 50,
  "regDeadline": "2025-02-15T23:59:59Z"
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Coding Challenge 2025",
  "description": "Test your coding skills in this annual competition",
  "tags": ["coding", "algorithms", "competitive"],
  "capacity": 50,
  "regDeadline": "2025-02-15T23:59:59Z",
  "createdAt": "2025-01-21T10:00:00Z"
}
```

#### GET /competitions
Get all competitions with pagination and filtering.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `tags` (optional): Comma-separated tags to filter by

**Example:**
```
GET /competitions?page=1&limit=10&tags=coding,algorithms
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Coding Challenge 2025",
      "description": "Test your coding skills...",
      "tags": ["coding", "algorithms"],
      "capacity": 50,
      "regDeadline": "2025-02-15T23:59:59Z",
      "startDate": null,
      "organizerId": 1,
      "createdAt": "2025-01-21T10:00:00Z",
      "updatedAt": "2025-01-21T10:00:00Z",
      "registeredCount": 5,
      "seatsLeft": 45
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

#### GET /competitions/:id
Get competition details by ID.

**Response:**
```json
{
  "id": 1,
  "title": "Coding Challenge 2025",
  "description": "Test your coding skills...",
  "tags": ["coding", "algorithms"],
  "capacity": 50,
  "regDeadline": "2025-02-15T23:59:59Z",
  "startDate": null,
  "organizerId": 1,
  "createdAt": "2025-01-21T10:00:00Z",
  "updatedAt": "2025-01-21T10:00:00Z",
  "registeredCount": 5,
  "seatsLeft": 45,
  "organizer": {
    "id": 1,
    "name": "Alice Organizer",
    "email": "alice@example.com"
  }
}
```

#### POST /competitions/:id/register
Register for a competition (Participant only).

**Headers:**
```
Authorization: Bearer <token>
Idempotency-Key: <unique-key> (optional)
```

**Response:**
```json
{
  "id": 1,
  "competitionId": 1,
  "userId": 2,
  "registeredAt": "2025-01-21T10:30:00Z",
  "competition": {
    "title": "Coding Challenge 2025"
  }
}
```

#### GET /competitions/:id/registrations
Get all registrations for a competition (Organizer only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "competitionId": 1,
  "totalRegistrations": 2,
  "registrations": [
    {
      "id": 1,
      "user": {
        "id": 2,
        "name": "John Participant",
        "email": "john@example.com"
      },
      "registeredAt": "2025-01-21T10:30:00Z"
    }
  ]
}
```

### User Management

#### GET /users/me/registrations
Get current user's registrations.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "userId": 2,
  "totalRegistrations": 1,
  "registrations": [
    {
      "id": 1,
      "competitionId": 1,
      "userId": 2,
      "createdAt": "2025-01-21T10:30:00Z",
      "competition": {
        "id": 1,
        "title": "Coding Challenge 2025",
        "description": "Test your coding skills...",
        "tags": ["coding", "algorithms"],
        "capacity": 50,
        "regDeadline": "2025-02-15T23:59:59Z",
        "startDate": null,
        "organizerId": 1,
        "createdAt": "2025-01-21T10:00:00Z",
        "updatedAt": "2025-01-21T10:00:00Z"
      }
    }
  ]
}
```

#### GET /users/me/mailbox
Get current user's mailbox (simulated emails).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "userId": 2,
  "totalEmails": 1,
  "emails": [
    {
      "id": 1,
      "userId": 2,
      "to": "john@example.com",
      "subject": "Registration Confirmed: Coding Challenge 2025",
      "body": "Hi John Participant,\n\nYour registration for \"Coding Challenge 2025\" has been confirmed!\n\nRegistration ID: 1\nCompetition ID: 1\n\nThank you for registering.\n\nBest regards,\nMini Compete Team",
      "sentAt": "2025-01-21T10:30:05Z"
    }
  ]
}
```

## Error Responses

All error responses follow this format:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

### Common Error Codes

- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: Insufficient permissions (e.g., participant trying to create competition)
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate registration or resource conflict
- `500 Internal Server Error`: Server error

### Specific Error Messages

- `"Registration deadline has passed"`: Trying to register after deadline
- `"Competition is full"`: No available seats
- `"You are already registered for this competition"`: Duplicate registration
- `"Registration in progress, please try again"`: Concurrent registration attempt
- `"Competition with ID X not found"`: Invalid competition ID

## Idempotency

The registration endpoint supports idempotency to handle duplicate requests safely. Include an `Idempotency-Key` header with a unique value:

```
Idempotency-Key: unique-key-123
```

If the same key is used again, the original response will be returned without creating a duplicate registration.

## Rate Limiting

API endpoints are rate-limited to prevent abuse. Default limits:
- Authentication: 5 requests per minute per IP
- Registration: 10 requests per minute per user
- General API: 100 requests per minute per user

## Webhooks (Future)

Planned webhook events:
- `registration.created`: When a user registers for a competition
- `competition.created`: When a new competition is created
- `competition.full`: When a competition reaches capacity

## SDK Examples

### JavaScript/TypeScript

```typescript
import { apiClient } from './lib/api';

// Login
const { data } = await apiClient.login({
  email: 'john@example.com',
  password: 'password123'
});

// Create competition
const competition = await apiClient.createCompetition({
  title: 'My Competition',
  description: 'A great competition',
  capacity: 100,
  regDeadline: '2025-12-31T23:59:59Z'
});

// Register with idempotency
const registration = await apiClient.registerForCompetition(
  competition.id,
  'unique-key-123'
);
```

### cURL Examples

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Create competition
curl -X POST http://localhost:3001/api/competitions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Test","description":"Test","capacity":10,"regDeadline":"2025-12-31T23:59:59Z"}'

# Register
curl -X POST http://localhost:3001/api/competitions/1/register \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Idempotency-Key: unique-key-123"
```
