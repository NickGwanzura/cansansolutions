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

seed_file "categories.json"
seed_file "products.json"

exec node server.js
