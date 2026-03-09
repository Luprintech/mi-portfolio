# Contexto: raíz del proyecto (igual que el backend)
# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY frontend/package.json frontend/.npmrc ./
RUN npm install --legacy-peer-deps

COPY frontend/ .
RUN npm run build

# ── Stage 2: serve ──────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Copia el build de React
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuración de nginx adaptada para Docker
COPY frontend/nginx.docker.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
