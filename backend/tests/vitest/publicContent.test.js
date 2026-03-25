/**
 * Tests para las rutas públicas de contenido (/api/posts, /api/projects).
 * Mockea el contentRepository para evitar dependencia de base de datos.
 */
import { describe, it, expect, vi, beforeAll } from 'vitest';
import express from 'express';
import request from 'supertest';

// Mockeamos el contentRepository ANTES de importar las rutas
vi.mock('../../lib/contentRepository.js', () => ({
    listPostsForPublic: vi.fn(),
    getPostForPublic: vi.fn(),
    listProjectsForPublic: vi.fn(),
}));

// Mockeamos el logger para no ensuciar la salida
vi.mock('../../lib/logger.js', () => ({
    logger: {
        child: () => ({
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            debug: vi.fn(),
        }),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
    },
}));

import { listPostsForPublic, getPostForPublic, listProjectsForPublic } from '../../lib/contentRepository.js';
import publicContentRouter from '../../routes/publicContent.js';
import { errorHandler } from '../../middleware/errorHandler.js';
import { notFoundHandler } from '../../middleware/notFoundHandler.js';

// Construir una app Express mínima con sólo las rutas públicas
function buildTestApp() {
    const app = express();
    app.use(express.json());
    // trust proxy para que los rate limiters vean IPs correctas
    app.set('trust proxy', ['loopback']);
    app.use('/api', publicContentRouter);
    app.use(notFoundHandler);
    app.use(errorHandler);
    return app;
}

const mockPosts = [
    { slug: 'primer-post', title: 'Primer Post', date: '2026-01-01', excerpt: 'Resumen 1', tags: ['react'] },
    { slug: 'segundo-post', title: 'Segundo Post', date: '2026-02-01', excerpt: 'Resumen 2', tags: ['node'] },
];

const mockProjects = [
    { id: 'proyecto-1', title: 'Proyecto 1', description: 'Desc 1', tech: ['React'], featured: true, category: 'code' },
    { id: 'proyecto-2', title: 'Proyecto 2', description: 'Desc 2', tech: ['Node.js'], featured: false, category: 'cms' },
];

describe('GET /api/posts', () => {
    let app;

    beforeAll(() => {
        app = buildTestApp();
    });

    it('devuelve 200 y la lista de posts cuando hay datos', async () => {
        listPostsForPublic.mockResolvedValue(mockPosts);

        const res = await request(app).get('/api/posts');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toHaveLength(2);
        expect(res.body[0].slug).toBe('primer-post');
    });

    it('devuelve 200 y array vacío cuando no hay posts', async () => {
        listPostsForPublic.mockResolvedValue([]);

        const res = await request(app).get('/api/posts');

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    it('devuelve 500 cuando el repositorio lanza error', async () => {
        listPostsForPublic.mockRejectedValue(new Error('DB error'));

        const res = await request(app).get('/api/posts');

        expect(res.status).toBe(500);
    });
});

describe('GET /api/posts/:slug', () => {
    let app;

    beforeAll(() => {
        app = buildTestApp();
    });

    it('devuelve 200 y el post para un slug válido', async () => {
        const mockPost = { ...mockPosts[0], content: '# Contenido del post' };
        getPostForPublic.mockResolvedValue(mockPost);

        const res = await request(app).get('/api/posts/primer-post');

        expect(res.status).toBe(200);
        expect(res.body.slug).toBe('primer-post');
        expect(res.body.title).toBe('Primer Post');
    });

    it('devuelve 404 cuando el slug no existe', async () => {
        getPostForPublic.mockResolvedValue(null);

        const res = await request(app).get('/api/posts/slug-inexistente');

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('error');
    });

    it('devuelve 400 para un slug con caracteres inválidos', async () => {
        const res = await request(app).get('/api/posts/Slug Invalido Con Espacios');

        expect(res.status).toBe(400);
    });
});

describe('GET /api/projects', () => {
    let app;

    beforeAll(() => {
        app = buildTestApp();
    });

    it('devuelve 200 y la lista de proyectos cuando hay datos', async () => {
        listProjectsForPublic.mockResolvedValue(mockProjects);

        const res = await request(app).get('/api/projects');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toHaveLength(2);
        expect(res.body[0].id).toBe('proyecto-1');
    });

    it('devuelve 200 y array vacío cuando no hay proyectos', async () => {
        listProjectsForPublic.mockResolvedValue([]);

        const res = await request(app).get('/api/projects');

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    it('devuelve 500 cuando el repositorio lanza error', async () => {
        listProjectsForPublic.mockRejectedValue(new Error('DB connection lost'));

        const res = await request(app).get('/api/projects');

        expect(res.status).toBe(500);
    });
});
