# Guía de Deployment - Hetzner VPS

Esta guía cubre el deployment completo del backend, AI service y PostgreSQL en un VPS de Hetzner.

---

## Requisitos previos

- VPS Hetzner (recomendado: CPX11 - 2GB RAM, €5/mes)
- Dominio registrado (ejemplo: `mentor-proyectos.com`)
- GitHub repo con el código

---

## 1. Setup inicial del VPS

### Conectar al VPS
```bash
ssh root@your-vps-ip
```

### Instalar dependencias
```bash
# Actualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
apt install docker-compose -y

# Instalar Nginx
apt install nginx -y

# Instalar Certbot (SSL)
apt install certbot python3-certbot-nginx -y

# Instalar Git
apt install git -y
```

---

## 2. Configurar DNS

En tu proveedor de dominio (Namecheap, Cloudflare, etc.):

**Registros A**:
```
api.mentor-proyectos.com  →  YOUR_VPS_IP
```

Espera 5-10 minutos para propagación DNS.

Verifica:
```bash
ping api.mentor-proyectos.com
```

---

## 3. Clonar repositorio

```bash
# Crear directorio
mkdir -p /var/www
cd /var/www

# Clonar repo
git clone https://github.com/tu-usuario/mentor-proyectos.git
cd mentor-proyectos
```

---

## 4. Configurar variables de entorno

```bash
nano .env
```

Contenido de `.env`:
```env
# PostgreSQL
DB_PASSWORD=tu_password_super_seguro_aqui
POSTGRES_DB=mentor_proyectos
POSTGRES_USER=postgres

# Backend
DATABASE_URL=postgresql://postgres:tu_password_super_seguro_aqui@postgres:5432/mentor_proyectos
JWT_SECRET=genera_un_secreto_aleatorio_de_64_caracteres
NODE_ENV=production
PORT=3000

# AI Service
OPENAI_API_KEY=sk-tu-api-key-de-openai
AI_PORT=3001

# URLs
API_URL=https://api.mentor-proyectos.com
```

**Generar JWT_SECRET:**
```bash
openssl rand -base64 64
```

---

## 5. Crear Docker Compose

`docker-compose.yml`:
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

## 6. Crear Dockerfiles

### Backend Dockerfile

`backend/Dockerfile`:
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "src/index.js"]
```

### AI Service Dockerfile

`ai-service/Dockerfile`:
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["node", "src/index.js"]
```

---

## 7. Configurar Nginx

```bash
nano /etc/nginx/sites-available/mentor-proyectos
```

Contenido:
```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

upstream backend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name api.mentor-proyectos.com;

    # Redirect HTTP to HTTPS (se configurará después)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.mentor-proyectos.com;

    # SSL certificates (Certbot los creará)
    ssl_certificate /etc/letsencrypt/live/api.mentor-proyectos.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.mentor-proyectos.com/privkey.pem;

    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    # Logs
    access_log /var/log/nginx/mentor-access.log;
    error_log /var/log/nginx/mentor-error.log;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

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
    }

    # Block access to AI service (internal only)
    location /ai/ {
        deny all;
        return 403;
    }
}
```

**Habilitar sitio:**
```bash
ln -s /etc/nginx/sites-available/mentor-proyectos /etc/nginx/sites-enabled/
nginx -t  # Verificar configuración
systemctl reload nginx
```

---

## 8. Configurar SSL con Let's Encrypt

```bash
# Obtener certificado (primero comenta las líneas SSL en nginx)
certbot --nginx -d api.mentor-proyectos.com --non-interactive --agree-tos -m tu@email.com

# Certbot configurará automáticamente nginx
# Verificar renovación automática
certbot renew --dry-run
```

---

## 9. Levantar servicios

```bash
cd /var/www/mentor-proyectos

# Build y start
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Verificar que todo esté corriendo
docker-compose ps
```

**Verificar:**
```bash
curl http://localhost:3000/health
# Debe retornar: {"status":"ok"}

curl https://api.mentor-proyectos.com/health
# Debe retornar lo mismo
```

---

## 10. Setup de backups automáticos

### Script de backup

```bash
nano /root/backup.sh
```

Contenido:
```bash
#!/bin/bash

# Configuración
BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Crear directorio si no existe
mkdir -p $BACKUP_DIR

# Backup de PostgreSQL
docker exec mentor-postgres pg_dump -U postgres mentor_proyectos | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Eliminar backups antiguos
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completado: backup_$DATE.sql.gz"
```

**Hacer ejecutable:**
```bash
chmod +x /root/backup.sh
```

### Configurar cron

```bash
crontab -e
```

Agregar:
```cron
# Backup diario a las 2 AM
0 2 * * * /root/backup.sh >> /var/log/backup.log 2>&1
```

---

## 11. GitHub Actions para CI/CD

`.github/workflows/deploy.yml`:
```yaml
name: Deploy to Hetzner VPS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: root
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /var/www/mentor-proyectos
            git pull origin main
            docker-compose down
            docker-compose up -d --build
            docker-compose logs --tail=50
```

**Configurar secrets en GitHub:**
1. Ve a Settings → Secrets → Actions
2. Agrega:
   - `VPS_HOST`: IP de tu VPS
   - `VPS_SSH_KEY`: Tu private key SSH

**Generar SSH key:**
```bash
# En tu máquina local
ssh-keygen -t ed25519 -C "github-actions"
# Guarda en: ~/.ssh/github_actions

# Copiar public key al VPS
ssh-copy-id -i ~/.ssh/github_actions.pub root@your-vps-ip

# Copiar private key a GitHub secrets
cat ~/.ssh/github_actions
```

---

## 12. Monitoreo

### Logs en tiempo real
```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo AI service
docker-compose logs -f ai-service

# Solo PostgreSQL
docker-compose logs -f postgres
```

### Estado de servicios
```bash
docker-compose ps
systemctl status nginx
```

### Uso de recursos
```bash
# CPU y RAM
htop

# Espacio en disco
df -h

# Docker stats
docker stats
```

---

## 13. Mantenimiento

### Actualizar código
```bash
cd /var/www/mentor-proyectos
git pull
docker-compose down
docker-compose up -d --build
```

### Restart servicios
```bash
# Todos
docker-compose restart

# Solo backend
docker-compose restart backend

# Solo AI service
docker-compose restart ai-service
```

### Ver logs de errores
```bash
# Nginx
tail -f /var/log/nginx/mentor-error.log

# Docker
docker-compose logs --tail=100 backend
```

### Limpiar Docker
```bash
# Eliminar containers parados
docker container prune -f

# Eliminar imágenes sin usar
docker image prune -a -f

# Eliminar volúmenes no usados
docker volume prune -f
```

---

## 14. Firewall (UFW)

```bash
# Habilitar UFW
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable

# Verificar
ufw status
```

---

## 15. Troubleshooting

### Backend no inicia
```bash
# Ver logs
docker-compose logs backend

# Verificar variables de entorno
docker-compose config

# Reiniciar
docker-compose restart backend
```

### No conecta a PostgreSQL
```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps postgres

# Verificar health
docker inspect mentor-postgres | grep -A 10 Health

# Conectar manualmente
docker exec -it mentor-postgres psql -U postgres -d mentor_proyectos
```

### SSL no funciona
```bash
# Renovar certificado
certbot renew --force-renewal

# Verificar nginx
nginx -t
systemctl reload nginx
```

### App móvil no conecta
```bash
# Verificar que nginx esté escuchando
netstat -tlnp | grep :443

# Probar desde el servidor
curl https://api.mentor-proyectos.com/health

# Ver logs de nginx
tail -f /var/log/nginx/mentor-error.log
```

---

## Checklist final

- [ ] VPS accesible vía SSH
- [ ] DNS apuntando a VPS
- [ ] Docker y Docker Compose instalados
- [ ] Nginx configurado
- [ ] SSL configurado con Let's Encrypt
- [ ] `.env` con variables correctas
- [ ] `docker-compose up -d` ejecutado
- [ ] Health check respondiendo OK
- [ ] Backups configurados en cron
- [ ] GitHub Actions configurado
- [ ] Firewall habilitado
- [ ] App móvil conecta exitosamente

---

## Costos mensuales

| Item | Costo |
|------|-------|
| Hetzner CPX11 VPS | €5 |
| Dominio .com | €1 |
| SSL (Let's Encrypt) | Gratis |
| OpenAI API (~100 users) | $10-15 |
| **TOTAL** | **~€20-25/mes** |

---

## Próximos pasos

1. **Monitoreo**: Configurar UptimeRobot (gratis) para alertas
2. **Backups offsite**: Subir backups a S3/Backblaze
3. **Escalamiento**: Cuando llegues a 100+ usuarios, considera CPX21 (4GB RAM)
4. **CDN**: Cloudflare gratis para caché y protección DDoS