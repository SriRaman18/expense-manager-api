# Testing Guide

This guide explains how to test the Expense Manager API endpoints.

## Prerequisites

1. Make sure your Docker PostgreSQL container is running:

   ```bash
   docker ps
   ```

   You should see `postgres-db` container running.

2. Create a `.env` file in the root directory with:

   ```env
   PORT=3000
   NODE_ENV=development
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mydb"
   ```

3. Generate Prisma Client and push schema:

   ```bash
   bun run db:generate
   bun run db:push
   ```

4. Start the development server:
   ```bash
   bun run dev
   ```

## Testing Endpoints

### 1. Health Check

**Endpoint:** `GET /health`

**Using cURL:**

```bash
curl http://localhost:3000/health
```

**Using PowerShell (Windows):**

```powershell
Invoke-RestMethod -Uri http://localhost:3000/health -Method Get
```

**Expected Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 123.456,
  "database": "connected",
  "environment": "development"
}
```

### 2. Root Endpoint

**Endpoint:** `GET /`

**Using cURL:**

```bash
curl http://localhost:3000/
```

**Using PowerShell:**

```powershell
Invoke-RestMethod -Uri http://localhost:3000/ -Method Get
```

**Expected Response:**

```json
{
  "message": "Expense Manager API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "users": {
      "create": "POST /api/users",
      "getAll": "GET /api/users",
      "getById": "GET /api/users/:id"
    }
  }
}
```

### 3. Create User

**Endpoint:** `POST /api/users`

**Using cURL:**

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@example.com\",\"name\":\"John Doe\"}"
```

**Using PowerShell:**

```powershell
$body = @{
    email = "john@example.com"
    name = "John Doe"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3000/api/users -Method Post -Body $body -ContentType "application/json"
```

**Expected Response (Success - 201):**

```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid-here",
    "email": "john@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Expected Response (Error - 400):**

```json
{
  "error": "Email is required"
}
```

**Expected Response (Error - 409):**

```json
{
  "error": "User with this email already exists"
}
```

### 4. Get All Users

**Endpoint:** `GET /api/users`

**Using cURL:**

```bash
curl http://localhost:3000/api/users
```

**Using PowerShell:**

```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/users -Method Get
```

**Expected Response:**

```json
{
  "count": 2,
  "users": [
    {
      "id": "uuid-1",
      "email": "john@example.com",
      "name": "John Doe",
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    },
    {
      "id": "uuid-2",
      "email": "jane@example.com",
      "name": "Jane Smith",
      "createdAt": "2024-01-01T11:00:00.000Z",
      "updatedAt": "2024-01-01T11:00:00.000Z"
    }
  ]
}
```

### 5. Get User by ID

**Endpoint:** `GET /api/users/:id`

**Using cURL:**

```bash
curl http://localhost:3000/api/users/YOUR_USER_ID_HERE
```

**Using PowerShell:**

```powershell
$userId = "YOUR_USER_ID_HERE"
Invoke-RestMethod -Uri "http://localhost:3000/api/users/$userId" -Method Get
```

**Expected Response (Success - 200):**

```json
{
  "user": {
    "id": "uuid-here",
    "email": "john@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Expected Response (Error - 404):**

```json
{
  "error": "User not found"
}
```

## Testing with Postman

1. **Import Collection:**

   - Create a new collection in Postman
   - Add requests for each endpoint

2. **Set Base URL:**

   - Base URL: `http://localhost:3000`

3. **Test Flow:**
   - First, test `/health` to ensure server is running
   - Create a user with `POST /api/users`
   - Get all users with `GET /api/users`
   - Get specific user with `GET /api/users/:id` (use ID from create response)

## Testing with Browser

You can test GET endpoints directly in your browser:

- `http://localhost:3000/health`
- `http://localhost:3000/`
- `http://localhost:3000/api/users`
- `http://localhost:3000/api/users/YOUR_USER_ID`

## Troubleshooting

### Database Connection Error

If you get a database connection error:

1. **Check if Docker container is running:**

   ```bash
   docker ps
   ```

2. **Check container logs:**

   ```bash
   docker logs postgres-db
   ```

3. **Verify DATABASE_URL in .env:**

   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mydb"
   ```

4. **Test connection manually:**
   ```bash
   # Using psql (if installed)
   psql -h localhost -U postgres -d mydb
   # Password: postgres
   ```

### Port Already in Use

If port 3000 is already in use:

- Change `PORT` in `.env` file to a different port (e.g., `3001`)
- Update all URLs in your tests accordingly
