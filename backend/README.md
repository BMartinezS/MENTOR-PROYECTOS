# Mentor de Proyectos - MVP

App móvil de accountability para emprendedores que transforma ideas en planes ejecutables con check-ins proactivos impulsados por IA.

## Stack
- **Backend**: Node.js + Express + PostgreSQL
- **Mobile**: React Native + Expo
- **IA**: OpenAI GPT-4o-mini
- **Deploy**: Railway (backend) + EAS (mobile)

## Estructura
- `/backend` - API REST
- `/mobile` - App React Native con Expo
- `/ai-service` - Lógica de IA aislada
- `/docs` - Arquitectura y especificaciones

## Monetización
- **Free**: 1 proyecto, 2 check-ins/semana
- **Pro ($12/mes)**: Proyectos ilimitados, check-ins ilimitados

## Requisitos funcionales del backend
- **Campos de área y formato**: agregar a `projects` los campos `area` y `plan_format` para indicar el tipo de plan generado y asegurar que API/IA usen plantillas distintas (marketing vs producto vs operaciones).
- **Iteraciones del plan**: crear endpoints `POST /api/projects/:id/plan-iterations` y `GET /api/projects/:id/plan-iterations` que conversen con el servicio de IA y persistan historial, limitando a 1 reintento para Free y sin límite para Pro.
- **Pantalla de detalle de tareas**: proveer `GET /api/tasks/:taskId` con descripciones, entregables, dependencias y métricas; y `PATCH /api/tasks/:taskId` para que el plan Pro pueda editar título, notas, responsable, fechas y fase asociada.
- **Gestión de fases**: exponer `PATCH /api/projects/:id/phases/:phaseId` y `POST /api/projects/:id/phases/reorder` permitiendo a los usuarios Pro renombrar, agregar o reordenar fases; los Free quedan en modo solo lectura.

### Estado actual
- `projects` ahora incluye los campos `area` y `plan_format`, la API los valida y env�a al servicio de IA.
- Disponible el historial de iteraciones (`GET/POST /api/projects/:id/plan-iterations`) con 1 reintento para Free y sin l�mite para Pro.
- Nuevos endpoints `GET /api/tasks/:taskId` y `PATCH /api/tasks/:taskId` (solo Pro) con entregables, dependencias, m�tricas y notas editables.
- Gesti�n de fases habilitada para Pro v�a `PATCH /api/projects/:id/phases/:phaseId` y `POST /api/projects/:id/phases/reorder`.
- Se aplicaron los l�mites de monetizaci�n: Free solo puede tener 1 proyecto activo y recibe m�ximo 2 check-ins por semana; Pro no tiene tope.

## Development

### Setup Backend
```powershell
cd backend
npm install

# 1. Configura variables de entorno
copy .env.example .env  # Windows
# luego edita .env y define DATABASE_URL=postgresql://mentor:mentorpass@localhost:5432/mentor_proyectos

# 2. Levanta PostgreSQL local + pgAdmin
npm run db:up

# 3. Sincroniza el schema con Sequelize o aplica migrations/001-initial-schema.sql
npm run db:sync

# 4. Inicia el backend
npm run dev
```

Comandos útiles:
- `npm run db:down` detiene PostgreSQL/pgAdmin
- `npm run db:reset` elimina también el volumen
- `npm run db:check` valida la conexión definida en `.env`

### Setup Mobile App
```powershell
cd mobile
npm install
npx expo start
# Escanear QR con Expo Go app en tu celular
```

### Setup AI Service
```powershell
cd ai-service
npm install
npm run dev
```

### Weekly Reviews
- `AI_SERVICE_URL` debe apuntar al microservicio (usa `/weekly-review`).
- Habilita el cron semanal con `ENABLE_WEEKLY_REVIEW_SCHEDULER=true` si quieres que se genere solo.
- También puedes consultar/generar bajo demanda vía `GET /api/weekly-reviews/projects/:projectId` y guardar respuestas con `POST /api/weekly-reviews/:id/answers`.

## Trabajar con Claude Code

Cada sprint tiene su documento en `/docs/sprints/`. Usa branches por feature:

```powershell
git checkout -b feature/auth-backend
# Pasa docs/sprints/SPRINT-1-AUTH.md a Claude Code
```

## Sprints
- Sprint 0: Setup y fundamentos
- Sprint 1: Autenticación
- Sprint 2: CRUD de Proyectos
- Sprint 3: Generación de planes con IA
- Sprint 4: Sistema de check-ins
- Sprint 5: Registro de avances
- Sprint 6: Revisión semanal

## Deployment a Producción

**Hetzner VPS** (€5/mes):
- Ver `DEPLOYMENT.md` para guía completa
- Incluye Docker, Nginx, SSL, backups automáticos, CI/CD
- Tiempo de setup: ~1 hora

**App Móvil**:
- iOS: EAS Build → App Store
- Android: EAS Build → Google Play Store
- OTA Updates con Expo
