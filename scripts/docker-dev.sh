#!/bin/bash

# ======================================
# Docker Development Scripts
# Mentor de Proyectos
# ======================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
check_env_file() {
    if [ ! -f .env ]; then
        log_warning ".env file not found. Creating from .env.example..."
        cp .env.example .env
        log_info "Please edit .env file with your configuration before proceeding."
        log_info "Especially set OPENAI_API_KEY and POSTGRES_PASSWORD"
        exit 1
    fi
}

# Development commands
dev_up() {
    log_info "Starting development environment..."
    check_env_file
    docker-compose -f docker-compose.dev.yml up -d
    log_success "Development environment started!"
    log_info "Services available at:"
    log_info "  - Backend API: http://localhost:3000"
    log_info "  - AI Service: http://localhost:3001"
    log_info "  - pgAdmin: http://localhost:5050"
    log_info "  - PostgreSQL: localhost:5433"
}

dev_down() {
    log_info "Stopping development environment..."
    docker-compose -f docker-compose.dev.yml down
    log_success "Development environment stopped!"
}

dev_logs() {
    local service=${1:-""}
    if [ -n "$service" ]; then
        log_info "Showing logs for service: $service"
        docker-compose -f docker-compose.dev.yml logs -f "$service"
    else
        log_info "Showing logs for all services"
        docker-compose -f docker-compose.dev.yml logs -f
    fi
}

dev_rebuild() {
    log_info "Rebuilding development services..."
    docker-compose -f docker-compose.dev.yml down
    docker-compose -f docker-compose.dev.yml build --no-cache
    docker-compose -f docker-compose.dev.yml up -d
    log_success "Development environment rebuilt and started!"
}

dev_reset() {
    log_warning "Resetting development environment (will remove all data)..."
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose -f docker-compose.dev.yml down -v
        docker system prune -f
        log_success "Development environment reset!"
    else
        log_info "Reset cancelled."
    fi
}

dev_status() {
    log_info "Development environment status:"
    docker-compose -f docker-compose.dev.yml ps
}

dev_shell() {
    local service=${1:-"backend"}
    log_info "Opening shell in $service container..."
    docker-compose -f docker-compose.dev.yml exec "$service" sh
}

# Production commands
prod_up() {
    log_info "Starting production environment..."
    check_env_file
    docker-compose up -d
    log_success "Production environment started!"
}

prod_down() {
    log_info "Stopping production environment..."
    docker-compose down
    log_success "Production environment stopped!"
}

prod_logs() {
    local service=${1:-""}
    if [ -n "$service" ]; then
        log_info "Showing production logs for service: $service"
        docker-compose logs -f "$service"
    else
        log_info "Showing production logs for all services"
        docker-compose logs -f
    fi
}

# Database commands
db_backup() {
    local filename=${1:-"backup_$(date +%Y%m%d_%H%M%S).sql"}
    log_info "Creating database backup: $filename"
    docker-compose -f docker-compose.dev.yml exec postgres pg_dump -U mentor_user mentor_proyectos_dev > "$filename"
    log_success "Database backup created: $filename"
}

db_restore() {
    local filename=$1
    if [ -z "$filename" ]; then
        log_error "Please provide backup filename"
        exit 1
    fi
    log_info "Restoring database from: $filename"
    docker-compose -f docker-compose.dev.yml exec -T postgres psql -U mentor_user mentor_proyectos_dev < "$filename"
    log_success "Database restored from: $filename"
}

db_shell() {
    log_info "Opening PostgreSQL shell..."
    docker-compose -f docker-compose.dev.yml exec postgres psql -U mentor_user mentor_proyectos_dev
}

# Show usage
show_help() {
    echo "Mentor de Proyectos - Docker Development Scripts"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Development Commands:"
    echo "  dev:up              Start development environment"
    echo "  dev:down            Stop development environment"
    echo "  dev:logs [service]  Show logs (optional: specific service)"
    echo "  dev:rebuild         Rebuild and restart development environment"
    echo "  dev:reset           Reset development environment (removes all data)"
    echo "  dev:status          Show status of development services"
    echo "  dev:shell [service] Open shell in service container (default: backend)"
    echo ""
    echo "Production Commands:"
    echo "  prod:up             Start production environment"
    echo "  prod:down           Stop production environment"
    echo "  prod:logs [service] Show production logs"
    echo ""
    echo "Database Commands:"
    echo "  db:backup [file]    Create database backup"
    echo "  db:restore <file>   Restore database from backup"
    echo "  db:shell            Open PostgreSQL shell"
    echo ""
    echo "Examples:"
    echo "  $0 dev:up                    # Start development environment"
    echo "  $0 dev:logs backend          # Show backend logs"
    echo "  $0 dev:shell ai-service      # Open shell in AI service"
    echo "  $0 db:backup my_backup.sql   # Create named backup"
    echo ""
}

# Main command dispatcher
case "$1" in
    dev:up)
        dev_up
        ;;
    dev:down)
        dev_down
        ;;
    dev:logs)
        dev_logs "$2"
        ;;
    dev:rebuild)
        dev_rebuild
        ;;
    dev:reset)
        dev_reset
        ;;
    dev:status)
        dev_status
        ;;
    dev:shell)
        dev_shell "$2"
        ;;
    prod:up)
        prod_up
        ;;
    prod:down)
        prod_down
        ;;
    prod:logs)
        prod_logs "$2"
        ;;
    db:backup)
        db_backup "$2"
        ;;
    db:restore)
        db_restore "$2"
        ;;
    db:shell)
        db_shell
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac