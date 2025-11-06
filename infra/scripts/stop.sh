#!/bin/bash

# ============================================================================
# ANDE EXPLORER - Stop Services Script
# ============================================================================
# This script stops all BlockScout services gracefully
# Usage: bash infra/scripts/stop.sh
# ============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
DOCKER_DIR="$PROJECT_ROOT/docker"

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
    print_header "ANDE NETWORK EXPLORER - Shutdown Script"
    
    cd "$DOCKER_DIR"
    
    echo "Stopping BlockScout services (this may take a moment)..."
    docker-compose down --remove-orphans
    
    print_success "All services stopped"
    
    echo ""
    echo "Container status:"
    docker-compose ps || echo "No containers running"
    
    print_success "Shutdown complete"
}

main "$@"
