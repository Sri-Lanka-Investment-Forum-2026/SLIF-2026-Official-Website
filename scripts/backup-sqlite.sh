#!/usr/bin/env bash
set -euo pipefail

DATABASE_URL="${DATABASE_URL:-file:./prisma/dev.db}"

if [[ "$DATABASE_URL" != file:* ]]; then
  echo "Only SQLite file URLs are supported by backup-sqlite.sh" >&2
  exit 1
fi

DB_PATH="${DATABASE_URL#file:}"
if [[ "$DB_PATH" != /* ]]; then
  DB_PATH="$(pwd)/$DB_PATH"
fi

if [[ ! -f "$DB_PATH" ]]; then
  echo "Database file not found: $DB_PATH" >&2
  exit 1
fi

BACKUP_DIR="$(pwd)/backups/sqlite"
mkdir -p "$BACKUP_DIR"

STAMP="$(date +%Y%m%d-%H%M%S)"
cp "$DB_PATH" "$BACKUP_DIR/slif-$STAMP.db"

echo "Backup created at $BACKUP_DIR/slif-$STAMP.db"
