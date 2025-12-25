# EC2 Deployment Guide

Complete guide to deploy Expense Manager API on AWS EC2 with PostgreSQL.

## Prerequisites

- AWS EC2 instance running (Ubuntu 22.04 LTS recommended)
- SSH access to your EC2 instance
- Security group configured to allow:
  - Port 22 (SSH)
  - Port 3000 (or your chosen port) for API
  - Port 5432 (PostgreSQL - restrict to your IP or internal only)

## Step 1: Connect to EC2 Instance

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

## Step 2: Update System and Install Dependencies

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl git build-essential

# Install Bun (recommended) or Node.js
# Option A: Install Bun
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Option B: Install Node.js (if not using Bun)
# curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
# sudo apt install -y nodejs

# Verify installation
bun --version
# or
node --version
```

## Step 3: Install and Configure PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Check status
sudo systemctl status postgresql
```

### Configure PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# Inside PostgreSQL prompt, run:
CREATE DATABASE expense_manager;
CREATE USER expense_user WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE expense_manager TO expense_user;
\q
```

### Configure PostgreSQL for Remote Access (Optional)

If you need remote access (not recommended for production):

```bash
# Edit postgresql.conf
sudo nano /etc/postgresql/16/main/postgresql.conf

# Find and change:
# listen_addresses = 'localhost'  →  listen_addresses = '*'

# Edit pg_hba.conf
sudo nano /etc/postgresql/16/main/pg_hba.conf

# Add at the end:
# host    all             all             0.0.0.0/0               md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

**Security Note:** Only enable remote access if necessary, and restrict it to specific IPs in your security group.

## Step 4: Clone/Upload Your Project

### Option A: Using Git (Recommended)

```bash
# Navigate to home directory
cd ~

# Clone your repository
git clone https://github.com/your-username/expense-manager-api.git
cd expense-manager-api
```

### Option B: Upload Files via SCP

From your local machine:

```bash
# Upload entire project
scp -i your-key.pem -r expense-manager-api ubuntu@your-ec2-ip:~/

# SSH into EC2
ssh -i your-key.pem ubuntu@your-ec2-ip
cd expense-manager-api
```

## Step 5: Install Project Dependencies

```bash
# Install dependencies
bun install
# or
npm install

# Install Prisma CLI globally (if needed)
bun add -g prisma
# or
npm install -g prisma
```

## Step 6: Configure Environment Variables

```bash
# Create .env file
nano .env
```

Add the following (update with your actual values):

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database Configuration
DATABASE_URL="postgresql://expense_user:your_secure_password_here@localhost:5432/expense_manager?schema=public"

# JWT Secret (generate a secure random string)
JWT_SECRET=your-very-secure-random-secret-key-here
```

**Generate a secure JWT secret:**

```bash
openssl rand -base64 32
```

Save and exit (Ctrl+X, then Y, then Enter).

## Step 7: Set Up Database

```bash
# Generate Prisma Client
bun run db:generate
# or
npm run db:generate

# Run migrations (recommended for production)
bun run db:migrate
# or
npm run db:migrate

# OR push schema (for quick setup, not recommended for production)
# bun run db:push
```

## Step 8: Build the Project

```bash
# Build TypeScript to JavaScript
bun run build
# or
npm run build
```

## Step 9: Test the Application

```bash
# Run the application
bun run start
# or
npm start

# Test in another terminal
curl http://localhost:3000/health
```

If it works, stop the server (Ctrl+C).

## Step 10: Set Up Process Manager (PM2)

PM2 keeps your application running and restarts it if it crashes.

```bash
# Install PM2 globally
bun add -g pm2
# or
npm install -g pm2

# Start application with PM2
pm2 start dist/index.js --name expense-manager-api

# Save PM2 configuration
pm2 save

# Set up PM2 to start on system boot
pm2 startup
# Follow the instructions it provides (usually run a sudo command)

# Check status
pm2 status

# View logs
pm2 logs expense-manager-api

# Other useful PM2 commands:
# pm2 restart expense-manager-api
# pm2 stop expense-manager-api
# pm2 delete expense-manager-api
```

## Step 11: Configure Firewall (UFW)

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow your API port
sudo ufw allow 3000/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## Step 12: Set Up Nginx Reverse Proxy (Optional but Recommended)

Nginx can handle SSL, load balancing, and act as a reverse proxy.

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/expense-manager-api
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # or your EC2 IP

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

Enable the site:

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/expense-manager-api /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## Step 13: Set Up SSL with Let's Encrypt (Optional)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Certbot will automatically configure Nginx and renew certificates
```

## Step 14: Verify Deployment

```bash
# Check if application is running
pm2 status

# Check application logs
pm2 logs expense-manager-api

# Test API endpoint
curl http://localhost:3000/health
curl http://your-ec2-ip:3000/health
# or if using Nginx
curl http://your-domain.com/health
```

## Step 15: Update Security Group

In AWS Console:

1. Go to EC2 → Security Groups
2. Select your instance's security group
3. Add inbound rules:
   - Type: Custom TCP, Port: 3000, Source: 0.0.0.0/0 (or restrict to specific IPs)
   - Type: HTTP, Port: 80, Source: 0.0.0.0/0 (if using Nginx)
   - Type: HTTPS, Port: 443, Source: 0.0.0.0/0 (if using SSL)

## Troubleshooting

### Application won't start

```bash
# Check PM2 logs
pm2 logs expense-manager-api

# Check if port is in use
sudo lsof -i :3000

# Check database connection
psql -U expense_user -d expense_manager -h localhost
```

### Database connection errors

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-16-main.log

# Test connection
psql -U expense_user -d expense_manager -h localhost
```

### Permission issues

```bash
# Check file permissions
ls -la

# Fix ownership if needed
sudo chown -R ubuntu:ubuntu ~/expense-manager-api
```

## Updating the Application

```bash
# Pull latest changes (if using Git)
cd ~/expense-manager-api
git pull

# Install new dependencies
bun install

# Run migrations if schema changed
bun run db:migrate

# Rebuild
bun run build

# Restart application
pm2 restart expense-manager-api
```

## Monitoring

```bash
# View real-time logs
pm2 logs expense-manager-api

# Monitor resources
pm2 monit

# View system resources
htop
# or
top
```

## Backup Database

```bash
# Create backup
sudo -u postgres pg_dump expense_manager > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
sudo -u postgres psql expense_manager < backup_file.sql
```

## Quick Reference Commands

```bash
# Application
pm2 start dist/index.js --name expense-manager-api
pm2 restart expense-manager-api
pm2 stop expense-manager-api
pm2 logs expense-manager-api
pm2 status

# Database
sudo systemctl status postgresql
sudo systemctl restart postgresql
psql -U expense_user -d expense_manager

# Nginx
sudo systemctl status nginx
sudo systemctl restart nginx
sudo nginx -t

# Firewall
sudo ufw status
sudo ufw allow 3000/tcp
```

## Environment-Specific Differences

### From Local Docker Setup to EC2

| Setting       | Local (Docker)   | EC2                       |
| ------------- | ---------------- | ------------------------- |
| Database Host | `localhost`      | `localhost` (same server) |
| Database Port | `5432`           | `5432`                    |
| Database User | `postgres`       | `expense_user` (custom)   |
| Database Name | `mydb`           | `expense_manager`         |
| Connection    | Docker container | Direct PostgreSQL install |
| Environment   | `development`    | `production`              |

### Key Changes in `.env`:

```env
# Local Docker
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mydb"

# EC2
DATABASE_URL="postgresql://expense_user:secure_password@localhost:5432/expense_manager?schema=public"
NODE_ENV=production
```

## Security Best Practices

1. ✅ Use strong passwords for database
2. ✅ Restrict security group to specific IPs
3. ✅ Use SSL/HTTPS in production
4. ✅ Keep system and packages updated
5. ✅ Use environment variables for secrets
6. ✅ Don't commit `.env` file
7. ✅ Use firewall (UFW)
8. ✅ Regular database backups
9. ✅ Monitor logs for suspicious activity
10. ✅ Use PM2 for process management
