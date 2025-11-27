#!/bin/bash
set -e

echo "🚀 Running database migrations..."

# Run migrations
npm run migrate:up

echo "✅ Migrations completed successfully"

# Run seeds (optional - comment out if you don't want demo data in production)
echo "🌱 Seeding database..."
npm run seed:up
echo "✅ Database seeded successfully"

echo "🎉 Database setup complete"
