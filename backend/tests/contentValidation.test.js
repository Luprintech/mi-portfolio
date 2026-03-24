import assert from 'node:assert/strict';
import {
    isValidSlug,
    sanitizePostInput,
    sanitizeProjectInput,
    validateRouteSlug,
} from '../utils/contentValidation.js';

export function runContentValidationTests(runTest) {
    runTest('validateRouteSlug accepts normalized slugs', () => {
        assert.equal(isValidSlug('mi-post'), true);
        assert.equal(validateRouteSlug('mi-post'), 'mi-post');
        assert.equal(validateRouteSlug('Mi Post'), null);
    });

    runTest('sanitizePostInput normalizes optional fields', () => {
        const { errors, data } = sanitizePostInput({
            title: '  Mi post  ',
            slug: 'mi-post',
            content: 'Contenido valido',
            tags: ['react', 'react', 'seo'],
            ogImage: '/posts/images/cover.jpg',
            canonicalUrl: 'https://guadalupecano.es/blog/mi-post',
            noindex: 'false',
            status: 'published',
            date: '2026-03-12',
        });

        assert.deepEqual(errors, []);
        assert.equal(data.title, 'Mi post');
        assert.deepEqual(data.tags, ['react', 'seo']);
        assert.equal(data.ogImage, '/posts/images/cover.jpg');
        assert.equal(data.canonicalUrl, 'https://guadalupecano.es/blog/mi-post');
        assert.equal(data.noindex, false);
    });

    runTest('sanitizePostInput rejects invalid payloads', () => {
        const { errors } = sanitizePostInput({
            title: '',
            slug: 'Slug invalido',
            content: '',
            status: 'active',
        });

        assert.ok(errors.length >= 3);
    });

    runTest('sanitizePostInput validates tocTitles correctly', () => {
        const { errors, data } = sanitizePostInput({
            title: 'Mi post',
            slug: 'mi-post',
            content: 'Contenido valido',
            tocTitles: ['Introducción', 'Desarrollo', 'Conclusión'],
            status: 'published',
            date: '2026-03-12',
        });

        assert.deepEqual(errors, []);
        assert.deepEqual(data.tocTitles, ['Introducción', 'Desarrollo', 'Conclusión']);
    });

    runTest('sanitizePostInput rejects invalid tocTitles', () => {
        const { data } = sanitizePostInput({
            title: 'Mi post',
            slug: 'mi-post',
            content: 'Contenido valido',
            tocTitles: [123, null, { invalid: true }, '   ', 'Título válido'],
            status: 'published',
            date: '2026-03-12',
        });

        assert.deepEqual(data.tocTitles, ['Título válido']);
    });

    runTest('sanitizePostInput limits tocTitles to 12 items and 120 chars', () => {
        const longTitle = 'A'.repeat(150);
        const titles = Array(15).fill('Título');
        titles[0] = longTitle;

        const { data } = sanitizePostInput({
            title: 'Mi post',
            slug: 'mi-post',
            content: 'Contenido valido',
            tocTitles: titles,
            status: 'published',
            date: '2026-03-12',
        });

        assert.equal(data.tocTitles.length, 12);
        assert.ok(!data.tocTitles.includes(longTitle));
    });

    runTest('sanitizePostInput handles empty tocTitles', () => {
        const { data } = sanitizePostInput({
            title: 'Mi post',
            slug: 'mi-post',
            content: 'Contenido valido',
            tocTitles: [],
            status: 'published',
            date: '2026-03-12',
        });

        assert.deepEqual(data.tocTitles, []);
    });

    runTest('sanitizeProjectInput validates URLs and categories', () => {
        const { errors, data } = sanitizeProjectInput({
            id: 'cms-pro',
            title: 'CMS Pro',
            tech: ['react', 'node', 'react'],
            github: 'https://github.com/example/repo',
            demo: 'https://example.com',
            image: '/posts/images/project.jpg',
            featured: 'true',
            category: 'cms',
        });

        assert.deepEqual(errors, []);
        assert.deepEqual(data.tech, ['react', 'node']);
        assert.equal(data.featured, true);
        assert.equal(data.category, 'cms');
    });

    runTest('sanitizeProjectInput rejects invalid categories', () => {
        const { errors } = sanitizeProjectInput({
            id: 'cms-pro',
            title: 'CMS Pro',
            category: 'mobile',
        });

        assert.ok(errors.includes('La categoria del proyecto no es valida.'));
    });
}
