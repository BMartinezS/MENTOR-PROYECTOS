# ======================================
# Verify Migration Script
# Mentor de Proyectos - Pre-cleanup Verification
# ======================================

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

Write-Host "🔍 Mentor de Proyectos - Migration Verification" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Info ""

$errors = @()
$warnings = @()

# 1. Verificar estructura de carpetas
Write-Info "1. Verificando estructura de carpetas..."

$requiredStructure = @{
    "backend/src" = "Backend source code"
    "backend/src/models" = "Database models"
    "backend/src/services" = "Business logic"
    "backend/src/controllers" = "HTTP controllers"
    "backend/tests" = "Backend tests"
    "backend/Dockerfile" = "Backend Docker config"
    "mobile/app" = "Mobile app source"
    "mobile/app/(auth)" = "Auth screens"
    "mobile/app/(tabs)" = "Main screens"
    "mobile/app/contexts" = "React contexts"
    "ai-service/src" = "AI service source"
    "ai-service/src/prompts" = "OpenAI prompts"
    "ai-service/tests" = "AI service tests"
    "ai-service/Dockerfile" = "AI service Docker config"
}

foreach ($path in $requiredStructure.Keys) {
    if (Test-Path $path) {
        Write-Success "  ✅ $path ($($requiredStructure[$path]))"
    } else {
        $errors += "Missing: $path ($($requiredStructure[$path]))"
        Write-Error "  ❌ $path"
    }
}

# 2. Verificar archivos críticos
Write-Info ""
Write-Info "2. Verificando archivos críticos..."

$criticalFiles = @{
    "backend/package.json" = "Backend dependencies"
    "backend/src/index.js" = "Backend entry point"
    "mobile/package.json" = "Mobile dependencies"
    "mobile/app/_layout.tsx" = "Mobile app layout"
    "ai-service/package.json" = "AI service dependencies"
    "ai-service/src/index.js" = "AI service entry point"
    "docker-compose.yml" = "Production Docker config"
    "docker-compose.dev.yml" = "Development Docker config"
    ".env.example" = "Environment variables template"
    "DOCKER-SETUP.md" = "Docker documentation"
}

foreach ($file in $criticalFiles.Keys) {
    if (Test-Path $file) {
        Write-Success "  ✅ $file"
    } else {
        $errors += "Missing file: $file ($($criticalFiles[$file]))"
        Write-Error "  ❌ $file"
    }
}

# 3. Verificar configuración Docker
Write-Info ""
Write-Info "3. Verificando configuración Docker..."

# Verificar que docker-compose no tenga referencias a worktrees
$dockerComposeFiles = @("docker-compose.yml", "docker-compose.dev.yml")

foreach ($file in $dockerComposeFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        if ($content -like "*worktrees*") {
            $errors += "$file still contains 'worktrees' references"
            Write-Error "  ❌ $file contiene referencias a worktrees"
        } else {
            Write-Success "  ✅ $file actualizado correctamente"
        }
    }
}

# 4. Verificar que las dependencias están instaladas
Write-Info ""
Write-Info "4. Verificando dependencias..."

$packageJsonFiles = @(
    @{Path = "backend/package.json"; NodeModules = "backend/node_modules"}
    @{Path = "mobile/package.json"; NodeModules = "mobile/node_modules"}
    @{Path = "ai-service/package.json"; NodeModules = "ai-service/node_modules"}
)

foreach ($pkg in $packageJsonFiles) {
    if (Test-Path $pkg.Path) {
        if (Test-Path $pkg.NodeModules) {
            Write-Success "  ✅ $($pkg.Path) - dependencies installed"
        } else {
            $warnings += "$($pkg.Path) - node_modules not found, may need 'npm install'"
            Write-Warning "  ⚠️  $($pkg.Path) - node_modules missing"
        }
    }
}

# 5. Verificar configuraciones específicas
Write-Info ""
Write-Info "5. Verificando configuraciones específicas..."

# RevenueCat configuration
if ((Test-Path "mobile/app/services/purchaseService.ts") -and
    (Test-Path "mobile/app/contexts/PurchaseContext.tsx")) {
    Write-Success "  ✅ RevenueCat integration migrated"
} else {
    $warnings += "RevenueCat configuration may be incomplete"
    Write-Warning "  ⚠️  RevenueCat integration incomplete"
}

# Notification service
if ((Test-Path "mobile/app/services/notificationService.ts") -and
    (Test-Path "mobile/app/contexts/NotificationContext.tsx")) {
    Write-Success "  ✅ Notification service migrated"
} else {
    $warnings += "Notification service configuration may be incomplete"
    Write-Warning "  ⚠️  Notification service incomplete"
}

# Backend webhook
if (Test-Path "backend/src/controllers/webhooks-controller.js") {
    Write-Success "  ✅ RevenueCat webhook controller migrated"
} else {
    $warnings += "RevenueCat webhook controller missing"
    Write-Warning "  ⚠️  Webhook controller missing"
}

# 6. Verificar documentación
Write-Info ""
Write-Info "6. Verificando documentación..."

$docs = @(
    "README.md",
    "CLAUDE.md",
    "DOCKER-SETUP.md",
    "docs/ARCHITECTURE.md",
    "docs/API-SPEC.md"
)

foreach ($doc in $docs) {
    if (Test-Path $doc) {
        $content = Get-Content $doc -Raw
        if ($content -like "*worktrees*") {
            $warnings += "$doc may contain outdated worktrees references"
            Write-Warning "  ⚠️  $doc may have outdated references"
        } else {
            Write-Success "  ✅ $doc"
        }
    } else {
        $warnings += "Documentation file missing: $doc"
        Write-Warning "  ⚠️  $doc missing"
    }
}

# 7. Test básico de Docker parsing
Write-Info ""
Write-Info "7. Validando sintaxis Docker..."

try {
    # Verificar que docker-compose puede parsear los archivos
    docker-compose -f docker-compose.yml config --quiet 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "  ✅ docker-compose.yml syntax valid"
    } else {
        $errors += "docker-compose.yml has syntax errors"
        Write-Error "  ❌ docker-compose.yml syntax errors"
    }

    docker-compose -f docker-compose.dev.yml config --quiet 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "  ✅ docker-compose.dev.yml syntax valid"
    } else {
        $errors += "docker-compose.dev.yml has syntax errors"
        Write-Error "  ❌ docker-compose.dev.yml syntax errors"
    }
} catch {
    $warnings += "Could not validate Docker syntax - docker-compose not available"
    Write-Warning "  ⚠️  Docker not available for syntax check"
}

# Resumen final
Write-Info ""
Write-Host "📊 RESUMEN DE VERIFICACIÓN" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

if ($errors.Count -eq 0) {
    Write-Success "✅ MIGRACIÓN EXITOSA - No se encontraron errores críticos"
} else {
    Write-Error "❌ ERRORES ENCONTRADOS - Migración incompleta"
    Write-Error ""
    Write-Error "Errores que deben corregirse:"
    foreach ($error in $errors) {
        Write-Error "  - $error"
    }
}

if ($warnings.Count -gt 0) {
    Write-Warning ""
    Write-Warning "⚠️  ADVERTENCIAS:"
    foreach ($warning in $warnings) {
        Write-Warning "  - $warning"
    }
}

Write-Info ""
Write-Info "📋 PRÓXIMOS PASOS:"

if ($errors.Count -eq 0) {
    Write-Info "1. ✅ La migración está lista"
    Write-Info "2. 🧪 Opcionalmente, probar Docker: .\scripts\docker-dev.ps1 dev:up"
    Write-Info "3. 🗑️  Limpiar worktrees: .\scripts\cleanup-worktrees.ps1"
    Write-Info "4. 💾 Commit cambios: git add . && git commit -m 'refactor: migrate from worktrees to monorepo'"

    Write-Success ""
    Write-Success "🎉 ¡La migración está lista para finalizar!"
} else {
    Write-Error ""
    Write-Error "🚨 Corrige los errores antes de continuar:"
    Write-Error "1. Resolver errores listados arriba"
    Write-Error "2. Ejecutar este script nuevamente"
    Write-Error "3. Una vez sin errores, proceder con cleanup"

    exit 1
}

Write-Info ""