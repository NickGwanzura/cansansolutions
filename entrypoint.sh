#!/bin/sh
set -e

# Fix permissions on data directories (runs as root)
mkdir -p /app/data /app/uploads/products
chown -R nextjs:nodejs /app/data /app/uploads/products

echo "========================================"
echo "Starting Cansan Solutions"
echo "========================================"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: ${PORT:-3000}"
echo "DATA_DIR: ${DATA_DIR:-/app/data}"

# Ensure data directory exists
DATA_DIR="${DATA_DIR:-/app/data}"
mkdir -p "$DATA_DIR"

# Seed products.json from image if volume is empty or corrupted
if [ -f /app/data.seed/products.json ]; then
  if [ ! -s "$DATA_DIR/products.json" ]; then
    echo "[Setup] Volume products.json is empty, seeding from image..."
    cp /app/data.seed/products.json "$DATA_DIR/products.json"
    chown nextjs:nodejs "$DATA_DIR/products.json"
    echo "[Setup] Seeded products from image"
  else
    EXISTING=$(wc -c < "$DATA_DIR/products.json" | tr -d ' ')
    if [ "$EXISTING" -lt 10 ]; then
      echo "[Setup] Volume products.json is nearly empty (${EXISTING} bytes), seeding from image..."
      cp /app/data.seed/products.json "$DATA_DIR/products.json"
      chown nextjs:nodejs "$DATA_DIR/products.json"
      echo "[Setup] Seeded products from image"
    else
      echo "[Setup] Volume products.json exists (${EXISTING} bytes), preserving"
    fi
  fi
else
  echo "[Setup] No seed file found at /app/data.seed/products.json"
fi

echo "[Setup] Permissions fixed, switching to nextjs user..."
echo ""

# Switch to nextjs user and run the app
exec su-exec nextjs:nodejs "$@"
