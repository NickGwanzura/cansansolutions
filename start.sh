#!/bin/sh
set -e

echo "========================================"
echo "Starting Cansan Solutions"
echo "========================================"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "Has DATABASE_URL: $(if [ -n "$DATABASE_URL" ]; then echo 'YES'; else echo 'NO'; fi)"
echo ""

# Try to run DB push, but don't fail if it errors
if [ -n "$DATABASE_URL" ]; then
    echo "Attempting database push..."
    npx prisma db push --accept-data-loss 2>/dev/null || echo "Warning: Database push failed or skipped"
else
    echo "Warning: DATABASE_URL not set, skipping database push"
fi

echo ""
echo "Starting Next.js server..."
echo "========================================"

exec node server.js
