# AGENTS.md

## General

- Aplica buenas prácticas de desarrollo de software y desarrollo web en todos los cambios.
- Prioriza código mantenible, legible, modular, seguro y fácil de evolucionar.
- Sigue las guías de estilo y convenciones más actuales y estables del lenguaje y framework en uso en cada carpeta del proyecto.
- En este repositorio eso implica, como mínimo, respetar las convenciones modernas de JavaScript ESM, React actual, Vite y Express.
- Evita soluciones improvisadas, duplicación innecesaria, efectos secundarios ocultos y acoplamientos difíciles de mantener.
- Prefiere nombres claros, funciones pequeñas, validaciones explícitas y separación de responsabilidades entre UI, lógica, acceso a datos y configuración.
- Mantén consistencia entre frontend y backend cuando cambien contratos, payloads, rutas o estructuras de contenido.
- Da prioridad a accesibilidad, rendimiento, SEO técnico, responsive design y experiencia de usuario al tocar la capa web.
- Trata la seguridad como requisito base: valida entradas, evita exponer secretos, revisa CORS, autenticación, uploads, sanitización y manejo de errores.
- No introduzcas dependencias nuevas sin una razón clara; si se añaden, deben estar justificadas por mantenimiento, seguridad o valor funcional.
- Antes de cerrar una tarea, comprueba que el resultado sea profesional a nivel visual, técnico y operativo, no solo "funcional".
- Si detectas documentación desactualizada, scripts rotos, configuraciones inconsistentes o deuda técnica relevante, señálalo y corrígelo si entra dentro del cambio.

## Arquitectura

Sigue el modelo vista controlador (MVC) de forma general, aunque no estricta. El frontend se encarga de la vista y parte de la lógica de presentación, mientras que el backend maneja la lógica de negocio, acceso a datos y API. El CMS es una capa adicional que interactúa con ambos para gestionar contenido dinámico.

## Objetivo del repositorio

Este proyecto es un portfolio personal full-stack con dos aplicaciones separadas:

- `frontend/`: SPA en React + Vite que sirve la web pública y la interfaz del CMS.
- `backend/`: API en Express para contacto, chat, autenticación del CMS y CRUD de contenido.

El objetivo habitual de los cambios es mantener coherentes estas dos capas sin romper el contenido estático servido desde `frontend/public`.

## Estructura útil

- `frontend/src/`: componentes, páginas, rutas y utilidades de la SPA.
- `frontend/public/projects.json`: fuente de verdad actual para los proyectos mostrados en la web.
- `frontend/public/posts/index.json`: índice del blog.
- `frontend/public/posts/*.md`: contenido Markdown de los posts.
- `frontend/public/posts/images/`: imágenes embebidas en posts.
- `frontend/public/posts/documents/`: documentos enlazados desde posts.
- `frontend/src/lib/cmsApi.js`: contrato del frontend con la API del CMS.
- `backend/server.js`: arranque del servidor y montaje de rutas.
- `backend/config/paths.js`: rutas reales de contenido; respeta `CONTENT_PATH`.
- `backend/routes/`: endpoints de auth, posts, proyectos, imágenes, contacto y chat.
- `docker-compose.yml`: despliegue conjunto de frontend + backend con volumen compartido.

## Comandos de trabajo

### Frontend

Desde `frontend/`:

- Instalar dependencias: `npm install`
- Desarrollo: `npm run dev`
- Build de producción: `npm run build`
- Lint: `npm run lint`
- Preview local del build: `npm run preview`

### Backend

Desde `backend/`:

- Instalar dependencias: `npm install`
- Arranque local actual: `node server.js`

Nota importante: el `README.md` menciona `npm start`, pero `backend/package.json` no define ese script ahora mismo. Si necesitas arrancar el backend, usa `node server.js` salvo que primero añadas y verifiques un script oficial.

### Docker

Desde la raíz:

- Levantar stack: `docker-compose up -d --build`
- Parar stack: `docker-compose down`

## Variables de entorno

### Backend obligatorias

El backend termina el proceso al arrancar si faltan:

- `JWT_SECRET`
- `CMS_USERNAME`
- `CMS_PASSWORD`

### Backend opcionales pero relevantes

- `FRONTEND_URL`: afecta a CORS y al sitemap generado.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_EMAIL`: necesarios para `/api/contact`.
- `GEMINI_API_KEY`: habilita `/api/chat`.
- `CONTENT_PATH`: cambia la ubicación física de `posts/`, `projects.json` e imágenes.

## Fuente de verdad del contenido

- La web pública consume proyectos desde `frontend/public/projects.json` mediante `frontend/src/hooks/useProjects.js`.
- El blog público consume `frontend/public/posts/index.json` y los `.md` dentro de `frontend/public/posts/`.
- El CMS escribe sobre esas estructuras a través del backend y `CONTENT_PATH`.

Importante: `frontend/src/data/webProjects.js` y `frontend/src/data/README.md` parecen legado y no son la fuente de verdad de la UI actual. Antes de editar datos, comprueba si el cambio debe ir en `frontend/public/projects.json` en lugar de ahí.

## Convenciones y límites del proyecto

- Todo el repo usa ESM (`"type": "module"`).
- Mantén compatibilidad entre frontend y backend cuando cambies payloads del CMS.
- No cambies slugs públicos (`/blog/:slug`, `/bitacora/...`) sin revisar enlaces, sitemap y navegación.
- Si cambias orígenes del frontend, actualiza también `backend/config/cors.js`.
- Si cambias uploads o rutas estáticas, mantén alineados `backend/routes/images.js` y los `express.static` de `backend/server.js`.
- No subas secretos reales a `.env`, commits o ejemplos.

## Validación mínima antes de cerrar cambios

- Si tocas frontend: ejecuta `npm run build` en `frontend/`.
- Si tocas JS/JSX del frontend: ejecuta también `npm run lint` en `frontend/`.
- Si tocas backend: arranca con `node server.js` y verifica `GET /api/health`.
- Si tocas CMS o contenido: prueba el flujo afectado de extremo a extremo.

Limitación actual: no existe una suite real de tests para backend; `npm test` en `backend/` es solo un placeholder que falla.

## Zonas delicadas

- `backend/routes/posts.js` regenera `sitemap.xml` al crear, editar o borrar posts. Si cambias rutas de contenido o despliegue, revisa esa lógica también.
- `backend/config/paths.js` permite mover el contenido con `CONTENT_PATH`; cualquier cambio en posts, proyectos, imágenes o Docker debe respetar esa estructura.
- `backend/routes/contact.js` depende de SMTP real y validaciones; no des por hecho que puede probarse sin credenciales.
- `backend/routes/chat.js` usa Gemini y respuestas cacheadas/FAQ; si cambias el comportamiento, revisa tanto la ruta como sus utilidades en `backend/utils/`.

## Cómo hacer cambios seguros aquí

- Prefiere cambios pequeños y coherentes entre capas.
- Si una modificación afecta contenido, API y renderizado, valida las tres piezas.
- Si introduces un nuevo comando o script oficial, actualiza también `README.md` y este archivo.
