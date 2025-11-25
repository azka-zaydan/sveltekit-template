#!/bin/bash
set -e

echo "🚀 Running database migrations..."

# Run migrations
npm run migrate:up

echo "✅ Migrations completed successfully"

# Run seeds (mandatory for deployment)
echo "🌱 Seeding database..."
npm run seed:up
echo "✅ Database seeded successfully"

echo "🎉 Database setup complete"
