#!/bin/sh
# Inicializa el volumen de contenido con los archivos base si está vacío
if [ -z "$(ls -A /data/content 2>/dev/null)" ]; then
    echo "[entrypoint] Volumen vacío - copiando contenido inicial..."
    cp -r /app/seed-content/. /data/content/
    echo "[entrypoint] Contenido inicial copiado."
fi

exec node server.js
