#!/bin/bash

# ============================================================================
# ANDE EXPLORER - Health Check Script
# ============================================================================
# This script performs comprehensive health checks on all services
# Usage: bash infra/scripts/health-check.sh [--verbose|--json]
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

# Script options
VERBOSE=false
JSON_OUTPUT=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --verbose)
            VERBOSE=true
            shift
            ;;
        --json)
            JSON_OUTPUT=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Load environment
if [ -f "$ENV_FILE" ]; then
    set -a
    source "$ENV_FILE"
    set +a
fi

# Global variables for JSON output
JSON_RESULTS='{"services":{'
OVERALL_STATUS="healthy"

# Functions
print_header() {
    if [ "$JSON_OUTPUT" = false ]; then
        echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
        echo -e "${BLUE}$1${NC}"
        echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    fi
}

print_success() {
    if [ "$JSON_OUTPUT" = false ]; then
        echo -e "${GREEN}✓ $1${NC}"
    fi
}

print_warning() {
    if [ "$JSON_OUTPUT" = false ]; then
        echo -e "${YELLOW}⚠ $1${NC}"
    fi
}

print_error() {
    if [ "$JSON_OUTPUT" = false ]; then
        echo -e "${RED}✗ $1${NC}"
    fi
    OVERALL_STATUS="unhealthy"
}

# Check if service is running
check_service_running() {
    local service_name="$1"
    local container_name="$2"
    
    if docker ps --format "table {{.Names}}" | grep -q "^${container_name}$"; then
        if [ "$JSON_OUTPUT" = true ]; then
            JSON_RESULTS+="${JSON_RESULTS%,*},'${service_name}':{'status':'running',"
        else
            print_success "$service_name: Container is running"
        fi
        return 0
    else
        if [ "$JSON_OUTPUT" = true ]; then
            JSON_RESULTS+="${JSON_RESULTS%,*},'${service_name}':{'status':'stopped',"
        else
            print_error "$service_name: Container is not running"
        fi
        return 1
    fi
}

# Check service health
check_service_health() {
    local service_name="$1"
    local container_name="$2"
    local health_command="$3"
    
    if [ "$JSON_OUTPUT" = true ]; then
        if docker exec "$container_name" sh -c "$health_command" > /dev/null 2>&1; then
            JSON_RESULTS+="'health':'healthy'},"
        else
            JSON_RESULTS+="'health':'unhealthy'},"
            OVERALL_STATUS="unhealthy"
        fi
    else
        if docker exec "$container_name" sh -c "$health_command" > /dev/null 2>&1; then
            print_success "$service_name: Health check passed"
        else
            print_error "$service_name: Health check failed"
            return 1
        fi
    fi
}

# Check HTTP endpoint
check_http_endpoint() {
    local service_name="$1"
    local url="$2"
    local timeout="${3:-10}"
    
    if [ "$JSON_OUTPUT" = true ]; then
        if curl -s --max-time "$timeout" "$url" > /dev/null 2>&1; then
            JSON_RESULTS+="'http':'healthy'},"
        else
            JSON_RESULTS+="'http':'unhealthy'},"
            OVERALL_STATUS="unhealthy"
        fi
    else
        if curl -s --max-time "$timeout" "$url" > /dev/null 2>&1; then
            print_success "$service_name: HTTP endpoint responding"
        else
            print_error "$service_name: HTTP endpoint not responding"
            return 1
        fi
    fi
}

# Get service metrics
get_service_metrics() {
    local service_name="$1"
    local container_name="$2"
    
    if [ "$VERBOSE" = true ] && [ "$JSON_OUTPUT" = false ]; then
        echo -e "${BLUE}  Metrics for $service_name:${NC}"
        
        # Container stats
        local stats=$(docker stats --no-stream --format "table {{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" "$container_name" 2>/dev/null | tail -n 1)
        if [ -n "$stats" ]; then
            echo "    CPU: $(echo $stats | awk '{print $1}')"
            echo "    Memory: $(echo $stats | awk '{print $2}')"
            echo "    Network I/O: $(echo $stats | awk '{print $3}')"
            echo "    Block I/O: $(echo $stats | awk '{print $4}')"
        fi
        
        # Container uptime
        local uptime=$(docker inspect -f '{{.State.StartedAt}}' "$container_name" 2>/dev/null)
        if [ -n "$uptime" ]; then
            echo "    Started: $uptime"
        fi
    fi
}

# Main health check function
run_health_checks() {
    print_header "ANDE EXPLORER - Health Check Results"
    
    # Initialize JSON if needed
    if [ "$JSON_OUTPUT" = true ]; then
        JSON_RESULTS+='timestamp":"'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",'
    fi
    
    # Check PostgreSQL
    print_header "Database Services"
    if check_service_running "PostgreSQL" "blockscout-postgres"; then
        check_service_health "PostgreSQL" "blockscout-postgres" "pg_isready -U ${DB_USER:-blockscout}"
        get_service_metrics "PostgreSQL" "blockscout-postgres"
        
        if [ "$JSON_OUTPUT" = false ]; then
            # Database connection count
            local connections=$(docker exec blockscout-postgres psql -U ${DB_USER:-blockscout} -t -c "SELECT count(*) FROM pg_stat_activity;" 2>/dev/null | xargs)
            if [ -n "$connections" ]; then
                echo -e "  ${BLUE}Active connections: $connections${NC}"
            fi
        fi
    fi
    
    # Check Redis
    if check_service_running "Redis" "blockscout-redis"; then
        check_service_health "Redis" "blockscout-redis" "redis-cli -a ${REDIS_PASSWORD:-redis_password} ping"
        get_service_metrics "Redis" "blockscout-redis"
        
        if [ "$VERBOSE" = true ] && [ "$JSON_OUTPUT" = false ]; then
            # Redis info
            local redis_info=$(docker exec blockscout-redis redis-cli -a ${REDIS_PASSWORD:-redis_password} info memory 2>/dev/null)
            if [ -n "$redis_info" ]; then
                echo -e "  ${BLUE}Redis memory usage:${NC}"
                echo "$redis_info" | grep used_memory_human | sed 's/^/    /'
            fi
        fi
    fi
    
    # Check BlockScout Main Backend
    print_header "BlockScout Services - Main Instance"
    if check_service_running "Main Backend" "blockscout-main-backend"; then
        check_http_endpoint "Main Backend" "http://localhost:4000/health"
        get_service_metrics "Main Backend" "blockscout-main-backend"
        
        if [ "$VERBOSE" = true ] && [ "$JSON_OUTPUT" = false ]; then
            # Check indexing status
            echo -e "  ${BLUE}Checking indexing status...${NC}"
            local indexing_status=$(curl -s http://localhost:4000/api/v2/health 2>/dev/null | jq -r '.indexing_status // "unknown"' 2>/dev/null || echo "unknown")
            echo "    Indexing status: $indexing_status"
        fi
    fi
    
    # Check BlockScout Main Frontend
    if check_service_running "Main Frontend" "blockscout-main-frontend"; then
        check_http_endpoint "Main Frontend" "http://localhost:3000"
        get_service_metrics "Main Frontend" "blockscout-main-frontend"
    fi
    
    # Check BlockScout Advanced Backend
    print_header "BlockScout Services - Advanced Instance"
    if check_service_running "Advanced Backend" "blockscout-advanced-backend"; then
        check_http_endpoint "Advanced Backend" "http://localhost:4001/health"
        get_service_metrics "Advanced Backend" "blockscout-advanced-backend"
    fi
    
    # Check BlockScout Advanced Frontend
    if check_service_running "Advanced Frontend" "blockscout-advanced-frontend"; then
        check_http_endpoint "Advanced Frontend" "http://localhost:3001"
        get_service_metrics "Advanced Frontend" "blockscout-advanced-frontend"
    fi
    
    # Check Nginx
    print_header "Proxy Services"
    if check_service_running "Nginx" "blockscout-nginx"; then
        check_http_endpoint "Nginx" "http://localhost/health"
        get_service_metrics "Nginx" "blockscout-nginx"
    fi
    
    # System checks
    print_header "System Resources"
    if [ "$JSON_OUTPUT" = false ]; then
        # Disk space
        local disk_usage=$(df -h / | tail -1 | awk '{print $5}' | sed 's/%//')
        if [ "$disk_usage" -gt 85 ]; then
            print_error "Disk usage is critical: ${disk_usage}%"
            OVERALL_STATUS="unhealthy"
        elif [ "$disk_usage" -gt 70 ]; then
            print_warning "Disk usage is high: ${disk_usage}%"
        else
            print_success "Disk usage is acceptable: ${disk_usage}%"
        fi
        
        # Memory usage
        local memory_usage=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
        if [ "$memory_usage" -gt 90 ]; then
            print_error "Memory usage is critical: ${memory_usage}%"
            OVERALL_STATUS="unhealthy"
        elif [ "$memory_usage" -gt 80 ]; then
            print_warning "Memory usage is high: ${memory_usage}%"
        else
            print_success "Memory usage is acceptable: ${memory_usage}%"
        fi
        
        # Docker system info
        if [ "$VERBOSE" = true ]; then
            echo -e "  ${BLUE}Docker system:${NC}"
            local docker_info=$(docker system df --format "table {{.Type}}\t{{.TotalCount}}\t{{.Size}}" 2>/dev/null | tail -n +2)
            if [ -n "$docker_info" ]; then
                echo "$docker_info" | sed 's/^/    /'
            fi
        fi
    fi
}

# Output results
output_results() {
    if [ "$JSON_OUTPUT" = true ]; then
        # Remove trailing comma and close JSON
        JSON_RESULTS=${JSON_RESULTS%,*}
        JSON_RESULTS+='},"overall_status":"'$OVERALL_STATUS'"}'
        echo "$JSON_RESULTS"
    else
        print_header "Health Check Summary"
        if [ "$OVERALL_STATUS" = "healthy" ]; then
            print_success "All services are healthy!"
        else
            print_error "Some services have issues - please check the logs"
        fi
        echo ""
        echo "For detailed logs:"
        echo "  docker logs -f [container-name]"
        echo ""
        echo "For service status:"
        echo "  docker-compose -f docker/docker-compose.yml ps"
    fi
}

# Main execution
main() {
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        if [ "$JSON_OUTPUT" = true ]; then
            echo '{"error":"Docker is not running","overall_status":"error"}'
        else
            print_error "Docker is not running or not accessible"
        fi
        exit 1
    fi
    
    run_health_checks
    output_results
    
    # Exit with appropriate code
    if [ "$OVERALL_STATUS" = "healthy" ]; then
        exit 0
    else
        exit 1
    fi
}

# Run main function
main "$@"