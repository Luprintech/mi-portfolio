# Context: raíz del proyecto (para poder copiar frontend/public como seed)
FROM node:20-alpine
WORKDIR /app

# Dependencias de producción
COPY backend/package.json .
RUN npm install --omit=dev

# Código fuente del backend
COPY backend/ .

# Contenido base del CMS (posts, projects.json, imágenes)
# Se copia al volumen compartido en el primer arranque vía entrypoint
COPY frontend/public /app/seed-content

# Script de inicio
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
