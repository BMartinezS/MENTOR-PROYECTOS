# Arquitectura del Sistema

## Overview
Monorepo con 3 módulos independientes que se comunican vía REST APIs.

## Módulos

### 1. Backend (`/backend`)
**Responsabilidad**: Lógica de negocio, persistencia, autenticación

**Stack**:
- Node.js 20+ + Express
- PostgreSQL 15+
- JWT para auth
- Bcrypt para passwords

**Estructura**:
```
backend/
├── src/
│   ├── models/         # Sequelize models
│   ├── controllers/    # Route handlers
│   ├── routes/         # Express routes
│   ├── middleware/     # Auth, validation, error handling
│   ├── services/       # Business logic
│   └── config/         # DB, env configs
├── tests/
└── package.json
```

**Responsabilidades**:
- Gestión de usuarios y sesiones
- CRUD de proyectos, fases, hitos, tareas
- Almacenamiento de check-ins y avances
- Orquestación de llamadas al AI Service

---

### 2. Mobile App (`/mobile`)
**Responsabilidad**: Aplicación móvil nativa (iOS + Android)

**Stack**:
- React Native + Expo SDK 51+
- Expo Router para navegación
- React Native Paper / NativeWind para UI
- Axios para HTTP
- Context API + AsyncStorage para estado

**Estructura**:
```
mobile/
├── app/                # Expo Router (file-based routing)
│   ├── (auth)/         # Auth screens
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/         # Main app tabs
│   │   ├── dashboard.tsx
│   │   ├── checkins.tsx
│   │   └── profile.tsx
│   └── project/
│       └── [id].tsx    # Dynamic route
├── components/         # Componentes reutilizables
│   ├── ProjectCard.tsx
│   ├── TaskList.tsx
│   └── CheckinItem.tsx
├── services/           # API clients
│   └── api.ts
├── contexts/           # Global state
│   └── AuthContext.tsx
├── utils/              # Helpers
└── app.json            # Expo config
```

**Pantallas principales**:
- `(auth)/login` - Login
- `(auth)/register` - Registro
- `(tabs)/dashboard` - Vista general de proyectos
- `(tabs)/checkins` - Check-ins pendientes
- `project/[id]` - Detalle de proyecto
- `(tabs)/profile` - Perfil de usuario

---

### 3. AI Service (`/ai-service`)
**Responsabilidad**: Toda interacción con OpenAI

**Stack**:
- Node.js + Express (micro-servicio)
- OpenAI SDK
- Rate limiting

**Estructura**:
```
ai-service/
├── src/
│   ├── prompts/        # Templates de prompts
│   ├── services/       # Llamadas a OpenAI
│   ├── validators/     # Validación de responses
│   └── controllers/    # Endpoints
└── package.json
```

**Endpoints**:
- `POST /generate-plan` - Crea plan desde idea
- `POST /generate-checkin` - Mensaje de check-in
- `POST /generate-weekly-review` - Resumen semanal
- `POST /suggest-task-split` - Divide tareas grandes

---

## Flujo de datos típico

```
Usuario crea proyecto en app móvil
    ↓
Mobile → Backend /projects/create
    ↓
Backend → AI Service /generate-plan
    ↓
AI Service → OpenAI GPT-4o-mini
    ↓
AI Service → Backend (plan generado)
    ↓
Backend → PostgreSQL (guarda proyecto + plan)
    ↓
Backend → Mobile (proyecto creado)
    ↓
Mobile muestra plan para confirmación
```

## Base de datos

**PostgreSQL** con estas tablas principales:
- `users` - Usuarios
- `projects` - Proyectos
- `phases` - Fases del proyecto
- `milestones` - Hitos
- `tasks` - Tareas
- `checkins` - Check-ins enviados/respondidos
- `progress_logs` - Registro de avances

Ver `DB-SCHEMA.md` para detalles.

## Seguridad

- JWT con expiración 7 días
- Refresh tokens en tabla separada
- Rate limiting en AI Service (100 req/hora por usuario)
- Passwords con bcrypt (10 rounds)
- CORS configurado para desarrollo local y Expo
- Helmet.js en todos los services
- Tokens almacenados en AsyncStorage (encrypted en producción)

## Push Notifications (futuro post-MVP)

- Expo Push Notifications para check-ins
- Backend envía notificaciones via Expo Push API
- Usuario puede configurar horarios preferidos

## Desarrollo Mobile

**Expo Go (desarrollo)**:
```bash
cd mobile
npx expo start
# Escanear QR con Expo Go app
```

**Preview Builds (testing)**:
```bash
eas build --profile preview --platform android
eas build --profile preview --platform ios
```

## Deployment

### Backend y AI Service - Hetzner VPS
**Infraestructura**: VPS Hetzner CPX11 (2GB RAM, 2 vCPU, ~€5/mes)

**Stack de deployment**:
- Docker + Docker Compose para containerización
- PostgreSQL 15 en container
- Nginx como reverse proxy
- Let's Encrypt para SSL
- PM2 como alternativa a Docker (opcional)

**Arquitectura en VPS**:
```
Internet
    ↓
Nginx (puerto 80/443)
    ↓
┌─────────────────────────────┐
│   Hetzner VPS (CPX11)       │
│                             │
│  Backend (puerto 3000)      │
│  AI Service (puerto 3001)   │
│  PostgreSQL (puerto 5432)   │
└─────────────────────────────┘
```

**Docker Compose setup**:
```yaml
services:
  postgres:
    image: postgres:15
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: unless-stopped

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    restart: unless-stopped

  ai-service:
    build: ./ai-service
    ports:
      - "3001:3001"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    restart: unless-stopped
```

**URL del API**: `https://api.tu-dominio.com/api`

---

### Mobile App
- **Development**: Expo Go
- **Production**: 
  - iOS: App Store via EAS Build
  - Android: Google Play Store via EAS Build
  - OTA Updates via Expo Updates

### Configuración Expo
```json
{
  "expo": {
    "name": "Mentor de Proyectos",
    "slug": "mentor-proyectos",
    "version": "1.0.0",
    "platforms": ["ios", "android"],
    "extra": {
      "apiUrl": "https://api.tu-dominio.com/api"
    }
  }
}
```

---

## CI/CD

**GitHub Actions** para deployment automático:

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Hetzner VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          script: |
            cd /var/www/mentor-proyectos
            git pull
            docker-compose down
            docker-compose up -d --build
```

---

## Backups

**PostgreSQL backups automáticos**:
- Cron diario a las 2 AM
- Retención: 7 días
- Script: `/root/backup.sh`

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec postgres pg_dump -U postgres mentor_proyectos > /backups/db_$DATE.sql
find /backups -name "*.sql" -mtime +7 -delete
```

---

## Monitoreo

- **PM2 Plus**: Monitoreo de procesos (free tier)
- **Logs**: `docker-compose logs -f [service]`
- **Uptime**: UptimeRobot (free) para alertas de downtime

---

## Costos estimados

| Item | Costo/mes |
|------|-----------|
| Hetzner VPS CPX11 | €5 |
| Dominio (.com) | €1 |
| OpenAI API (~100 users) | $10-15 |
| SSL (Let's Encrypt) | Gratis |
| **Total** | **~€20-25/mes** |