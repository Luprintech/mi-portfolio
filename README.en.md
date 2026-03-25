# Mi web

[Leer en espanol](README.md)

Full-stack personal portfolio with a public website, technical blog, custom CMS, and an Express API. The repository is split into two applications (`frontend/` and `backend/`) that share an initial content layer in `frontend/public`, while the current operational state for posts and projects lives in PostgreSQL.

## Table of Contents

- [Overview](#overview)
- [Verified stack](#verified-stack)
- [Current architecture](#current-architecture)
- [Repository structure](#repository-structure)
- [Requirements](#requirements)
- [Local setup](#local-setup)
- [Environment variables](#environment-variables)
- [Available scripts](#available-scripts)
- [Content source of truth](#content-source-of-truth)
- [API and relevant routes](#api-and-relevant-routes)
- [Docker and deployment](#docker-and-deployment)
- [Testing and CI](#testing-and-ci)
- [Troubleshooting](#troubleshooting)
- [Documentation status](#documentation-status)

## Overview

### What is included

- Public website built with React + Vite.
- Private CMS embedded in the SPA under `/bitacora`.
- Express REST API for authentication, public content, contact, chat, and Open Graph metadata.
- PostgreSQL persistence for posts and projects.
- Editorial files and public assets stored on the filesystem (`posts/`, images, documents, audio, and `sitemap.xml`).
- Deployment setup with Docker Compose, Nginx, and a shared content volume.

### How content flows today

1. The public site consumes `GET /api/posts` and `GET /api/projects`.
2. The CMS creates and updates posts and projects in PostgreSQL.
3. The backend performs a one-time seed import from `frontend/public` when the database is empty.
4. Image, document, and audio uploads are stored under `CONTENT_PATH/posts/...`.
5. The backend regenerates `sitemap.xml` on startup and after changes to published posts.

## Verified stack

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
- JWT for CMS access
- Nodemailer for contact forms
- Gemini API for chat
- Vitest + Supertest

### Infrastructure

- Docker Compose
- PostgreSQL 16 (`postgres:16-alpine`)
- Nginx as the frontend server and reverse proxy

## Current architecture

```text
frontend/       -> public SPA + CMS interface
backend/        -> REST API + business logic + data access
PostgreSQL      -> operational source of truth for posts and projects
CONTENT_PATH    -> shared content root (post seeds, media, sitemap)
frontend/public -> initial seed and local fallback when CONTENT_PATH is unset
```

### Verified implementation details

- `backend/app.js` validates `JWT_SECRET`, `CMS_USERNAME`, and `CMS_PASSWORD` before startup.
- `backend/lib/database.js` waits for PostgreSQL, ensures the schema, and runs the initial file import when needed.
- `frontend/src/hooks/useProjects.js` and `frontend/src/pages/Blog.jsx` consume the public API instead of reading `public/` JSON files at runtime.
- `backend/config/paths.js` resolves `CONTENT_PATH` and falls back to `frontend/public` locally.
- `backend/config/cors.js` allows `localhost:5173`, production domains, and `FRONTEND_URL`.

## Repository structure

```text
.
|- frontend/                  # public SPA, CMS, assets, and Vite build
|  |- public/                 # initial seed and shared public content
|  |- src/                    # components, pages, hooks, routes, utilities
|  |- package.json
|  `- Dockerfile
|- backend/                   # Express API, PostgreSQL access, CMS routes
|  |- config/
|  |- db/migrations/
|  |- lib/
|  |- middleware/
|  |- routes/
|  |- tests/
|  |- package.json
|  `- Dockerfile
|- .github/workflows/ci.yml   # continuous integration pipeline
|- docker-compose.yml         # frontend + backend + postgres stack
|- nginx.conf                 # Nginx configuration for traditional deployment
|- README.md
`- README.en.md
```

## Requirements

- Node.js 20 or newer
- npm
- A reachable PostgreSQL instance for the backend
- Docker and Docker Compose if you want the full stack locally

## Local setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npm start
```

The backend listens on `http://localhost:3000` by default.

Verified notes:

- The server will not start without `JWT_SECRET`, `CMS_USERNAME`, and `CMS_PASSWORD`.
- You need either `DATABASE_URL` or a valid `PG*` PostgreSQL configuration.
- On startup it checks the connection, ensures the schema, and imports seed content if the database is empty.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The development app runs at `http://localhost:5173`.

Verified notes:

- The frontend uses `VITE_API_URL` as the API base URL; if it is unset, it falls back to relative requests.
- In local development the current environment setup expects the backend at `http://localhost:3000`.
- The CMS is part of the same SPA and lives under `/bitacora`.

## Environment variables

### Frontend (`frontend/.env.example`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | No | Base API URL. If empty, the frontend uses relative paths and works well behind Nginx. |
| `VITE_SITE_URL` | Recommended | Public canonical site URL used to build absolute links in the frontend. |

### Backend (`backend/.env.example`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | No | Express server port. Defaults to `3000`. |
| `FRONTEND_URL` | Recommended | Controls CORS and is used to build the sitemap. |
| `SITE_URL` | No | Canonical site URL used by `/api/og`; falls back to `FRONTEND_URL`. |
| `CMS_USERNAME` | Yes | CMS username. |
| `CMS_PASSWORD` | Yes | CMS password. |
| `JWT_SECRET` | Yes | Secret used to sign CMS JWT tokens. |
| `SMTP_HOST` | Only if using contact | SMTP host for `POST /api/contact`. |
| `SMTP_PORT` | Only if using contact | SMTP port. The example uses `465`. |
| `SMTP_USER` | Only if using contact | SMTP username. |
| `SMTP_PASS` | Only if using contact | SMTP password. |
| `CONTACT_EMAIL` | No | Contact form recipient; falls back to `SMTP_USER`. |
| `GEMINI_API_KEY` | Only if using chat | Enables `POST /api/chat`; without it the route returns `503`. |
| `CONTENT_PATH` | No | Physical path for shared content. Locally it defaults to `frontend/public`. |
| `DATABASE_URL` | Yes* | PostgreSQL connection string with priority over `PG*`. |
| `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` | Yes* | Alternative PostgreSQL configuration if `DATABASE_URL` is not used. |
| `PGSSLMODE` | No | Basic SSL control for PostgreSQL. |

`*` You need either `DATABASE_URL` or a complete `PG*` configuration.

## Available scripts

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

Notes:

- `npm start` runs `node server.js`.
- The backend does not have a dedicated lint script; `npm run check` is the light validation command currently available.
- `npm run migrate` executes the SQL migrations in `backend/db/migrations/`.

## Content source of truth

### Current runtime

- Posts: `posts` table in PostgreSQL.
- Projects: `projects` table in PostgreSQL.
- Editorial assets: filesystem under `CONTENT_PATH/posts/`.

### Initial seed and shared content

- `frontend/public/posts/index.json` and `frontend/public/posts/*.md` are used for the initial post import.
- `frontend/public/projects.json` is used for the initial project import.
- `frontend/public/posts/images/`, `frontend/public/posts/documents/`, and `frontend/public/posts/audio/` act as the local base or seed for shared content.

In practice, `frontend/public` is NO LONGER the operational runtime source of truth, but it is still important as the initial seed and as the default path when `CONTENT_PATH` is not configured.

## API and relevant routes

### Public

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
- Post CRUD under `/api/bitacora/posts`
- Project CRUD under `/api/bitacora/projects`
- Image, document, and audio uploads under `/api/bitacora/*`

## Docker and deployment

The reproducible deployment setup in this repository lives in `docker-compose.yml`.

### Included services

- `postgres`: PostgreSQL 16 with persistent `postgres_data` volume.
- `backend`: Express API with `CONTENT_PATH=/data/content` and PostgreSQL connection through `PG*` variables.
- `frontend`: Vite build served by Nginx at `http://localhost:8081`.

### Start the stack

```bash
cp backend/.env.example backend/.env
# Fill backend/.env with real values

docker-compose up -d --build
```

Verified details:

- `backend/Dockerfile` copies `frontend/public` into `/app/seed-content` for first-run bootstrapping.
- The backend mounts the shared `content_data` volume at `/data/content`.
- The frontend mounts the same volume read-only to serve shared public content.
- The repository CI is validation-only; deployment is not automated through GitHub Actions.

## Testing and CI

Current automation lives in `.github/workflows/ci.yml`.

### What CI runs

- Frontend: `npm ci`, `npm run lint`, `npm test`, and `npm run build`.
- Backend: `npm ci`, `npm test`, and `npm run check`.

### Available coverage

- The frontend uses Vitest + Testing Library.
- The backend uses Vitest + Supertest and also keeps a legacy runner (`npm run test:legacy`).
- There is no automated deployment or release pipeline in this repository.

## Troubleshooting

### Backend does not start

- Check `JWT_SECRET`, `CMS_USERNAME`, and `CMS_PASSWORD`.
- Check `DATABASE_URL` or the `PG*` variables.
- Confirm PostgreSQL is reachable before startup.

### Frontend cannot reach the API

- In local development, make sure the backend is available at `localhost:3000` or adjust `VITE_API_URL`.
- In deployed environments, avoid trailing slashes in public URLs and review `FRONTEND_URL`.

### Contact form fails

- `POST /api/contact` depends on a real SMTP configuration.
- Without `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASS`, email delivery will fail.

### Chat returns `503`

- That is the expected behavior when `GEMINI_API_KEY` is missing or Gemini is temporarily unavailable.

## Documentation status

This README is aligned with the verified repository state for:

- actual scripts in `frontend/package.json` and `backend/package.json`
- environment variables documented in `frontend/.env.example` and `backend/.env.example`
- the current architecture with PostgreSQL as the operational source of truth and `frontend/public` as the initial seed
- real CI behavior in `.github/workflows/ci.yml`
- deployment setup in `docker-compose.yml`, the Dockerfiles, and the shared content volume
