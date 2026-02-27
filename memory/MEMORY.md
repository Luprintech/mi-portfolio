# Portfolio Guadalupe Cano — Notas del Proyecto

## Stack
- **Frontend**: React 19, Vite 7, Tailwind CSS v4 (via @tailwindcss/vite), react-router-dom v7, framer-motion, i18next
- **Backend**: Node.js, Express, Nodemailer, helmet, express-rate-limit, express-validator
- **Despliegue**: VPS con Nginx + Docker, dominio guadalupecano.es

## Estructura
- `frontend/` — React SPA
- `backend/` — Express API para formulario de contacto (`/api/contact`)
- `nginx.conf` — configuración nginx

## Dev server (Windows)
- launch.json usa `node ./frontend/node_modules/vite/bin/vite.js --port 5173`
- `npm` no funciona directamente en spawn Windows (usa path completo de node + vite.js)
- Instalar deps: ejecutar `npm install --legacy-peer-deps` desde dentro del directorio `frontend/`

## Convenciones
- CSS Variables para temas: `var(--bg-primary)`, `var(--accent-primary)` etc.
- Temas dark/light via `data-theme` en `<html>` (ThemeContext)
- i18n en `src/locales/{es,en}/common.json`
- Proyectos en `public/projects.json` (cargados por useProjects hook)
- Blog posts en `public/posts/index.json` + archivos .md individuales

## Mejoras aplicadas (Feb 2025)
- Eliminado dangerouslySetInnerHTML en Home.jsx
- console.log de config guardado con NODE_ENV check en backend
- Página 404 NotFound + ruta catch-all en AppRoutes
- ErrorBoundary global en App.jsx
- useProjects: AbortController + error state
- Blog/BlogPost: async/await + AbortController + error state
- Navbar: clickTimeout → useRef, li-in-div → div-in-div
- Imports no usados eliminados (React, Typewriter)
- Fix typo "Proyectos Descados" → "Proyectos Destacados"
- Spinner en Suspense fallback de main.jsx

## Notas de seguridad backend
- Rate limit: 5 req / 10 min en /api/contact
- Honeypot field `_website` para bots
- helmet() activo
- CORS restringido a allowedOrigins
