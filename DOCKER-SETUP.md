# 🐳 Docker Setup - Mentor de Proyectos

Esta guía explica cómo ejecutar el stack completo de Mentor de Proyectos usando Docker.

## 📋 Requisitos

- Docker Desktop o Docker Engine
- Docker Compose v2+
- Al menos 4GB RAM disponible
- 10GB espacio en disco

## 🚀 Inicio Rápido

### 1. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar con tus configuraciones
# IMPORTANTE: Configurar al menos OPENAI_API_KEY y POSTGRES_PASSWORD
```

### 2. Levantar el Stack de Desarrollo

```bash
# Opción 1: Comando directo
docker-compose -f docker-compose.dev.yml up -d

# Opción 2: Script de conveniencia (Windows)
.\scripts\docker-dev.ps1 dev:up

# Opción 3: Script de conveniencia (Linux/Mac)
chmod +x scripts/docker-dev.sh
./scripts/docker-dev.sh dev:up
```

### 3. Verificar que Todo Funciona

```bash
# Verificar estado de contenedores
docker-compose -f docker-compose.dev.yml ps

# O usar el script
.\scripts\docker-dev.ps1 dev:status
```

## 🌍 Servicios Disponibles

Una vez levantado el stack, tendrás acceso a:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Backend API** | http://localhost:3000 | API REST principal |
| **AI Service** | http://localhost:3001 | Servicio de OpenAI |
| **PostgreSQL** | localhost:5433 | Base de datos |
| **pgAdmin** | http://localhost:5050 | Administrador de BD |

### Health Checks

```bash
# Backend
curl http://localhost:3000/health

# AI Service
curl http://localhost:3001/health
```

## 🔧 Comandos Útiles

### Desarrollo

```bash
# Iniciar desarrollo
.\scripts\docker-dev.ps1 dev:up

# Ver logs de todos los servicios
.\scripts\docker-dev.ps1 dev:logs

# Ver logs de un servicio específico
.\scripts\docker-dev.ps1 dev:logs backend

# Abrir shell en un contenedor
.\scripts\docker-dev.ps1 dev:shell backend

# Reconstruir servicios
.\scripts\docker-dev.ps1 dev:rebuild

# Detener desarrollo
.\scripts\docker-dev.ps1 dev:down

# Reset completo (¡BORRA TODOS LOS DATOS!)
.\scripts\docker-dev.ps1 dev:reset
```

### Base de Datos

```bash
# Abrir shell PostgreSQL
.\scripts\docker-dev.ps1 db:shell

# Crear backup
.\scripts\docker-dev.ps1 db:backup

# Crear backup con nombre específico
.\scripts\docker-dev.ps1 db:backup mi_backup.sql

# Restaurar backup
.\scripts\docker-dev.ps1 db:restore mi_backup.sql
```

### Producción

```bash
# Levantar en modo producción
docker-compose up -d

# O con script
.\scripts\docker-dev.ps1 prod:up

# Ver logs de producción
.\scripts\docker-dev.ps1 prod:logs

# Detener producción
.\scripts\docker-dev.ps1 prod:down
```

## 📁 Estructura de Archivos Docker

```
mentor-proyectos/
├── docker-compose.yml              # Configuración de producción
├── docker-compose.dev.yml          # Configuración de desarrollo
├── .env.example                    # Variables de entorno de ejemplo
├── .env                           # Variables de entorno (crear manualmente)
├── scripts/
│   ├── docker-dev.ps1             # Scripts PowerShell (Windows)
│   ├── docker-dev.sh              # Scripts Bash (Linux/Mac)
│   └── init-db.sql                # Inicialización de BD
├── backend/
│   ├── Dockerfile                 # Backend Docker image
│   ├── .dockerignore              # Exclusiones para backend
│   └── src/                       # Código fuente del backend
├── mobile/
│   └── app/                       # Aplicación React Native
└── ai-service/
    ├── Dockerfile                 # AI Service Docker image
    ├── .dockerignore              # Exclusiones para AI service
    └── src/                       # Código fuente del AI service
```

## ⚙️ Configuración

### Variables de Entorno Importantes

```bash
# ===== REQUERIDAS =====
OPENAI_API_KEY=sk-your-openai-api-key-here
POSTGRES_PASSWORD=your-secure-password

# ===== BACKEND =====
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGINS=http://localhost:19006,http://localhost:8081

# ===== FEATURES =====
ENABLE_CHECKIN_SCHEDULER=false          # true en producción
ENABLE_WEEKLY_REVIEW_SCHEDULER=false    # true en producción
DB_SYNC=true                            # false en producción

# ===== REVENUECAT =====
REVENUECAT_WEBHOOK_SECRET=your-webhook-secret

# ===== EXPO =====
EXPO_ACCESS_TOKEN=your-expo-access-token
```

### Puertos Utilizados

| Puerto | Servicio | Configurable |
|--------|----------|-------------|
| 3000 | Backend API | `BACKEND_PORT` |
| 3001 | AI Service | `AI_SERVICE_PORT` |
| 5433 | PostgreSQL | `POSTGRES_PORT` |
| 5050 | pgAdmin | `PGADMIN_PORT` |

## 🔍 Debugging

### Ver Logs Detallados

```bash
# Logs de todos los servicios
docker-compose -f docker-compose.dev.yml logs -f

# Logs de un servicio específico
docker-compose -f docker-compose.dev.yml logs -f backend

# Últimas 100 líneas
docker-compose -f docker-compose.dev.yml logs --tail=100 backend
```

### Inspeccionar Contenedores

```bash
# Listar contenedores
docker ps

# Inspeccionar un contenedor
docker inspect mentor-backend-dev

# Ver stats de recursos
docker stats
```

### Conectar a Base de Datos

#### Opción 1: Desde pgAdmin (Recomendado)
1. Ir a http://localhost:5050
2. Login: `admin@mentor.dev` / `admin123`
3. Agregar servidor:
   - Host: `postgres`
   - Port: `5432`
   - Database: `mentor_proyectos_dev`
   - Username: `mentor_user`
   - Password: (tu POSTGRES_PASSWORD)

#### Opción 2: Comando directo
```bash
docker-compose -f docker-compose.dev.yml exec postgres psql -U mentor_user mentor_proyectos_dev
```

#### Opción 3: Cliente externo
```bash
# Configuración para cliente SQL externo
Host: localhost
Port: 5433
Database: mentor_proyectos_dev
Username: mentor_user
Password: tu_POSTGRES_PASSWORD
```

## 🚨 Troubleshooting

### Problemas Comunes

#### Puerto ya en uso
```bash
# Ver qué proceso usa el puerto
netstat -ano | findstr :3000

# Cambiar puerto en .env
BACKEND_PORT=3010
```

#### Contenedor no inicia
```bash
# Ver logs de error
docker-compose -f docker-compose.dev.yml logs backend

# Reconstruir imagen
docker-compose -f docker-compose.dev.yml build --no-cache backend
```

#### Base de datos no conecta
```bash
# Verificar que PostgreSQL esté saludable
docker-compose -f docker-compose.dev.yml ps postgres

# Verificar logs de PostgreSQL
docker-compose -f docker-compose.dev.yml logs postgres

# Reset completo de la BD
docker-compose -f docker-compose.dev.yml down -v
```

#### Variables de entorno no funcionan
```bash
# Verificar que .env existe
ls -la .env

# Ver variables cargadas en un contenedor
docker-compose -f docker-compose.dev.yml exec backend env | grep OPENAI
```

### Comandos de Diagnóstico

```bash
# Ver espacio usado por Docker
docker system df

# Limpiar imágenes no usadas
docker image prune

# Limpiar todo (¡CUIDADO!)
docker system prune -a

# Ver logs del daemon de Docker
# Windows: Ver Event Viewer
# Linux: journalctl -u docker.service
```

## 🚀 Deployment a Producción

### En Hetzner VPS

```bash
# 1. Copiar archivos al servidor
scp -r . user@your-server:/opt/mentor-proyectos/

# 2. En el servidor
cd /opt/mentor-proyectos
cp .env.example .env
# Editar .env con configuraciones de producción

# 3. Levantar en modo producción
docker-compose up -d

# 4. Verificar
docker-compose ps
docker-compose logs
```

### Nginx Reverse Proxy (Opcional)

```nginx
# /etc/nginx/sites-available/mentor-proyectos
server {
    listen 80;
    server_name api.mentorproyectos.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📚 Referencias

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

---

**¿Problemas?** Revisa los logs con `.\scripts\docker-dev.ps1 dev:logs` o abre un issue en el repositorio.