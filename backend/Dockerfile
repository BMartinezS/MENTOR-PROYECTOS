# ======================================
# Multi-stage Dockerfile para Backend
# Mentor de Proyectos - Node.js + Express
# ======================================

# ----------------
# Build Stage
# ----------------
FROM node:20-alpine AS builder

# Metadatos de la imagen
LABEL maintainer="Mentor de Proyectos Team"
LABEL description="Backend API for Mentor de Proyectos - Build Stage"

# Instalar dependencias del sistema necesarias para compilación
RUN apk add --no-cache python3 make g++

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (solo production + devDependencies para build)
RUN npm ci --include=dev

# Copiar código fuente
COPY . .

# Limpiar devDependencies para imagen final más pequeña
RUN npm prune --production

# ----------------
# Production Stage
# ----------------
FROM node:20-alpine AS production

# Metadatos de la imagen final
LABEL maintainer="Mentor de Proyectos Team"
LABEL description="Backend API for Mentor de Proyectos - Production"
LABEL version="0.1.0"

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S mentorapp -u 1001

# Crear directorios necesarios
WORKDIR /app

# Copiar node_modules optimizados desde build stage
COPY --from=builder --chown=mentorapp:nodejs /app/node_modules ./node_modules

# Copiar aplicación
COPY --chown=mentorapp:nodejs . .

# Crear directorio para logs y archivos temporales
RUN mkdir -p /app/logs /app/temp && \
    chown -R mentorapp:nodejs /app/logs /app/temp

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "const http = require('http'); \
    const options = { hostname: 'localhost', port: process.env.PORT || 3000, path: '/health', timeout: 2000 }; \
    const req = http.request(options, (res) => process.exit(res.statusCode === 200 ? 0 : 1)); \
    req.on('error', () => process.exit(1)); \
    req.end();"

# Exponer puerto
EXPOSE 3000

# Cambiar a usuario no-root
USER mentorapp

# Comando de inicio
CMD ["node", "src/index.js"]

# ----------------
# Development Stage
# ----------------
FROM node:20-alpine AS development

# Metadatos
LABEL maintainer="Mentor de Proyectos Team"
LABEL description="Backend API for Mentor de Proyectos - Development"

# Instalar dependencias adicionales para desarrollo
RUN apk add --no-cache git

# Crear directorio de trabajo
WORKDIR /app

# Instalar nodemon globalmente para development
RUN npm install -g nodemon

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar TODAS las dependencias (incluye devDependencies)
RUN npm ci

# Variables de entorno para desarrollo
ENV NODE_ENV=development
ENV PORT=3000

# Exponer puerto
EXPOSE 3000

# Health check simplificado para desarrollo
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/health || exit 1

# Comando de desarrollo (será sobrescrito por docker-compose)
CMD ["npm", "run", "dev"]