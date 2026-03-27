-- Migration: 0001_initial
-- Description: Schema inicial — tablas app_meta, posts y projects.
-- Idempotente: usa CREATE TABLE IF NOT EXISTS y ALTER TABLE ADD COLUMN IF NOT EXISTS.

-- ── Tabla de metadatos de la app ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS app_meta (
    key        TEXT        PRIMARY KEY,
    value      JSONB       NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Tabla de posts ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS posts (
    id               BIGSERIAL    PRIMARY KEY,
    slug             VARCHAR(80)  UNIQUE NOT NULL,
    title            VARCHAR(160) NOT NULL,
    content          TEXT         NOT NULL,
    excerpt          VARCHAR(320) NOT NULL DEFAULT '',
    tags             JSONB        NOT NULL DEFAULT '[]'::jsonb,
    publication_date DATE         NOT NULL,
    seo_title        VARCHAR(80)  NOT NULL DEFAULT '',
    seo_description  VARCHAR(180) NOT NULL DEFAULT '',
    og_image         TEXT         NOT NULL DEFAULT '',
    canonical_url    TEXT         NOT NULL DEFAULT '',
    noindex          BOOLEAN      NOT NULL DEFAULT FALSE,
    featured         BOOLEAN      NOT NULL DEFAULT FALSE,
    status           VARCHAR(16)  NOT NULL DEFAULT 'draft',
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT posts_status_check CHECK (status IN ('draft', 'published'))
);

-- Columnas añadidas después del schema original (idempotentes)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS featured  BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS toc_titles JSONB  NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS show_toc  BOOLEAN NOT NULL DEFAULT TRUE;

-- Índice de ordenación
CREATE INDEX IF NOT EXISTS idx_posts_publication_date
    ON posts (publication_date DESC, created_at DESC);

-- ── Tabla de proyectos ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS projects (
    id         VARCHAR(80)  PRIMARY KEY,
    title      VARCHAR(160) NOT NULL,
    description TEXT        NOT NULL DEFAULT '',
    tech       JSONB        NOT NULL DEFAULT '[]'::jsonb,
    github     TEXT         NOT NULL DEFAULT '',
    demo       TEXT         NOT NULL DEFAULT '',
    image      TEXT         NOT NULL DEFAULT '',
    featured   BOOLEAN      NOT NULL DEFAULT FALSE,
    category   VARCHAR(24)  NOT NULL DEFAULT 'code',
    sort_order INTEGER      NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT projects_category_check CHECK (category IN ('code', 'cms'))
);

-- Índice de ordenación
CREATE INDEX IF NOT EXISTS idx_projects_sort_order
    ON projects (sort_order ASC, created_at ASC);
