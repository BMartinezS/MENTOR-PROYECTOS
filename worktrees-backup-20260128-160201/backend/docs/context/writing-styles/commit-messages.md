# Estilo de Commit Messages

## Formato: Conventional Commits

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

## Types

| Type | Uso | Ejemplo |
|------|-----|---------|
| `feat` | Nueva feature | `feat(auth): add JWT refresh token` |
| `fix` | Bug fix | `fix(projects): correct progress calculation` |
| `refactor` | Refactorización sin cambiar funcionalidad | `refactor(api): extract validation middleware` |
| `test` | Agregar/modificar tests | `test(auth): add login endpoint tests` |
| `docs` | Documentación | `docs(api): update endpoint specs` |
| `chore` | Mantenimiento, deps, configs | `chore(deps): update sequelize to v6.35` |
| `style` | Formateo, no cambia lógica | `style(backend): apply prettier formatting` |
| `perf` | Mejoras de performance | `perf(queries): add index on user_id` |

## Scopes Válidos

**Backend**: `auth`, `projects`, `tasks`, `checkins`, `users`, `api`, `db`, `middleware`
**Mobile**: `mobile`, `screens`, `components`, `navigation`, `storage`
**AI Service**: `ai`, `prompts`, `openai`
**General**: `docs`, `deploy`, `ci`, `deps`, `config`

## Reglas

### DO ✅
- Primera línea: máximo 72 caracteres
- Usar imperativo: "add" no "added", "fix" no "fixed"
- Lowercase todo excepto nombres propios
- Describir QUÉ y POR QUÉ, no CÓMO

### DON'T ❌
- No terminar con punto
- No usar "WIP" como commit (hacer commits atómicos)
- No mezclar cambios no relacionados en un commit
- No commitear código comentado

## Ejemplos Buenos ✅

```
feat(checkins): implement adaptive frequency based on user hours

- Calculate optimal frequency from weekly availability
- Store preference in user settings
- Update cron job to respect frequency
```

```
fix(mobile): prevent AsyncStorage race condition on logout

Fixes #45
```

```
refactor(auth): extract JWT logic to token-service

- Improve testability
- Prepare for refresh token feature
```

## Ejemplos Malos ❌

```
update stuff                    # Muy vago
fixed the bug                   # ¿Qué bug?
WIP: working on auth           # No commitear WIP
feat: add auth and fix bugs    # Mezcla cambios
```

## Cuerpo del Commit (Opcional)

Usar cuando:
- El cambio necesita explicación
- Hay context importante
- Se resuelve un issue

```
feat(projects): add soft delete for projects

Previously projects were hard-deleted, causing orphan tasks.
Now projects are marked as deleted and filtered from queries.

Closes #78
```

## Footer (Opcional)

- `Closes #123` - Cierra un issue
- `Fixes #123` - Arregla un bug reportado
- `BREAKING CHANGE:` - Cambio que rompe compatibilidad

```
feat(api): change project response format

BREAKING CHANGE: Response now returns { data: project } instead of project directly
```
