# Mentor de Proyectos - MVP

App móvil de accountability para emprendedores que transforma ideas en planes ejecutables con check-ins proactivos impulsados por IA.

## Stack
- **Backend**: Node.js + Express + PostgreSQL
- **Mobile**: React Native + Expo
- **IA**: OpenAI gpt-5-nano
- **Deploy**: Railway (backend) + EAS (mobile)

## Estructura
- `/backend` - API REST
- `/mobile` - App React Native con Expo
- `/ai-service` - Lógica de IA aislada
- `/docs` - Arquitectura y especificaciones

## Monetización
- **Free**: 1 proyecto, 2 check-ins/semana
- **Pro ($12/mes)**: Proyectos ilimitados, check-ins ilimitados

## Lineamientos para el servicio de IA
- **Plantillas por área**: el prompt y el orquestador deben recibir el campo `project_area` (marketing, producto, operaciones, etc.) y elegir un formato de salida diferente (secciones, KPIs, tono) para cada área.
- **Iteraciones del plan**: expone un endpoint (p.ej. `POST /plans/:projectId/iterations`) que, dado feedback del usuario + el plan previo, genere una nueva versión; los usuarios Free obtienen una iteración adicional y los Pro pueden solicitar múltiples, conservando historial.
- **Apoyo a la edición manual**: cada respuesta debe incluir identificadores estables de fases y tareas para que el backend/mobile puedan permitir edición puntual (mover tareas de fase, actualizar campos) sin perder la relación con la IA.

## Development

### Setup Backend
```powershell
cd backend
npm install
npm run dev
```

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

> Copia `.env.example` a `.env` y define `OPENAI_API_KEY`, `OPENAI_MODEL` (por defecto gpt-5-nano) y opcionalmente `OPENAI_TEMPERATURE` (0 a 2), `OPENAI_PLAN_MAX_TOKENS` (p.ej. 600) y `OPENAI_RESPONSE_FORMAT` (`auto`/`disabled`/`json_object`).

#### Ejecutar AI Service en Docker
```powershell
cd ai-service
docker build -t mentor-ai-service .
docker run --env-file .env -p 3001:3001 mentor-ai-service
```

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

