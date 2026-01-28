# Mentor de Proyectos - MVP

App móvil de accountability para emprendedores que transforma ideas en planes ejecutables con check-ins proactivos impulsados por IA.

## Stack
- **Backend**: Node.js + Express + PostgreSQL
- **Mobile**: React Native + Expo
- **IA**: OpenAI GPT-4o-mini
- **Deploy**: Hetzner VPS (backend) + EAS (mobile)

## Estructura
```
mentor-proyectos/
├── backend/                    # API REST (Node.js + Express + PostgreSQL)
│   ├── src/                    # Código fuente del backend
│   ├── tests/                  # Tests del backend
│   ├── Dockerfile              # Docker configuration
│   └── package.json
├── mobile/                     # App React Native con Expo
│   ├── app/                    # Código fuente de la app
│   ├── constants/              # Configuraciones y temas
│   └── package.json
├── ai-service/                 # Servicio de IA (OpenAI integration)
│   ├── src/                    # Lógica de IA aislada
│   ├── tests/                  # Tests del AI service
│   ├── Dockerfile              # Docker configuration
│   └── package.json
├── docs/                       # Arquitectura y especificaciones
├── scripts/                    # Scripts de desarrollo
└── docker-compose*.yml        # Configuraciones Docker
```

## Monetización
- **Free**: 1 proyecto, 2 check-ins/semana
- **Pro ($12/mes)**: Proyectos ilimitados, check-ins ilimitados

## Requisitos funcionales clave
- **Formatos según el área**: el plan generado y las pantallas asociadas deben cambiar de estructura dependiendo del tipo de proyecto (producto digital, marketing, operaciones, etc.), con secciones, KPIs y bloques visuales adaptados para cada disciplina.
- **Iteraciones guiadas por IA**: cualquier usuario puede solicitar un nuevo plan si el generado por la IA no encaja, y los usuarios Pro pueden encadenar múltiples iteraciones comparando versiones y eligiendo la definitiva.
- **Edición profunda en plan Pro**: la app necesita una pantalla de detalle de tareas con campos editables (nombre, alcance, responsable, fechas) y, para clientes Pro, controles para reordenar tareas, moverlas entre fases y ajustar la estructura de fases completas.

## Development

### Opción 1: Docker (Recomendado)
```powershell
# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu OPENAI_API_KEY

# Levantar todo el stack
.\scripts\docker-dev.ps1 dev:up

# Verificar que funciona
.\scripts\docker-dev.ps1 dev:status

# Ver logs
.\scripts\docker-dev.ps1 dev:logs
```

### Opción 2: Setup Manual

#### Backend
```powershell
cd backend
npm install
npm run dev
```

#### Mobile App
```powershell
cd mobile
npm install
npx expo start
# Escanear QR con Expo Go app en tu celular
```

#### AI Service
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
