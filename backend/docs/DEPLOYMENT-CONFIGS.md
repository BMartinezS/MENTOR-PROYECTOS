# Configuraciones de Deployment - Archivos listos para copiar

Este archivo contiene todas las configuraciones necesarias listas para copiar/pegar.

---

## 1. docker-compose.yml

Ubicación: `/var/www/mentor-proyectos/docker-compose.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: mentor-postgres
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./backend/migrations:/docker-entrypoint-initdb.d
    ports:
      - "127.0.0.1:5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    container_name: mentor-backend
    environment:
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: ${NODE_ENV}
      PORT: ${PORT}
    ports:
      - "127.0.0.1:3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  ai-service:
    build:
      context: ./ai-service
      dockerfile: Dockerfile
    container_name: mentor-ai-service
    environment:
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      PORT: ${AI_PORT}
      NODE_ENV: ${NODE_ENV}
    ports:
      - "127.0.0.1:3001:3001"
    restart: unless-stopped

volumes:
  pgdata:
    driver: local
```

---

## 2. .env

Ubicación: `/var/www/mentor-proyectos/.env`

```env
# PostgreSQL
DB_PASSWORD=CAMBIA_ESTO_POR_PASSWORD_SEGURO
POSTGRES_DB=mentor_proyectos
POSTGRES_USER=postgres

# Backend
DATABASE_URL=postgresql://postgres:CAMBIA_ESTO_POR_PASSWORD_SEGURO@postgres:5432/mentor_proyectos
JWT_SECRET=GENERA_SECRETO_CON_openssl_rand_-base64_64
NODE_ENV=production
PORT=3000

# AI Service
OPENAI_API_KEY=sk-TU_API_KEY_DE_OPENAI
AI_PORT=3001

# URLs
API_URL=https://api.tu-dominio.com
```

**Generar JWT_SECRET:**
```bash
openssl rand -base64 64
```

---

## 3. backend/Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

# Ejecutar aplicación
CMD ["node", "src/index.js"]
```

---

## 4. ai-service/Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 3001

# Ejecutar aplicación
CMD ["node", "src/index.js"]
```

---

## 5. Nginx Config

Ubicación: `/etc/nginx/sites-available/mentor-proyectos`

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

upstream backend {
    server 127.0.0.1:3000;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.tu-dominio.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name api.tu-dominio.com;

    # SSL certificates (managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/api.tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.tu-dominio.com/privkey.pem;

    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Logs
    access_log /var/log/nginx/mentor-access.log;
    error_log /var/log/nginx/mentor-error.log;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Max body size (para uploads)
    client_max_body_size 10M;

    # API endpoints
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check (sin rate limit)
    location /health {
        proxy_pass http://backend/health;
        access_log off;
    }

    # Block access to AI service (internal only)
    location /ai/ {
        deny all;
        return 403;
    }
}
```

**Habilitar:**
```bash
ln -s /etc/nginx/sites-available/mentor-proyectos /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## 6. Backup Script

Ubicación: `/root/backup.sh`

```bash
#!/bin/bash

# Configuración
BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7
LOG_FILE="/var/log/backup.log"

# Crear directorio si no existe
mkdir -p $BACKUP_DIR

# Logging
echo "$(date '+%Y-%m-%d %H:%M:%S') - Iniciando backup..." | tee -a $LOG_FILE

# Backup de PostgreSQL
if docker exec mentor-postgres pg_dump -U postgres mentor_proyectos | gzip > $BACKUP_DIR/backup_$DATE.sql.gz; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Backup exitoso: backup_$DATE.sql.gz" | tee -a $LOG_FILE
    
    # Eliminar backups antiguos
    find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Backups antiguos eliminados (>$RETENTION_DAYS días)" | tee -a $LOG_FILE
else
    echo "$(date '+%Y-%m-%d %H:%M:%S') - ERROR: Backup falló" | tee -a $LOG_FILE
    exit 1
fi

# Verificar espacio en disco
DISK_USAGE=$(df -h $BACKUP_DIR | tail -1 | awk '{print $5}' | sed 's/%//')
echo "$(date '+%Y-%m-%d %H:%M:%S') - Uso de disco: $DISK_USAGE%" | tee -a $LOG_FILE

if [ $DISK_USAGE -gt 80 ]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') - ADVERTENCIA: Espacio en disco > 80%" | tee -a $LOG_FILE
fi
```

**Hacer ejecutable:**
```bash
chmod +x /root/backup.sh
```

**Crontab:**
```bash
crontab -e
```

Agregar:
```cron
# Backup diario a las 2 AM
0 2 * * * /root/backup.sh

# Limpiar logs viejos cada domingo a las 3 AM
0 3 * * 0 find /var/log -name "*.log" -mtime +30 -delete
```

---

## 7. GitHub Actions

Ubicación: `.github/workflows/deploy.yml`

```yaml
name: Deploy to Hetzner VPS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: root
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            set -e
            
            echo "🔄 Pulling latest changes..."
            cd /var/www/mentor-proyectos
            git pull origin main
            
            echo "🛑 Stopping services..."
            docker-compose down
            
            echo "🏗️  Building and starting services..."
            docker-compose up -d --build
            
            echo "⏳ Waiting for services to be healthy..."
            sleep 10
            
            echo "✅ Deployment complete!"
            docker-compose ps
            
            echo "📋 Recent logs:"
            docker-compose logs --tail=50
```

**Configurar GitHub Secrets:**
1. Ve a tu repo → Settings → Secrets and variables → Actions
2. New repository secret:
   - Name: `VPS_HOST`
   - Value: IP de tu VPS (ej: `123.45.67.89`)
3. New repository secret:
   - Name: `VPS_SSH_KEY`
   - Value: Tu private SSH key (el contenido completo del archivo)

**Generar SSH key para GitHub Actions:**
```bash
# En tu máquina local
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions

# Ver la private key (copia TODO el contenido)
cat ~/.ssh/github_actions

# Copiar public key al VPS
ssh-copy-id -i ~/.ssh/github_actions.pub root@TU_VPS_IP
```

---

## 8. mobile/app.json (para producción)

```json
{
  "expo": {
    "name": "Mentor de Proyectos",
    "slug": "mentor-proyectos",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.tuempresa.mentorproyectos"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.tuempresa.mentorproyectos"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router"
    ],
    "extra": {
      "apiUrl": "https://api.tu-dominio.com/api",
      "eas": {
        "projectId": "tu-project-id-de-eas"
      }
    }
  }
}
```

---

## 9. UFW Firewall

```bash
# Resetear firewall (solo si es necesario)
ufw --force reset

# Configuración básica
ufw default deny incoming
ufw default allow outgoing

# Permitir SSH (IMPORTANTE: hazlo ANTES de enable)
ufw allow OpenSSH

# Permitir HTTP y HTTPS
ufw allow 'Nginx Full'

# Habilitar firewall
ufw enable

# Verificar status
ufw status verbose
```

---

## 10. Script de instalación completa

Ubicación: `/root/install.sh` (ejecutar UNA VEZ en VPS nuevo)

```bash
#!/bin/bash

echo "🚀 Instalando dependencias para Mentor de Proyectos..."

# Actualizar sistema
apt update && apt upgrade -y

# Instalar Docker
echo "📦 Instalando Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Instalar Docker Compose
apt install docker-compose -y

# Instalar Nginx
echo "🌐 Instalando Nginx..."
apt install nginx -y

# Instalar Certbot
echo "🔒 Instalando Certbot..."
apt install certbot python3-certbot-nginx -y

# Instalar Git
apt install git -y

# Instalar otras utilidades
apt install htop curl wget unzip -y

# Configurar firewall
echo "🔥 Configurando firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# Crear directorios
mkdir -p /var/www
mkdir -p /backups/postgres

echo "✅ Instalación completa!"
echo ""
echo "Próximos pasos:"
echo "1. Clonar repo: cd /var/www && git clone TU_REPO"
echo "2. Configurar .env"
echo "3. Ejecutar docker-compose up -d"
echo "4. Configurar SSL: certbot --nginx -d api.tu-dominio.com"
```

**Usar:**
```bash
chmod +x /root/install.sh
./root/install.sh
```

---

## Resumen de comandos de deployment

```bash
# 1. Instalación inicial (una vez)
./root/install.sh

# 2. Clonar proyecto
cd /var/www
git clone https://github.com/tu-usuario/mentor-proyectos.git
cd mentor-proyectos

# 3. Configurar .env
nano .env
# (copiar template de arriba)

# 4. Configurar Nginx
nano /etc/nginx/sites-available/mentor-proyectos
# (copiar config de arriba)
ln -s /etc/nginx/sites-available/mentor-proyectos /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# 5. SSL
certbot --nginx -d api.tu-dominio.com

# 6. Levantar servicios
docker-compose up -d --build

# 7. Verificar
docker-compose ps
curl https://api.tu-dominio.com/health

# 8. Configurar backups
nano /root/backup.sh
# (copiar script de arriba)
chmod +x /root/backup.sh
crontab -e
# (agregar línea de cron)
```

---

¡Listo! Con estos archivos tienes todo configurado para deployment en Hetzner VPS.