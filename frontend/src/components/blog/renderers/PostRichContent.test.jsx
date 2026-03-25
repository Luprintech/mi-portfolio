import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

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

  it('prioriza el renderer html-first cuando existe contentHtml', () => {
    render(
      <PostRichContent
        post={{
          format: 'html',
          contentHtml: '<h2>Renderer comun</h2>',
          legacyMarkdown: '## Legacy',
        }}
      />
    );

    expect(screen.getByTestId('html-renderer')).toHaveTextContent('<h2>Renderer comun</h2>');
    expect(screen.queryByTestId('markdown-renderer')).not.toBeInTheDocument();
  });

  it('cae en markdown legacy cuando el post no trae html canonico', () => {
    render(
      <PostRichContent
        post={{
          format: 'markdown',
          legacyMarkdown: '## Fallback legacy',
        }}
      />
    );

    expect(screen.getByTestId('markdown-renderer')).toHaveTextContent('## Fallback legacy');
    expect(screen.queryByTestId('html-renderer')).not.toBeInTheDocument();
  });
});

describe('rich blocks', () => {
  beforeEach(() => {
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
        columns={2}
        images={[
          { src: '/img/uno.webp', alt: 'Captura uno', caption: 'Caption uno' },
          { src: '/img/dos.webp', alt: 'Captura dos', caption: 'Caption dos' },
        ]}
      />
    );

    expect(screen.getByAltText('Captura uno')).toBeInTheDocument();
    expect(screen.getByText('Caption dos')).toBeInTheDocument();
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

    expect(screen.getByText('En mobile priorizamos apertura directa o descarga para evitar un visor roto o ilegible.')).toBeInTheDocument();
    expect(screen.queryByTitle('Guia PDF')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Abrir' })).toHaveAttribute('href', '/docs/guia.pdf');
  });
});
