# ======================================
# Cleanup Worktrees Script
# Mentor de Proyectos - Migration Cleanup
# ======================================

param(
    [switch]$Force,
    [switch]$Backup
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

Write-Info "Mentor de Proyectos - Worktrees Cleanup Script"
Write-Info "Este script limpiará los worktrees después de migrar a estructura monorepo"
Write-Info ""

# Verificar que las nuevas carpetas existen
$requiredFolders = @("backend", "mobile", "ai-service")
$missingFolders = @()

foreach ($folder in $requiredFolders) {
    if (!(Test-Path $folder)) {
        $missingFolders += $folder
    }
}

if ($missingFolders.Count -gt 0) {
    Write-Error "Las siguientes carpetas no existen:"
    foreach ($folder in $missingFolders) {
        Write-Error "  - $folder/"
    }
    Write-Error ""
    Write-Error "La migración no está completa. Ejecuta primero la migración."
    exit 1
}

Write-Success "Verificación de carpetas: ✅ Todas las carpetas nuevas existen"

# Verificar contenido básico
$contentChecks = @{
    "backend/src/index.js" = "Backend entry point"
    "mobile/app/_layout.tsx" = "Mobile app layout"
    "ai-service/src/index.js" = "AI service entry point"
    "backend/package.json" = "Backend dependencies"
    "mobile/package.json" = "Mobile dependencies"
    "ai-service/package.json" = "AI service dependencies"
}

$missingContent = @()
foreach ($file in $contentChecks.Keys) {
    if (!(Test-Path $file)) {
        $missingContent += "$file ($($contentChecks[$file]))"
    }
}

if ($missingContent.Count -gt 0) {
    Write-Error "Archivos críticos faltantes:"
    foreach ($file in $missingContent) {
        Write-Error "  - $file"
    }
    Write-Error ""
    Write-Error "La migración está incompleta. Verifica que se copiaron todos los archivos."
    exit 1
}

Write-Success "Verificación de contenido: ✅ Archivos críticos presentes"

# Verificar que Docker compose funciona
Write-Info "Verificando configuración Docker..."
if (!(Test-Path "docker-compose.yml")) {
    Write-Error "docker-compose.yml no encontrado"
    exit 1
}

# Test de parsing de docker-compose
try {
    $yamlContent = Get-Content "docker-compose.yml" -Raw
    if ($yamlContent -like "*worktrees*") {
        Write-Error "docker-compose.yml todavía contiene referencias a worktrees"
        Write-Error "Ejecuta la actualización de configuración Docker primero"
        exit 1
    }
} catch {
    Write-Error "Error leyendo docker-compose.yml: $($_.Exception.Message)"
    exit 1
}

Write-Success "Verificación Docker: ✅ Configuración actualizada"

# Backup opcional
if ($Backup) {
    Write-Info "Creando backup de worktrees..."
    $backupDir = "worktrees-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

    try {
        Copy-Item "worktrees" $backupDir -Recurse
        Write-Success "Backup creado: $backupDir"
    } catch {
        Write-Error "Error creando backup: $($_.Exception.Message)"
        exit 1
    }
}

# Confirmar eliminación
if (!$Force) {
    Write-Warning "¿Estás seguro que quieres eliminar la carpeta worktrees?"
    Write-Warning "Esta acción NO se puede deshacer."
    Write-Info ""
    Write-Info "Contenido a eliminar:"
    Write-Info "  - worktrees/backend/"
    Write-Info "  - worktrees/mobile/"
    Write-Info "  - worktrees/ai/"
    Write-Info "  - worktrees/.git files"
    Write-Info ""

    $confirmation = Read-Host "¿Continuar? Escribe 'DELETE' para confirmar"

    if ($confirmation -ne "DELETE") {
        Write-Info "Operación cancelada por el usuario"
        exit 0
    }
}

# Realizar limpieza
Write-Info "Eliminando worktrees..."

try {
    # Eliminar carpeta worktrees
    if (Test-Path "worktrees") {
        Remove-Item "worktrees" -Recurse -Force
        Write-Success "Carpeta worktrees eliminada"
    }

    # Limpiar referencias de git worktree
    Write-Info "Limpiando referencias git..."

    # Verificar si hay worktrees de git activos
    $gitWorktrees = git worktree list 2>$null
    if ($LASTEXITCODE -eq 0 -and $gitWorktrees) {
        Write-Info "Worktrees git detectados:"
        Write-Host $gitWorktrees

        # Remover worktrees de git si existen
        git worktree remove --force backend 2>$null
        git worktree remove --force mobile 2>$null
        git worktree remove --force ai 2>$null

        # Prune worktrees
        git worktree prune 2>$null

        Write-Success "Referencias git limpiadas"
    }

} catch {
    Write-Error "Error durante la limpieza: $($_.Exception.Message)"
    exit 1
}

Write-Success "✅ Limpieza completada exitosamente!"
Write-Info ""
Write-Info "Estructura final del proyecto:"
Write-Info "mentor-proyectos/"
Write-Info "├── backend/          # API REST"
Write-Info "├── mobile/           # React Native App"
Write-Info "├── ai-service/       # OpenAI Service"
Write-Info "├── docs/            # Documentación"
Write-Info "└── scripts/         # Scripts de desarrollo"
Write-Info ""
Write-Success "🎉 Migración a monorepo completada!"
Write-Info ""
Write-Info "Próximos pasos:"
Write-Info "1. Verificar que Docker funciona: .\scripts\docker-dev.ps1 dev:up"
Write-Info "2. Commit cambios: git add . && git commit -m 'refactor: migrate from worktrees to monorepo'"
Write-Info "3. Continuar desarrollo normalmente"