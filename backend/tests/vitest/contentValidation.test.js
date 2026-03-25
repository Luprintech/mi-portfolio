/**
 * Tests para las utilidades de validación de contenido.
 * Versión Vitest nativa de los tests existentes en tests/contentValidation.test.js.
 */
import { describe, it, expect } from 'vitest';
import {
    isValidSlug,
    sanitizePostInput,
    sanitizeProjectInput,
    validateRouteSlug,
} from '../../utils/contentValidation.js';

describe('validateRouteSlug', () => {
    it('acepta slugs normalizados', () => {
        expect(isValidSlug('mi-post')).toBe(true);
        expect(validateRouteSlug('mi-post')).toBe('mi-post');
    });

    it('rechaza slugs con espacios o mayúsculas', () => {
        expect(validateRouteSlug('Mi Post')).toBeNull();
        expect(validateRouteSlug('Mi-Post')).toBeNull();
    });

    it('rechaza slugs vacíos', () => {
        expect(validateRouteSlug('')).toBeNull();
        expect(validateRouteSlug(null)).toBeNull();
    });
});

describe('sanitizePostInput', () => {
    it('normaliza campos opcionales correctamente', () => {
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

        expect(errors).toEqual([]);
        expect(data.title).toBe('Mi post');
        expect(data.tags).toEqual(['react', 'seo']); // sin duplicados
        expect(data.ogImage).toBe('/posts/images/cover.jpg');
        expect(data.noindex).toBe(false);
    });

    it('rechaza payloads inválidos', () => {
        const { errors } = sanitizePostInput({
            title: '',
            slug: 'Slug invalido',
            content: '',
            status: 'active',
        });

        expect(errors.length).toBeGreaterThanOrEqual(3);
    });

    it('valida tocTitles correctamente', () => {
        const { errors, data } = sanitizePostInput({
            title: 'Mi post',
            slug: 'mi-post',
            content: 'Contenido valido',
            tocTitles: ['Introducción', 'Desarrollo', 'Conclusión'],
            status: 'published',
            date: '2026-03-12',
        });

        expect(errors).toEqual([]);
        expect(data.tocTitles).toEqual(['Introducción', 'Desarrollo', 'Conclusión']);
    });

    it('filtra tocTitles inválidos', () => {
        const { data } = sanitizePostInput({
            title: 'Mi post',
            slug: 'mi-post',
            content: 'Contenido valido',
            tocTitles: [123, null, { invalid: true }, '   ', 'Título válido'],
            status: 'published',
            date: '2026-03-12',
        });

        expect(data.tocTitles).toEqual(['Título válido']);
    });

    it('acepta revision numérica para bloqueo optimista', () => {
        const { errors, data } = sanitizePostInput({
            title: 'Mi post',
            slug: 'mi-post',
            contentHtml: '<p>Contenido</p>',
            format: 'html',
            revision: 3,
            status: 'draft',
            date: '2026-03-12',
        });

        expect(errors).toEqual([]);
        expect(data.revision).toBe(3);
    });

    it('rechaza revision inválida', () => {
        const { errors } = sanitizePostInput({
            title: 'Mi post',
            slug: 'mi-post',
            contentHtml: '<p>Contenido</p>',
            format: 'html',
            revision: -1,
            status: 'draft',
            date: '2026-03-12',
        });

        expect(errors).toContain('La revision no es valida.');
    });

    it('limita tocTitles a 12 items y 120 chars', () => {
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

        expect(data.tocTitles.length).toBe(12);
        expect(data.tocTitles).not.toContain(longTitle);
    });

    it('rechaza imageGrid con payload JSON invalido', () => {
        const { errors } = sanitizePostInput({
            title: 'Mi post',
            slug: 'mi-post',
            format: 'html',
            contentHtml: '<div data-block="image-grid" data-columns="3" data-images="not-json"></div>',
            status: 'draft',
            date: '2026-03-12',
        });

        expect(errors).toContain('El bloque imageGrid tiene un data-images invalido.');
    });

    it('rechaza documentos sin metadata minima requerida', () => {
        const { errors } = sanitizePostInput({
            title: 'Mi post',
            slug: 'mi-post',
            format: 'html',
            contentHtml: '<div data-block="document" data-src="/posts/documents/guia.pdf"></div>',
            status: 'draft',
            date: '2026-03-12',
        });

        expect(errors).toContain('El bloque de documento requiere data-src y nombre de archivo.');
    });

    it('acepta documentos embebidos con metadata de visor compartido', () => {
        const { errors, data } = sanitizePostInput({
            title: 'Mi post',
            slug: 'mi-post',
            format: 'html',
            contentHtml: '<div data-block="document" data-src="/posts/documents/guia.pdf" data-title="Guia" data-file-type="pdf" data-display="embed" data-embed-height="640" data-embed-width="960"></div>',
            status: 'draft',
            date: '2026-03-12',
        });

        expect(errors).toEqual([]);
        expect(data.contentHtml).toContain('data-embed-height="640"');
        expect(data.contentHtml).toContain('data-embed-width="960"');
    });

    it('rechaza documentos con modo de visualizacion invalido', () => {
        const { errors } = sanitizePostInput({
            title: 'Mi post',
            slug: 'mi-post',
            format: 'html',
            contentHtml: '<div data-block="document" data-src="/posts/documents/guia.pdf" data-title="Guia" data-file-type="pdf" data-display="fullscreen"></div>',
            status: 'draft',
            date: '2026-03-12',
        });

        expect(errors).toContain('El bloque de documento tiene un modo de visualizacion invalido.');
    });

    it('sanea script tags y atributos peligrosos del html canonico', () => {
        const { errors, data } = sanitizePostInput({
            title: 'Mi post',
            slug: 'mi-post',
            format: 'html',
            contentHtml: '<p onclick="alert(1)">Hola</p><script>alert(1)</script><a href="javascript:alert(2)">Abrir</a>',
            status: 'draft',
            date: '2026-03-12',
        });

        expect(errors).toEqual([]);
        expect(data.contentHtml).toBe('<p>Hola</p><a href="#">Abrir</a>');
    });
});

describe('sanitizeProjectInput', () => {
    it('valida URLs y categorías correctamente', () => {
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

        expect(errors).toEqual([]);
        expect(data.tech).toEqual(['react', 'node']); // sin duplicados
        expect(data.featured).toBe(true);
        expect(data.category).toBe('cms');
    });

    it('rechaza categorías inválidas', () => {
        const { errors } = sanitizeProjectInput({
            id: 'cms-pro',
            title: 'CMS Pro',
            category: 'mobile',
        });

        expect(errors).toContain('La categoria del proyecto no es valida.');
    });

    it('acepta categoría code (default)', () => {
        const { errors, data } = sanitizeProjectInput({
            id: 'my-app',
            title: 'My App',
            tech: ['React'],
            category: 'code',
        });

        expect(errors).toEqual([]);
        expect(data.category).toBe('code');
    });
});
