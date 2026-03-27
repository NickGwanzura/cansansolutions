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
mkdir -p "/app/data"
mkdir -p "/app/public/images/products"
ls -la "$UPLOAD_DIR" || echo "[Setup] Upload dir not accessible yet"
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
