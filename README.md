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