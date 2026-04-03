#!/bin/sh
set -e

echo "========================================"
echo "Starting Next.js Server"
echo "========================================"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: ${PORT:-3000}"

echo "[Server] Starting..."
exec node server.js
