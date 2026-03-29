import fsExtra from 'fs-extra';
import path from 'path';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import {
    CONTENT_PATH,
    POSTS_DIR,
    POSTS_INDEX,
    PROJECTS_FILE,
} from '../config/paths.js';
import { logger } from './logger.js';

const dbLogger = logger.child({ area: 'database' });

let pool;

function parseSslConfig() {
    const sslMode = process.env.PGSSLMODE;
    if (!sslMode || sslMode === 'disable') return false;

    return { rejectUnauthorized: sslMode === 'verify-full' };
}

function getPoolConfig() {
    if (process.env.DATABASE_URL) {
        return {
            connectionString: process.env.DATABASE_URL,
            ssl: parseSslConfig(),
        };
    }

    if (!process.env.PGUSER || !process.env.PGPASSWORD || !process.env.PGDATABASE) {
        throw new Error(
            'Missing required PostgreSQL environment variables: PGUSER, PGPASSWORD and PGDATABASE must be set.'
        );
    }

    return {
        host: process.env.PGHOST || '127.0.0.1',
        port: Number(process.env.PGPORT) || 5432,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        ssl: parseSslConfig(),
    };
}

function getDateString(value) {
    if (!value) return new Date().toISOString().slice(0, 10);
    if (typeof value === 'string') return value.slice(0, 10);
    return new Date(value).toISOString().slice(0, 10);
}

async function readSeedPosts() {
    if (!(await fsExtra.pathExists(POSTS_INDEX))) {
        return [];
    }

    const index = await fsExtra.readJson(POSTS_INDEX).catch(() => []);
    if (!Array.isArray(index)) return [];

    return Promise.all(
        index.map(async (post) => {
            const filename = `${post.slug}.md`;
            const preferredFile = post.filename || filename;
            const contentPath = path.join(POSTS_DIR, preferredFile);
            const content = await fsExtra.readFile(contentPath, 'utf-8').catch(() => '');

            return {
                slug: post.slug,
                title: post.title,
                content,
                excerpt: post.excerpt || '',
                tags: Array.isArray(post.tags) ? post.tags : [],
                publicationDate: getDateString(post.date),
                seoTitle: post.seoTitle || '',
                seoDescription: post.seoDescription || '',
                ogImage: post.ogImage || '',
                canonicalUrl: post.canonicalUrl || '',
                noindex: Boolean(post.noindex),
                featured: Boolean(post.featured),
                status: post.status || 'draft',
            };
        })
    );
}

async function readSeedProjects() {
    if (!(await fsExtra.pathExists(PROJECTS_FILE))) {
        return [];
    }

    const projects = await fsExtra.readJson(PROJECTS_FILE).catch(() => []);
    if (!Array.isArray(projects)) return [];

    return projects.map((project, index) => ({
        id: project.id,
        title: project.title,
        description: project.description || '',
        tech: Array.isArray(project.tech) ? project.tech : [],
        github: project.github || '',
        demo: project.demo || '',
        image: project.image || '',
        featured: Boolean(project.featured),
        category: project.category || 'code',
        sortOrder: index,
    }));
}

async function runInitialImport(client) {
    const metaCheck = await client.query(
        'SELECT value FROM app_meta WHERE key = $1 LIMIT 1',
        ['initial_file_import_v1']
    );

    if (metaCheck.rowCount > 0) {
        return;
    }

    const postCountResult = await client.query('SELECT COUNT(*)::int AS count FROM posts');
    const projectCountResult = await client.query('SELECT COUNT(*)::int AS count FROM projects');

    let importedPosts = 0;
    let importedProjects = 0;

    if (postCountResult.rows[0].count === 0) {
        const posts = await readSeedPosts();

        for (const post of posts) {
            await client.query(
                `INSERT INTO posts (
                    slug,
                    title,
                    content,
                    excerpt,
                    tags,
                    publication_date,
                    seo_title,
                    seo_description,
                    og_image,
                    canonical_url,
                    noindex,
                    featured,
                    status
                ) VALUES (
                    $1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10, $11, $12, $13
                )`,
                [
                    post.slug,
                    post.title,
                    post.content,
                    post.excerpt,
                    JSON.stringify(post.tags),
                    post.publicationDate,
                    post.seoTitle,
                    post.seoDescription,
                    post.ogImage,
                    post.canonicalUrl,
                    post.noindex,
                    post.featured,
                    post.status,
                ]
            );
        }

        importedPosts = posts.length;
    }

    if (projectCountResult.rows[0].count === 0) {
        const projects = await readSeedProjects();

        for (const project of projects) {
            await client.query(
                `INSERT INTO projects (
                    id,
                    title,
                    description,
                    tech,
                    github,
                    demo,
                    image,
                    featured,
                    category,
                    sort_order
                ) VALUES (
                    $1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9, $10
                )`,
                [
                    project.id,
                    project.title,
                    project.description,
                    JSON.stringify(project.tech),
                    project.github,
                    project.demo,
                    project.image,
                    project.featured,
                    project.category,
                    project.sortOrder,
                ]
            );
        }

        importedProjects = projects.length;
    }

    await client.query(
        `INSERT INTO app_meta (key, value)
         VALUES ($1, $2::jsonb)
         ON CONFLICT (key)
         DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [
            'initial_file_import_v1',
            JSON.stringify({
                importedAt: new Date().toISOString(),
                importedPosts,
                importedProjects,
                contentPath: CONTENT_PATH,
            }),
        ]
    );

    dbLogger.info('Initial content import completed', {
        importedPosts,
        importedProjects,
        contentPath: CONTENT_PATH,
    });
}

/**
 * Si la tabla cms_users está vacía, crea el usuario admin inicial
 * usando las credenciales de las variables de entorno CMS_USERNAME / CMS_PASSWORD.
 * Esto sólo corre una vez; a partir de ahí los usuarios se gestionan desde el CMS.
 */
async function seedAdminUserIfNeeded(client) {
    const { rows } = await client.query('SELECT COUNT(*)::int AS count FROM cms_users');
    if (rows[0].count > 0) return;

    const username = process.env.CMS_USERNAME;
    const password = process.env.CMS_PASSWORD;

    if (!username || !password) {
        dbLogger.warn('Cannot seed admin user: CMS_USERNAME or CMS_PASSWORD not set');
        return;
    }

    const hash = await bcrypt.hash(password, 12);
    await client.query(
        `INSERT INTO cms_users (username, password_hash, role, active)
         VALUES ($1, $2, 'admin', true)
         ON CONFLICT (username) DO NOTHING`,
        [username, hash]
    );

    dbLogger.info('Admin user seeded from env credentials', { username });
}

export function getPool() {
    if (!pool) {
        pool = new Pool({
            ...getPoolConfig(),
            max: Number(process.env.PGPOOL_MAX) || 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
        });
    }

    return pool;
}

export async function query(text, params) {
    return getPool().query(text, params);
}

export async function withTransaction(callback) {
    const client = await getPool().connect();

    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function waitForDatabase() {
    const attempts = Number(process.env.PG_CONNECT_RETRIES) || 15;
    const delayMs = Number(process.env.PG_CONNECT_DELAY_MS) || 2000;
    let lastError;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        try {
            await query('SELECT 1');
            if (attempt > 1) {
                dbLogger.info('Database connection restored', { attempt });
            }
            return;
        } catch (error) {
            lastError = error;
            dbLogger.warn('Database connection attempt failed', {
                attempt,
                attempts,
                error,
            });
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }

    throw lastError;
}

async function ensureSchema() {
    await query(`
        CREATE TABLE IF NOT EXISTS app_meta (
            key TEXT PRIMARY KEY,
            value JSONB NOT NULL DEFAULT '{}'::jsonb,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS posts (
            id BIGSERIAL PRIMARY KEY,
            slug VARCHAR(80) UNIQUE NOT NULL,
            title VARCHAR(160) NOT NULL,
            content TEXT NOT NULL,
            excerpt VARCHAR(320) NOT NULL DEFAULT '',
            tags JSONB NOT NULL DEFAULT '[]'::jsonb,
            publication_date DATE NOT NULL,
            seo_title VARCHAR(80) NOT NULL DEFAULT '',
            seo_description VARCHAR(180) NOT NULL DEFAULT '',
            og_image TEXT NOT NULL DEFAULT '',
            canonical_url TEXT NOT NULL DEFAULT '',
            noindex BOOLEAN NOT NULL DEFAULT FALSE,
            featured BOOLEAN NOT NULL DEFAULT FALSE,
            status VARCHAR(16) NOT NULL DEFAULT 'draft',
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            CONSTRAINT posts_status_check CHECK (status IN ('draft', 'published'))
        );

        ALTER TABLE posts
            ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;

        ALTER TABLE posts
            ADD COLUMN IF NOT EXISTS toc_titles JSONB NOT NULL DEFAULT '[]'::jsonb;

        ALTER TABLE posts
            ADD COLUMN IF NOT EXISTS show_toc BOOLEAN NOT NULL DEFAULT TRUE;

        ALTER TABLE posts
            ADD COLUMN IF NOT EXISTS format VARCHAR(16);

        ALTER TABLE posts
            ADD COLUMN IF NOT EXISTS content_html TEXT NOT NULL DEFAULT '';

        ALTER TABLE posts
            ADD COLUMN IF NOT EXISTS content_markdown_legacy TEXT NOT NULL DEFAULT '';

        ALTER TABLE posts
            ADD COLUMN IF NOT EXISTS cover_image TEXT NOT NULL DEFAULT '';

        ALTER TABLE posts
            ADD COLUMN IF NOT EXISTS reading_time INTEGER NOT NULL DEFAULT 4;

        ALTER TABLE posts
            ADD COLUMN IF NOT EXISTS attachments_meta JSONB NOT NULL DEFAULT '[]'::jsonb;

        ALTER TABLE posts
            ADD COLUMN IF NOT EXISTS revision INTEGER NOT NULL DEFAULT 0;

        ALTER TABLE posts
            ADD COLUMN IF NOT EXISTS last_autosaved_at TIMESTAMPTZ;

        CREATE TABLE IF NOT EXISTS post_revisions (
            id BIGSERIAL PRIMARY KEY,
            post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
            revision INTEGER NOT NULL,
            snapshot_format VARCHAR(16) NOT NULL,
            snapshot_content_html TEXT NOT NULL DEFAULT '',
            snapshot_content_markdown_legacy TEXT NOT NULL DEFAULT '',
            snapshot_meta JSONB NOT NULL DEFAULT '{}'::jsonb,
            source VARCHAR(24) NOT NULL DEFAULT 'manual-save',
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_post_revisions_post_id_revision
            ON post_revisions (post_id, revision DESC, created_at DESC);

        CREATE INDEX IF NOT EXISTS idx_posts_publication_date
            ON posts (publication_date DESC, created_at DESC);

        CREATE TABLE IF NOT EXISTS projects (
            id VARCHAR(80) PRIMARY KEY,
            title VARCHAR(160) NOT NULL,
            description TEXT NOT NULL DEFAULT '',
            tech JSONB NOT NULL DEFAULT '[]'::jsonb,
            github TEXT NOT NULL DEFAULT '',
            demo TEXT NOT NULL DEFAULT '',
            image TEXT NOT NULL DEFAULT '',
            featured BOOLEAN NOT NULL DEFAULT FALSE,
            category VARCHAR(24) NOT NULL DEFAULT 'code',
            sort_order INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            CONSTRAINT projects_category_check CHECK (category IN ('code', 'cms'))
        );

        CREATE INDEX IF NOT EXISTS idx_projects_sort_order
            ON projects (sort_order ASC, created_at ASC);

        ALTER TABLE projects
            ADD COLUMN IF NOT EXISTS description_en TEXT NOT NULL DEFAULT '';

        -- ── Tabla de usuarios CMS ──────────────────────────────────────────────
        CREATE TABLE IF NOT EXISTS cms_users (
            id         BIGSERIAL    PRIMARY KEY,
            username   VARCHAR(80)  UNIQUE NOT NULL,
            password_hash TEXT       NOT NULL,
            role       VARCHAR(20)  NOT NULL DEFAULT 'editor',
            active     BOOLEAN      NOT NULL DEFAULT TRUE,
            created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
            CONSTRAINT cms_users_role_check CHECK (role IN ('admin', 'editor'))
        );

        CREATE INDEX IF NOT EXISTS idx_cms_users_username
            ON cms_users (username);
    `);
}

export async function ensureDatabaseReady() {
    await waitForDatabase();
    await ensureSchema();
    await withTransaction(runInitialImport);
    await withTransaction(seedAdminUserIfNeeded);
}
