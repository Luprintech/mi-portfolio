# Ecosistema Digital Personal - Portfolio

Plataforma unificada para la presentación de perfil profesional, documentación técnica, portafolio de desarrollo y blog personal. Desarrollado con una arquitectura desacoplada Frontend/Backend escalable, un sistema de gestión de contenido estático (JSON/Markdown) y foco en el rendimiento visual.

## Stack Tecnológico

**Frontend**: React, Vite, Tailwind CSS, Framer Motion, React-Markdown, Swiper.
**Backend**: Node.js, Express.
**Integraciones y Seguridad**: Nodemailer, Helmet, Express-Rate-Limit, Express-Validator, CORS.
**Gestión de Contenido**: JSON estático (Proyectos), Markdown avanzado (Blog).

## Arquitectura del Proyecto

El proyecto está diseñado bajo un modelo híbrido:

- `/frontend`: SPA (Single Page Application) que consume contenido estático incrustado dinámicamente (`.json` y `.md`) para lograr velocidad extrema y SEO amigable, conectándose al backend solo para servicios transaccionales.
- `/backend`: Servicio API RESTful puro con endpoints protegidos, encargado del procesamiento de datos y comunicación externa (SMTP).

## Sistema de Contenido Estático

Para lograr un rendimiento óptimo sin depender de bases de datos externas pesadas o CMS monolíticos, se ha implementado un sistema "Headless Estático":

1. **Catálogo de Proyectos (JSON)**: Los proyectos viven en `frontend/public/projects.json` y la web los carga mediante `frontend/src/hooks/useProjects.js`. El CMS escribe sobre este mismo fichero o sobre la ruta definida en `CONTENT_PATH`.
2. **Motor de Blog (Markdown + JSON)**: Los artículos se redactan en ficheros `.md` puros ubicados en `/public/posts/`. Un índice centralizado (`index.json`) maneja el mapeo y los metadatos (slug, tags, fecha).
3. **Renderizado de Markdown**: Mediante `react-markdown` equipado con plugins avanzados (`remark-gfm`, `rehype-highlight`), el Markdown se inyecta directamente adaptando reglas CSS exclusivas para inyectarle estética premium de Tailwind a las imágenes, listas, código y crear botones mágicos con `[Link](url "button")`.

## Características Principales

- **Identidad Visual Consistente**: Theme oscuro de alta fidelidad, unificado mediante tokens transversales, con manejo avanzado de interactividad a través de Framer Motion y Tailwind CSS.
- **Grillas y Layouts Responsivos**: Uso intensivo de CSS Grid y Flexbox estructurado en base a variables Mobile-First (breakpoints md, lg, xl).
- **Procesamiento de Formularios Seguro**: Comunicación HTTP hacia la API usando estado de red (`idle`, `submitting`, `success`, `error`).
- **SEO Dinámico**: Implementación de `react-helmet-async` para mutar metaetiquetas Open Graph (título, descripción) bajo demanda para cada post del blog.

## Ejecución en Desarrollo (Local)

El despliegue local requiere encender dos servidores aislados. Asume tener instalados Node.js v18+ y un gestor de paquetes.

### Backend

```bash
cd backend
npm install
cp .env.example .env
node server.js
```

_Asegúrate de configurar las variables obligatorias del CMS (`JWT_SECRET`, `CMS_USERNAME`, `CMS_PASSWORD`) y, si vas a usar contacto o chat, también SMTP y Gemini en el nuevo `.env`._

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Despliegue en Producción

### Opción A — Docker (Recomendado: Synology NAS, VPS, servidor propio)

El proyecto incluye una configuración Docker completa lista para usar:

```
docker-compose.yml           ← orquestación de servicios
frontend/Dockerfile          ← build React + nginx alpine
frontend/nginx.docker.conf   ← nginx con proxy /api/ al backend
backend/Dockerfile           ← Node.js 20 alpine
backend/docker-entrypoint.sh ← inicialización del volumen de contenido
```

**Requisitos**: Docker y Docker Compose instalados.

```bash
# Configura las variables de entorno del backend
cp backend/.env.example backend/.env
# Edita backend/.env con tus valores reales

# Construye y arranca todos los servicios
docker-compose up -d --build
```

La aplicación quedará disponible en el puerto `8081` (configurable en `docker-compose.yml`).

**Detalles de la arquitectura Docker:**
- El frontend (nginx) sirve los assets estáticos y hace proxy de `/api/*` al backend.
- El contenido del CMS (posts, proyectos, imágenes) se persiste en un volumen Docker (`content_data`) compartido entre ambos contenedores.
- En el primer arranque, el volumen se inicializa automáticamente con el contenido de `frontend/public`.
- El backend no es accesible directamente desde el exterior, solo a través de nginx.

### Opción B — Despliegue clásico en la nube

Como resultado de esta arquitectura técnica dividida, el despliegue requiere dos ambientes:

- **Frontend HTTP Estático (Recomendado: Vercel, Netlify o GitHub Pages)**: Servir estáticamente, la carga de JSONs y Markdown funcionará sin fricción. Inyectar variable `VITE_API_URL` apuntando al Backend.
- **Backend Node Persistente (Recomendado: Railway, Render o VPS)**: El entorno debe mantener vivo el proceso `node server.js`. Si se opta por VPS autogestionado, requiere PM2 con proxy inverso (Nginx).


