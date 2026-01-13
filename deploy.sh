#!/bin/bash
# Deployment Script for Hostinger VPS
# 
# Usage: ./deploy.sh

set -e

echo "🚀 Starting deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo "Please create .env file with required variables."
    exit 1
fi

echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

echo -e "${YELLOW}🔨 Building application...${NC}"
npm run build

echo -e "${YELLOW}🗄️  Generating Prisma client...${NC}"
npx prisma generate

echo -e "${YELLOW}📊 Running database migrations...${NC}"
npx prisma migrate deploy

echo -e "${YELLOW}🔄 Restarting application...${NC}"
pm2 restart abm-valuation || pm2 start ecosystem.config.js

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Check application status: pm2 status"
echo "View logs: pm2 logs abm-valuation"
