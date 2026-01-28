# Estilo de PR Descriptions

## Template Estándar

```markdown
## Summary
[1-3 bullet points describiendo el cambio principal]

## Changes
- [Lista detallada de cambios]
- [Archivos principales modificados]
- [Decisiones técnicas importantes]

## Test Plan
- [ ] Tests unitarios pasan
- [ ] Tests de integración pasan
- [ ] Probado manualmente: [describir flujo]

## Screenshots (si aplica)
[Imágenes de UI changes]

## Breaking Changes (si aplica)
[Describir qué se rompe y cómo migrar]

## Related Issues
Closes #123
```

## Ejemplo Real

```markdown
## Summary
- Implementa sistema de check-ins con IA personalizada
- Los usuarios reciben notificaciones diarias preguntando por su progreso
- El mensaje de check-in se adapta al contexto del proyecto

## Changes
- **Nuevo modelo**: `Checkin` con campos status, notes, sentiment
- **Cron job**: Dispara check-ins a las 9 AM hora local del usuario
- **AI Service**: Genera mensajes personalizados usando contexto del proyecto
- **Mobile**: Nueva pantalla `CheckinsScreen` con lista de pendientes

### Archivos principales:
- `backend/src/models/Checkin.js` - Modelo Sequelize
- `backend/src/services/checkin-service.js` - Lógica de negocio
- `ai-service/src/prompts/checkin-message.js` - Template para IA
- `mobile/app/(tabs)/checkins.tsx` - Pantalla principal

## Test Plan
- [x] Unit tests: 12 nuevos, todos pasan
- [x] Integration tests: 4 nuevos para API endpoints
- [x] Manual: Creé proyecto, esperé cron, recibí check-in, respondí
- [x] Edge case: Usuario sin proyecto activo no recibe check-in

## Screenshots
[Agregar capturas de la pantalla de check-ins]

## Related Issues
Closes #45 (Implement daily check-ins)
Related to #32 (AI personalization)
```

## Reglas

### DO ✅
- Ser específico sobre QUÉ y POR QUÉ
- Listar archivos principales (no todos)
- Incluir test plan detallado
- Agregar screenshots para cambios de UI
- Linkear issues relacionados

### DON'T ❌
- PRs con solo "Fixed stuff"
- Listar cada archivo modificado
- Olvidar test plan
- PRs gigantes (+500 líneas) sin justificación
- Mezclar features no relacionadas

## Tamaños de PR

| Tamaño | Líneas | Revisión |
|--------|--------|----------|
| XS | <50 | ~5 min |
| S | 50-200 | ~15 min |
| M | 200-500 | ~30 min |
| L | 500-1000 | ~1 hora |
| XL | >1000 | Dividir si es posible |

**Recomendación**: Mantener PRs en S-M para revisiones rápidas.

## Checklist Pre-Submit

- [ ] Tests pasan (`/test-all`)
- [ ] Code review personal (`/review-code`)
- [ ] Deploy check (`/deploy-check`)
- [ ] PR description completa
- [ ] Branch actualizada con main
- [ ] No hay console.logs de debug
