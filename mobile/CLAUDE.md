# CLAUDE.md - Conocimiento Institucional del Proyecto

**Propósito**: Este archivo contiene TODOS los errores que Claude ha cometido y las convenciones que debe seguir. Se actualiza CADA VEZ que Claude comete un error o aprendemos algo nuevo.

---

## 🚫 Errores que Claude NO debe repetir

### Backend (Node.js + Express)

**Database & ORM**
- ❌ NUNCA usar `localhost` hardcodeado → ✅ SIEMPRE usar `process.env.DATABASE_URL`
- ❌ NUNCA olvidar validar JWT en rutas protegidas → ✅ SIEMPRE usar middleware `authenticate`
- ❌ NUNCA mezclar snake_case y camelCase → ✅ PostgreSQL usa `snake_case`, Sequelize modelos usan `camelCase`
- ❌ NUNCA hacer queries sin índices en columnas frecuentes → ✅ SIEMPRE crear índices en `user_id`, `created_at`, etc.
- ❌ NUNCA exponer errores de DB directamente → ✅ SIEMPRE usar error handler genérico

**Authentication & Security**
- ❌ NUNCA guardar JWT_SECRET en código → ✅ SIEMPRE en `.env`
- ❌ NUNCA usar bcrypt con rounds < 10 → ✅ SIEMPRE usar 10 rounds
- ❌ NUNCA permitir CORS desde cualquier origen → ✅ SIEMPRE configurar origins específicos
- ❌ NUNCA loguear passwords/tokens → ✅ SIEMPRE sanitizar logs

**API Design**
- ❌ NUNCA retornar toda la data sin paginación → ✅ SIEMPRE limitar a 50 items + cursor
- ❌ NUNCA usar status codes incorrectos → ✅ 201 para creates, 204 para deletes
- ❌ NUNCA olvidar validar inputs → ✅ SIEMPRE usar Joi/Yup antes de procesar

---

### Mobile (React Native + Expo)

**Componentes & Styling**
- ❌ NUNCA usar `<div>` → ✅ SIEMPRE usar `<View>`
- ❌ NUNCA usar `<span>` → ✅ SIEMPRE usar `<Text>`
- ❌ NUNCA usar `className` → ✅ SIEMPRE usar `style={styles.container}`
- ❌ NUNCA usar CSS directo → ✅ SIEMPRE usar StyleSheet.create()
- ❌ NUNCA hardcodear colores → ✅ SIEMPRE usar theme/constants

**Storage & State**
- ❌ NUNCA usar `localStorage` → ✅ SIEMPRE usar AsyncStorage (es asíncrono, requiere await)
- ❌ NUNCA olvidar try/catch en AsyncStorage → ✅ SIEMPRE manejar errores
- ❌ NUNCA usar useState para data persistente → ✅ SIEMPRE usar AsyncStorage + Context

**Navigation**
- ❌ NUNCA confundir paths de Expo Router → ✅ `app/(tabs)/dashboard.tsx` = ruta `/dashboard`
- ❌ NUNCA usar React Navigation manualmente → ✅ SIEMPRE usar Expo Router (file-based)
- ❌ NUNCA olvidar `_layout.tsx` → ✅ Cada carpeta necesita su layout

**Performance**
- ❌ NUNCA renderizar listas largas con .map() → ✅ SIEMPRE usar FlatList/SectionList
- ❌ NUNCA hacer múltiples re-renders → ✅ SIEMPRE usar useMemo/useCallback donde corresponda
- ❌ NUNCA cargar imágenes pesadas sin optimizar → ✅ SIEMPRE usar Image con resize

---

### AI Service (OpenAI Integration)

**API Calls**
- ❌ NUNCA asumir que OpenAI retorna JSON válido → ✅ SIEMPRE validar con try/catch + schema
- ❌ NUNCA enviar datos sensibles en prompts → ✅ SIEMPRE sanitizar info del usuario
- ❌ NUNCA olvidar rate limiting → ✅ Free tier: 100 req/hora, Pro: ilimitado
- ❌ NUNCA usar GPT-4 → ✅ SIEMPRE usar gpt-4o-mini (más barato, suficiente)

**Prompts**
- ❌ NUNCA prompts vagos → ✅ SIEMPRE incluir estructura JSON esperada
- ❌ NUNCA olvidar `response_format: {type: "json_object"}` → ✅ SIEMPRE especificarlo
- ❌ NUNCA asumir que IA divide bien tareas → ✅ SIEMPRE validar que horas estimadas < horas disponibles

**Error Handling**
- ❌ NUNCA dejar fallar silenciosamente → ✅ SIEMPRE loguear errores de OpenAI
- ❌ NUNCA reintentar infinitamente → ✅ SIEMPRE límite de 3 reintentos
- ❌ NUNCA fallar todo si IA falla → ✅ SIEMPRE tener fallback manual

---

## ✅ Convenciones del Proyecto

### Estructura de Carpetas (NO CAMBIAR)

```
mentor-proyectos/
├── backend/
│   └── src/
│       ├── models/       # Sequelize models (User, Project, Task, etc.)
│       ├── services/     # Business logic (TODA la lógica va aquí)
│       ├── controllers/  # HTTP handlers (solo llaman a services)
│       ├── routes/       # Express routes (solo definen endpoints)
│       ├── middleware/   # Auth, validation, error handling
│       └── config/       # DB, env configs
├── mobile/
│   └── app/
│       ├── (auth)/       # Pantallas de login/register
│       ├── (tabs)/       # Dashboard, checkins, profile
│       └── contexts/     # AuthContext, etc.
└── ai-service/
    └── src/
        ├── prompts/      # Templates de prompts
        ├── services/     # Llamadas a OpenAI
        └── validators/   # Validación de responses
```

### Naming Conventions

**Archivos**:
- Backend: `kebab-case` → `user-service.js`, `auth-middleware.js`
- Mobile: `PascalCase` para componentes → `ProjectCard.tsx`, `LoginScreen.tsx`
- Mobile: `camelCase` para utils → `apiClient.ts`, `formatDate.ts`

**Código**:
- Funciones: `camelCase` → `getUserProjects()`, `createCheckin()`
- Clases/Componentes: `PascalCase` → `UserModel`, `ProjectCard`
- Constantes: `UPPER_SNAKE_CASE` → `MAX_PROJECTS_FREE`, `JWT_EXPIRATION`
- Variables privadas: `_underscore` → `_internalCache`

### Git Commits (Conventional Commits)

Formato: `<type>(<scope>): <description>`

**Types**:
- `feat`: Nueva feature → `feat(auth): add JWT refresh token`
- `fix`: Bug fix → `fix(projects): correct progress calculation`
- `refactor`: Refactorización → `refactor(api): extract validation middleware`
- `test`: Tests → `test(auth): add login endpoint tests`
- `docs`: Documentación → `docs(api): update endpoint specs`
- `chore`: Mantenimiento → `chore(deps): update sequelize to v6.35`

**Ejemplos**:
```
feat(checkins): implement adaptive frequency based on user hours
fix(mobile): prevent AsyncStorage race condition on logout
refactor(ai): extract prompt templates to separate files
test(backend): add integration tests for project creation
docs(deployment): add Hetzner VPS setup guide
```

---

## 🎯 Stack Técnico (NO CAMBIAR sin consenso del equipo)

### Backend
- **Runtime**: Node.js 20+ (LTS)
- **Framework**: Express 4.x
- **Database**: PostgreSQL 15+
- **ORM**: Sequelize 6.x
- **Auth**: JWT (jsonwebtoken)
- **Validation**: Joi
- **Testing**: Jest + Supertest

### Mobile
- **Framework**: React Native + Expo SDK 51+
- **Language**: TypeScript
- **Router**: Expo Router (file-based)
- **State**: Context API + AsyncStorage
- **UI**: React Native Paper
- **HTTP**: Axios
- **Testing**: Jest + React Native Testing Library

### AI Service
- **Model**: OpenAI GPT-4o-mini
- **Library**: OpenAI SDK oficial (NO fetch directo)
- **Rate Limiting**: express-rate-limit

### Deployment
- **Backend/AI**: Hetzner VPS CPX11 (€5/mes)
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx + Let's Encrypt SSL
- **CI/CD**: GitHub Actions
- **Mobile**: EAS Build (Expo Application Services)

---

## 📝 Prompts Efectivos para Este Proyecto

### Template General
```
Implementa [feature] siguiendo:
- ARCHITECTURE.md para estructura
- AI-GUIDELINES.md para estilo de código
- CLAUDE.md para convenciones

Trabajar SOLO en carpeta /[backend|mobile|ai-service].
Incluir tests con 80%+ coverage.
```

### Crear Nueva Feature (ejemplo: check-ins)
```
Implementa el sistema de check-ins según SPRINT-4-CHECKINS.md.

Contexto:
- Backend: crear modelo Checkin + servicio + rutas
- AI Service: generar mensajes personalizados
- Mobile: pantalla de check-ins pendientes

Criterios:
1. Cron job diario a las 9 AM
2. IA personaliza mensajes según contexto del usuario
3. Usuario puede responder Sí/No + notas
4. Tests unitarios + integración
```

### Bug Fix
```
Bug: El endpoint GET /api/projects/:id retorna 404 incluso con ID válido.

Pasos para debug:
1. Revisar logs: docker-compose logs backend
2. Verificar que el proyecto existe en DB
3. Verificar ownership (user_id debe coincidir)
4. Verificar middleware de autenticación

Fix debe:
- Corregir validación de ownership
- Agregar mejor logging
- Incluir test que reproduce el bug
```

### Refactoring
```
Refactoriza el módulo de autenticación para mejorar testabilidad.

Cambios:
1. Extraer lógica de bcrypt a auth-service.js
2. Extraer generación de JWT a token-service.js
3. Controllers deben solo llamar a services
4. Todos los services deben tener tests unitarios

No cambiar:
- API contracts (endpoints, request/response formats)
- Database schema
```

---

## 🔄 Actualizaciones Recientes (Changelog Interno)

### 2025-01-17
- ✅ Cambiamos de React web a React Native + Expo
- ✅ Deploy configurado en Hetzner VPS (antes Railway)
- ✅ Agregado CLAUDE.md para knowledge institucional
- ✅ Estructura de slash commands creada
- ✅ Configuración de subagents para code review

### 2025-01-16
- Decisión de monetización: Free (1 proyecto) vs Pro ($12/mes)
- GPT-4o-mini para TODA la IA (no usar GPT-4)
- PostgreSQL como única DB (no usar MongoDB)

---

## 🎓 Aprendizajes del Equipo

### Lo que funciona bien
- Planning mode (Shift+Tab 2 veces) antes de implementar → 90% one-shot success
- Verificación automática con tests → reduce bugs en 70%
- CLAUDE.md actualizado frecuentemente → menos errores repetidos

### Anti-patterns detectados
- Prompts muy largos → mejor estructura de carpetas + docs
- No usar planning mode → múltiples iteraciones innecesarias
- Hardcodear valores → siempre usar .env

---

## 🚨 Reglas Críticas (NUNCA ROMPER)

1. **NUNCA commitear secrets**: `.env` está en `.gitignore` por seguridad
2. **NUNCA skipear tests**: Todo PR necesita tests que pasen
3. **NUNCA deployar sin validar**: Probar en local ANTES de push
4. **NUNCA ignorar este archivo**: Si Claude comete error, ACTUALIZAR CLAUDE.md
5. **NUNCA cambiar stack sin discusión**: Cambios mayores requieren consenso del equipo

---

## 📚 Referencias Rápidas

- **Architecture**: Ver `/docs/ARCHITECTURE.md`
- **API Spec**: Ver `/docs/API-SPEC.md`
- **Database**: Ver `/docs/DB-SCHEMA.md`
- **Deployment**: Ver `/docs/DEPLOYMENT.md`
- **Sprints**: Ver `/docs/sprints/SPRINT-[0-6].md`

---

## 🔧 Mantenimiento de este archivo

**Cuándo actualizar**:
- ✅ Cada vez que Claude comete un error
- ✅ Cada vez que aprendemos una mejor práctica
- ✅ Cada vez que cambiamos stack o arquitectura
- ✅ Después de cada sprint completado

**Cómo actualizar**:
1. Identifica el error/aprendizaje
2. Agrégalo en la sección correcta
3. Usa formato claro: ❌ Error → ✅ Solución
4. Commit: `docs(claude): add [descripción del aprendizaje]`
5. El equipo revisa en PR

**Responsables**: TODO el equipo (cada developer actualiza cuando encuentra algo)

---

**Última actualización**: 2025-01-17  
**Versión**: 1.0  
**Mantenido por**: Equipo Mentor de Proyectos