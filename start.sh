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
mkdir -p /app/public/images/products
echo ""

# Init database if URL is set
if [ -n "$DATABASE_URL" ]; then
    echo "[DB] Initializing database..."
    node -e "
    const { initDb, seedCategories } = require('./lib/db.js');
    initDb().then(() => {
      console.log('[DB] Tables created');
      return seedCategories();
    }).then(() => {
      console.log('[DB] Categories seeded');
      process.exit(0);
    }).catch(err => {
      console.error('[DB] Error:', err.message);
      process.exit(0);
    });
    " || echo "[DB] Init may have run already"
else
    echo "[DB] Warning: DATABASE_URL not set"
fi

echo ""
echo "[Server] Starting on port ${PORT:-3000}..."
echo "========================================"

exec node server.js
