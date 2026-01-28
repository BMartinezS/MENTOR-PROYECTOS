# Claude Code Hooks

Los hooks permiten ejecutar comandos automáticamente en respuesta a acciones de Claude Code.

## Hooks Disponibles

### PostToolUse
Se ejecuta después de que Claude usa una herramienta (Edit, Write, Bash, etc.)

**Configuración en settings.json o vía `/config`:**
```json
{
  "hooks": {
    "PostToolUse": {
      "Edit": "npx prettier --write $FILE",
      "Write": "npx eslint --fix $FILE"
    }
  }
}
```

### PreCommit
Se ejecuta antes de cada commit de git.

**Para usar con git hooks tradicionales:**

1. Crear `.git/hooks/pre-commit`:
```bash
#!/bin/bash
npm test -- --passWithNoTests
npm run lint
```

2. Hacer ejecutable:
```bash
chmod +x .git/hooks/pre-commit
```

## Hooks Recomendados para Este Proyecto

### 1. Format on Edit (Prettier)
```
After Edit: npx prettier --write $FILE
```
- Mantiene formato consistente
- Evita discusiones de estilo en PRs
- 100% automático

### 2. Lint on Write (ESLint)
```
After Write: npx eslint --fix $FILE
```
- Detecta errores comunes
- Auto-fix cuando es posible
- Previene bugs obvios

### 3. Test Before Commit
```
Before Commit: npm test -- --passWithNoTests && npm run lint
```
- No permite commits con tests rotos
- Asegura calidad mínima

## Configuración Manual

Si Claude Code no soporta hooks nativamente, usar:

### Opción 1: Git Hooks
Crear `.git/hooks/pre-commit` con los checks necesarios.

### Opción 2: Husky (recomendado)
```bash
npm install husky --save-dev
npx husky install
npx husky add .husky/pre-commit "npm test"
```

### Opción 3: lint-staged
```bash
npm install lint-staged --save-dev
```

Agregar a `package.json`:
```json
{
  "lint-staged": {
    "*.{js,ts,jsx,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

## Notas

- Los hooks NO deben bloquear el workflow normal
- Si un hook falla, debe dar feedback claro
- Hooks deben ser rápidos (<5 segundos)
- No usar hooks para tareas pesadas (esas van en CI)
