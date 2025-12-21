# Deployment Guide

## Prerequisites

1. **Server Access**: You have SSH access to your server using a `.pem` file
2. **Server Requirements**:
   - Ubuntu/Debian Linux (recommended)
   - Docker and Docker Compose installed
   - Bun installed (or we'll install it)

## Step 1: Prepare Your Local Project

1. **Build the project**:

   ```bash
   bun install
   bun run db:generate
   bun run build
   ```

2. **Test locally**:

   ```bash
   # Start PostgreSQL with Docker
   docker-compose up -d

   # Run migrations
   bun run db:push

   # Start the server
   bun run dev
   ```

## Step 2: Transfer Files to Server

### Option A: Using SCP with .pem file

```bash
# From your local machine, navigate to project root
# Replace with your actual values:
# - your-server-ip: Your server's IP address or domain
# - ubuntu: Your server username (usually 'ubuntu' for AWS EC2)
# - /path/to/your-key.pem: Path to your .pem file
# - /home/ubuntu/expense-manager-api: Destination path on server

# Create a tarball (excludes node_modules, .env, etc.)
tar --exclude='node_modules' \
    --exclude='.git' \
    --exclude='dist' \
    --exclude='.env' \
    --exclude='*.db' \
    -czf expense-manager-api.tar.gz .

# Transfer to server
scp -i /path/to/your-key.pem expense-manager-api.tar.gz ubuntu@your-server-ip:/home/ubuntu/

# SSH into server
ssh -i /path/to/your-key.pem ubuntu@your-server-ip

# On server: Extract and set up
cd /home/ubuntu
tar -xzf expense-manager-api.tar.gz -C expense-manager-api
cd expense-manager-api
```

### Option B: Using Git (Recommended)

```bash
# On server
ssh -i /path/to/your-key.pem ubuntu@your-server-ip

# Clone your repository
git clone <your-repo-url> expense-manager-api
cd expense-manager-api
```

## Step 3: Server Setup

### Install Bun (if not installed)

```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc  # or restart terminal
bun --version
```

### Install Docker and Docker Compose

```bash
# Update package index
sudo apt-get update

# Install Docker
sudo apt-get install -y docker.io docker-compose

# Add your user to docker group (to run without sudo)
sudo usermod -aG docker $USER
newgrp docker  # or logout/login
```

## Step 4: Configure Environment

```bash
# On server, create .env file
cd /home/ubuntu/expense-manager-api
nano .env
```

Add your production environment variables:

```env
PORT=3000
NODE_ENV=production
DATABASE_URL="postgresql://postgres:your-secure-password@postgres:5432/expense_manager?schema=public"
```

**Important**: For Docker Compose, use `postgres` as hostname (service name), not `localhost`.

## Step 5: Update docker-compose.yml for Production

Create `docker-compose.prod.yml`:

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:16-alpine
    container_name: expense-manager-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
      POSTGRES_DB: expense_manager
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: expense-manager-api
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD:-postgres}@postgres:5432/expense_manager?schema=public
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - app-network

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

## Step 6: Create Dockerfile

```dockerfile
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma Client
RUN bunx prisma generate

# Build the application
RUN bun run build

# Production stage
FROM oven/bun:1
WORKDIR /app

# Copy built files and dependencies
COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/package.json ./

EXPOSE 3000

CMD ["bun", "run", "dist/index.js"]
```

## Step 7: Deploy

```bash
# On server
cd /home/ubuntu/expense-manager-api

# Start PostgreSQL
docker-compose up -d postgres

# Wait for DB to be ready (30 seconds)
sleep 30

# Run migrations
bun run db:push

# Build and start with Docker Compose
docker-compose -f docker-compose.prod.yml up -d --build

# Or run directly with Bun (without Docker for API)
bun install
bun run db:generate
bun run build
bun run start
```

## Step 8: Use PM2 for Process Management (Recommended)

```bash
# Install PM2 globally
bun add -g pm2

# Create ecosystem file: ecosystem.config.js
```

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: "expense-manager-api",
      script: "dist/index.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
    },
  ],
};
```

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions it provides
```

## Step 9: Setup Nginx Reverse Proxy (Optional but Recommended)

```bash
sudo apt-get install -y nginx
```

Create `/etc/nginx/sites-available/expense-manager-api`:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # or your server IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/expense-manager-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 10: Setup SSL with Let's Encrypt (Optional)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Monitoring

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs expense-manager-api

# Monitor
pm2 monit

# Check Docker containers
docker ps
docker-compose ps

# Check database
docker exec -it expense-manager-db psql -U postgres -d expense_manager
```

## Quick Commands Reference

```bash
# Restart API
pm2 restart expense-manager-api

# View logs
pm2 logs expense-manager-api --lines 100

# Update and redeploy
git pull
bun install
bun run db:generate
bun run build
pm2 restart expense-manager-api

# Database backup
docker exec expense-manager-db pg_dump -U postgres expense_manager > backup.sql

# Database restore
docker exec -i expense-manager-db psql -U postgres expense_manager < backup.sql
```
