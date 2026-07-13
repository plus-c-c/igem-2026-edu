#!/bin/bash
# Restore database + user uploads to local Docker environment
# Usage: ./scripts/restore.sh <backup.tar.gz>
#
# Expects: backup tar.gz containing db.sql + uploads/
# Requires: docker compose running with db + backend services

set -euo pipefail

ARCHIVE="${1:-}"
if [[ -z "$ARCHIVE" || ! -f "$ARCHIVE" ]]; then
  echo "Usage: $0 <backup.tar.gz>"
  echo ""
  echo "Available backups:"
  ls -lh ./backups/backup-*.tar.gz 2>/dev/null || echo "  (none)"
  exit 1
fi

TMPDIR=$(mktemp -d)
COMPOSE="docker compose"

echo "=== Restoring from $ARCHIVE ==="

# 1. Extract
echo "[1/3] Extracting archive..."
tar xzf "$ARCHIVE" -C "$TMPDIR/"
echo "      db.sql: $(wc -c < "$TMPDIR/db.sql") bytes"
echo "      uploads: $(find "$TMPDIR/uploads" -type f 2>/dev/null | wc -l) files"

# 2. Restore database
echo "[2/3] Restoring database..."
# Stop backend to prevent connection conflicts
$COMPOSE stop backend seed 2>/dev/null || true
# Drop and recreate database
$COMPOSE exec -T db psql -U postgres -c "DROP DATABASE IF EXISTS igem_education;" postgres
$COMPOSE exec -T db psql -U postgres -c "CREATE DATABASE igem_education;" postgres
# Import dump
cat "$TMPDIR/db.sql" | $COMPOSE exec -T db psql -U postgres -d igem_education > /dev/null 2>&1
echo "      Database restored"

# 3. Restore uploads
echo "[3/3] Restoring uploads..."
mkdir -p backend/database/uploads
cp -a "$TMPDIR/uploads/"* backend/database/uploads/ 2>/dev/null || true
echo "      Uploads restored"

# Cleanup
rm -rf "$TMPDIR"

# Restart services
echo ""
echo "Restarting services..."
$COMPOSE up -d db backend seed 2>&1 | grep -E 'Started|Running'

echo ""
echo "=== Restore complete ==="
echo "Verify: curl http://localhost:3000/"
