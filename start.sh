#!/bin/sh
set -e

echo "========================================"
echo "Starting Cansan Solutions"
echo "========================================"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: ${PORT:-3000}"
echo "UPLOAD_DIR: ${UPLOAD_DIR:-/app/public/images/products}"
echo "Has DATABASE_URL: $(if [ -n "$DATABASE_URL" ]; then echo 'YES'; else echo 'NO'; fi)"
echo ""

# Ensure upload directories exist and are writable
UPLOAD_DIR="${UPLOAD_DIR:-/app/public/images/products}"
echo "[Setup] Creating upload directories..."
mkdir -p "$UPLOAD_DIR"
mkdir -p "/app/public/images/products"
ls -la "$UPLOAD_DIR" 2>/dev/null || echo "[Setup] Upload dir check complete"
echo ""

# Initialize data directory if empty (volume mount overwrites copied data)
if [ ! -f "/app/data/products.json" ]; then
    echo "[Data] Initializing products.json..."
    mkdir -p /app/data
    echo '[]' > /app/data/products.json
    chown nextjs:nodejs /app/data/products.json
    echo "[Data] Created empty products.json"
else
    echo "[Data] products.json exists"
fi
echo ""

# Try to run DB push, but don't fail if it errors
if [ -n "$DATABASE_URL" ]; then
    echo "[DB] Attempting database push..."
    npx prisma db push --accept-data-loss 2>/dev/null || echo "[DB] Warning: Database push failed or skipped"
else
    echo "[DB] Warning: DATABASE_URL not set, skipping database push"
fi

echo ""
echo "[Server] Starting Next.js server on port ${PORT:-3000}..."
echo "========================================"

exec node server.js
