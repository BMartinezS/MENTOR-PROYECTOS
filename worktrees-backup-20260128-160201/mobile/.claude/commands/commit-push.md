# /commit-push

Analiza cambios actuales, crea commit con conventional commits y hace push.

## Variables pre-cargadas
```bash
git_status=$(git status --short)
branch=$(git branch --show-current)
recent_commits=$(git log --oneline -5)
```

## Proceso

1. **Analizar cambios**: Revisar `$git_status` para entender qué se modificó
2. **Generar commit message** siguiendo conventional commits:
   - `feat(scope)`: Nueva feature
   - `fix(scope)`: Bug fix
   - `refactor(scope)`: Refactorización sin cambiar funcionalidad
   - `test(scope)`: Agregar/modificar tests
   - `docs(scope)`: Documentación
   - `chore(scope)`: Mantenimiento, deps, configs

3. **Scopes válidos**: `auth`, `projects`, `checkins`, `tasks`, `mobile`, `backend`, `ai`, `docs`, `deploy`

4. **Ejecutar**:
   ```bash
   git add .
   git commit -m "[mensaje generado]"
   git push origin $branch
   ```

5. **Confirmar éxito** o reportar error

## Reglas
- Primera línea del commit: máximo 72 caracteres
- Descripción en español es aceptable
- Si hay múltiples cambios de diferente tipo, usar el más significativo
- NUNCA commitear archivos .env o secrets

## Output esperado
```
✅ Commit: feat(auth): implementar refresh token JWT
✅ Push: origin/feature/auth-backend
📝 Archivos: 3 modificados, 1 nuevo
```
