# Local Testing Guide

## Prerequisites

1. **Bun installed**: Check with `bun --version`

   - If not installed: `curl -fsSL https://bun.sh/install | bash` (Linux/Mac)
   - Or download from: https://bun.sh

2. **Docker Desktop installed** (for PostgreSQL)
   - Download from: https://www.docker.com/products/docker-desktop
   - Make sure Docker is running

## Step-by-Step Local Testing

### Step 1: Install Dependencies

```bash
bun install
```

This will install all required packages including Express, Prisma, and TypeScript.

### Step 2: Create Environment File

Create a `.env` file in the root directory:

```bash
# On Windows (PowerShell)
Copy-Item .env.example .env

# On Linux/Mac
cp .env.example .env
```

Or manually create `.env` with:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/expense_manager?schema=public"
```

### Step 3: Start PostgreSQL Database

```bash
docker-compose up -d
```

This will:

- Pull PostgreSQL 16 image (if not already downloaded)
- Start a container named `expense-manager-db`
- Expose PostgreSQL on port `5432`
- Create a database named `expense_manager`

**Verify database is running:**

```bash
docker ps
```

You should see `expense-manager-db` container running.

**Check database logs (optional):**

```bash
docker-compose logs postgres
```

### Step 4: Setup Database Schema

```bash
# Generate Prisma Client
bun run db:generate

# Push schema to database (creates tables)
bun run db:push
```

This will:

- Generate Prisma Client based on your schema
- Create the `users` table in your database

### Step 5: Start Development Server

```bash
bun run dev
```

You should see:

```
🚀 Server running on http://localhost:3000
📊 Health check: http://localhost:3000/health
🌍 Environment: development
```

The server is now running with hot-reload enabled (auto-restarts on file changes).

## Testing the API

### Option 1: Using Browser

1. **Root Endpoint**: Open http://localhost:3000

   - Should show API information

2. **Health Check**: Open http://localhost:3000/health
   - Should show `"status": "healthy"` and `"database": "connected"`

### Option 2: Using curl (PowerShell/Command Prompt)

```bash
# Test root endpoint
curl http://localhost:3000

# Test health check
curl http://localhost:3000/health
```

### Option 3: Using PowerShell Invoke-WebRequest

```powershell
# Test root endpoint
Invoke-WebRequest -Uri http://localhost:3000 | Select-Object -ExpandProperty Content

# Test health check
Invoke-WebRequest -Uri http://localhost:3000/health | Select-Object -ExpandProperty Content
```

### Option 4: Using Postman or Thunder Client (VS Code Extension)

1. **GET** `http://localhost:3000`
2. **GET** `http://localhost:3000/health`

## Expected Responses

### Root Endpoint (`GET /`)

```json
{
  "message": "Expense Manager API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health"
  }
}
```

### Health Check (`GET /health`) - Success

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.456,
  "database": "connected",
  "environment": "development"
}
```

### Health Check (`GET /health`) - Database Error

If database is not connected:

```json
{
  "status": "unhealthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "disconnected",
  "error": "Connection error message"
}
```

## Troubleshooting

### Issue: "Cannot find module '@prisma/client'"

**Solution:**

```bash
bun run db:generate
```

### Issue: "Database connection failed"

**Check:**

1. Is Docker running?

   ```bash
   docker ps
   ```

2. Is PostgreSQL container running?

   ```bash
   docker-compose ps
   ```

3. If not running, start it:

   ```bash
   docker-compose up -d
   ```

4. Wait a few seconds for database to initialize, then try again.

### Issue: "Port 3000 already in use"

**Solution:**

1. Change PORT in `.env` file to another port (e.g., `3001`)
2. Or stop the process using port 3000:

   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F

   # Linux/Mac
   lsof -ti:3000 | xargs kill
   ```

### Issue: "Prisma schema not found"

**Solution:**
Make sure `prisma/schema.prisma` exists. If not, create it with the basic schema.

### Issue: Docker not starting

**Solution:**

1. Make sure Docker Desktop is installed and running
2. Check Docker status:
   ```bash
   docker --version
   docker info
   ```

## Additional Testing Tools

### Prisma Studio (Database GUI)

View and edit your database visually:

```bash
bun run db:studio
```

This opens Prisma Studio at http://localhost:5555

### Check Database Directly

```bash
# Connect to PostgreSQL container
docker exec -it expense-manager-db psql -U postgres -d expense_manager

# Then run SQL commands:
# \dt          - List tables
# SELECT * FROM users;  - View users
# \q           - Quit
```

## Stopping Services

### Stop Development Server

Press `Ctrl + C` in the terminal running `bun run dev`

### Stop PostgreSQL

```bash
docker-compose down
```

### Stop and Remove All Data

```bash
docker-compose down -v
```

⚠️ **Warning**: This removes the database volume and all data!

## Next Steps

Once local testing is successful:

1. Add more API endpoints
2. Add authentication
3. Add more database models
4. Deploy to server (see DEPLOYMENT.md)
