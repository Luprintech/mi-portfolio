# Ecosistema Digital Personal - Portfolio

Portfolio full-stack con blog técnico y CMS propio. La aplicación está separada en frontend y backend, con contenido editorial persistido en PostgreSQL, media en almacenamiento compartido y una capa pública preparada para servir portfolio, blog y páginas sin acoplar el contenido al despliegue.

## Stack tecnológico

- Frontend: React, Vite, Tailwind CSS, Framer Motion, React Markdown.
- Backend: Node.js, Express.
- Persistencia: PostgreSQL para posts y proyectos.
- Media editorial: imágenes, documentos, audio y sitemap en `CONTENT_PATH`.
- Integraciones y seguridad: Helmet, CORS, Nodemailer, JWT y multer.

## Arquitectura actual

- `frontend/`: SPA pública y panel CMS.
- `backend/`: API REST para autenticación, CRUD del CMS, contacto y chat.
- `postgres`: fuente de verdad del contenido estructurado.
- `CONTENT_PATH`: almacenamiento persistente de media editorial y archivos públicos auxiliares.

### Dónde se guarda cada cosa

- Posts del blog: tabla `posts` en PostgreSQL.
- Proyectos del portfolio: tabla `projects` en PostgreSQL.
- Imágenes, documentos y audio: filesystem persistente bajo `CONTENT_PATH/posts`.
- Sitemap: archivo `sitemap.xml` generado por el backend en `CONTENT_PATH`.

## Migración desde el sistema legacy

El backend conserva una importación inicial automática desde los archivos históricos:

- `frontend/public/posts/index.json`
- `frontend/public/posts/*.md`
- `frontend/public/projects.json`

En el primer arranque con la base de datos vacía, esos datos se importan una sola vez a PostgreSQL. A partir de ese momento, la fuente de verdad pasa a ser la base de datos.

## Desarrollo local

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm start
```

Variables mínimas obligatorias:

- `JWT_SECRET`
- `CMS_USERNAME`
- `CMS_PASSWORD`
- `PGHOST`
- `PGPORT`
- `PGUSER`
- `PGPASSWORD`
- `PGDATABASE`

También puedes usar `DATABASE_URL` en lugar de las variables separadas de PostgreSQL.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Si el backend no corre en el mismo origen, configura `VITE_API_URL`.

## Despliegue en producción

### Opción recomendada: Docker Compose

```bash
cp backend/.env.example backend/.env
# Edita backend/.env con valores reales

docker-compose up -d --build
```

Servicios incluidos:

- `frontend`: nginx sirviendo la SPA y haciendo proxy de `/api` al backend.
- `backend`: API Express + CMS.
- `postgres`: base de datos PostgreSQL persistente.

Volúmenes persistentes:

- `postgres_data`: datos de PostgreSQL.
- `content_data`: media del CMS y sitemap.

## Buenas prácticas operativas

- No borres `postgres_data` ni `content_data` en producción.
- Evita `docker-compose down -v` salvo que quieras eliminar datos.
- Haz backup periódico de PostgreSQL y del almacenamiento de `CONTENT_PATH`.
- Mantén `FRONTEND_URL` bien configurado para generar canónicas y sitemap correctos.

## Endpoints públicos relevantes

- `GET /api/posts`
- `GET /api/posts/:slug`
- `GET /api/projects`
- `GET /api/health`
