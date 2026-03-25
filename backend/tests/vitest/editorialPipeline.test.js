import { beforeEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import request from 'supertest';

const repositoryState = vi.hoisted(() => ({
    posts: new Map(),
    revisions: new Map(),
    nextRevisionId: 1,
}));

function clone(value) {
    return value ? JSON.parse(JSON.stringify(value)) : value;
}

function rememberRevision(post, source) {
    const snapshots = repositoryState.revisions.get(post.slug) || [];
    snapshots.unshift({
        id: repositoryState.nextRevisionId++,
        revision: post.revision,
        source,
        createdAt: `2026-03-25T00:00:0${Math.min(post.revision, 9)}.000Z`,
        snapshot: clone(post),
    });
    repositoryState.revisions.set(post.slug, snapshots);
}

function createRevisionConflictError(currentRevision) {
    const error = new Error('La revision del post esta desactualizada. Recarga antes de guardar.');
    error.code = 'REVISION_CONFLICT';
    error.currentRevision = currentRevision;
    return error;
}

vi.mock('../../lib/contentRepository.js', () => ({
    listPostsForCms: vi.fn(async () => Array.from(repositoryState.posts.values()).map(clone)),
    getPostForCms: vi.fn(async (slug) => clone(repositoryState.posts.get(slug) || null)),
    listPostsForSitemap: vi.fn(async () => Array.from(repositoryState.posts.values()).filter(post => post.status === 'published').map(post => ({ slug: post.slug, date: post.date }))),
    createPost: vi.fn(async (data) => {
        const post = {
            ...clone(data),
            revision: 1,
            updatedAt: '2026-03-25T00:00:01.000Z',
            lastAutosavedAt: null,
            readingTime: data.readingTime || 4,
            coverImage: data.coverImage || '/posts/images/cover.webp',
            tocTitles: data.tocTitles || ['Contrato editorial'],
            attachmentsMeta: data.attachmentsMeta || [{ src: '/posts/documents/guia.pdf', title: 'Guia PDF', fileType: 'pdf', display: 'embed' }],
        };

        repositoryState.posts.set(post.slug, post);
        rememberRevision(post, post.status === 'published' ? 'publish' : 'manual-save');
        return clone(post);
    }),
    updatePost: vi.fn(async (slug, patch, { source = 'manual-save' } = {}) => {
        const current = repositoryState.posts.get(slug);
        if (!current) return null;
        if (patch.revision !== undefined && patch.revision !== current.revision) {
            throw createRevisionConflictError(current.revision);
        }

        const next = {
            ...current,
            ...clone(patch),
            revision: current.revision + 1,
            updatedAt: `2026-03-25T00:00:0${Math.min(current.revision + 1, 9)}.000Z`,
            lastAutosavedAt: current.lastAutosavedAt,
        };

        repositoryState.posts.set(slug, next);
        rememberRevision(next, source);
        return clone(next);
    }),
    autosavePost: vi.fn(async (slug, patch) => {
        const current = repositoryState.posts.get(slug);
        if (!current) return null;
        if (patch.revision !== undefined && patch.revision !== current.revision) {
            throw createRevisionConflictError(current.revision);
        }

        const next = {
            ...current,
            ...clone(patch),
            revision: current.revision + 1,
            updatedAt: `2026-03-25T00:00:0${Math.min(current.revision + 1, 9)}.000Z`,
            lastAutosavedAt: `2026-03-25T00:00:0${Math.min(current.revision + 1, 9)}.000Z`,
        };

        repositoryState.posts.set(slug, next);
        rememberRevision(next, 'autosave');
        return clone(next);
    }),
    listPostRevisions: vi.fn(async (slug) => {
        if (!repositoryState.posts.has(slug)) return null;
        return clone((repositoryState.revisions.get(slug) || []).map(({ id, revision, source, createdAt }) => ({ id, revision, source, createdAt })));
    }),
    restorePostRevision: vi.fn(async (slug, revisionId, expectedRevision) => {
        const current = repositoryState.posts.get(slug);
        if (!current) return null;
        if (expectedRevision !== undefined && expectedRevision !== current.revision) {
            throw createRevisionConflictError(current.revision);
        }

        const snapshot = (repositoryState.revisions.get(slug) || []).find(item => item.id === revisionId);
        if (!snapshot) return undefined;

        const next = {
            ...clone(snapshot.snapshot),
            revision: current.revision + 1,
            updatedAt: `2026-03-25T00:00:0${Math.min(current.revision + 1, 9)}.000Z`,
            lastAutosavedAt: current.lastAutosavedAt,
        };

        repositoryState.posts.set(slug, next);
        rememberRevision(next, 'restore');
        return clone(next);
    }),
    deletePost: vi.fn(async () => true),
    getPostForPublic: vi.fn(async (slug) => {
        const post = repositoryState.posts.get(slug);
        return post?.status === 'published' ? clone(post) : null;
    }),
    listPostsForPublic: vi.fn(async () => Array.from(repositoryState.posts.values()).filter(post => post.status === 'published').map(clone)),
    listProjectsForPublic: vi.fn(async () => []),
}));

vi.mock('../../middleware/auth.js', () => ({
    verifyCmsToken: (req, _res, next) => {
        req.user = { username: 'vitest-admin' };
        next();
    },
}));

vi.mock('../../lib/logger.js', () => ({
    logger: {
        child: () => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() }),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
    },
}));

vi.mock('../../lib/sitemap.js', () => ({
    generateSitemap: vi.fn(async () => undefined),
}));

import postsRouter from '../../routes/posts.js';
import publicContentRouter from '../../routes/publicContent.js';
import { errorHandler } from '../../middleware/errorHandler.js';
import { notFoundHandler } from '../../middleware/notFoundHandler.js';

function buildApp() {
    const app = express();
    app.use(express.json());
    app.set('trust proxy', ['loopback']);
    app.use('/api/bitacora/posts', postsRouter);
    app.use('/api', publicContentRouter);
    app.use(notFoundHandler);
    app.use(errorHandler);
    return app;
}

describe('editorial pipeline integration', () => {
    beforeEach(() => {
        repositoryState.posts.clear();
        repositoryState.revisions.clear();
        repositoryState.nextRevisionId = 1;
    });

    it('persiste un post html-first desde CMS y lo expone al render publico', async () => {
        const app = buildApp();
        const richHtml = '<h2>Contrato editorial</h2><div data-block="image-grid" data-columns="2" data-images="[{&quot;src&quot;:&quot;/posts/images/uno.webp&quot;,&quot;alt&quot;:&quot;Uno&quot;}]"></div><div data-block="document" data-src="/posts/documents/guia.pdf" data-title="Guia PDF" data-filename="guia.pdf" data-file-type="pdf" data-display="embed"></div><pre data-block="code" data-language="bash" data-filename="deploy.sh"><code>npm run deploy</code></pre>';

        const created = await request(app)
            .post('/api/bitacora/posts')
            .send({
                title: 'Pipeline rico',
                slug: 'pipeline-rico',
                format: 'html',
                contentHtml: richHtml,
                status: 'published',
                date: '2026-03-25',
                tags: ['cms', 'render'],
            });

        expect(created.status).toBe(201);
        expect(created.body.format).toBe('html');
        expect(created.body.contentHtml).toContain('data-block="image-grid"');
        expect(created.body.revision).toBe(1);

        const publicPost = await request(app).get('/api/posts/pipeline-rico');

        expect(publicPost.status).toBe(200);
        expect(publicPost.body.slug).toBe('pipeline-rico');
        expect(publicPost.body.contentHtml).toContain('data-block="document"');
        expect(publicPost.body.contentHtml).toContain('data-block="code"');
        expect(publicPost.body.tags).toEqual(['cms', 'render']);
    });

    it('cubre autosave, revisiones y restore con contrato consistente', async () => {
        const app = buildApp();

        const created = await request(app)
            .post('/api/bitacora/posts')
            .send({
                title: 'Versionado',
                slug: 'versionado',
                format: 'html',
                contentHtml: '<p>Revision inicial</p>',
                status: 'published',
                date: '2026-03-25',
            });

        const autosaved = await request(app)
            .post('/api/bitacora/posts/versionado/autosave')
            .send({
                revision: created.body.revision,
                format: 'html',
                contentHtml: '<p>Borrador autosave</p>',
            });

        expect(autosaved.status).toBe(200);
        expect(autosaved.body.revision).toBe(2);
        expect(autosaved.body.lastAutosavedAt).toBeTruthy();

        const revisions = await request(app).get('/api/bitacora/posts/versionado/revisions');

        expect(revisions.status).toBe(200);
        expect(revisions.body.map(item => item.source)).toContain('autosave');
        const originalRevisionId = revisions.body.find(item => item.revision === 1)?.id;

        const restored = await request(app)
            .post('/api/bitacora/posts/versionado/restore')
            .send({ revisionId: originalRevisionId, revision: autosaved.body.revision });

        expect(restored.status).toBe(200);
        expect(restored.body.revision).toBe(3);
        expect(restored.body.contentHtml).toContain('Revision inicial');

        const publicPost = await request(app).get('/api/posts/versionado');

        expect(publicPost.status).toBe(200);
        expect(publicPost.body.contentHtml).toContain('Revision inicial');
    });
});
