# /implement-feature

Template para implementar features de forma estructurada.

## Pre-requisitos
- Usar **Planning Mode** (Shift+Tab x2) antes de ejecutar este comando
- Tener claro el sprint/spec relevante

## Fase 1: Entender el Requerimiento

1. **Leer documentación**:
   - Sprint relevante en `/docs/sprints/`
   - API-SPEC.md si afecta endpoints
   - DB-SCHEMA.md si necesita nuevas tablas

2. **Clarificar**:
   - ¿Qué inputs recibe?
   - ¿Qué outputs produce?
   - ¿Qué edge cases hay?
   - ¿Cómo afecta a Free vs Pro users?

## Fase 2: Planear (en Planning Mode)

Crear plan detallado antes de codear:

```markdown
## Plan: [Nombre de Feature]

### Archivos a crear/modificar:
- [ ] backend/src/models/[Model].js
- [ ] backend/src/services/[service]-service.js
- [ ] backend/src/controllers/[controller].js
- [ ] backend/src/routes/[routes].js
- [ ] mobile/app/(tabs)/[screen].tsx

### Database changes:
- Nueva tabla: [nombre]
- Nuevos campos: [campos]

### API Endpoints:
- POST /api/[resource]
- GET /api/[resource]
- etc.

### Dependencias:
- [package-name] para [propósito]
```

## Fase 3: Implementar

### Backend (en orden):
1. **Model**: Crear/modificar modelo Sequelize
2. **Service**: Implementar lógica de negocio
3. **Controller**: Crear handlers HTTP
4. **Routes**: Definir endpoints
5. **Tests**: Crear tests unitarios e integración

### Mobile (en orden):
1. **Types**: Definir interfaces TypeScript
2. **API Client**: Agregar métodos para nuevos endpoints
3. **Screen/Component**: Implementar UI
4. **Tests**: Crear tests de componentes

### AI Service (si aplica):
1. **Prompt**: Crear template en `/prompts/`
2. **Service**: Implementar llamada a OpenAI
3. **Validator**: Validar response de IA
4. **Tests**: Mockear OpenAI, testear lógica

## Fase 4: Verificar

1. **Tests**: `/test-all`
2. **Manual**: Probar flujo completo
3. **Edge cases**: Probar límites y errores

## Fase 5: Documentar

1. Actualizar API-SPEC.md si hay nuevos endpoints
2. Actualizar DB-SCHEMA.md si hay nuevas tablas
3. Actualizar CLAUDE.md si hubo aprendizajes

## Output

```
✅ FEATURE IMPLEMENTED: [Nombre]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Files created:  5
Files modified: 3
Tests added:    12
Coverage:       87%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Ready for: /commit-push
```
