# /review-code

Revisa código con checklist de calidad. Ejecutar antes de PR.

## Input
Especificar qué revisar:
- Ruta específica: `/review-code backend/src/services/`
- Cambios recientes: `/review-code` (revisa git diff)
- PR específico: `/review-code PR#123`

## Checklist de Revisión

### 1. Convenciones (CLAUDE.md)
- [ ] Sigue naming conventions (camelCase, PascalCase, kebab-case)
- [ ] Estructura de carpetas correcta
- [ ] No viola ningún "NUNCA" de CLAUDE.md

### 2. Calidad de Código
- [ ] Funciones < 50 líneas
- [ ] Nombres descriptivos (no `x`, `temp`, `data`)
- [ ] No hay código duplicado
- [ ] Imports organizados
- [ ] No hay `TODO`/`FIXME` sin issue

### 3. Seguridad
- [ ] No secrets hardcodeados
- [ ] Inputs validados con Joi/Yup
- [ ] SQL injection prevenido (usando ORM)
- [ ] XSS prevenido (sanitizando outputs)
- [ ] Auth middleware en rutas protegidas

### 4. Performance
- [ ] Queries tienen índices necesarios
- [ ] Paginación en listas
- [ ] No hay N+1 queries
- [ ] useMemo/useCallback donde corresponde (React)

### 5. Error Handling
- [ ] try/catch en async functions
- [ ] Errores específicos (no solo `catch(e)`)
- [ ] Mensajes de error útiles para debugging
- [ ] No exponer errores internos al usuario

### 6. Tests
- [ ] Tests incluidos para nuevo código
- [ ] Coverage > 80%
- [ ] Tests cubren happy path + edge cases + errors

### 7. React Native Específico
- [ ] No usar `<div>`, `<span>` → usar `<View>`, `<Text>`
- [ ] StyleSheet.create() en vez de estilos inline
- [ ] FlatList para listas largas
- [ ] AsyncStorage con try/catch

## Output

```
📝 CODE REVIEW: backend/src/services/
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Convenciones:    OK
✅ Calidad:         OK
⚠️  Seguridad:      1 warning
✅ Performance:     OK
✅ Error Handling:  OK
❌ Tests:           2 missing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Findings:

### ⚠️ WARN: Posible información sensible en logs
📍 backend/src/services/auth-service.js:45
```js
console.log('User login:', email, password); // ← No loguear passwords
```
**Fix**: Remover password del log

### ❌ ERROR: Falta test para edge case
📍 backend/src/services/project-service.js
```js
export const getById = async (userId, id) => { ... }
```
**Missing**: Test para cuando id no existe

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 2 items need attention before merge
```

## Auto-fix
Si los problemas son menores (formatting, imports), ofrecer arreglarlos automáticamente.
