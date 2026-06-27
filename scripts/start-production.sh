#!/bin/sh
set -eu

DATA_DIR="${DATA_DIR:-/app/data}"
SEED_DIR="/app/data.seed"

mkdir -p "$DATA_DIR"

seed_file() {
  name="$1"
  source_file="$SEED_DIR/$name"
  target_file="$DATA_DIR/$name"

  if [ ! -f "$source_file" ]; then
    return
  fi

  if [ ! -s "$target_file" ]; then
    cp "$source_file" "$target_file"
    echo "[startup] Seeded $name into $DATA_DIR"
  else
    echo "[startup] Preserving existing $name"
  fi
}

echo "[startup] Starting Cansan Solutions"
echo "[startup] PORT=${PORT:-3000}"
echo "[startup] DATA_DIR=$DATA_DIR"

# Warn about default admin password
if [ -z "${ADMIN_PASSWORD:-}" ]; then
  echo "[startup] ⚠️  WARNING: ADMIN_PASSWORD is not set! Using default password."
elif [ "$ADMIN_PASSWORD" = "cansan2024" ]; then
  echo "[startup] ⚠️  WARNING: ADMIN_PASSWORD is set to the default value. Change it for production."
fi

seed_file "categories.json"
seed_file "products.json"

exec node server.js
