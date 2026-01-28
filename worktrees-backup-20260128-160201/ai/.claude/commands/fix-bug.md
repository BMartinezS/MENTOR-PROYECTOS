# /fix-bug

Template estructurado para debugging sistemático.

## Fase 1: Recopilar Información

Preguntar al usuario:
1. **Error exacto**: ¿Qué mensaje de error ves? ¿Screenshot?
2. **Reproducción**: ¿Pasos exactos para reproducir?
3. **Esperado**: ¿Qué debería pasar en vez?
4. **Contexto**: ¿Cuándo empezó? ¿Después de qué cambio?
5. **Logs**: ¿Hay logs o stack trace?

## Fase 2: Reproducir

1. Intentar reproducir localmente
2. Si se reproduce:
   - Documentar pasos exactos
   - Capturar estado actual
3. Si NO se reproduce:
   - Verificar diferencias de entorno
   - Solicitar más información

## Fase 3: Diagnosticar

1. **Revisar logs**:
   ```bash
   # Backend
   docker-compose logs backend --tail=100
   # O si es local
   cat backend/logs/error.log
   ```

2. **Identificar código involucrado**:
   - Buscar el endpoint/función afectada
   - Revisar cambios recientes: `git log --oneline -20`

3. **Formular hipótesis**:
   - ¿Qué podría causar este comportamiento?
   - ¿Qué asunciones podrían estar mal?

4. **Verificar hipótesis**:
   - Agregar logs temporales
   - Inspeccionar datos en DB
   - Revisar request/response

## Fase 4: Implementar Fix

1. **Solución mínima**: Solo arreglar el bug, no refactorizar
2. **Crear test que reproduce el bug**:
   ```javascript
   it('should [expected behavior] when [condition that caused bug]', async () => {
     // Arrange: setup que causa el bug
     // Act: ejecutar acción
     // Assert: verificar comportamiento correcto
   });
   ```
3. **Verificar que test FALLA antes del fix**
4. **Aplicar fix**
5. **Verificar que test PASA después del fix**
6. **Ejecutar suite completa**: `/test-all`

## Fase 5: Prevenir Regresiones

1. **Actualizar CLAUDE.md**:
   ```markdown
   ## 🚫 Errores que Claude NO debe repetir
   - ❌ [Descripción del error] → ✅ [Solución correcta]
   ```

2. **Agregar validación** si aplica (Joi schema, middleware, etc.)

3. **Mejorar logging** si fue difícil debuggear

## Output Final

```
🐛 BUG FIX REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bug:     GET /projects/:id retorna 404 para proyectos válidos
Causa:   Query no incluía userId, encontraba proyectos de otros usuarios
Fix:     Agregado where: { id, userId } en findOne
Test:    projects.test.js línea 45
CLAUDE:  Actualizado con regla de ownership validation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Bug fixed and documented
```
