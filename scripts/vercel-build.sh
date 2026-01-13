#!/bin/bash
# Vercel build script with Prisma migrations

set -e

echo "🔨 Building application..."

# Generate Prisma client (always needed)
echo "📦 Generating Prisma client..."
npx prisma generate

# Run migrations if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
  echo "🗄️  Running database migrations..."
  npx prisma migrate deploy || echo "⚠️  Migration failed, continuing build..."
else
  echo "⚠️  DATABASE_URL not set - skipping migrations"
  echo "   Make sure to set DATABASE_URL in Vercel environment variables"
fi

# Build Next.js app
echo "🏗️  Building Next.js application..."
next build

echo "✅ Build complete!"
