import { describe, expect, it } from 'vitest';
import { deriveHtmlMetadata } from '../../utils/htmlMetadata.js';

describe('deriveHtmlMetadata', () => {
    it('deriva cover, tiempo de lectura, toc y adjuntos desde HTML saneado', () => {
        const metadata = deriveHtmlMetadata(`
            <h1>Titulo</h1>
            <p>Una intro con varias palabras para medir lectura.</p>
            <img src="/posts/images/cover.webp" alt="cover" />
            <h2>Primer paso</h2>
            <p>Mas contenido relevante para superar el minimo de palabras.</p>
            <div data-block="document" data-src="/posts/documents/guia.pdf" data-title="Guia" data-file-type="pdf" data-display="embed" data-embed-height="640"></div>
            <h3>Detalles</h3>
        `);

        expect(metadata.coverImage).toBe('/posts/images/cover.webp');
        expect(metadata.readingTime).toBeGreaterThanOrEqual(4);
        expect(metadata.tocTitles).toEqual(['Primer paso', 'Detalles']);
        expect(metadata.attachmentsMeta).toEqual([
            {
                src: '/posts/documents/guia.pdf',
                title: 'Guia',
                fileType: 'pdf',
                display: 'embed',
            },
        ]);
    });

    it('respeta fallbackImage cuando no hay imagen en el contenido', () => {
        const metadata = deriveHtmlMetadata('<p>Solo texto</p>', { fallbackImage: '/fallback.png' });

        expect(metadata.coverImage).toBe('/fallback.png');
        expect(metadata.tocTitles).toEqual([]);
    });
});
