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

## Requisitos UX/producto en mobile
- **Formatos visuales por área**: la vista de proyectos debe renderizar tarjetas y planes con layout distinto según el `project.area` (colores, iconografía y orden de secciones adaptado para marketing, producto, operaciones, etc.).
- **Cambiar/iterar plan**: desde la pantalla de plan se necesita un CTA "Iterar plan" que mande feedback al backend/IA; usuarios Free ven un aviso de único reintento y los Pro pueden solicitar múltiples iteraciones y comparar resultados.
- **Pantalla de detalle de tarea**: al tocar una tarea debe abrir un modal/pantalla con descripción extendida, checklist, métricas y acciones; usuarios Free ven la información, mientras que los Pro pueden editar campos, mover la tarea de fase y reordenar tareas dentro de la misma fase.
- **Gestión de fases para Pro**: incluir un flujo (por ejemplo, desde el menú contextual del proyecto) para renombrar fases, reordenarlas o crear nuevas; sólo se habilita para clientes Pro y debe sincronizarse inmediatamente con el backend.

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

### Configurar la URL del backend

La app intenta conectarse al backend usando la variable `EXPO_PUBLIC_API_URL` y, si no existe, el valor definido en `app.json > expo.extra.apiUrl`. En dispositivos fisicos, evita usar `localhost` y apunta a la IP o dominio accesible desde la red (por ejemplo `http://192.168.1.50:3000/api`).

Ejemplos:

```powershell
# Windows PowerShell
$env:EXPO_PUBLIC_API_URL="http://TU_IP:3000/api"; npx expo start

# macOS/Linux
EXPO_PUBLIC_API_URL="http://TU_IP:3000/api" npx expo start
```

Como alternativa, puedes editar `mobile/app.json` y cambiar `expo.extra.apiUrl` para dejar un valor persistente.

### Modo Mock (sin backend)

Para navegar el flujo completo sin backend corriendo:
```powershell
$env:EXPO_PUBLIC_USE_MOCK_API="1"; npx expo start
```

Credenciales demo (cualquier password):
- Email: `demo@mentor.app`
- Password: `demo`

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
