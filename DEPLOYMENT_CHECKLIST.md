# EC2 Deployment Checklist

Use this checklist to ensure a smooth deployment.

## Pre-Deployment

- [ ] EC2 instance created and running
- [ ] Security group configured (SSH, API port, HTTP/HTTPS)
- [ ] SSH key pair ready
- [ ] Domain name configured (optional)

## Server Setup

- [ ] Connected to EC2 via SSH
- [ ] System packages updated (`sudo apt update && sudo apt upgrade`)
- [ ] Bun or Node.js installed
- [ ] Git installed (if using Git)

## PostgreSQL Setup

- [ ] PostgreSQL installed
- [ ] PostgreSQL service running
- [ ] Database created (`expense_manager`)
- [ ] Database user created (`expense_user`)
- [ ] User permissions granted
- [ ] Database connection tested

## Application Setup

- [ ] Project files uploaded/cloned to EC2
- [ ] Dependencies installed (`bun install` or `npm install`)
- [ ] `.env` file created with correct values
- [ ] Database URL configured correctly
- [ ] JWT secret generated (if using)
- [ ] Prisma Client generated (`bun run db:generate`)
- [ ] Database migrations run (`bun run db:migrate`)
- [ ] Application built (`bun run build`)

## Testing

- [ ] Application starts successfully
- [ ] Health check endpoint works (`/health`)
- [ ] API endpoints respond correctly
- [ ] Database operations work (create/get users)

## Production Setup

- [ ] PM2 installed and configured
- [ ] Application running with PM2
- [ ] PM2 startup script configured
- [ ] Firewall (UFW) configured
- [ ] Nginx installed (optional)
- [ ] Nginx configured as reverse proxy (optional)
- [ ] SSL certificate installed (optional)
- [ ] Security group rules updated

## Post-Deployment

- [ ] Application accessible from outside
- [ ] All endpoints tested
- [ ] Logs monitored
- [ ] Database backup scheduled
- [ ] Monitoring set up (optional)

## Environment Variables Checklist

Verify your `.env` file has:

- [ ] `PORT=3000` (or your chosen port)
- [ ] `NODE_ENV=production`
- [ ] `DATABASE_URL` with correct credentials
- [ ] `JWT_SECRET` (if using authentication)

## Quick Test Commands

```bash
# Test database connection
psql -U expense_user -d expense_manager -h localhost

# Test application
curl http://localhost:3000/health

# Check PM2 status
pm2 status

# View logs
pm2 logs expense-manager-api
```
