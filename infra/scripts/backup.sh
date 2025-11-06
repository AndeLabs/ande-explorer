#!/bin/bash

# ============================================================================
# ANDE EXPLORER - Database Backup Script
# ============================================================================
# This script creates automated backups of the PostgreSQL database
# Usage: bash infra/scripts/backup.sh
# Or add to crontab: 0 2 * * * bash /path/to/infra/scripts/backup.sh
# ============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
BACKUP_DIR="${PROJECT_ROOT}/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/blockscout_backup_$TIMESTAMP.sql.gz"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

main() {
    print_header "ANDE NETWORK EXPLORER - Database Backup"
    
    # Load environment
    ENV_FILE="$PROJECT_ROOT/.env.main"
    if [ ! -f "$ENV_FILE" ]; then
        print_error "Environment file not found: $ENV_FILE"
        exit 1
    fi
    
    set -a
    source "$ENV_FILE"
    set +a
    
    # Create backup directory if it doesn't exist
    mkdir -p "$BACKUP_DIR"
    
    echo "Backup destination: $BACKUP_FILE"
    
    # Create backup
    echo "Starting database backup..."
    if docker exec blockscout-postgres pg_dump \
        -U ${DB_USER:-blockscout} \
        -d ${DB_NAME:-blockscout} \
        --compress=9 \
        --verbose \
        > >(gzip > "$BACKUP_FILE") 2>&1; then
        print_success "Database backup completed"
    else
        print_error "Database backup failed"
        exit 1
    fi
    
    # Get backup size
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    print_success "Backup size: $BACKUP_SIZE"
    
    # List recent backups
    echo ""
    print_header "Recent Backups"
    ls -lh "$BACKUP_DIR"/blockscout_backup_*.sql.gz 2>/dev/null | tail -5 || echo "No backups found"
    
    # Cleanup old backups (keep last 7 days)
    echo ""
    print_header "Cleaning up old backups (older than 7 days)"
    find "$BACKUP_DIR" -name "blockscout_backup_*.sql.gz" -mtime +7 -delete -print
    
    print_success "Backup completed successfully!"
}

main "$@"
