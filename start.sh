#!/bin/sh
set -e

echo "========================================"
echo "Starting Cansan Solutions"
echo "========================================"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: ${PORT:-3000}"

# Seed products.json from image if volume is empty
# The image has the correct data at /app/data.seed/products.json
# The volume mounts at /app/data (shadowing image data)
mkdir -p /app/data
if [ ! -s /app/data/products.json ] || [ "$(wc -c < /app/data/products.json | tr -d ' ')" -lt 10 ]; then
  echo "[Setup] Volume products.json is empty, seeding from image..."
  cp /app/data.seed/products.json /app/data/products.json
  echo "[Setup] Seeded $(cat /app/data/products.json | grep -c '"id"') products"
else
  echo "[Setup] Volume products.json exists ($(cat /app/data/products.json | grep -c '"id"') products), preserving"
fi

# Ensure upload directories exist
mkdir -p /app/uploads/products
echo "[Setup] Directories ready"
echo ""

echo "[Server] Starting..."
echo "========================================"

exec node server.js
