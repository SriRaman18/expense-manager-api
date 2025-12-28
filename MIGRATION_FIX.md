# Fixing Prisma Migration Drift

## The Problem

You're getting "Drift detected" because:

- Your database already has tables (from `db:push`)
- But there are no migration files yet
- Prisma can't sync migration history with the database

## Solutions

### Solution 1: Reset and Create Initial Migration (No Important Data)

If your database is empty or you don't mind losing data:

```bash
# Type 'y' when prompted, or run:
bun run db:migrate --name init
```

This will:

- Reset the database
- Create `prisma/migrations/` folder
- Create initial migration file
- Apply the migration

### Solution 2: Use db:push Instead (No Migrations)

If you don't need migration history for now:

```bash
# Cancel the current command (Ctrl+C)
# Then use:
bun run db:push
```

This keeps your current database and syncs the schema without creating migration files.

**Note:** For production/EC2, you should use migrations. But for local development, `db:push` is fine.

### Solution 3: Create Baseline Migration (Keep Data)

If you want to keep your data AND start using migrations:

```bash
# 1. Cancel current command (Ctrl+C)

# 2. Mark the current database state as the baseline
bunx prisma migrate resolve --applied init

# 3. Create a migration that matches current state
bunx prisma migrate dev --create-only --name init

# 4. Mark it as applied (since database already has these tables)
bunx prisma migrate resolve --applied init
```

This is more complex but preserves your data.

## Recommendation

**For Local Development:**

- Use **Solution 2** (`db:push`) - simpler and faster
- You can switch to migrations later

**For Production/EC2:**

- Use **Solution 1** (reset and create migration) - proper migration history
- Or use **Solution 3** if you have important data

## After Fixing

Once you have migrations set up, always use:

```bash
bun run db:migrate  # Creates and applies migrations
```

Instead of:

```bash
bun run db:push  # Only for quick prototyping
```
