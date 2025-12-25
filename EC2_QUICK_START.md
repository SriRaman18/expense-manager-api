# EC2 Quick Start Guide

Quick reference for deploying to EC2. For detailed instructions, see [EC2_DEPLOYMENT.md](./EC2_DEPLOYMENT.md).

## Prerequisites Checklist

- [ ] EC2 instance running (Ubuntu 22.04)
- [ ] Security group allows: SSH (22), API (3000), HTTP (80), HTTPS (443)
- [ ] SSH access configured

## Step-by-Step (TL;DR)

### 1. Connect to EC2

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### 2. Install Dependencies

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential postgresql postgresql-contrib
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
```

### 3. Setup PostgreSQL

```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
```

In PostgreSQL prompt:

```sql
CREATE DATABASE expense_manager;
CREATE USER expense_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE expense_manager TO expense_user;
\q
```

### 4. Upload Project

```bash
# Option A: Git
git clone https://github.com/your-username/expense-manager-api.git
cd expense-manager-api

# Option B: SCP (from local machine)
# scp -i your-key.pem -r expense-manager-api ubuntu@your-ec2-ip:~/
```

### 5. Configure Environment

```bash
nano .env
```

Add:

```env
PORT=3000
NODE_ENV=production
DATABASE_URL="postgresql://expense_user:your_secure_password@localhost:5432/expense_manager?schema=public"
JWT_SECRET=$(openssl rand -base64 32)
```

### 6. Deploy

```bash
# Install dependencies
bun install

# Setup database
bun run db:generate
bun run db:migrate

# Build
bun run build

# Install PM2
bun add -g pm2

# Start with PM2
pm2 start dist/index.js --name expense-manager-api
pm2 save
pm2 startup  # Follow instructions
```

### 7. Configure Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 3000/tcp
sudo ufw enable
```

### 8. Test

```bash
curl http://localhost:3000/health
curl http://your-ec2-ip:3000/health
```

## Key Configuration Changes

### `.env` File Differences

**Local (Docker):**

```env
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mydb"
```

**EC2 (Production):**

```env
NODE_ENV=production
DATABASE_URL="postgresql://expense_user:secure_password@localhost:5432/expense_manager?schema=public"
```

### Database Setup Differences

| Item          | Local      | EC2                  |
| ------------- | ---------- | -------------------- |
| Installation  | Docker     | Direct install       |
| Database Name | `mydb`     | `expense_manager`    |
| User          | `postgres` | `expense_user`       |
| Password      | `postgres` | Your secure password |
| Connection    | Container  | Local service        |

## Common Commands

```bash
# Application
pm2 status
pm2 logs expense-manager-api
pm2 restart expense-manager-api
pm2 stop expense-manager-api

# Database
sudo systemctl status postgresql
sudo systemctl restart postgresql
psql -U expense_user -d expense_manager

# Logs
pm2 logs expense-manager-api
tail -f /var/log/postgresql/postgresql-16-main.log
```

## Troubleshooting

### Can't connect to database

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U expense_user -d expense_manager -h localhost
```

### Application won't start

```bash
# Check logs
pm2 logs expense-manager-api

# Check if port is in use
sudo lsof -i :3000
```

### Update application

```bash
cd ~/expense-manager-api
git pull  # or upload new files
bun install
bun run db:migrate  # if schema changed
bun run build
pm2 restart expense-manager-api
```

## Next Steps

- [ ] Set up Nginx reverse proxy (optional)
- [ ] Configure SSL with Let's Encrypt (optional)
- [ ] Set up database backups
- [ ] Configure monitoring
- [ ] Update security group to restrict access

For detailed instructions, see [EC2_DEPLOYMENT.md](./EC2_DEPLOYMENT.md).
