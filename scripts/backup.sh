#!/bin/bash
# Backup database + user uploads from remote server
# Usage: ./scripts/backup.sh [user@host] [backup_dir]
#
# Produces: backup-YYYYMMDD-HHMMSS.tar.gz containing:
#   - db.sql       (PostgreSQL dump)
#   - uploads/     (user uploaded files)

set -euo pipefail

REMOTE="${1:-root@124.70.90.241}"
BACKUP_DIR="${2:-./backups}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
TMPDIR=$(mktemp -d)

echo "=== Backing up from $REMOTE ==="

# 1. Dump database
echo "[1/2] Dumping database..."
ssh "$REMOTE" "docker exec education-db-1 pg_dump -U postgres igem_education" > "$TMPDIR/db.sql"
echo "      db.sql ($(wc -c < "$TMPDIR/db.sql") bytes)"

# 2. Copy uploads
echo "[2/2] Copying uploads..."
ssh "$REMOTE" "tar cf - -C /root/education/backend/database uploads" | tar xf - -C "$TMPDIR/"
echo "      uploads/ ($(find "$TMPDIR/uploads" -type f 2>/dev/null | wc -l) files)"

# 3. Package
mkdir -p "$BACKUP_DIR"
ARCHIVE="$BACKUP_DIR/backup-$TIMESTAMP.tar.gz"
tar czf "$ARCHIVE" -C "$TMPDIR" db.sql uploads
rm -rf "$TMPDIR"

echo ""
echo "=== Backup complete ==="
echo "Archive: $ARCHIVE ($(du -h "$ARCHIVE" | cut -f1))"
