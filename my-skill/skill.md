---
name: my-skill
description: "Contexto completo del proyecto Portfolio de Guadalupe Cano (guadalupecano.es). USE FOR: cualquier tarea de desarrollo, debugging, nuevas features, refactoring, preguntas sobre arquitectura, stack, convenciones, estructura de archivos, CMS Bitácora, blog, chatbot IA, i18n, Docker, API backend, componentes React. Cubre frontend React 19 + Vite 7 + Tailwind 4, backend Express 5 + Gemini AI, Docker Compose con Nginx, y CMS propio sin base de datos."
argument-hint: "Describe qué necesitas hacer en el proyecto (feature, bugfix, refactor, pregunta...)"
---

# Proyecto Portfolio — guadalupecano.es

Ecosistema digital personal de **Guadalupe Cano**, desarrolladora Full Stack. Plataforma unificada que combina portfolio profesional, blog técnico con Markdown, CMS propio (Bitácora), chatbot con IA generativa (Gemini) y formulario de contacto. Desplegado con Docker en Synology NAS.

## Stack técnico

### Frontend — React 19 + Vite 7
- **Core**: `react@^19.1.1`, `react-dom@^19.1.1`, `react-router-dom@^7.9.5`, `vite@^7.1.7`
- **Styling**: `tailwindcss@^4.1.16` (utility-first) + CSS variables para tema oscuro/claro. Sin librerías UI externas.
- **i18n**: `i18next@^25.8.13` + `react-i18next` — ES/EN, lazy-loaded, detección automática, fallback a español.
- **Markdown**: `react-markdown@^10.1.0` + `remark-gfm` + `rehype-highlight` + `rehype-raw` + `dompurify` (sanitización XSS).
- **Editor CMS**: `@tiptap/react@^3.20.0` + 8 extensiones (code blocks, tablas, YouTube, etc.).
- **Animaciones**: `framer-motion@^12.23.24`, `react-parallax-tilt`.
- **SEO**: `react-helmet-async` — metaetiquetas dinámicas por página.
- **Iconos**: `react-icons`, `lucide-react`.
- **Otros**: `swiper` (carrusel), `mermaid` (diagramas), `pdfjs-dist` (PDFs), `react-simple-typewriter`.

### Backend — Node.js + Express 5
- **Core**: `express@^5.2.1`, ES Modules (`"type": "module"`).
- **Seguridad**: `helmet` (headers), `cors` (whitelist), `express-rate-limit`, `express-validator`, `jsonwebtoken` (JWT 24h).
- **IA**: `@google/generative-ai@^0.24.1` — Gemini 2.5 Flash con historial de 10 mensajes.
- **Email**: `nodemailer` — SMTP dual (admin + confirmación remitente).
- **Archivos**: `multer@^2.0.2` (upload), `fs-extra` (filesystem).
- **Autenticación**: Credenciales CMS en `.env`, comparación timing-safe, JWT en sessionStorage.

### Infraestructura — Docker Compose
- **Backend**: Node.js 20 Alpine, healthcheck `/api/health`, puerto 3000 (interno).
- **Frontend**: Build Node.js → Nginx Alpine, puerto `8081:80`.
- **Volumen compartido**: `content_data` — persiste posts MD, projects JSON, imágenes entre restarts.
- **Red**: `portfolio_net` (bridge) — Nginx encuentra backend por DNS `backend:3000`.
- **Dominio**: `guadalupecano.es` con Nginx reverse proxy, SSL terminado en Nginx.

## Arquitectura

### Decisiones clave
1. **Sin base de datos** — Posts (`.md`) y proyectos (`projects.json`) son archivos planos versionables con git.
2. **SPA + API separadas** — Frontend deployable independiente (Vercel, Netlify); backend API pura.
3. **CMS propio (Bitácora)** — CRUD completo de posts, proyectos e imágenes sin dependencias externas.
4. **IA con fallback** — FAQ local (no consume tokens) → Cache → Gemini API con timeout 10s.

### Routing frontend
Todas las páginas usan lazy loading (`React.lazy`) con `AnimatePresence` (fade + slide).

**Rutas públicas:**
| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | Home | Hero, proyectos destacados, tech carousel |
| `/sobre-mi` | About | Perfil, timeline, skills, diferenciadores |
| `/portfolio` | Portfolio | Galería de proyectos con filtrado |
| `/portfolio/desarrollo-web` | Subcategoría | Proyectos web |
| `/portfolio/documentacion-tecnica` | Subcategoría | Documentación técnica |
| `/blog` | Blog | Índice de posts publicados |
| `/blog/:slug` | BlogPost | Post individual (markdown renderizado) |
| `/blog/preview` | Preview | Vista previa sin auth |
| `/contacto` | Contact | Formulario + chatbot |
| `/politica-cookies` | Cookies | Política de cookies |
| `/politica-privacidad` | Privacidad | Política de privacidad |

**Rutas CMS protegidas (`/bitacora`):**
| Ruta | Página |
|------|--------|
| `/bitacora` | Login |
| `/bitacora/inicio` | Dashboard |
| `/bitacora/posts` | Lista posts (CRUD) |
| `/bitacora/posts/nuevo` | Editor nuevo post |
| `/bitacora/posts/editar/:slug` | Editor post existente |
| `/bitacora/proyectos` | Lista proyectos |
| `/bitacora/proyectos/nuevo` | Editor nuevo proyecto |
| `/bitacora/proyectos/editar/:id` | Editor proyecto existente |
| `/bitacora/imagenes` | Gestión de imágenes |

### API backend
| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/api/auth` | POST | No | Login CMS (JWT) |
| `/api/verify` | GET | Bearer | Verificar token |
| `/api/chat` | POST | No | ChatBot (Gemini + FAQ) |
| `/api/contact` | POST | No | Formulario contacto (email) |
| `/api/posts` | GET | No | Índice posts |
| `/api/posts/:slug` | GET | No | Post individual |
| `/api/posts` | POST/PUT/DELETE | Bearer | CRUD posts |
| `/api/projects` | GET | No | Lista proyectos |
| `/api/projects` | POST/PUT/DELETE | Bearer | CRUD proyectos |
| `/api/images` | GET/POST | Bearer | Gestión imágenes |
| `/api/health` | GET | No | Health check |

### Flujo de autenticación CMS
1. POST `/api/auth` con credenciales → comparación timing-safe.
2. JWT generado (24h expiración).
3. Token en `sessionStorage['cms_token']`.
4. `<ProtectedRoute>` envuelve rutas CMS → redirige si `!isAuthenticated`.
5. `AuthContext` expone `login()`, `logout()`, `useAuth()`.

### ChatBot IA — flujo completo
1. POST `/api/chat` con `{ message, history }`.
2. Spam detection → FAQ matching (local, sin tokens) → Cache check.
3. Si no hay match → Gemini API (`gemini-2.5-flash`) con system prompt + historial (10 msgs).
4. Timeout 10s con fallback graceful.
5. URLs en respuesta parseadas → botones con emojis (PDF, GitHub, LinkedIn, YouTube).
6. Rate limit: 20 req/15min por IP.

### Blog — sistema de posts
- **Almacenamiento**: archivos `.md` en `frontend/public/posts/` + `index.json` con metadatos.
- **Metadatos**: slug, title, date, excerpt, tags, status (`published`/`draft`), seoTitle, seoDescription, ogImage, canonicalUrl, noindex.
- **Renderizado**: `ReactMarkdown` con GFM, syntax highlighting, raw HTML sanitizado con DOMPurify.

## Convenciones de código

### Naming
| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Componentes React | PascalCase `.jsx` | `ChatBot.jsx`, `ProjectCard.jsx` |
| Páginas | PascalCase `.jsx` | `Home.jsx`, `BlogPost.jsx` |
| Hooks | camelCase con prefijo `use` | `useProjects()`, `useTheme()` |
| Helpers/utils | camelCase `.js` | `slugify.js`, `faqMatcher.js` |
| Constantes | SCREAMING_SNAKE_CASE | `SYSTEM_PROMPT`, `CONTENT_PATH` |
| Variables | camelCase | `featuredProjects`, `isAuthenticated` |
| Rutas URL | kebab-case | `/sobre-mi`, `/politica-cookies` |
| CSS variables | kebab-case | `--bg-primary`, `--accent-secondary` |
| Archivos datos | camelCase | `faqAnswers.json`, `webProjects.js` |

### Patrones frontend
- **Componentes funcionales** con hooks (`useState`, `useEffect`, `useCallback`, `useContext`).
- **Context API** para estado global: `AuthContext`, `ThemeContext`.
- **Props destructuring** inmediato en la definición de función.
- **Lazy loading** de todas las páginas en `AppRoutes.jsx`.
- **Tailwind utility-first** + CSS variables para colores del tema.
- **i18n**: `useTranslation()` hook, keys en `common.json`.

### Patrones backend
- **ES Modules** (`import/export`).
- **Express Router** por dominio (auth, chat, contact, posts, projects, images).
- **Middleware stack**: helmet → cors → json → urlencoded → static → routes.
- **Validación**: `express-validator` en cada ruta con sanitización.
- **Rate limiting** por tipo: login (10/15min), contact (5/10min), chat (20/15min).

### Tema oscuro/claro
- CSS variables en `:root` y `:root[data-theme="dark"]`.
- Colores primarios: **Fuchsia** (`#e879f9`) + **Cyan** (`#22d3ee`).
- `ThemeContext` con persistencia en localStorage + detección OS.
- Toggle disponible en navbar y sidebar CMS.

## Estructura de archivos

### Frontend
```
frontend/src/
├── components/     → Componentes reutilizables (.jsx)
├── components/cms/ → Componentes del CMS (editor, protección)
├── pages/          → Páginas públicas (.jsx)
├── pages/cms/      → Páginas del CMS Bitácora
├── pages/portfolio/ → Subpáginas del portfolio
├── hooks/          → Custom hooks (useProjects, useTheme)
├── context/        → Providers (AuthContext, ThemeContext)
├── data/           → Datos estáticos (expertise, services, webProjects)
├── design/         → Design tokens
├── lib/            → Utilidades cliente (cmsApi.js)
├── utils/          → Helpers (analytics, slugify)
├── locales/{es,en}/ → Traducciones JSON
├── routes/         → AppRoutes.jsx (lazy loading)
├── assets/         → Imágenes, SVGs
├── App.jsx         → Componente raíz
├── index.css       → Estilos globales + variables CSS
├── i18n.js         → Configuración i18n
└── main.jsx        → Entry point
```

### Backend
```
backend/
├── config/         → cors.js, paths.js
├── middleware/      → auth.js (JWT), rateLimiters.js
├── routes/         → auth, chat, contact, posts, projects, images
├── routes/cms/     → Rutas CMS protegidas
├── data/           → systemPrompt.js, faqAnswers.json
├── utils/          → faqMatcher.js, messageProtection.js
├── uploads/        → Directorio temporal uploads
├── config.js       → Configuración centralizada
└── server.js       → Entry point Express
```

### Contenido estático
```
frontend/public/
├── posts/
│   ├── index.json       → Índice de posts (metadatos)
│   ├── *.md             → Posts en Markdown
│   ├── images/          → Imágenes de posts
│   └── documents/       → PDFs y documentos
├── projects.json        → Lista de proyectos
├── robots.txt, sitemap.xml → SEO
└── assets/, images/     → Assets estáticos
```

## Variables de entorno requeridas (.env)

| Variable | Uso |
|----------|-----|
| `CMS_USERNAME` | Usuario login CMS |
| `CMS_PASSWORD` | Password login CMS |
| `JWT_SECRET` | Secreto para firmar JWT |
| `GEMINI_API_KEY` | API key Google Gemini |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Configuración email |
| `CONTACT_EMAIL` | Email destino contacto |
| `FRONTEND_URL` | URL frontend (CORS) |
| `CONTENT_PATH` | Ruta al contenido (default: `../frontend/public`) |

## Seguridad implementada

- **Helmet**: headers HTTP seguros (CSP, XSS, clickjacking).
- **CORS**: whitelist de orígenes permitidos.
- **Rate limiting**: por IP y por ruta (login, chat, contacto).
- **JWT**: tokens 24h, verificación en middleware, sessionStorage.
- **Timing-safe**: comparación de credenciales resistente a timing attacks.
- **Validación**: express-validator en todos los endpoints.
- **Sanitización**: DOMPurify para HTML en markdown.
- **Honeypot**: campo `_website` anti-spam en formulario de contacto.
- **Spam detection**: patrones en `messageProtection.js` para chatbot.

## Desarrollo local

```bash
# Frontend (dev con HMR)
cd frontend && npm install && npm run dev  # → http://localhost:5173

# Backend
cd backend && npm install && node server.js  # → http://localhost:3000

# Docker (producción)
docker compose up --build  # → http://localhost:8081
```

El proxy de Vite redirige `/api` a `localhost:3000` en desarrollo.

## Notas importantes

- **Sin testing automatizado** — no hay Jest, Vitest ni Cypress configurados.
- **Sin TypeScript** — proyecto en JavaScript puro (.jsx/.js), aunque hay @types instalados como devDependencies.
- **Sin base de datos** — todo el contenido es archivos planos (JSON + Markdown).
- **Logging simple** — `console.log` directo, sin Winston/Pino ni monitoreo (Sentry).
- **Vite vendor splitting** — chunks separados: react-vendor, animation-vendor, icons-vendor, swiper-vendor.
