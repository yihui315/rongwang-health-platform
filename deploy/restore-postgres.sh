#!/usr/bin/env sh
set -eu

if [ "${1:-}" = "" ]; then
  echo "Usage: deploy/restore-postgres.sh <backup.dump>"
  exit 1
fi

CONTAINER="${POSTGRES_CONTAINER:-rongwang-prod-postgres-1}"
DATABASE="${POSTGRES_DB:-rongwang}"
USER="${POSTGRES_USER:-rongwang}"

cat "$1" | docker exec -i "$CONTAINER" pg_restore -U "$USER" -d "$DATABASE" --clean --if-exists
echo "[restore] restored $1"
