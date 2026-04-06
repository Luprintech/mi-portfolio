import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../components/blog/renderers/MarkdownLegacyRenderer', () => ({
  default: ({ content }) => (
    <>
      <h2>Heading legacy</h2>
      <p>{content.includes('Texto heredado.') ? 'Texto heredado.' : content}</p>
    </>
  ),
}));

vi.mock('../components/shared/PdfPreview', () => ({
  default: ({ title }) => <div data-rendered-pdf-preview="true">{title}</div>,
}));

import BlogPostPreview from './BlogPostPreview';
import PostContent from '../components/blog/PostContent';

const richPostFixture = {
  title: 'Post rico',
  date: '2026-03-25',
  tags: ['cms', 'html'],
  format: 'html',
  contentHtml: `
    <h2>Bloque compartido</h2>
    <div data-block="image-grid" data-columns="2" data-images='[{"src":"/posts/images/uno.webp","alt":"Uno","caption":"Imagen uno"}]'></div>
    <div data-block="document" data-src="/posts/documents/guia.pdf" data-title="Guia PDF" data-filename="guia.pdf" data-file-type="pdf" data-display="embed"></div>
    <pre data-block="code" data-language="bash" data-filename="deploy.sh" data-title="Deploy"><code>npm run deploy</code></pre>
  `,
};

describe('BlogPostPreview', () => {
  beforeEach(() => {
    sessionStorage.clear();
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

  it('reutiliza el mismo pipeline de render que la vista publica', async () => {
    sessionStorage.setItem('cms_preview', JSON.stringify(richPostFixture));

    const previewRender = render(
      <MemoryRouter>
        <BlogPostPreview />
      </MemoryRouter>
    );

    const publicRender = render(<PostContent post={richPostFixture} />);

    await waitFor(() => {
      expect(screen.getByText('VISTA PREVIA — Este post aún no está publicado')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(previewRender.container.querySelectorAll('[data-rendered-block="image-grid"]')).toHaveLength(1);
    });

    await waitFor(() => {
      expect(publicRender.container.querySelectorAll('[data-rendered-block="image-grid"]')).toHaveLength(1);
    });

    expect(previewRender.container.querySelectorAll('[data-rendered-block="image-grid"]')).toHaveLength(1);
    expect(publicRender.container.querySelectorAll('[data-rendered-block="image-grid"]')).toHaveLength(1);
    expect(previewRender.container.querySelectorAll('[data-rendered-block="document"]')).toHaveLength(1);
    expect(publicRender.container.querySelectorAll('[data-rendered-block="document"]')).toHaveLength(1);
    expect(previewRender.container.querySelectorAll('[data-rendered-block="code"]')).toHaveLength(1);
    expect(publicRender.container.querySelectorAll('[data-rendered-block="code"]')).toHaveLength(1);
    expect(previewRender.container).toHaveTextContent('Bloque compartido');
    expect(publicRender.container).toHaveTextContent('Bloque compartido');
    expect(screen.getAllByText('deploy.sh')).toHaveLength(2);
  });

  it('mantiene fallback legacy markdown cuando no hay HTML canonico', async () => {
    sessionStorage.setItem(
      'cms_preview',
      JSON.stringify({
        title: 'Legacy',
        format: 'markdown',
        legacyMarkdown: '## Heading legacy\n\nTexto heredado.',
      })
    );

    render(
      <MemoryRouter>
        <BlogPostPreview />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Heading legacy' })).toBeInTheDocument();
    });

    expect(screen.getByText('Texto heredado.')).toBeInTheDocument();
  });
});
