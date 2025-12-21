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

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start PostgreSQL Database

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

### Root

```
GET /
```

Returns API information.

## Project Structure

```
expense-manager-api/
├── src/
│   └── index.ts          # Main application entry
├── prisma/
│   └── schema.prisma     # Database schema
├── dist/                 # Compiled output (generated)
├── docker-compose.yml    # Local PostgreSQL setup
├── Dockerfile            # Production Docker image
├── ecosystem.config.js   # PM2 configuration
└── package.json
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Development

### Adding New Models

1. Update `prisma/schema.prisma`
2. Run `bun run db:push` or `bun run db:migrate`
3. Use Prisma Client in your code

### Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `DATABASE_URL` - PostgreSQL connection string

## License

ISC
