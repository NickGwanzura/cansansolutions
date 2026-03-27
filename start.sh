#!/bin/sh
set -e

echo "========================================"
echo "Starting Cansan Solutions"
echo "========================================"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: ${PORT:-3000}"
echo "DATABASE_URL set: $(if [ -n "$DATABASE_URL" ]; then echo 'YES'; else echo 'NO'; fi)"
echo ""

# Ensure upload directories exist
mkdir -p /app/uploads/products
echo "[Setup] Directories ready"
echo ""

echo "[Server] Starting..."
echo "========================================"

exec node server.js
