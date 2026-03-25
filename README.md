# Mi web

[Read in English](README.en.md)

Portfolio personal full-stack con web publica, blog tecnico, CMS propio y API en Express. El repositorio esta organizado como dos aplicaciones separadas (`frontend/` y `backend/`) que comparten una capa de contenido inicial en `frontend/public`, mientras que el estado operativo actual de posts y proyectos vive en PostgreSQL.

## Indice

- [Vision general](#vision-general)
- [Stack verificado](#stack-verificado)
- [Arquitectura actual](#arquitectura-actual)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Requisitos](#requisitos)
- [Puesta en marcha en local](#puesta-en-marcha-en-local)
- [Variables de entorno](#variables-de-entorno)
- [Scripts disponibles](#scripts-disponibles)
- [Fuente de verdad del contenido](#fuente-de-verdad-del-contenido)
- [API y rutas relevantes](#api-y-rutas-relevantes)
- [Docker y despliegue](#docker-y-despliegue)
- [Testing y CI](#testing-y-ci)
- [Solucion de problemas](#solucion-de-problemas)
- [Estado de la documentacion](#estado-de-la-documentacion)

## Vision general

### Que incluye

- Web publica construida con React + Vite.
- CMS privado integrado en la SPA bajo la ruta `/bitacora`.
- API REST en Express para autenticacion, contenido publico, contacto, chat y metadatos Open Graph.
- Persistencia en PostgreSQL para posts y proyectos.
- Ficheros editoriales y assets publicos en filesystem (`posts/`, imagenes, documentos, audio y `sitemap.xml`).
- Despliegue preparado con Docker Compose, Nginx y un volumen compartido para contenido.

### Flujo del contenido hoy

1. La web publica consume `GET /api/posts` y `GET /api/projects`.
2. El CMS crea y actualiza posts y proyectos en PostgreSQL.
3. El backend importa una sola vez el contenido seed desde `frontend/public` si la base de datos esta vacia.
4. Las subidas de imagenes, documentos y audio se guardan en `CONTENT_PATH/posts/...`.
5. El backend regenera `sitemap.xml` al arrancar y tras cambios en posts publicados.

## Stack verificado

### Frontend

- React 19
- Vite 7
- Tailwind CSS 4
- React Router 7
- SWR
- Framer Motion
- TipTap
- Vitest + Testing Library

### Backend

- Node.js 20
- Express 5
- PostgreSQL (`pg`)
- JWT para el acceso al CMS
- Nodemailer para contacto
- Gemini API para el chat
- Vitest + Supertest

### Infraestructura

- Docker Compose
- PostgreSQL 16 (`postgres:16-alpine`)
- Nginx como servidor del frontend y proxy inverso

## Arquitectura actual

```text
frontend/      -> SPA publica + interfaz del CMS
backend/       -> API REST + logica de negocio + acceso a datos
PostgreSQL     -> fuente operativa de posts y proyectos
CONTENT_PATH   -> contenido compartido (posts seed, media, sitemap)
frontend/public -> seed inicial y fallback local si no se define CONTENT_PATH
```

### Decisiones relevantes verificadas

- `backend/app.js` valida `JWT_SECRET`, `CMS_USERNAME` y `CMS_PASSWORD` antes de arrancar.
- `backend/lib/database.js` espera a PostgreSQL, asegura el esquema y ejecuta la importacion inicial desde ficheros si procede.
- `frontend/src/hooks/useProjects.js` y `frontend/src/pages/Blog.jsx` consumen la API publica, no los JSON del directorio `public/` en runtime.
- `backend/config/paths.js` resuelve `CONTENT_PATH` y usa `frontend/public` como ruta por defecto en local.
- `backend/config/cors.js` combina `localhost:5173`, dominios de produccion y `FRONTEND_URL` como origenes permitidos.

## Estructura del repositorio

```text
.
|- frontend/                  # SPA publica, CMS, assets y build de Vite
|  |- public/                 # seed inicial y contenido publico compartido
|  |- src/                    # componentes, paginas, hooks, rutas y utilidades
|  |- package.json
|  `- Dockerfile
|- backend/                   # API Express, PostgreSQL y rutas del CMS
|  |- config/
|  |- db/migrations/
|  |- lib/
|  |- middleware/
|  |- routes/
|  |- tests/
|  |- package.json
|  `- Dockerfile
|- .github/workflows/ci.yml   # pipeline de integracion continua
|- docker-compose.yml         # stack frontend + backend + postgres
|- nginx.conf                 # configuracion Nginx para despliegue tradicional
|- README.md
`- README.en.md
```

## Requisitos

- Node.js 20 o superior
- npm
- Una instancia accesible de PostgreSQL para el backend
- Docker y Docker Compose si vas a levantar el stack completo

## Puesta en marcha en local

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npm start
```

El backend escucha en `http://localhost:3000` por defecto.

Notas verificadas:

- El servidor no arranca si faltan `JWT_SECRET`, `CMS_USERNAME` o `CMS_PASSWORD`.
- Hace falta `DATABASE_URL` o una configuracion `PG*` valida para conectar con PostgreSQL.
- En el arranque se comprueba la conexion, se asegura el esquema y se importa el contenido seed si la base de datos esta vacia.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

La aplicacion de desarrollo se sirve en `http://localhost:5173`.

Notas verificadas:

- El frontend usa `VITE_API_URL` como base de la API; si no existe, trabaja con rutas relativas.
- En desarrollo, Vite espera el backend en `http://localhost:3000` segun la configuracion actual de entorno.
- El CMS forma parte de la misma SPA y vive bajo `/bitacora`.

## Variables de entorno

### Frontend (`frontend/.env.example`)

| Variable | Obligatoria | Uso |
| --- | --- | --- |
| `VITE_API_URL` | No | URL base de la API. Si esta vacia, el frontend usa rutas relativas y funciona bien detras de Nginx. |
| `VITE_SITE_URL` | Recomendable | URL canonica publica usada para construir enlaces absolutos en el frontend. |

### Backend (`backend/.env.example`)

| Variable | Obligatoria | Uso |
| --- | --- | --- |
| `PORT` | No | Puerto del servidor Express. Por defecto `3000`. |
| `FRONTEND_URL` | Recomendable | Controla CORS y se usa para generar el sitemap. |
| `SITE_URL` | No | URL canonica usada por `/api/og`; si falta, usa `FRONTEND_URL`. |
| `CMS_USERNAME` | Si | Usuario del CMS. |
| `CMS_PASSWORD` | Si | Contrasena del CMS. |
| `JWT_SECRET` | Si | Firma de los tokens JWT del CMS. |
| `SMTP_HOST` | Solo si usas contacto | Host SMTP para `POST /api/contact`. |
| `SMTP_PORT` | Solo si usas contacto | Puerto SMTP. El ejemplo usa `465`. |
| `SMTP_USER` | Solo si usas contacto | Usuario SMTP. |
| `SMTP_PASS` | Solo si usas contacto | Contrasena SMTP. |
| `CONTACT_EMAIL` | No | Destinatario del formulario; si falta, se usa `SMTP_USER`. |
| `GEMINI_API_KEY` | Solo si usas chat | Habilita `POST /api/chat`; sin esta clave responde `503`. |
| `CONTENT_PATH` | No | Ruta fisica del contenido compartido. En local, por defecto apunta a `frontend/public`. |
| `DATABASE_URL` | Si* | Cadena de conexion PostgreSQL con prioridad sobre `PG*`. |
| `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` | Si* | Configuracion alternativa a `DATABASE_URL`. |
| `PGSSLMODE` | No | Control basico de SSL para PostgreSQL. |

`*` Hace falta `DATABASE_URL` o una configuracion completa `PG*`.

## Scripts disponibles

### Frontend (`frontend/package.json`)

```bash
npm run dev
npm run build
npm run lint
npm run preview
npm test
npm run test:watch
npm run test:ui
npm run test:coverage
```

### Backend (`backend/package.json`)

```bash
npm start
npm run check
npm run migrate
npm test
npm run test:watch
npm run test:ui
npm run test:coverage
npm run test:legacy
```

Notas:

- `npm start` ejecuta `node server.js`.
- El backend no tiene script formal de lint; la validacion minima disponible es `npm run check`.
- `npm run migrate` ejecuta las migraciones SQL de `backend/db/migrations/`.

## Fuente de verdad del contenido

### Runtime actual

- Posts: tabla `posts` en PostgreSQL.
- Proyectos: tabla `projects` en PostgreSQL.
- Assets editoriales: filesystem bajo `CONTENT_PATH/posts/`.

### Seed inicial y contenido compartido

- `frontend/public/posts/index.json` y `frontend/public/posts/*.md` se usan para la importacion inicial de posts.
- `frontend/public/projects.json` se usa para la importacion inicial de proyectos.
- `frontend/public/posts/images/`, `frontend/public/posts/documents/` y `frontend/public/posts/audio/` actuan como base local o seed del contenido compartido.

En otras palabras: `frontend/public` YA NO es la fuente operativa del sitio en runtime, pero sigue siendo clave como seed inicial y como ruta por defecto cuando no se define `CONTENT_PATH`.

## API y rutas relevantes

### Publicas

- `GET /api/health`
- `GET /api/posts`
- `GET /api/posts/:slug`
- `GET /api/projects`
- `POST /api/contact`
- `POST /api/chat`
- `GET /api/og/blog/:slug`

### CMS (`/api/bitacora`)

- `POST /api/bitacora/auth`
- `GET /api/bitacora/verify`
- CRUD de posts en `/api/bitacora/posts`
- CRUD de proyectos en `/api/bitacora/projects`
- Uploads y gestion de imagenes, documentos y audio bajo `/api/bitacora/*`

## Docker y despliegue

El despliegue reproducible del repositorio esta definido en `docker-compose.yml`.

### Servicios incluidos

- `postgres`: PostgreSQL 16 con volumen persistente `postgres_data`.
- `backend`: API Express con `CONTENT_PATH=/data/content` y conexion a PostgreSQL por variables `PG*`.
- `frontend`: build de Vite servido con Nginx en `http://localhost:8081`.

### Levantar el stack

```bash
cp backend/.env.example backend/.env
# Completa backend/.env con valores reales

docker-compose up -d --build
```

Detalles verificados:

- `backend/Dockerfile` copia `frontend/public` a `/app/seed-content` para el primer arranque.
- El backend comparte el volumen `content_data` en `/data/content`.
- El frontend monta ese mismo volumen en modo lectura para servir el contenido publico compartido.
- La CI del repositorio es de validacion; el despliegue no esta automatizado en GitHub Actions.

## Testing y CI

La automatizacion actual vive en `.github/workflows/ci.yml`.

### Que ejecuta la CI

- Frontend: `npm ci`, `npm run lint`, `npm test` y `npm run build`.
- Backend: `npm ci`, `npm test` y `npm run check`.

### Cobertura disponible

- El frontend usa Vitest + Testing Library.
- El backend usa Vitest + Supertest y mantiene ademas un runner legacy (`npm run test:legacy`).
- No hay pipeline de despliegue ni publicacion automatica en este repositorio.

## Solucion de problemas

### El backend no arranca

- Verifica `JWT_SECRET`, `CMS_USERNAME` y `CMS_PASSWORD`.
- Verifica `DATABASE_URL` o las variables `PG*`.
- Comprueba que PostgreSQL este accesible antes del arranque.

### El frontend no encuentra la API

- En local, asegurate de que el backend responde en `localhost:3000` o ajusta `VITE_API_URL`.
- En despliegue, evita barras finales en URLs publicas y revisa `FRONTEND_URL`.

### El formulario de contacto falla

- `POST /api/contact` depende de un SMTP real.
- Sin `SMTP_HOST`, `SMTP_USER` y `SMTP_PASS`, el envio no funcionara.

### El chat devuelve `503`

- Es el comportamiento esperado cuando falta `GEMINI_API_KEY` o Gemini no esta disponible.

## Estado de la documentacion

Este README esta alineado con el estado verificado del repositorio en:

- scripts reales de `frontend/package.json` y `backend/package.json`
- variables de entorno documentadas en `frontend/.env.example` y `backend/.env.example`
- arquitectura actual con PostgreSQL como fuente operativa y `frontend/public` como seed inicial
- CI real en `.github/workflows/ci.yml`
- despliegue con `docker-compose.yml`, Dockerfiles y volumen compartido de contenido
