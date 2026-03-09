# Contexto: ./frontend
# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json .npmrc ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# ── Stage 2: serve ──────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Copia el build de React
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuración de nginx adaptada para Docker
COPY nginx.docker.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
