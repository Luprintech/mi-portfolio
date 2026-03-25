import { beforeEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import request from 'supertest';

vi.mock('../../lib/contentRepository.js', () => ({
    getPostForPublic: vi.fn(),
}));

import { getPostForPublic } from '../../lib/contentRepository.js';
import ogMetaRouter from '../../routes/ogMeta.js';

function buildTestApp() {
    const app = express();
    app.use('/api/og', ogMetaRouter);
    return app;
}

describe('GET /api/og/blog/:slug', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('usa canonical y noindex del post cuando existen', async () => {
        const app = buildTestApp();

        getPostForPublic.mockResolvedValue({
            slug: 'seo-post',
            title: 'SEO Post',
            seoTitle: 'SEO Post canonico',
            seoDescription: 'Descripcion SEO real',
            canonicalUrl: 'https://guadalupecano.es/blog/seo-post-canonico',
            ogImage: '/posts/images/seo-cover.webp',
            noindex: true,
        });

        const response = await request(app).get('/api/og/blog/seo-post');

        expect(response.status).toBe(200);
        expect(response.text).toContain('rel="canonical" href="https://guadalupecano.es/blog/seo-post-canonico"');
        expect(response.text).toContain('property="og:url"         content="https://guadalupecano.es/blog/seo-post-canonico"');
        expect(response.text).toContain('name="robots"              content="noindex, nofollow"');
    });
});
