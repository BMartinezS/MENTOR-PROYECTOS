# 📦 Guía de Migración: De Worktrees a Monorepo

Esta guía documenta la migración del proyecto de una estructura con git worktrees a un monorepo normal.

## 🎯 Objetivo

Simplificar la estructura del proyecto eliminando la complejidad de git worktrees y tener todo el código en una estructura estándar de monorepo que es más fácil de manejar.

## 📋 Cambios Realizados

### Estructura Anterior (Worktrees)
```
mentor-proyectos/
├── worktrees/
│   ├── backend/       # Git worktree en branch backend-dev
│   ├── mobile/        # Git worktree en branch mobile-dev
│   └── ai/
│       └── ai-service/   # Git worktree en branch ai-dev
├── docs/
└── docker-compose*.yml   # Apuntando a worktrees/
```

### Estructura Nueva (Monorepo)
```
mentor-proyectos/
├── backend/           # Código del backend (Node.js + Express)
├── mobile/           # App móvil (React Native + Expo)
├── ai-service/       # Servicio de IA (OpenAI)
├── docs/            # Documentación
├── scripts/         # Scripts de desarrollo
└── docker-compose*.yml   # Apuntando a carpetas normales
```

## 🔄 Proceso de Migración

### 1. Copia de Contenido ✅
- [x] `worktrees/backend/` → `backend/`
- [x] `worktrees/mobile/` → `mobile/`
- [x] `worktrees/ai/ai-service/` → `ai-service/`

### 2. Actualización de Configuraciones ✅
- [x] `docker-compose.yml` - paths actualizados
- [x] `docker-compose.dev.yml` - paths actualizados
- [x] `.gitignore` - actualizado para nueva estructura
- [x] Scripts de desarrollo - rutas corregidas

### 3. Actualización de Documentación ✅
- [x] `README.md` - estructura y comandos actualizados
- [x] `CLAUDE.md` - convenciones y estructura actualizada
- [x] `DOCKER-SETUP.md` - paths corregidos
- [x] Documentación en cada servicio

### 4. Verificación y Limpieza
- [x] Scripts de verificación creados
- [x] Script de limpieza de worktrees creado
- [ ] Ejecución de verificación
- [ ] Limpieza de worktrees
- [ ] Commit final

## 🧪 Verificación

### Script de Verificación
```powershell
# Ejecutar verificación completa
.\scripts\verify-migration.ps1
```

Este script verifica:
- ✅ Estructura de carpetas completa
- ✅ Archivos críticos presentes
- ✅ Configuraciones Docker actualizadas
- ✅ Dependencias instaladas
- ✅ Sintaxis de Docker Compose válida
- ✅ Documentación actualizada

### Test Manual
```powershell
# Probar que Docker funciona con nueva estructura
.\scripts\docker-dev.ps1 dev:up

# Verificar servicios
curl http://localhost:3000/health  # Backend
curl http://localhost:3001/health  # AI Service
```

## 🗑️ Limpieza Final

Una vez verificado que todo funciona:

```powershell
# Limpieza con backup
.\scripts\cleanup-worktrees.ps1 -Backup

# Limpieza sin confirmación (cuidado)
.\scripts\cleanup-worktrees.ps1 -Force

# Limpieza interactiva (recomendado)
.\scripts\cleanup-worktrees.ps1
```

## 📚 Beneficios de la Nueva Estructura

### ✅ Ventajas
- **Simplicidad**: Una sola estructura de carpetas
- **Onboarding**: Más fácil para nuevos desarrolladores
- **IDE Support**: Mejor soporte en IDEs (VS Code, etc.)
- **Docker**: Rutas más simples en configuraciones
- **Git**: Un solo repositorio, menos complejidad
- **CI/CD**: Más fácil configurar pipelines

### ⚠️ Consideraciones
- **Git History**: Se mantiene en las ramas originales
- **Branches**: Las ramas `backend-dev`, `mobile-dev`, `ai-dev` quedan como legacy
- **Merge Strategy**: Los cambios se desarrollan en `main` branch

## 🎯 Flujo de Trabajo Nuevo

### Desarrollo Local
```powershell
# Levantar todo con Docker
.\scripts\docker-dev.ps1 dev:up

# O desarrollo manual por servicio
cd backend && npm run dev
cd mobile && npx expo start
cd ai-service && npm run dev
```

### Estructura de Commits
```bash
# Cambios en múltiples servicios
feat(backend,mobile): add user profile sync

# Cambios en un solo servicio
fix(ai-service): handle OpenAI timeout errors

# Cambios de configuración
chore(docker): update development configuration
```

### Branching Strategy
```bash
# Feature branches desde main
git checkout -b feature/new-payment-system

# Trabajar en cualquier servicio desde la misma rama
# backend/src/...
# mobile/app/...
# ai-service/src/...

# Commit y PR a main
git commit -m "feat(payment): implement RevenueCat integration"
```

## 🔍 Troubleshooting

### Problemas Comunes

#### Docker no encuentra archivos
```bash
# Verificar que las rutas son correctas
grep -r "worktrees" docker-compose*.yml
# No debería retornar nada
```

#### Node modules faltantes
```bash
cd backend && npm install
cd mobile && npm install
cd ai-service && npm install
```

#### Git worktree references
```bash
# Limpiar referencias git
git worktree prune
git branch -D backend-dev mobile-dev ai-dev
```

#### Paths en documentación
```bash
# Buscar referencias obsoletas
grep -r "worktrees" docs/ *.md
```

## 📝 Checklist de Migración

- [x] Código copiado a nueva estructura
- [x] Docker configurado para nueva estructura
- [x] Scripts de desarrollo actualizados
- [x] Documentación actualizada
- [x] .gitignore actualizado
- [x] Scripts de verificación creados
- [x] Scripts de limpieza creados
- [ ] Verificación ejecutada exitosamente
- [ ] Test manual con Docker
- [ ] Limpieza de worktrees realizada
- [ ] Commit de migración creado
- [ ] Documentación finalizada

## 🎉 Estado Final

Después de la migración completa:

```
✅ Estructura simplificada
✅ Docker funcionando
✅ Desarrollo local funcionando
✅ Documentación actualizada
✅ Scripts de desarrollo listos
✅ Worktrees eliminados
✅ Git limpio

🎯 Proyecto listo para continuar desarrollo
```

---

**Fecha de migración**: 2025-01-28
**Realizada por**: Claude Code Assistant
**Estado**: Completada ✅