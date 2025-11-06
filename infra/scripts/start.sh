#!/bin/bash

# ============================================================================
# ANDE EXPLORER - Start Services Script
# ============================================================================
# This script starts all BlockScout services using standard .env configuration
# Usage: bash infra/scripts/start.sh [dev|prod]
# ============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
DOCKER_DIR="$PROJECT_ROOT/docker"
ENV_FILE="$PROJECT_ROOT/.env"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default environment
ENVIRONMENT="${1:-prod}"

# Functions
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

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    print_success "Docker is installed"
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    print_success "Docker Compose is installed"
    
    # Check environment file
    if [ ! -f "$ENV_FILE" ]; then
        print_warning "Environment file not found: $ENV_FILE"
        print_warning "Creating from template..."
        if [ -f "$PROJECT_ROOT/.env.example" ]; then
            cp "$PROJECT_ROOT/.env.example" "$ENV_FILE"
            print_warning "Created $ENV_FILE - PLEASE EDIT WITH YOUR VALUES"
            print_error "Setup incomplete - edit .env and run again"
            exit 1
        else
            print_error "Template .env.example not found"
            exit 1
        fi
    fi
    print_success "Environment file found"
}

# Load environment
load_environment() {
    print_header "Loading Environment"
    
    if [ -f "$ENV_FILE" ]; then
        # Source environment but don't export to shell
        set -a
        source "$ENV_FILE"
        set +a
        print_success "Environment loaded from $ENV_FILE"
    else
        print_error "Environment file not found: $ENV_FILE"
        exit 1
    fi
}

# Create required directories
create_directories() {
    print_header "Creating Required Directories"
    
    mkdir -p "$PROJECT_ROOT/data/postgres"
    mkdir -p "$PROJECT_ROOT/data/redis"
    mkdir -p "$PROJECT_ROOT/logs/nginx"
    mkdir -p "$PROJECT_ROOT/logs/blockscout/main"
    mkdir -p "$PROJECT_ROOT/logs/blockscout/advanced"
    mkdir -p "$PROJECT_ROOT/backups"
    
    # Set proper permissions
    chmod 755 "$PROJECT_ROOT/data"
    chmod 755 "$PROJECT_ROOT/logs"
    chmod 755 "$PROJECT_ROOT/backups"
    
    print_success "Directories created"
}

# Pull latest images
pull_images() {
    print_header "Pulling Docker Images"
    
    cd "$DOCKER_DIR"
    docker-compose pull
    
    print_success "Docker images updated"
}

# Start services
start_services() {
    print_header "Starting BlockScout Services (Environment: $ENVIRONMENT)"
    
    cd "$DOCKER_DIR"
    
    if [ "$ENVIRONMENT" = "prod" ]; then
        docker-compose -f docker-compose.yml -f docker-compose.production.yml up -d
        print_success "Services started in PRODUCTION mode"
    else
        docker-compose -f docker-compose.yml up -d
        print_success "Services started in DEVELOPMENT mode"
    fi
    
    # Wait for services to be healthy
    print_header "Waiting for Services to Start"
    
    echo "Waiting for PostgreSQL..."
    for i in {1..30}; do
        if docker exec blockscout-postgres pg_isready -U ${DB_USER:-blockscout} > /dev/null 2>&1; then
            print_success "PostgreSQL is ready"
            break
        fi
        if [ $i -eq 30 ]; then
            print_warning "PostgreSQL took too long to start"
        fi
        sleep 2
    done
    
    echo "Waiting for Redis..."
    for i in {1..30}; do
        if docker exec blockscout-redis redis-cli -a ${REDIS_PASSWORD:-redis_password} ping > /dev/null 2>&1; then
            print_success "Redis is ready"
            break
        fi
        if [ $i -eq 30 ]; then
            print_warning "Redis took too long to start, continuing anyway..."
        fi
        sleep 1
    done
    
    echo "Waiting for BlockScout services..."
    for i in {1..90}; do
        if curl -s http://localhost:4000/health > /dev/null 2>&1 && curl -s http://localhost:4001/health > /dev/null 2>&1; then
            print_success "BlockScout backends are ready"
            break
        fi
        if [ $i -eq 90 ]; then
            print_warning "BlockScout backends took too long to start"
        fi
        echo -n "."
        sleep 2
    done
    echo ""
}

# Display service status
show_status() {
    print_header "Service Status"
    
    cd "$DOCKER_DIR"
    docker-compose ps
    
    # Check individual services
    echo ""
    echo "Health Checks:"
    
    # PostgreSQL
    if docker exec blockscout-postgres pg_isready -U ${DB_USER:-blockscout} > /dev/null 2>&1; then
        print_success "PostgreSQL: Healthy"
    else
        print_error "PostgreSQL: Not responding"
    fi
    
    # Redis
    if docker exec blockscout-redis redis-cli -a ${REDIS_PASSWORD:-redis_password} ping > /dev/null 2>&1; then
        print_success "Redis: Healthy"
    else
        print_error "Redis: Not responding"
    fi
    
    # Main Backend
    if curl -s http://localhost:4000/health > /dev/null 2>&1; then
        print_success "Main Backend: Healthy"
    else
        print_warning "Main Backend: Starting up..."
    fi
    
    # Advanced Backend
    if curl -s http://localhost:4001/health > /dev/null 2>&1; then
        print_success "Advanced Backend: Healthy"
    else
        print_warning "Advanced Backend: Starting up..."
    fi
    
    # Frontends
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_success "Main Frontend: Healthy"
    else
        print_warning "Main Frontend: Starting up..."
    fi
    
    if curl -s http://localhost:3001 > /dev/null 2>&1; then
        print_success "Advanced Frontend: Healthy"
    else
        print_warning "Advanced Frontend: Starting up..."
    fi
}

# Display access information
show_access_info() {
    print_header "Access Information"
    
    echo ""
    echo -e "Local Development:"
    echo -e "  Main Explorer:      ${BLUE}http://localhost:3000${NC}"
    echo -e "  Main API:           ${BLUE}http://localhost:4000/api/v2${NC}"
    echo -e "  Advanced Explorer:  ${BLUE}http://localhost:3001${NC}"
    echo -e "  Advanced API:       ${BLUE}http://localhost:4001/api/v2${NC}"
    echo ""
    
    if [ "$ENVIRONMENT" = "prod" ]; then
        echo -e "Production URLs (when deployed with SSL):"
        echo -e "  Main Explorer:      ${BLUE}https://${BLOCKSCOUT_HOST_MAIN:-explorer.ande.network}${NC}"
        echo -e "  Advanced Explorer:  ${BLUE}https://${BLOCKSCOUT_HOST_ADVANCED:-explorer-advanced.ande.network}${NC}"
        echo ""
    fi
    
    echo -e "Database Access:"
    echo -e "  Host:               ${BLUE}localhost${NC}"
    echo -e "  Port:               ${BLUE}${DB_PORT:-5432}${NC}"
    echo -e "  Database:           ${BLUE}${DB_NAME:-blockscout}${NC}"
    echo -e "  User:               ${BLUE}${DB_USER:-blockscout}${NC}"
    echo ""
    
    echo -e "Redis Access:"
    echo -e "  Host:               ${BLUE}localhost${NC}"
    echo -e "  Port:               ${BLUE}${REDIS_PORT:-6379}${NC}"
    echo ""
}

# Show logs
show_logs_tip() {
    print_header "View Logs"
    
    echo "To view logs in real-time:"
    echo ""
    echo "All services:"
    echo "  docker-compose -f docker/docker-compose.yml logs -f"
    echo ""
    echo "Individual services:"
    echo "  PostgreSQL:          docker logs -f blockscout-postgres"
    echo "  Redis:               docker logs -f blockscout-redis"
    echo "  Main Backend:        docker logs -f blockscout-main-backend"
    echo "  Main Frontend:       docker logs -f blockscout-main-frontend"
    echo "  Advanced Backend:    docker logs -f blockscout-advanced-backend"
    echo "  Advanced Frontend:   docker logs -f blockscout-advanced-frontend"
    echo "  Nginx:               docker logs -f blockscout-nginx"
    echo ""
    echo "Using docker-compose:"
    echo "  docker-compose -f docker/docker-compose.yml logs -f [service-name]"
    echo ""
}

# Show maintenance commands
show_maintenance_commands() {
    print_header "Maintenance Commands"
    
    echo "Stop all services:"
    echo "  bash infra/scripts/stop.sh"
    echo ""
    echo "Restart services:"
    echo "  docker-compose -f docker/docker-compose.yml restart [service-name]"
    echo ""
    echo "Health check:"
    echo "  bash infra/scripts/health-check.sh"
    echo ""
    echo "Database backup:"
    echo "  bash infra/scripts/backup.sh"
    echo ""
    echo "Update images:"
    echo "  docker-compose -f docker/docker-compose.yml pull"
    echo "  docker-compose -f docker/docker-compose.yml up -d"
    echo ""
}

# Main execution
main() {
    print_header "ANDE NETWORK EXPLORER - Startup Script"
    
    check_prerequisites
    load_environment
    create_directories
    pull_images
    start_services
    show_status
    show_access_info
    show_logs_tip
    show_maintenance_commands
    
    print_success "All services started successfully!"
    echo ""
    echo -e "${YELLOW}Note: Initial blockchain indexing may take several minutes.${NC}"
    echo -e "${YELLOW}Check the logs to monitor progress: docker logs -f blockscout-main-backend${NC}"
    echo ""
}

# Run main function
main "$@"