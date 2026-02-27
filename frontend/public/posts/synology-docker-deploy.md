# Cómo desplegué mi portfolio React + Node.js en un Synology con Docker, HTTPS y dominio propio (sin depender de ningún hosting)

Después de terminar mi portfolio con **React (Vite)** en el frontend y **Node.js + Express** en el backend, tenía varias opciones para publicarlo:

- Subirlo a un **VPS**
- Usar **Hostinger** (donde ya tenía hosting)
- O usar servicios como **Vercel o Netlify**

Pero decidí algo más desafiante: **desplegarlo en mi propio NAS Synology**, usando **Docker y mi propio dominio**, sin depender de ningún proveedor externo.

El objetivo era tener una infraestructura completamente bajo mi control.

Este artículo explica **todos los retos reales que encontré**, los errores más confusos, y la solución final paso a paso.

---

## Arquitectura final

Mi aplicación está compuesta por:

**Frontend**
- React + Vite
- Servido con NGINX en Docker
- Build estático (`dist`)

**Backend**
- Node.js + Express
- Endpoint `/api/contact`
- Envío de emails con Nodemailer

**Infraestructura**

```
Internet
↓
Router (80 → 8080, 443 → 4443)
↓
NGINX Proxy Manager (Docker)
↓
├── guadalupecano.es       → frontend container
└── guadalupecano.es/api   → backend container
```

Todo funcionando en **[https://guadalupecano.es](https://guadalupecano.es)**.

---

## Primer intento: usar el proxy inverso de Synology

Synology incluye su propio sistema de proxy inverso, así que inicialmente intenté usarlo.

Configuré:

```
guadalupecano.es      → frontend
guadalupecano.es/api  → backend
```

En HTTP funcionaba correctamente. Pero al activar HTTPS empezaron los problemas:

- Conflictos con el nginx interno de DSM
- Certificados que no se asignaban correctamente
- Redirecciones inesperadas a los puertos 5000 / 5001
- Interceptación del tráfico antes de llegar a los contenedores

Synology ejecuta su propio nginx internamente, y eso complica el control completo del tráfico. Decidí usar **NGINX Proxy Manager en Docker**, que me da control total.

---

## Instalando NGINX Proxy Manager en Docker

El primer problema importante fue que **Synology ya usa los puertos 80 y 443 internamente**, así que no podía usarlos directamente.

La solución fue usar puertos alternativos:

```yaml
ports:
  - "8080:80"
  - "4443:443"
  - "81:81"
```

Y redirigirlos en el router:

```
Puerto externo 80  → NAS puerto 8080
Puerto externo 443 → NAS puerto 4443
```

Esto permite que NGINX Proxy Manager gestione el tráfico externo.

---

## Problema con Let's Encrypt: bloqueo por rate limit

Después de varios intentos fallidos de crear certificados desde NGINX Proxy Manager, apareció este error:

```
too many certificates already issued for this exact set of identifiers
```

Let's Encrypt limita el número de certificados que puedes generar en un periodo corto. Como solución temporal, exporté el certificado generado por Synology y lo importé manualmente en NGINX Proxy Manager. Esto permitió activar HTTPS inmediatamente.

---

## Configuración de Docker

```yaml
services:

  frontend:
    image: nginx:alpine
    ports:
      - "8081:80"
    volumes:
      - ./frontend:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/conf.d/default.conf

  backend:
    image: node:18-alpine
    ports:
      - "3000:3000"
    volumes:
      - ./backend:/app
    env_file:
      - ./backend/.env
```

---

## Error crítico: el frontend apuntaba a un subdominio inexistente

Mi frontend tenía esta variable de entorno:

```
VITE_API_URL=https://api.guadalupecano.es
```

Pero en realidad el backend estaba configurado en:

```
https://guadalupecano.es/api
```

Esto provocaba errores de `Failed to fetch` y CORS. La solución fue cambiar la variable:

```
VITE_API_URL=https://guadalupecano.es
```

Y recompilar el frontend:

```bash
npm run build
```

---

## Error en el backend: el servidor arrancaba antes de registrar las rutas

El archivo `server.js` tenía un problema importante: había un `app.listen()` **antes** de registrar `app.post("/api/contact")`. Esto hacía que la ruta nunca se registrara correctamente. Reordenar el código solucionó el problema.

---

## Configuración en NGINX Proxy Manager

**Proxy principal:**

| Campo | Valor |
|---|---|
| Domain | `guadalupecano.es` |
| Forward | `192.168.1.91:8081` |

**Custom location:**

| Campo | Valor |
|---|---|
| Location | `/api/` |
| Forward | `192.168.1.91:3000` |

Esto permite usar el mismo dominio para frontend y backend, evitando problemas CORS.

---

## Error típico en React: las rutas no funcionan al recargar

Al acceder directamente a `https://guadalupecano.es/contacto` aparecía un error **404**. Esto ocurre porque React Router gestiona las rutas en el cliente, no en el servidor.

La solución fue crear un `nginx.conf` personalizado:

```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

Esto permite que todas las rutas carguen correctamente al recargar o acceder directamente por URL.

---

## Resultado final

El portfolio funciona completamente en **[https://guadalupecano.es](https://guadalupecano.es)** con:

- HTTPS con certificado válido
- Dominio propio
- Backend funcional
- Envío de emails desde el formulario de contacto
- Sin depender de ningún hosting externo

Todo ejecutándose en mi propio Synology.

---

## Por qué elegí Synology en lugar de un VPS

Podría haberlo desplegado en minutos en Hostinger, un VPS, Vercel o Netlify. Pero el objetivo era:

- Aprender infraestructura real
- Controlar completamente el entorno
- No depender de terceros
- Entender cómo funcionan proxies, certificados y redes

Este proceso me permitió trabajar con Docker, reverse proxies, Let's Encrypt, networking y despliegue en producción real.

---

## Lecciones aprendidas

Los puntos clave al desplegar en Synology son:

1. Synology usa sus propios puertos 80 y 443 — hay que usar puertos alternativos en Docker
2. Redirigir correctamente en el router
3. Unificar frontend y backend bajo el mismo dominio para evitar CORS
4. Recompilar el frontend si cambian variables de entorno (las variables de Vite se incrustan en el build)
5. Configurar nginx correctamente para React Router (`try_files`)

---

## Estado actual

Portfolio desplegado con éxito en infraestructura propia. Frontend y backend funcionando bajo HTTPS, con contenedores Docker y proxy inverso.

Si estás intentando hacer algo similar y tienes dudas, puedes [contactarme](https://guadalupecano.es/contacto).

> Este proceso también será parte de un vídeo donde explicaré todo paso a paso.
