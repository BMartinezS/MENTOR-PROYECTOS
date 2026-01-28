# Workflow Guide - Setup Estilo Boris Cherny

Esta guía explica **cómo y para qué** usar cada componente del setup avanzado de Claude Code.

---

## 📁 Estructura Completa del Proyecto

```
mentor-proyectos/
├── CLAUDE.md                    # ⭐ Conocimiento institucional (LO MÁS IMPORTANTE)
├── .claude/
│   ├── commands/                # Slash commands personalizados
│   │   ├── commit-push.md
│   │   ├── test-backend.md
│   │   ├── test-mobile.md
│   │   ├── deploy-check.md
│   │   └── fix-bug.md
│   ├── subagents/               # Agentes de revisión automática
│   │   ├── code-reviewer.md
│   │   ├── security-checker.md
│   │   └── test-generator.md
│   ├── hooks/                   # Hooks automáticos
│   │   ├── post-tool-use.sh
│   │   └── pre-commit.sh
│   └── settings.json            # Configuración de permisos
├── docs/
│   ├── context/                 # Context engineering
│   │   ├── business/
│   │   │   ├── monetization.md
│   │   │   ├── user-personas.md
│   │   │   └── roadmap.md
│   │   ├── writing-styles/
│   │   │   ├── commit-messages.md
│   │   │   ├── code-comments.md
│   │   │   └── pr-descriptions.md
│   │   └── examples/
│   │       ├── good-pr-example.md
│   │       ├── api-response-examples.json
│   │       └── component-patterns.tsx
│   ├── ARCHITECTURE.md
│   ├── API-SPEC.md
│   ├── DB-SCHEMA.md
│   └── sprints/
└── (resto del código)
```

---

## 1️⃣ CLAUDE.md - El Cerebro del Proyecto

### ¿Qué es?
Un archivo que contiene **todo el conocimiento acumulado** del equipo:
- Errores que Claude ha cometido
- Soluciones a problemas comunes
- Convenciones del proyecto
- Stack técnico
- Prompts efectivos

### ¿Para qué sirve?
**Compounding Engineering**: Cada error se convierte en conocimiento institucional.
- Claude comete error → Lo agregas a CLAUDE.md → Nunca vuelve a pasar
- Con el tiempo, Claude se vuelve **experto en TU proyecto específico**

### ¿Cómo usarlo?

**Cada vez que Claude Code comete un error:**
```bash
# 1. Identificar el problema
# Ej: Claude usó <div> en React Native

# 2. Agregar a CLAUDE.md
## Mobile (React Native + Expo)
- ❌ NUNCA usar `<div>` → ✅ SIEMPRE usar `<View>`

# 3. Commit
git add CLAUDE.md
git commit -m "docs(claude): prohibir uso de <div> en React Native"
```

**En cada sesión de Claude Code:**
```bash
# Claude lee CLAUDE.md automáticamente si está en la raíz
# Asegúrate de mencionarlo en prompts importantes:

"Implementa auth siguiendo CLAUDE.md, ARCHITECTURE.md y AI-GUIDELINES.md"
```

### ¿Cuándo actualizar?
- ✅ Cada vez que encuentres un error repetitivo
- ✅ Después de code review (agregar feedback)
- ✅ Al finalizar cada sprint
- ✅ Cuando cambies stack o arquitectura

---

## 2️⃣ Slash Commands - APIs Personalizados

### ¿Qué son?
Comandos reutilizables que ejecutan workflows complejos con un solo comando.

Ubicación: `.claude/commands/`

### ¿Para qué sirven?
**Eliminar trabajo repetitivo**:
- En vez de escribir el mismo prompt 10 veces al día
- Defines el workflow UNA VEZ
- Lo ejecutas con `/nombre-comando`

### Comandos Esenciales

#### `/commit-push` - Commit + Push automático

**Archivo**: `.claude/commands/commit-push.md`

```markdown
# /commit-push

Analiza los cambios actuales y crea un commit + push.

**Pasos**:
1. Ejecutar: `git status --short`
2. Analizar cambios
3. Generar commit message en formato conventional commits
4. Ejecutar: `git add .`
5. Ejecutar: `git commit -m "[mensaje generado]"`
6. Ejecutar: `git push origin $(git branch --show-current)`
7. Confirmar éxito
```

**Uso**:
```bash
# En Claude Code, después de hacer cambios:
/commit-push

# Claude automáticamente:
# 1. Revisa los cambios
# 2. Crea commit message: "feat(auth): add JWT refresh token"
# 3. Hace commit y push
```

**¿Cuándo usar?**: Cada vez que termines una tarea pequeña (10-20 veces/día)

---

#### `/test-backend` - Correr tests backend

**Archivo**: `.claude/commands/test-backend.md`

```markdown
# /test-backend

Ejecuta tests del backend con coverage.

**Pasos**:
1. cd backend
2. npm test -- --coverage
3. Si hay fallos:
   a. Identificar el error
   b. Proponer fix
   c. Aplicar fix
   d. Re-ejecutar tests
4. Reportar coverage final
```

**Uso**:
```bash
/test-backend

# Claude:
# - Corre tests
# - Si fallan, los arregla automáticamente
# - Vuelve a correr hasta que pasen
```

**¿Cuándo usar?**: Antes de cada commit, después de refactorings

---

#### `/deploy-check` - Checklist pre-deploy

**Archivo**: `.claude/commands/deploy-check.md`

```markdown
# /deploy-check

Verifica que todo esté listo para deployment.

**Checklist**:
- [ ] Todos los tests pasan
- [ ] .env.example actualizado
- [ ] Migrations creadas y probadas
- [ ] CLAUDE.md actualizado si hay cambios
- [ ] No hay console.log en producción
- [ ] Variables de entorno documentadas
- [ ] README actualizado

**Acciones**:
1. Ejecutar cada check
2. Reportar qué falta
3. Ofrecer arreglar automáticamente
```

**Uso**:
```bash
/deploy-check

# Antes de hacer deploy a producción
```

---

#### `/fix-bug` - Template para bug fixes

**Archivo**: `.claude/commands/fix-bug.md`

```markdown
# /fix-bug

Template para debugging estructurado.

**Recopilar info**:
1. ¿Cuál es el error exacto?
2. ¿Cómo reproducirlo?
3. ¿Qué debería pasar?
4. ¿Logs relevantes?

**Proceso**:
1. Reproducir el bug localmente
2. Identificar la causa raíz
3. Proponer fix
4. Implementar fix
5. Crear test que reproduzca el bug
6. Verificar que el test pase
7. Actualizar CLAUDE.md si es error común
```

**Uso**:
```bash
/fix-bug

# Claude pregunta detalles del bug
# Luego sigue el proceso sistemático
```

---

### ¿Cómo crear nuevos slash commands?

1. Identifica un workflow que repites frecuentemente
2. Crea archivo en `.claude/commands/nombre-comando.md`
3. Define pasos claros y estructurados
4. Usa cuando necesites ese workflow

**Ejemplo: Crear `/create-component`**:

```markdown
# /create-component

Crea un nuevo componente React Native con estructura estándar.

**Input esperado**:
- Nombre del componente (ej: ProjectCard)
- Props esperados (ej: project, onPress)

**Pasos**:
1. Crear archivo `mobile/components/[Nombre].tsx`
2. Generar código:
   - Import React y tipos necesarios
   - Interface para Props
   - Componente funcional con TypeScript
   - StyleSheet con estilos básicos
   - Export default
3. Crear archivo de tests `mobile/components/__tests__/[Nombre].test.tsx`
4. Agregar exports a `mobile/components/index.ts`
```

---

## 3️⃣ Subagents - Revisores Automáticos

### ¿Qué son?
"Desarrolladores junior virtuales" que revisan tu código automáticamente.

Ubicación: `.claude/commands/subagents/`

### ¿Para qué sirven?
**Automatizar code review**:
- Revisar seguridad
- Generar tests
- Simplificar código complejo
- Verificar estándares

### Subagents Esenciales

#### `code-reviewer.md` - Revisor de código

```markdown
# Code Reviewer Subagent

**Rol**: Senior Engineer enfocado en calidad de código

**Checklist de revisión**:
- [ ] Código sigue convenciones de CLAUDE.md
- [ ] No hay lógica duplicada
- [ ] Nombres de variables son descriptivos
- [ ] Funciones tienen <= 50 líneas
- [ ] No hay TODO/FIXME sin issue asociado
- [ ] Imports están organizados
- [ ] No hay console.log en producción

**Acciones**:
1. Revisar cada archivo modificado
2. Identificar problemas
3. Sugerir refactorings
4. Aplicar cambios si es aprobado
```

**Uso**:
```bash
# Después de implementar feature:
@code-reviewer revisa los cambios en /backend/src/services/

# Claude Code ejecuta el subagent automáticamente
```

---

#### `security-checker.md` - Checker de seguridad

```markdown
# Security Checker Subagent

**Rol**: Security Engineer

**Checks**:
- [ ] No hay secrets hardcodeados
- [ ] Inputs están validados
- [ ] SQL injection prevenido (usar ORM)
- [ ] XSS prevenido (sanitizar outputs)
- [ ] CORS configurado correctamente
- [ ] Rate limiting en endpoints públicos
- [ ] Auth middleware en rutas protegidas

**Acciones**:
1. Escanear código en busca de vulnerabilidades
2. Reportar findings con severidad
3. Sugerir fixes
```

**Uso**:
```bash
@security-checker revisa el PR antes de merge
```

---

#### `test-generator.md` - Generador de tests

```markdown
# Test Generator Subagent

**Rol**: QA Engineer

**Objetivo**: Generar tests con 80%+ coverage

**Para cada función/endpoint**:
1. Happy path (caso exitoso)
2. Edge cases (valores límite)
3. Error cases (manejo de errores)
4. Integration tests si aplica

**Template**:
```javascript
describe('[Función/Endpoint]', () => {
  it('should [comportamiento esperado] when [condición]', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

**Acciones**:
1. Analizar código sin tests
2. Generar suite completa
3. Ejecutar tests
4. Ajustar hasta lograr 80%+ coverage
```

**Uso**:
```bash
@test-generator crea tests para /backend/src/services/project-service.js
```

---

### ¿Cómo crear subagents personalizados?

1. Define el "rol" del agente (ej: Performance Auditor)
2. Lista los checks específicos
3. Define acciones automatizadas
4. Guarda en `.claude/subagents/nombre.md`

---

## 4️⃣ Context Engineering - Estructura de Carpetas

### ¿Qué es?
En vez de escribir prompts largos, estructuras carpetas con contexto que Claude lee.

### Estructura Recomendada

```
docs/context/
├── business/
│   ├── monetization.md        # Free vs Pro, pricing
│   ├── user-personas.md       # Emprendedores target
│   └── roadmap.md             # Features planeadas
├── writing-styles/
│   ├── commit-messages.md     # Estilo de commits
│   ├── code-comments.md       # Cómo comentar código
│   └── pr-descriptions.md     # Template de PRs
└── examples/
    ├── good-pr-example.md     # Ejemplo de PR bien hecho
    ├── api-response-examples.json
    └── component-patterns.tsx
```

### ¿Para qué sirve?

**Prompts más simples y efectivos**:

❌ **Antes** (prompt largo):
```
Crea un PR description para esta feature de check-ins.
El formato debe incluir: summary, changes, testing, breaking changes.
Usa tono profesional pero amigable. Menciona el issue #123.
Include screenshots si hay cambios visuales...
```

✅ **Después** (con context engineering):
```
Crea PR description usando docs/context/writing-styles/pr-descriptions.md
```

### Contenido de Archivos de Contexto

#### `business/monetization.md`
```markdown
# Estrategia de Monetización

## Tiers

**Free**:
- 1 proyecto activo
- 2 check-ins/semana
- Generación de plan con IA
- Dashboard básico

**Pro ($12/mes)**:
- Proyectos ilimitados
- Check-ins ilimitados
- Análisis de bloqueos con IA
- Revisiones semanales avanzadas
- Soporte prioritario

## Conversión esperada
- Free → Pro: 15-20% después de 2 semanas
- Valor percibido: accountability + ahorro de tiempo

## Messaging
"Tu mentor personal que te mantiene enfocado en lo que importa"
```

**Uso**:
```
Escribe el onboarding screen usando info de docs/context/business/monetization.md
```

---

#### `writing-styles/commit-messages.md`
```markdown
# Estilo de Commit Messages

## Formato
`<type>(<scope>): <description>`

## Types
- feat: Nueva feature
- fix: Bug fix
- refactor: Refactorización
- test: Tests
- docs: Documentación

## Ejemplos BUENOS ✅
- `feat(auth): add JWT refresh token support`
- `fix(mobile): prevent AsyncStorage race condition`
- `test(api): add integration tests for projects endpoint`

## Ejemplos MALOS ❌
- `update stuff` (vago)
- `fix bug` (no especifica qué bug)
- `WIP` (work in progress, no commitear)

## Longitud
- Primera línea: max 72 caracteres
- Descripción opcional en líneas siguientes
```

**Uso**:
```
/commit-push
# Claude genera commits siguiendo este estilo automáticamente
```

---

## 5️⃣ Planning Mode - El Secreto de Boris

### ¿Qué es?
Modo donde Claude **planea** antes de codear.

### ¿Cómo activarlo?
```
Shift + Tab (2 veces)
```

### ¿Para qué sirve?
**"Measure twice, cut once" aplicado a IA**:
- Evita desperdiciar tokens en implementaciones incorrectas
- Te permite revisar el approach antes de codear
- Claude puede "one-shot" la implementación con buen plan

### Workflow Recomendado

```
1. Abrir Claude Code
2. Shift+Tab (2 veces) → Planning Mode
3. "Planea cómo implementar sistema de check-ins según SPRINT-4-CHECKINS.md"
4. Revisar plan, hacer ajustes
5. Aprobar plan
6. Shift+Tab → Auto-accept mode
7. "Implementa el plan"
8. Claude ejecuta todo de una vez
```

### Ejemplo

**Sin Planning Mode** (mal):
```
User: Implementa check-ins
Claude: [empieza a codear]
User: No, quería que fuera configurable
Claude: [refactoriza]
User: Tampoco, necesito cron job
Claude: [refactoriza de nuevo]
```
**Total**: 3 iteraciones, muchos tokens desperdiciados

**Con Planning Mode** (bien):
```
[Planning Mode ON]
User: Planea sistema de check-ins
Claude: 
Plan:
1. Modelo Checkin con campos...
2. Cron job daily con node-cron...
3. AI genera mensajes usando contexto...
4. API endpoints...
5. Mobile screen...

User: Perfecto, agrega también que sea configurable por usuario
Claude: [actualiza plan]

User: Apruebo el plan
[Auto-accept Mode ON]
Claude: [implementa TODO de una vez]
```
**Total**: 1 iteración, implementación perfecta

---

## 6️⃣ Parallel Instances - Orquestación

### ¿Qué es?
Ejecutar múltiples Claude Code en paralelo.

### Estrategias

#### Opción 1: Git Worktrees (RECOMENDADA para solo dev)
```bash
# Setup
git worktree add ../backend-work backend-dev
git worktree add ../mobile-work mobile-dev

# Terminal 1
cd ../backend-work
claude code
# "Implementa auth backend"

# Terminal 2 (simultáneo)
cd ../mobile-work
claude code
# "Implementa auth mobile"
```

#### Opción 2: Browser + Terminal (AVANZADA)
```bash
# Terminal: Backend
claude code
# "Implementa API endpoints"

# Browser (claude.ai): Mobile
# "Implementa UI consumiendo API"

# Usar --teleport para mover contexto entre ellos
```

### ¿Cuándo usar paralelo?
- ✅ Backend + Mobile (no se pisan)
- ✅ Features independientes
- ✅ Documentation + Code

### ¿Cuándo NO usar paralelo?
- ❌ Mismo archivo
- ❌ Dependencias cruzadas
- ❌ Solo un developer (mejor secuencial)

---

## 7️⃣ Verification Loops - Calidad Garantizada

### ¿Qué es?
Darle a Claude una forma de **verificar su propio trabajo**.

### Estrategias

#### Tests Automáticos
```bash
# En slash command /implement-feature:

**Pasos**:
1. Implementar feature
2. Crear tests
3. Ejecutar: npm test
4. Si fallan:
   a. Analizar error
   b. Fix código
   c. Volver a step 3
5. Solo terminar cuando tests pasen
```

#### Browser Testing (para Mobile)
```bash
# Subagent: mobile-tester.md

**Proceso**:
1. Implementar cambio
2. Iniciar Expo: npx expo start
3. Abrir en simulador
4. Probar flujo manualmente
5. Si hay bug:
   a. Screenshot del error
   b. Fix
   c. Volver a step 3
```

#### API Testing
```bash
# Slash command /test-api:

**Para cada endpoint**:
1. Hacer request con curl
2. Verificar status code correcto
3. Verificar response schema
4. Verificar edge cases
5. Reportar resultado
```

### ¿Por qué es crítico?
**Sin verification loop**: Código puede tener bugs silenciosos
**Con verification loop**: 2-3x mejor calidad, menos bugs en producción

---

## 8️⃣ Hooks - Automatización Total

### ¿Qué son?
Scripts que se ejecutan automáticamente en eventos específicos.

Ubicación: `.claude/hooks/`

### Hooks Útiles

#### `post-tool-use.sh` - Formatear después de editar

```bash
#!/bin/bash
# Se ejecuta después de que Claude edita código

# Formatear con Prettier
npx prettier --write "$1"

# Lint con ESLint
npx eslint --fix "$1"

echo "✅ Código formateado y linteado"
```

**Uso**: Automático, cada vez que Claude edita archivo

---

#### `pre-commit.sh` - Validar antes de commit

```bash
#!/bin/bash
# Se ejecuta antes de cada git commit

echo "🔍 Running pre-commit checks..."

# Tests
npm test
if [ $? -ne 0 ]; then
  echo "❌ Tests failed"
  exit 1
fi

# Lint
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ Lint failed"
  exit 1
fi

echo "✅ All checks passed"
```

**Uso**: Automático, Claude no puede commitear código roto

---

## 📊 Resumen: ¿Qué usar y cuándo?

| Herramienta | Frecuencia | Propósito |
|-------------|------------|-----------|
| **CLAUDE.md** | Diario | Acumular conocimiento |
| **Planning Mode** | Cada feature | Planear antes de codear |
| **/commit-push** | 10-20x/día | Commits rápidos |
| **/test-backend** | Pre-commit | Asegurar calidad |
| **@code-reviewer** | Pre-PR | Code review automático |
| **Context folders** | Siempre | Prompts más simples |
| **Hooks** | Automático | Formateo/lint |
| **Parallel instances** | Features grandes | Acelerar desarrollo |

---

## 🚀 Quick Start: Primer día con el workflow

```bash
# Día 1: Setup básico
1. Crear CLAUDE.md en raíz
2. Crear .claude/commands/commit-push.md
3. Crear docs/context/business/monetization.md

# Día 2-3: Familiarización
4. Usar Planning Mode en todas las features
5. Actualizar CLAUDE.md cuando Claude cometa errores
6. Crear 1-2 slash commands más

# Semana 2: Workflow completo
7. Agregar subagents (code-reviewer, test-generator)
8. Usar context engineering (carpetas business/, writing-styles/)
9. Configurar hooks (post-tool-use, pre-commit)

# Semana 3+: Maestría
10. Experimentar con parallel instances
11. MCP para integrar tools (Slack, etc.)
12. Refinar todo basado en experiencia
```

---

**TL;DR**: Este setup convierte Claude Code de "asistente" a "equipo completo" que:
1. Aprende de sus errores (CLAUDE.md)
2. Ejecuta workflows complejos (slash commands)
3. Se auto-revisa (subagents)
4. Planea antes de actuar (planning mode)
5. Se auto-verifica (verification loops)

**Resultado**: 5-10x más productividad en 2-3 semanas de adopción.