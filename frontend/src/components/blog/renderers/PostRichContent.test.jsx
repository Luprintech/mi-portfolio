import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('./HtmlContentRenderer', () => ({
  default: ({ content }) => <div data-testid="html-renderer">{content}</div>,
}));

vi.mock('./MarkdownLegacyRenderer', () => ({
  default: ({ content }) => <div data-testid="markdown-renderer">{content}</div>,
}));

import PostRichContent from './PostRichContent';
import ImageGridBlock from './ImageGridBlock';
import DocumentBlock from './DocumentBlock';

describe('PostRichContent', () => {
  beforeEach(() => {
    globalThis.IntersectionObserver = class {
      constructor(callback) {
        this.callback = callback;
      }

      observe() {
        this.callback([{ isIntersecting: true, intersectionRatio: 1 }]);
      }

      disconnect() {}
      unobserve() {}
    };

    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it('prioriza el renderer html-first cuando existe contentHtml', async () => {
    render(
      <PostRichContent
        post={{
          format: 'html',
          contentHtml: '<h2>Renderer comun</h2>',
          legacyMarkdown: '## Legacy',
        }}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('html-renderer')).toHaveTextContent('<h2>Renderer comun</h2>');
    });
    expect(screen.queryByTestId('markdown-renderer')).not.toBeInTheDocument();
  });

  it('cae en markdown legacy cuando el post no trae html canonico', async () => {
    render(
      <PostRichContent
        post={{
          format: 'markdown',
          legacyMarkdown: '## Fallback legacy',
        }}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('markdown-renderer')).toHaveTextContent('## Fallback legacy');
    });
    expect(screen.queryByTestId('html-renderer')).not.toBeInTheDocument();
  });
});

describe('rich blocks', () => {
  beforeEach(() => {
    globalThis.IntersectionObserver = class {
      constructor(callback) {
        this.callback = callback;
      }

      observe() {
        this.callback([{ isIntersecting: true, intersectionRatio: 1 }]);
      }

      disconnect() {}
      unobserve() {}
    };

    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(max-width: 767px)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it('renderiza imageGrid con caption y alt explicitos', () => {
    render(
      <ImageGridBlock
        images={[
          { src: '/img/uno.webp', alt: 'Captura uno', caption: 'Caption uno', href: 'https://example.com/demo', openInNewTab: true },
          { src: '/img/dos.webp', alt: 'Captura dos', caption: 'Caption dos' },
        ]}
        config={{
          columns: 2,
          mobileColumns: 2,
          captionMode: 'overlay',
          aspectRatio: 'square',
          imageFit: 'contain',
          layoutStyle: 'mosaic',
        }}
      />
    );

    expect(screen.getByAltText('Captura uno')).toBeInTheDocument();
    expect(screen.getByText('Caption dos')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Captura uno' })).toHaveAttribute('target', '_blank');
  });

  it('aplica variantes de tamano sin romper payloads existentes', () => {
    const { container } = render(
      <ImageGridBlock
        images={[
          { src: '/img/uno.webp', alt: 'Captura uno', size: 'wide' },
          { src: '/img/dos.webp', alt: 'Captura dos', size: 'hero' },
        ]}
        config={{
          columns: 3,
          mobileColumns: 2,
          layoutStyle: 'mosaic',
        }}
      />
    );

    const wideItem = container.querySelector('[data-image-grid-item-size="wide"]');
    const heroItem = container.querySelector('[data-image-grid-item-size="hero"]');

    expect(container.querySelector('[data-rendered-block="image-grid"]')).toHaveAttribute('data-image-grid-layout', 'mosaic');
    expect(wideItem?.className).toContain('lg:col-span-2');
    expect(heroItem?.textContent).toContain('Hero');
  });

  it('degrada el PDF a CTA responsive en mobile', () => {
    render(
      <DocumentBlock
        src="/docs/guia.pdf"
        title="Guia PDF"
        filename="guia.pdf"
        fileType="pdf"
        display="embed"
      />
    );

    expect(screen.getByText('Ábrelo o descargalo en una pestaña aparte para verlo con comodidad.')).toBeInTheDocument();
    expect(screen.queryByTitle('Guia PDF')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Abrir' })).toHaveAttribute('href', '/docs/guia.pdf');
  });
});
