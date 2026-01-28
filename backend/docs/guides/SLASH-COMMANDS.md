# Slash Commands - Templates Listos para Usar

Ubicación: Copia cada comando a `.claude/commands/[nombre].md`

---

## /commit-push - Commit y Push Automático

**Archivo**: `.claude/commands/commit-push.md`

```markdown
# /commit-push

Analiza cambios, crea commit y hace push.

**Proceso**:
1. Ejecutar: `git status --short`
2. Analizar cambios realizados
3. Generar commit message siguiendo conventional commits:
   - feat(scope): descripción
   - fix(scope): descripción
   - refactor(scope): descripción
   - test(scope): descripción
   - docs(scope): descripción
4. Ejecutar: `git add .`
5. Ejecutar: `git commit -m "[mensaje]"`
6. Ejecutar: `git push origin $(git branch --show-current)`
7. Confirmar éxito o reportar error

**Scopes válidos**: auth, projects, checkins, mobile, backend, ai, docs

**Ejemplo output**:
✅ Commit: feat(auth): add JWT refresh token support
✅ Push: origin/feature/auth-backend
```

---

## /test-backend - Tests Backend con Coverage

**Archivo**: `.claude/commands/test-backend.md`

```markdown
# /test-backend

Ejecuta suite completa de tests del backend.

**Pasos**:
1. `cd backend`
2. `npm test -- --coverage`
3. Analizar resultados:
   - Tests passed/failed
   - Coverage % por módulo
   - Identificar archivos sin coverage
4. Si hay fallos:
   a. Leer output del test
   b. Identificar causa raíz
   c. Proponer fix
   d. Aplicar fix
   e. Re-ejecutar desde paso 2
5. Si coverage < 80%:
   - Listar archivos que necesitan más tests
   - Ofrecer generar tests faltantes
6. Reportar resumen final

**Output esperado**:
Tests: 45 passed, 0 failed
Coverage: 87% (statements), 82% (branches)
Files needing tests: user-service.js (65%)
```

---

## /test-mobile - Tests Mobile

**Archivo**: `.claude/commands/test-mobile.md`

```markdown
# /test-mobile

Ejecuta tests de la app móvil.

**Pasos**:
1. `cd mobile`
2. `npm test -- --coverage`
3. Analizar:
   - Component tests
   - Hook tests
   - Integration tests
4. Si hay fallos:
   - Identificar componente
   - Revisar snapshot si aplica
   - Proponer fix
5. Coverage target: 75%+ (mobile suele tener menos que backend)
6. Reportar

**Comandos adicionales**:
- Update snapshots: `npm test -- -u`
- Watch mode: `npm test -- --watch`
```

---

## /deploy-check - Checklist Pre-Deploy

**Archivo**: `.claude/commands/deploy-check.md`

```markdown
# /deploy-check

Verifica que TODO esté listo antes de deploy.

**Checklist Completo**:

## 1. Tests
- [ ] Backend tests pasan: `cd backend && npm test`
- [ ] Mobile tests pasan: `cd mobile && npm test`
- [ ] AI service tests pasan: `cd ai-service && npm test`

## 2. Environment Variables
- [ ] `.env.example` está actualizado
- [ ] Todas las vars están documentadas
- [ ] No hay secrets hardcodeados

## 3. Database
- [ ] Migrations creadas para cambios de schema
- [ ] Migrations probadas en local
- [ ] Rollback plan documentado

## 4. Code Quality
- [ ] No hay `console.log` en producción
- [ ] No hay `TODO` sin issue asociado
- [ ] ESLint pasa sin warnings
- [ ] Prettier aplicado

## 5. Documentation
- [ ] CLAUDE.md actualizado si hay cambios
- [ ] API-SPEC.md actualizado si cambió API
- [ ] README actualizado si cambió setup

## 6. Git
- [ ] Branch está actualizado con main
- [ ] No hay conflictos
- [ ] Commits tienen mensajes descriptivos

**Proceso**:
1. Ejecutar cada check
2. Marcar ✅ o ❌
3. Si hay ❌:
   - Listar qué falta
   - Ofrecer arreglar automáticamente
4. Solo dar OK cuando TODO esté ✅

**Output**:
✅ Todos los checks pasaron - LISTO PARA DEPLOY
❌ 3 items pendientes:
  - .env.example falta OPENAI_API_KEY
  - Migration para tabla checkins no creada
  - console.log encontrado en project-service.js
```

---

## /fix-bug - Template de Bug Fixing

**Archivo**: `.claude/commands/fix-bug.md`

```markdown
# /fix-bug

Template estructurado para debugging.

**Fase 1: Recopilar Información**
Pregunta al usuario:
1. ¿Cuál es el error exacto? (mensaje, screenshot)
2. ¿Cómo reproducirlo? (pasos específicos)
3. ¿Qué debería pasar en vez?
4. ¿Hay logs o stack trace?
5. ¿Cuándo empezó? (después de qué cambio)

**Fase 2: Reproducir**
1. Intentar reproducir localmente
2. Si se reproduce:
   - Documentar pasos exactos
   - Capturar estado antes/después
3. Si NO se reproduce:
   - Preguntar por diferencias de entorno
   - Solicitar más info

**Fase 3: Diagnosticar**
1. Revisar logs relevantes:
   - Backend: `docker-compose logs backend`
   - Mobile: Expo logs
   - Database: Query logs
2. Identificar código involucrado
3. Hipótesis de causa raíz
4. Verificar hipótesis

**Fase 4: Fix**
1. Implementar solución mínima
2. Crear test que reproduce el bug
3. Verificar que test falla ANTES del fix
4. Aplicar fix
5. Verificar que test pasa DESPUÉS del fix

**Fase 5: Prevención**
1. Actualizar CLAUDE.md:
   - ❌ Error cometido
   - ✅ Solución correcta
2. Agregar validación si aplica
3. Mejorar logging si fue difícil debuggear

**Output Esperado**:
🐛 Bug: GET /projects/:id retorna 404
📝 Causa: Faltaba validación de ownership
✅ Fix: Agregado check user_id en query
🧪 Test: projects.test.js - "should return 404 for unauthorized user"
📚 CLAUDE.md actualizado: "SIEMPRE validar ownership en endpoints de recursos"
```

---

## /create-component - Crear Componente React Native

**Archivo**: `.claude/commands/create-component.md`

```markdown
# /create-component

Genera componente React Native con estructura estándar.

**Input Requerido**:
1. Nombre del componente (ej: ProjectCard, CheckinItem)
2. Props esperados (ej: project, onPress, loading)
3. Si necesita state local (sí/no)

**Generación Automática**:

1. Archivo principal: `mobile/components/[Nombre].tsx`
```typescript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface [Nombre]Props {
  // Props aquí
}

export default function [Nombre]({ ...props }: [Nombre]Props) {
  return (
    <View style={styles.container}>
      <Text>[Nombre] Component</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Estilos básicos
  },
});
```

2. Test: `mobile/components/__tests__/[Nombre].test.tsx`
```typescript
import { render, screen } from '@testing-library/react-native';
import [Nombre] from '../[Nombre]';

describe('[Nombre]', () => {
  it('renders correctly', () => {
    render(<[Nombre] {...mockProps} />);
    expect(screen.getByText('[Nombre] Component')).toBeTruthy();
  });
});
```

3. Export: Agregar a `mobile/components/index.ts`
```typescript
export { default as [Nombre] } from './[Nombre]';
```

**Pasos**:
1. Solicitar inputs
2. Generar archivos
3. Ejecutar tests: `cd mobile && npm test [Nombre]`
4. Confirmar que pasan
```

---

## /create-service - Crear Service Backend

**Archivo**: `.claude/commands/create-service.md`

```markdown
# /create-service

Genera service de backend con estructura estándar.

**Input**:
1. Nombre del servicio (ej: project-service, checkin-service)
2. Modelo asociado (ej: Project, Checkin)
3. Operaciones (CRUD completo o específicas)

**Generación**:

1. Service: `backend/src/services/[nombre]-service.js`
```javascript
import [Modelo] from '../models/[Modelo].js';

export const create = async (userId, data) => {
  // Validaciones
  // Lógica de negocio
  return await [Modelo].create({ userId, ...data });
};

export const getAll = async (userId, filters = {}) => {
  return await [Modelo].findAll({
    where: { userId, ...filters },
    order: [['createdAt', 'DESC']]
  });
};

export const getById = async (userId, id) => {
  const item = await [Modelo].findOne({ where: { id, userId } });
  if (!item) throw new Error('Not found');
  return item;
};

export const update = async (userId, id, updates) => {
  const item = await getById(userId, id);
  return await item.update(updates);
};

export const destroy = async (userId, id) => {
  const item = await getById(userId, id);
  await item.destroy();
};
```

2. Tests: `backend/tests/services/[nombre]-service.test.js`
```javascript
import * as Service from '../../src/services/[nombre]-service.js';

describe('[Nombre] Service', () => {
  describe('create', () => {
    it('should create new item', async () => {
      // Test
    });
  });
  // Más tests...
});
```

**Pasos**:
1. Generar archivos
2. Ejecutar tests
3. Verificar coverage > 80%
```

---

## /review-pr - Review de Pull Request

**Archivo**: `.claude/commands/review-pr.md`

```markdown
# /review-pr

Revisa PR completo con checklist.

**Input**: URL o número del PR

**Checklist de Revisión**:

## Code Quality
- [ ] Código sigue convenciones de CLAUDE.md
- [ ] No hay código duplicado
- [ ] Nombres descriptivos
- [ ] Funciones < 50 líneas
- [ ] Complejidad ciclomática razonable

## Tests
- [ ] Tests incluidos
- [ ] Coverage > 80%
- [ ] Tests pasan en CI
- [ ] Edge cases cubiertos

## Security
- [ ] No secrets hardcodeados
- [ ] Inputs validados
- [ ] SQL injection prevenido
- [ ] XSS prevenido
- [ ] Auth checks presentes

## Documentation
- [ ] API-SPEC.md actualizado si cambió API
- [ ] CLAUDE.md actualizado si es necesario
- [ ] Comments en código complejo
- [ ] README actualizado si cambió setup

## Git
- [ ] Commits limpios y descriptivos
- [ ] No hay merge conflicts
- [ ] Branch actualizado con main
- [ ] PR description completo

**Proceso**:
1. Fetch PR
2. Ejecutar cada check
3. Comentar findings
4. Sugerir cambios si es necesario
5. Aprobar o request changes

**Output**:
✅ LGTM - Ready to merge
❌ Changes requested:
  - Agregar tests para user-service.js
  - Remover console.log en línea 45
  - Actualizar API-SPEC.md con nuevo endpoint
```

---

## Cómo Usar Estos Comandos

### 1. Instalación
```bash
mkdir -p .claude/commands
# Copiar cada comando a su archivo correspondiente
```

### 2. Uso en Claude Code
```bash
# Simplemente escribe /comando
/commit-push
/test-backend
/deploy-check
```

### 3. Personalización
Edita los archivos .md para ajustar a tu workflow específico.

### 4. Git
```bash
# Commitear los comandos para compartir con equipo
git add .claude/commands/
git commit -m "feat(claude): add custom slash commands"
git push
```

---

**Pro Tip**: Empieza con `/commit-push` y `/test-backend`. Son los más usados y dan ROI inmediato.