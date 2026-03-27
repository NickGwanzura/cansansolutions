#!/bin/sh
set -e

echo "========================================"
echo "Starting Cansan Solutions"
echo "========================================"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: ${PORT:-3000}"
echo "Has DATABASE_URL: $(if [ -n "$DATABASE_URL" ]; then echo 'YES'; else echo 'NO'; fi)"
echo ""

# Ensure upload directories exist
UPLOAD_DIR="/app/public/images/products"
echo "[Setup] Creating upload directories..."
mkdir -p "$UPLOAD_DIR"
ls -la "$UPLOAD_DIR" 2>/dev/null || echo "[Setup] Upload dir ready"
echo ""

# Run DB push and seed
if [ -n "$DATABASE_URL" ]; then
    echo "[DB] Running database push..."
    npx prisma db push --accept-data-loss --skip-generate || {
        echo "[DB] Push failed, attempting reset..."
        npx prisma db push --force-reset --accept-data-loss --skip-generate || true
    }
    
    echo "[DB] Seeding database..."
    npx prisma db seed || echo "[DB] Seed completed or skipped"
else
    echo "[DB] Warning: DATABASE_URL not set"
fi

echo ""
echo "[Server] Starting Next.js server on port ${PORT:-3000}..."
echo "========================================"

exec node server.js
