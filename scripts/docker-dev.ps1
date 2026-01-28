# ======================================
# Docker Development Scripts (PowerShell)
# Mentor de Proyectos - Windows
# ======================================

param(
    [Parameter(Position=0)]
    [string]$Command,

    [Parameter(Position=1)]
    [string]$Service
)

# Colors for output
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if .env file exists
function Test-EnvFile {
    if (!(Test-Path ".env")) {
        Write-Warning ".env file not found. Creating from .env.example..."
        Copy-Item ".env.example" ".env"
        Write-Info "Please edit .env file with your configuration before proceeding."
        Write-Info "Especially set OPENAI_API_KEY and POSTGRES_PASSWORD"
        exit 1
    }
}

# Development commands
function Start-Development {
    Write-Info "Starting development environment..."
    Test-EnvFile
    docker-compose -f docker-compose.dev.yml up -d
    Write-Success "Development environment started!"
    Write-Info "Services available at:"
    Write-Info "  - Backend API: http://localhost:3000"
    Write-Info "  - AI Service: http://localhost:3001"
    Write-Info "  - pgAdmin: http://localhost:5050"
    Write-Info "  - PostgreSQL: localhost:5433"
}

function Stop-Development {
    Write-Info "Stopping development environment..."
    docker-compose -f docker-compose.dev.yml down
    Write-Success "Development environment stopped!"
}

function Show-DevelopmentLogs {
    param([string]$ServiceName)
    if ($ServiceName) {
        Write-Info "Showing logs for service: $ServiceName"
        docker-compose -f docker-compose.dev.yml logs -f $ServiceName
    } else {
        Write-Info "Showing logs for all services"
        docker-compose -f docker-compose.dev.yml logs -f
    }
}

function Rebuild-Development {
    Write-Info "Rebuilding development services..."
    docker-compose -f docker-compose.dev.yml down
    docker-compose -f docker-compose.dev.yml build --no-cache
    docker-compose -f docker-compose.dev.yml up -d
    Write-Success "Development environment rebuilt and started!"
}

function Reset-Development {
    Write-Warning "Resetting development environment (will remove all data)..."
    $confirmation = Read-Host "Are you sure? (y/N)"
    if ($confirmation -eq "y" -or $confirmation -eq "Y") {
        docker-compose -f docker-compose.dev.yml down -v
        docker system prune -f
        Write-Success "Development environment reset!"
    } else {
        Write-Info "Reset cancelled."
    }
}

function Get-DevelopmentStatus {
    Write-Info "Development environment status:"
    docker-compose -f docker-compose.dev.yml ps
}

function Enter-ServiceShell {
    param([string]$ServiceName = "backend")
    Write-Info "Opening shell in $ServiceName container..."
    docker-compose -f docker-compose.dev.yml exec $ServiceName sh
}

# Production commands
function Start-Production {
    Write-Info "Starting production environment..."
    Test-EnvFile
    docker-compose up -d
    Write-Success "Production environment started!"
}

function Stop-Production {
    Write-Info "Stopping production environment..."
    docker-compose down
    Write-Success "Production environment stopped!"
}

function Show-ProductionLogs {
    param([string]$ServiceName)
    if ($ServiceName) {
        Write-Info "Showing production logs for service: $ServiceName"
        docker-compose logs -f $ServiceName
    } else {
        Write-Info "Showing production logs for all services"
        docker-compose logs -f
    }
}

# Database commands
function Backup-Database {
    param([string]$Filename)
    if (!$Filename) {
        $Filename = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
    }
    Write-Info "Creating database backup: $Filename"
    docker-compose -f docker-compose.dev.yml exec postgres pg_dump -U mentor_user mentor_proyectos_dev | Out-File -FilePath $Filename -Encoding utf8
    Write-Success "Database backup created: $Filename"
}

function Restore-Database {
    param([string]$Filename)
    if (!$Filename) {
        Write-Error "Please provide backup filename"
        exit 1
    }
    if (!(Test-Path $Filename)) {
        Write-Error "Backup file not found: $Filename"
        exit 1
    }
    Write-Info "Restoring database from: $Filename"
    Get-Content $Filename | docker-compose -f docker-compose.dev.yml exec -T postgres psql -U mentor_user mentor_proyectos_dev
    Write-Success "Database restored from: $Filename"
}

function Enter-DatabaseShell {
    Write-Info "Opening PostgreSQL shell..."
    docker-compose -f docker-compose.dev.yml exec postgres psql -U mentor_user mentor_proyectos_dev
}

# Show usage
function Show-Help {
    Write-Host "Mentor de Proyectos - Docker Development Scripts (Windows)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\docker-dev.ps1 [COMMAND] [OPTIONS]" -ForegroundColor White
    Write-Host ""
    Write-Host "Development Commands:" -ForegroundColor Yellow
    Write-Host "  dev:up              Start development environment"
    Write-Host "  dev:down            Stop development environment"
    Write-Host "  dev:logs [service]  Show logs (optional: specific service)"
    Write-Host "  dev:rebuild         Rebuild and restart development environment"
    Write-Host "  dev:reset           Reset development environment (removes all data)"
    Write-Host "  dev:status          Show status of development services"
    Write-Host "  dev:shell [service] Open shell in service container (default: backend)"
    Write-Host ""
    Write-Host "Production Commands:" -ForegroundColor Yellow
    Write-Host "  prod:up             Start production environment"
    Write-Host "  prod:down           Stop production environment"
    Write-Host "  prod:logs [service] Show production logs"
    Write-Host ""
    Write-Host "Database Commands:" -ForegroundColor Yellow
    Write-Host "  db:backup [file]    Create database backup"
    Write-Host "  db:restore <file>   Restore database from backup"
    Write-Host "  db:shell            Open PostgreSQL shell"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Green
    Write-Host "  .\docker-dev.ps1 dev:up                    # Start development environment"
    Write-Host "  .\docker-dev.ps1 dev:logs backend          # Show backend logs"
    Write-Host "  .\docker-dev.ps1 dev:shell ai-service      # Open shell in AI service"
    Write-Host "  .\docker-dev.ps1 db:backup my_backup.sql   # Create named backup"
    Write-Host ""
}

# Main command dispatcher
switch ($Command) {
    "dev:up" {
        Start-Development
    }
    "dev:down" {
        Stop-Development
    }
    "dev:logs" {
        Show-DevelopmentLogs $Service
    }
    "dev:rebuild" {
        Rebuild-Development
    }
    "dev:reset" {
        Reset-Development
    }
    "dev:status" {
        Get-DevelopmentStatus
    }
    "dev:shell" {
        Enter-ServiceShell $Service
    }
    "prod:up" {
        Start-Production
    }
    "prod:down" {
        Stop-Production
    }
    "prod:logs" {
        Show-ProductionLogs $Service
    }
    "db:backup" {
        Backup-Database $Service
    }
    "db:restore" {
        Restore-Database $Service
    }
    "db:shell" {
        Enter-DatabaseShell
    }
    { $_ -in @("help", "--help", "-h", "") } {
        Show-Help
    }
    default {
        Write-Error "Unknown command: $Command"
        Show-Help
        exit 1
    }
}