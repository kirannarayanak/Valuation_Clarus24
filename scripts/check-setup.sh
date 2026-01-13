#!/bin/bash

echo "=== ABM Valuation Setup Check ==="
echo ""

# Check Node.js
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    echo "✓ Node.js installed: $NODE_VERSION"
else
    echo "✗ Node.js not installed"
    echo "  Please install Node.js first. See INSTALL_NODE.md for instructions."
    exit 1
fi

# Check npm
if command -v npm >/dev/null 2>&1; then
    NPM_VERSION=$(npm --version)
    echo "✓ npm installed: $NPM_VERSION"
else
    echo "✗ npm not installed"
    exit 1
fi

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "✓ Dependencies installed"
else
    echo "⚠ Dependencies not installed. Run: npm install"
fi

# Check for .env file
if [ -f ".env" ]; then
    echo "✓ .env file exists"
else
    echo "⚠ .env file not found. Copy .env.example to .env and configure it."
fi

# Check for Prisma client
if [ -d "node_modules/.prisma/client" ]; then
    echo "✓ Prisma client generated"
else
    echo "⚠ Prisma client not generated. Run: npx prisma generate"
fi

echo ""
echo "=== Setup Status ==="
echo ""
echo "To start the application:"
echo "  1. Install Node.js (if not done): See INSTALL_NODE.md"
echo "  2. Install dependencies: npm install"
echo "  3. Set up .env file with your configuration"
echo "  4. Generate Prisma client: npx prisma generate"
echo "  5. Push database schema: npx prisma db push"
echo "  6. Start dev server: npm run dev"
echo ""
