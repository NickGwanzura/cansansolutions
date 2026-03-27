#!/bin/sh
set -e

echo "========================================"
echo "Starting Cansan Solutions"
echo "========================================"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: ${PORT:-3000}"
echo "Has DATABASE_URL: $(if [ -n "$DATABASE_URL" ]; then echo 'YES'; else echo 'NO'; fi)"
echo ""

# Ensure upload directories exist (for runtime uploads)
mkdir -p /app/uploads/products
echo "[Setup] Uploads directory ready"
echo ""

echo "[Server] Starting on port ${PORT:-3000}..."
echo "========================================"

exec node server.js
