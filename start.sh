#!/bin/sh
set -e

echo "========================================"
echo "Starting Cansan Solutions"
echo "========================================"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: ${PORT:-3000}"

# Seed products.json from image if volume is empty or corrupted
# The image stores a seed copy at /app/data.seed/products.json
# The volume mounts at /app/data (shadowing the image's COPY)
if [ -f /app/data.seed/products.json ]; then
  if [ ! -s /app/data/products.json ]; then
    echo "[Setup] Volume products.json is empty, seeding from image..."
    cp /app/data.seed/products.json /app/data/products.json
    echo "[Setup] Seeded products from image"
  else
    EXISTING=$(wc -c < /app/data/products.json | tr -d ' ')
    if [ "$EXISTING" -lt 10 ]; then
      echo "[Setup] Volume products.json is nearly empty (${EXISTING} bytes), seeding from image..."
      cp /app/data.seed/products.json /app/data/products.json
      echo "[Setup] Seeded products from image"
    else
      echo "[Setup] Volume products.json exists (${EXISTING} bytes), preserving"
    fi
  fi
else
  echo "[Setup] No seed file found at /app/data.seed/products.json"
fi

# Ensure upload directories exist
mkdir -p /app/uploads/products
echo "[Setup] Directories ready"
echo ""

echo "[Server] Starting..."
echo "========================================"

exec node server.js
