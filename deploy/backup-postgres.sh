#!/usr/bin/env sh
set -eu

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
CONTAINER="${POSTGRES_CONTAINER:-rongwang-prod-postgres-1}"
DATABASE="${POSTGRES_DB:-rongwang}"
USER="${POSTGRES_USER:-rongwang}"

mkdir -p "$BACKUP_DIR"
docker exec "$CONTAINER" pg_dump -U "$USER" -d "$DATABASE" --format=custom > "$BACKUP_DIR/rongwang-$TIMESTAMP.dump"
echo "[backup] wrote $BACKUP_DIR/rongwang-$TIMESTAMP.dump"
