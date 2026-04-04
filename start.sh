#!/bin/sh
set -e

echo "=== Starting Cansan Solutions ==="
echo "PORT: $PORT"
echo "NODE_ENV: $NODE_ENV"

# Ensure data directory exists with proper permissions
mkdir -p /app/data /app/uploads/products

# Create empty products.json if it doesn't exist
if [ ! -f /app/data/products.json ]; then
    echo "[]" > /app/data/products.json
    echo "Created empty products.json"
fi

echo "Data directory ready"
ls -la /app/data/

echo "=== Starting Next.js server ==="
exec npm start
