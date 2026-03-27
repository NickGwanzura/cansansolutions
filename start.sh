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

# Run DB migrations (Drizzle)
if [ -n "$DATABASE_URL" ]; then
    echo "[DB] Running Drizzle migrations..."
    npx drizzle-kit push --force || {
        echo "[DB] Migration may have issues, continuing..."
    }
else
    echo "[DB] Warning: DATABASE_URL not set"
fi

echo ""
echo "[Server] Starting Next.js server on port ${PORT:-3000}..."
echo "========================================"

exec node server.js
