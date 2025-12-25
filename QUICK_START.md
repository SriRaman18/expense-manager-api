# Quick Start Guide

## Current Setup (Docker PostgreSQL)

Your Docker PostgreSQL is already running! Here's how to connect and test:

### Step 1: Create .env File

Create a `.env` file in the root directory with:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mydb"
```

### Step 2: Setup Database

```bash
# Generate Prisma Client
bun run db:generate

# Push schema to database (creates the users table)
bun run db:push
```

### Step 3: Start Server

```bash
bun run dev
```

You should see:

```
🚀 Server running on http://localhost:3000
📊 Health check: http://localhost:3000/health
🌍 Environment: development
```

### Step 4: Test the API

**1. Health Check:**

```powershell
Invoke-RestMethod -Uri http://localhost:3000/health -Method Get
```

**2. Create a User:**

```powershell
$body = @{
    email = "test@example.com"
    name = "Test User"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3000/api/users -Method Post -Body $body -ContentType "application/json"
```

**3. Get All Users:**

```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/users -Method Get
```

**4. Get User by ID:**

```powershell
# Replace USER_ID with the ID from the create response
Invoke-RestMethod -Uri "http://localhost:3000/api/users/USER_ID" -Method Get
```

## Verify Docker PostgreSQL Connection

```bash
# Check if container is running
docker ps

# View logs
docker logs postgres-db

# Test connection (if psql is installed)
psql -h localhost -U postgres -d mydb
# Password: postgres
```

## What Changed for Different Environments?

### Docker PostgreSQL (Current - No Changes Needed)

- Connection string: `postgresql://postgres:postgres@localhost:5432/mydb`
- Port: `5432` (mapped from container)
- Everything works as-is!

### Direct PostgreSQL Installation

- **Only change:** Update `.env` file with your actual password
- Connection string: `postgresql://postgres:YOUR_PASSWORD@localhost:5432/mydb`
- **No code changes needed!**

### EC2 Instance

- **Only change:** Update `.env` file with EC2 IP and password
- Connection string: `postgresql://postgres:PASSWORD@EC2_IP:5432/mydb`
- **No code changes needed!**
- Make sure port 5432 is open in security group

## Troubleshooting

**Database connection error?**

1. Check Docker container: `docker ps`
2. Check `.env` file has correct `DATABASE_URL`
3. Verify port 5432 is not blocked

**Port 3000 already in use?**

- Change `PORT` in `.env` to another port (e.g., `3001`)

For more details, see [TESTING_GUIDE.md](./TESTING_GUIDE.md) and [README.md](./README.md).
