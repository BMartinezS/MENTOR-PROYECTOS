# Estilo de Comentarios de Código

## Filosofía

> "El código debe ser auto-documentado. Los comentarios explican el POR QUÉ, no el QUÉ."

## Cuándo Comentar ✅

### 1. Decisiones no obvias
```javascript
// Usamos bcrypt rounds=10 porque:
// - < 10: Inseguro para ataques de fuerza bruta
// - > 12: Demasiado lento para UX de login
const BCRYPT_ROUNDS = 10;
```

### 2. Workarounds o hacks temporales
```javascript
// HACK: Sequelize no soporta upsert con composite keys en PostgreSQL
// TODO(#123): Migrar a raw query cuando actualicemos a Sequelize 7
await model.findOrCreate({ where: { userId, projectId } });
```

### 3. Reglas de negocio complejas
```javascript
// Free tier: máximo 2 check-ins por semana
// Pro tier: sin límite
// La cuenta empieza el lunes a las 00:00 UTC
const weeklyLimit = user.tier === 'free' ? 2 : Infinity;
```

### 4. Integraciones externas
```javascript
// OpenAI API: response_format fuerza JSON válido
// Documentación: https://platform.openai.com/docs/guides/json-mode
const response = await openai.chat.completions.create({
  response_format: { type: 'json_object' },
  // ...
});
```

## Cuándo NO Comentar ❌

### Código obvio
```javascript
// ❌ MAL: Comentario que repite el código
// Incrementa el contador
counter++;

// ✅ BIEN: Sin comentario, el código es claro
counter++;
```

### Nombres descriptivos hacen el trabajo
```javascript
// ❌ MAL
// Obtiene proyectos del usuario
const p = await getP(uid);

// ✅ BIEN
const userProjects = await getUserProjects(userId);
```

## Formato de Comentarios

### Single-line
```javascript
// Explicación corta en una línea
const value = calculate();
```

### Multi-line
```javascript
/**
 * Genera plan de proyecto usando IA.
 *
 * El plan incluye fases, milestones y tareas iniciales
 * calibradas según las horas disponibles del usuario.
 *
 * @param {string} idea - Descripción de la idea del usuario
 * @param {number} hoursPerWeek - Horas disponibles por semana
 * @param {Date} targetDate - Fecha objetivo de completitud
 * @returns {Promise<Plan>} Plan estructurado
 */
async function generatePlan(idea, hoursPerWeek, targetDate) {
  // ...
}
```

### TODO/FIXME
```javascript
// TODO: Implementar cache de respuestas de IA
// TODO(#45): Agregar rate limiting por usuario

// FIXME: Race condition cuando se crean 2 proyectos simultáneos
// FIXME(urgent): Memory leak en conexión de WebSocket
```

**Regla**: Todo TODO/FIXME debe tener issue asociado (#número) o ser resuelto antes de merge.

## JSDoc para Funciones Públicas

```javascript
/**
 * Crea un nuevo check-in para el usuario.
 *
 * @param {string} userId - ID del usuario
 * @param {string} projectId - ID del proyecto
 * @param {Object} data - Datos del check-in
 * @param {string} data.status - 'completed' | 'partial' | 'blocked'
 * @param {string} [data.notes] - Notas opcionales del usuario
 * @returns {Promise<Checkin>} El check-in creado
 * @throws {ValidationError} Si faltan campos requeridos
 * @throws {LimitError} Si el usuario free excedió su límite semanal
 *
 * @example
 * const checkin = await createCheckin('user-123', 'project-456', {
 *   status: 'completed',
 *   notes: 'Terminé el diseño de la landing'
 * });
 */
export async function createCheckin(userId, projectId, data) {
  // ...
}
```

## Comentarios de Sección

Para archivos largos, usar separadores:

```javascript
// ============================================
// AUTHENTICATION
// ============================================

function login() { /* ... */ }
function logout() { /* ... */ }

// ============================================
// USER MANAGEMENT
// ============================================

function createUser() { /* ... */ }
function updateUser() { /* ... */ }
```

## Anti-Patterns

### Comentarios desactualizados
```javascript
// ❌ El comentario miente
// Retorna el email del usuario
function getUsername(user) {
  return user.name; // En realidad retorna name
}
```

### Código comentado
```javascript
// ❌ No commitear código comentado
// const oldImplementation = () => {
//   // ... 50 líneas de código viejo
// };
```

### Comentarios pasivo-agresivos
```javascript
// ❌ No hacer esto
// Solo Dios sabe por qué esto funciona
// El que escribió esto debería volver a la escuela
```
