# Database Management Guide

## Quick Ways to Check Your Database

### Method 1: Prisma Studio (GUI - Easiest) ⭐ Recommended

Prisma Studio provides a visual interface to view and edit your database:

```bash
bun run db:studio
```

This opens a web interface at **http://localhost:5555** where you can:

- View all tables
- Browse data
- Add/edit/delete records
- See table schemas

### Method 2: Direct PostgreSQL Connection (Command Line)

Connect directly to PostgreSQL using Docker:

```bash
# Connect to PostgreSQL
docker exec -it expense-manager-db psql -U postgres -d expense_manager
```

Once connected, you can run SQL commands:

```sql
-- List all tables
\dt

-- Describe a specific table
\d users

-- View all data in users table
SELECT * FROM users;

-- Count records
SELECT COUNT(*) FROM users;

-- Exit
\q
```

### Method 3: One-Line SQL Commands

Run SQL commands without entering the interactive shell:

```bash
# List all tables
docker exec -it expense-manager-db psql -U postgres -d expense_manager -c "\dt"

# View users table structure
docker exec -it expense-manager-db psql -U postgres -d expense_manager -c "\d users"

# View all users
docker exec -it expense-manager-db psql -U postgres -d expense_manager -c "SELECT * FROM users;"

# Count users
docker exec -it expense-manager-db psql -U postgres -d expense_manager -c "SELECT COUNT(*) FROM users;"
```

### Method 4: Check Database Status

```bash
# Check if container is running
docker ps

# Check database logs
docker logs expense-manager-db

# Check database health
docker exec expense-manager-db pg_isready -U postgres
```

## Common SQL Queries

### View All Tables

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

### View Table Structure

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users';
```

### View All Data

```sql
SELECT * FROM users;
```

### Insert Test Data

```sql
INSERT INTO users (email, name)
VALUES ('test@example.com', 'Test User');
```

### Delete All Data (Careful!)

```sql
DELETE FROM users;
```

## Prisma Commands

### Check Database Status

```bash
# Validate Prisma schema
bunx prisma validate

# Check database connection
bunx prisma db pull

# View migrations
bunx prisma migrate status
```

## Troubleshooting

### Database Not Found

If you get "database does not exist":

```bash
# Create database (if needed)
docker exec -it expense-manager-db psql -U postgres -c "CREATE DATABASE expense_manager;"
```

### Connection Issues

```bash
# Restart database
docker-compose restart postgres

# Check if database is ready
docker exec expense-manager-db pg_isready -U postgres
```
