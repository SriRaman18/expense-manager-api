# Expense Manager API

A modern REST API built with Express, TypeScript, PostgreSQL, and Prisma.

## Tech Stack

- **Runtime**: Bun
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Containerization**: Docker

## Prerequisites

- [Bun](https://bun.sh/) installed
- Docker and Docker Compose (for local database)

## Getting Started

### 1. Clone and Install

```bash
bun install
```

### 2. Setup Environment

Create a `.env` file in the root directory:

```bash
# For Docker PostgreSQL (recommended for local development)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mydb"
PORT=3000
NODE_ENV=development
```

### 3. Start PostgreSQL Database

#### Option A: Using Docker (Recommended)

If you've already set up PostgreSQL in Docker:

```bash
# Check if container is running
docker ps

# If not running, start it
docker start postgres-db

# Or if you need to create it:
docker run -d ^
  --name postgres-db ^
  -e POSTGRES_USER=postgres ^
  -e POSTGRES_PASSWORD=postgres ^
  -e POSTGRES_DB=mydb ^
  -p 5432:5432 ^
  -v pgdata:/var/lib/postgresql/data ^
  postgres:16
```

#### Option B: Using Docker Compose

```bash
docker-compose up -d
```

### 4. Setup Database

```bash
# Generate Prisma Client
bun run db:generate

# Push schema to database
bun run db:push
```

### 5. Run Development Server

```bash
bun run dev
```

The API will be available at `http://localhost:3000`

## Database Connection Configuration

### For Docker PostgreSQL (Current Setup)

Your Docker PostgreSQL is configured with:

- **Host:** `localhost`
- **Port:** `5432`
- **User:** `postgres`
- **Password:** `postgres`
- **Database:** `mydb`

**Connection String:**

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mydb"
```

**To verify connection:**

```bash
# Check if container is running
docker ps

# View container logs
docker logs postgres-db

# Connect using psql (if installed)
psql -h localhost -U postgres -d mydb
# Password: postgres
```

### For Direct PostgreSQL Installation

If PostgreSQL is installed directly on your system:

1. **Update `.env` file:**

   ```env
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/mydb"
   ```

   Replace `your_password` with your actual PostgreSQL password.

2. **Ensure PostgreSQL service is running:**

   ```bash
   # Windows (PowerShell as Admin)
   Get-Service postgresql*

   # Or start manually
   net start postgresql-x64-16
   ```

3. **Create database if it doesn't exist:**

   ```bash
   psql -U postgres
   CREATE DATABASE mydb;
   \q
   ```

4. **No other code changes needed** - The connection string format is the same!

### For EC2 Instance

When deploying to EC2, you need to:

1. **Update `.env` file:**

   ```env
   DATABASE_URL="postgresql://postgres:your_secure_password@your_ec2_ip:5432/mydb"
   ```

   Replace:

   - `your_secure_password` with a strong password
   - `your_ec2_ip` with your EC2 instance's public or private IP

2. **Security Group Configuration:**

   - Open port `5432` in your EC2 security group
   - Restrict access to specific IPs if possible (for production)

3. **PostgreSQL Configuration on EC2:**

   ```bash
   # Edit postgresql.conf
   sudo nano /etc/postgresql/16/main/postgresql.conf
   # Set: listen_addresses = '*'

   # Edit pg_hba.conf
   sudo nano /etc/postgresql/16/main/pg_hba.conf
   # Add: host all all 0.0.0.0/0 md5

   # Restart PostgreSQL
   sudo systemctl restart postgresql
   ```

4. **Firewall Configuration:**

   ```bash
   # Allow PostgreSQL port
   sudo ufw allow 5432/tcp
   ```

5. **No code changes needed** - Only the connection string changes!

### Connection String Format

The connection string format is always:

```
postgresql://[user]:[password]@[host]:[port]/[database]
```

- **Docker:** `postgresql://postgres:postgres@localhost:5432/mydb`
- **Local Install:** `postgresql://postgres:your_password@localhost:5432/mydb`
- **EC2:** `postgresql://postgres:password@ec2-ip:5432/mydb`

## Available Scripts

- `bun run dev` - Start development server with hot reload
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run db:generate` - Generate Prisma Client
- `bun run db:push` - Push schema changes to database
- `bun run db:migrate` - Run database migrations
- `bun run db:studio` - Open Prisma Studio

## API Endpoints

### Health Check

```
GET /health
```

Returns server and database health status.

**Example Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 123.456,
  "database": "connected",
  "environment": "development"
}
```

### Root

```
GET /
```

Returns API information and available endpoints.

### User Management

#### Create User

```
POST /api/users
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "User Name"  // optional
}
```

#### Get All Users

```
GET /api/users
```

#### Get User by ID

```
GET /api/users/:id
```

For detailed testing instructions, see [TESTING_GUIDE.md](./TESTING_GUIDE.md).

## Project Structure

This project follows the **MVC (Model-View-Controller)** pattern. See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed architecture documentation.

```
expense-manager-api/
├── src/
│   ├── config/              # Configuration files
│   │   └── database.ts      # Prisma client instance
│   ├── controllers/         # Request handlers (Controller layer)
│   │   ├── health.controller.ts
│   │   └── user.controller.ts
│   ├── services/            # Business logic (Service layer)
│   │   └── user.service.ts
│   ├── routes/              # Route definitions
│   │   ├── index.routes.ts
│   │   ├── health.routes.ts
│   │   └── user.routes.ts
│   ├── middleware/          # Custom middleware
│   │   ├── errorHandler.middleware.ts
│   │   └── asyncHandler.middleware.ts
│   ├── types/               # TypeScript types and interfaces
│   │   ├── user.types.ts
│   │   └── error.types.ts
│   ├── app.ts               # Express app configuration
│   └── index.ts             # Application entry point
├── prisma/
│   └── schema.prisma        # Database schema (Model layer)
├── dist/                    # Compiled output (generated)
└── package.json
```

### Architecture Layers

- **Routes**: Define API endpoints and map to controllers
- **Controllers**: Handle HTTP requests/responses, call services
- **Services**: Contain business logic and database operations
- **Models**: Database schema (Prisma)
- **Types**: TypeScript interfaces and DTOs
- **Middleware**: Error handling and request processing

## Deployment

### EC2 Deployment

For complete EC2 deployment instructions with PostgreSQL setup, see:

- **[EC2_DEPLOYMENT.md](./EC2_DEPLOYMENT.md)** - Complete step-by-step guide
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Deployment checklist

### Quick Deploy Script

After setting up PostgreSQL and creating `.env` file on EC2:

```bash
chmod +x deploy.sh
./deploy.sh
```

### Key Differences: Local vs EC2

| Setting         | Local (Docker)   | EC2                       |
| --------------- | ---------------- | ------------------------- |
| Database        | Docker container | Direct PostgreSQL install |
| Database Name   | `mydb`           | `expense_manager`         |
| Database User   | `postgres`       | `expense_user` (custom)   |
| Environment     | `development`    | `production`              |
| Process Manager | Manual           | PM2                       |

## Development

### Adding New Models

1. Update `prisma/schema.prisma`
2. Run `bun run db:push` or `bun run db:migrate`
3. Use Prisma Client in your code

### Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `DATABASE_URL` - PostgreSQL connection string

**Important:** Never commit your `.env` file to version control. The `.env.example` file shows the required variables without sensitive data.

## License

ISC
