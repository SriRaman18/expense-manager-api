#!/bin/bash

# EC2 Deployment Script for Expense Manager API
# Run this script on your EC2 instance after uploading your project

set -e  # Exit on error

echo "🚀 Starting deployment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create .env file with your configuration"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
bun install || npm install

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
bun run db:generate || npm run db:generate

# Run migrations
echo "🗄️  Running database migrations..."
bun run db:migrate || npm run db:migrate

# Build the project
echo "🏗️  Building project..."
bun run build || npm run build

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📥 Installing PM2..."
    bun add -g pm2 || npm install -g pm2
fi

# Stop existing PM2 process if running
pm2 delete expense-manager-api 2>/dev/null || true

# Start application with PM2
echo "▶️  Starting application with PM2..."
pm2 start dist/index.js --name expense-manager-api

# Save PM2 configuration
pm2 save

echo "✅ Deployment complete!"
echo ""
echo "📊 Check status: pm2 status"
echo "📝 View logs: pm2 logs expense-manager-api"
echo "🔄 Restart: pm2 restart expense-manager-api"

