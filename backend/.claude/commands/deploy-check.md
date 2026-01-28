# /deploy-check

Checklist completo pre-deployment. NO hacer deploy si algo falla.

## Checklist Automático

### 1. Tests
```bash
cd backend && npm test -- --passWithNoTests
cd mobile && npm test -- --passWithNoTests
cd ai-service && npm test -- --passWithNoTests
```
- [ ] Backend tests pasan
- [ ] Mobile tests pasan
- [ ] AI Service tests pasan

### 2. Linting & Format
```bash
cd backend && npm run lint 2>/dev/null || echo "No lint script"
cd mobile && npm run lint 2>/dev/null || echo "No lint script"
```
- [ ] No errores de ESLint
- [ ] Código formateado

### 3. Environment Variables
Verificar que `.env.example` incluye TODAS las variables usadas:
```bash
grep -r "process.env\." backend/src --include="*.js" | grep -oP 'process\.env\.\K[A-Z_]+' | sort -u
```
- [ ] Todas las variables documentadas en `.env.example`
- [ ] No hay secrets hardcodeados

### 4. Security Checks
```bash
grep -rn "console.log" backend/src --include="*.js" | grep -v "// debug"
grep -rn "password\|secret\|key" backend/src --include="*.js" | grep -v ".env"
```
- [ ] No hay `console.log` en producción
- [ ] No hay secrets hardcodeados

### 5. Database
- [ ] Migrations creadas para cambios de schema
- [ ] Migrations probadas en local

### 6. Documentation
- [ ] CLAUDE.md actualizado si hubo errores/aprendizajes
- [ ] API-SPEC.md actualizado si cambió API
- [ ] README actualizado si cambió setup

### 7. Git Status
```bash
git status
git log origin/main..HEAD --oneline
```
- [ ] Branch actualizado con main
- [ ] No hay conflictos
- [ ] Commits descriptivos

## Output

```
🚀 DEPLOY CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Tests:          All passed
✅ Linting:        No errors
✅ Env vars:       Documented
✅ Security:       No issues
✅ Database:       Migrations ready
✅ Documentation:  Updated
✅ Git:            Clean
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ READY FOR DEPLOY
```

O si hay problemas:

```
🚀 DEPLOY CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ Tests:          2 failing
✅ Linting:        No errors
❌ Env vars:       Missing OPENAI_API_KEY
✅ Security:       No issues
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ NOT READY - Fix 2 issues first
```

## Auto-fix
Si hay problemas menores, ofrecer arreglarlos automáticamente.
