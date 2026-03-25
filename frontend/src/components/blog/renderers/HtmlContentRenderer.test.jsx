import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('../../shared/PdfPreview', () => ({
  default: ({ src, title, height }) => (
    <div data-rendered-pdf-preview="true" data-src={src} data-height={String(height)}>{title}</div>
  ),
}));

import HtmlContentRenderer from './HtmlContentRenderer';

const richHtmlFixture = `
  <h2>Contrato editorial</h2>
  <div
    data-block="image-grid"
    data-columns="3"
    data-images='[{"src":"/posts/images/uno.webp","alt":"Captura uno","caption":"Caption uno"},{"src":"/posts/images/dos.webp","alt":"Captura dos","caption":"Caption dos"}]'
  ></div>
  <div
    data-block="document"
    data-src="/posts/documents/guia.pdf"
    data-title="Guia editorial"
    data-filename="guia.pdf"
    data-file-type="pdf"
    data-display="embed"
  ></div>
  <pre data-block="code" data-language="bash" data-filename="deploy.sh" data-title="Deploy" data-variant="terminal"><code>npm run deploy</code></pre>
`;

describe('HtmlContentRenderer', () => {
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

  it('renderiza bloques editoriales enriquecidos desde el HTML canonico', () => {
    const { container } = render(<HtmlContentRenderer content={richHtmlFixture} />);

    expect(screen.getByRole('heading', { name: 'Contrato editorial' })).toBeInTheDocument();
    expect(screen.getByAltText('Captura uno')).toBeInTheDocument();
    expect(screen.getByText('Caption dos')).toBeInTheDocument();
    expect(screen.getAllByText('Guia editorial').length).toBeGreaterThan(0);
    expect(screen.getByText('deploy.sh')).toBeInTheDocument();
    expect(container.querySelectorAll('[data-rendered-block="image-grid"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-rendered-block="document"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-rendered-pdf-preview="true"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-rendered-block="code"]')).toHaveLength(1);
  });

  it('rehidrata el data-embed-width del documento publicado y conserva la vista previa', () => {
    const { container } = render(
      <HtmlContentRenderer
        content={`
          <div
            data-block="document"
            data-src="/posts/documents/guia.pdf"
            data-title="Guia editorial"
            data-filename="guia.pdf"
            data-file-type="pdf"
            data-display="embed"
            data-embed-height="640"
            data-embed-width="960"
            style="width:960px;max-width:100%"
          ></div>
        `}
      />
    );

    const renderedDocument = container.querySelector('[data-rendered-block="document"]');
    const renderedPreview = container.querySelector('[data-rendered-pdf-preview="true"]');

    expect(renderedDocument).toHaveStyle({ width: '960px', maxWidth: '100%' });
    expect(renderedPreview).toHaveAttribute('data-src', '/posts/documents/guia.pdf');
    expect(renderedPreview).toHaveAttribute('data-height', '640');
    expect(screen.getAllByText('Guia editorial').length).toBeGreaterThan(0);
  });

  it('mantiene la paridad publica de alineacion para documentos, grillas e imagenes', () => {
    const { container } = render(
      <HtmlContentRenderer
        content={`
          <div data-block="document" data-align="right" data-src="/posts/documents/guia.pdf" data-title="Guia editorial" data-filename="guia.pdf" data-file-type="pdf" data-display="embed"></div>
          <div data-block="image-grid" data-align="center" data-columns="2" data-images='[{"src":"/posts/images/uno.webp","alt":"Captura uno"}]'></div>
          <img src="/posts/images/solo.webp" alt="Hero alineado" data-align="center" />
          <div data-block="document" data-align="justify" data-src="/posts/documents/fallback.pdf" data-title="Fallback" data-filename="fallback.pdf" data-file-type="pdf" data-display="embed"></div>
        `}
      />
    );

    const renderedDocument = container.querySelector('[data-rendered-block="document"]');
    const renderedGrid = container.querySelector('[data-rendered-block="image-grid"]');
    const centeredFigure = screen.getByAltText('Hero alineado').closest('figure');
    const fallbackDocument = screen.getAllByText('Fallback')[0].closest('[data-rendered-block="document"]');

    expect(renderedDocument?.parentElement).toHaveClass('justify-end');
    expect(renderedGrid?.parentElement).toHaveClass('justify-center');
    expect(centeredFigure?.parentElement).toHaveClass('justify-center');
    expect(fallbackDocument?.parentElement?.className || '').not.toContain('justify-');
  });

  it('sanea script tags y javascript urls antes de renderizar', () => {
    render(
      <HtmlContentRenderer
        content={`
          <script>alert('xss')</script>
          <p>Texto limpio</p>
          <a href="javascript:alert('boom')">Abrir</a>
        `}
      />
    );

    expect(screen.getByText('Texto limpio')).toBeInTheDocument();
    expect(document.body.innerHTML).not.toContain('<script>');
    expect(document.body.innerHTML).not.toContain('javascript:');
  });

  it('preserva variante, estilos y alineacion de los CTA publicados', () => {
    const { container } = render(
      <HtmlContentRenderer
        content={`
          <a
            data-content-button
            data-align="center"
            class="content-button content-button--primary"
            href="https://example.com/demo"
            style="background:#2563eb;color:#ffffff;border-radius:18px;font-size:16px"
          >Ver demo</a>
        `}
      />
    );

    const cta = screen.getByRole('link', { name: 'Ver demo' });
    expect(cta).toHaveAttribute('data-content-button');
    expect(cta).toHaveAttribute('data-align', 'center');
    expect(cta.className).toContain('content-button--primary');
    expect(cta.style.background).toBe('rgb(37, 99, 235)');
    expect(cta.style.borderRadius).toBe('18px');
    expect(container.querySelector('a[data-content-button][data-align="center"]')).not.toBeNull();
  });

  it('normaliza enlaces externos de CTA sin protocolo para no romper la redireccion publicada', () => {
    render(
      <HtmlContentRenderer
        content={'<a data-content-button href="www.example.com/demo">Ver demo</a>'}
      />
    );

    expect(screen.getByRole('link', { name: 'Ver demo' })).toHaveAttribute('href', 'https://www.example.com/demo');
  });

  it('preserva colores y widths utiles de tablas publicadas', () => {
    const { container } = render(
      <HtmlContentRenderer
        content={`
          <table style="min-width:720px">
            <colgroup>
              <col data-colwidth="240,240" />
            </colgroup>
            <thead>
              <tr>
                <th data-colwidth="240,240" style="background-color:#dbeafe;border-color:#2563eb">Plan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td data-colwidth="240,240" style="background-color:#eff6ff;border-color:#60a5fa">Pro</td>
              </tr>
            </tbody>
          </table>
        `}
      />
    );

    expect(screen.getByRole('columnheader', { name: 'Plan' })).toHaveStyle({
      backgroundColor: 'rgb(219, 234, 254)',
      borderColor: '#2563eb',
    });
    expect(screen.getByRole('cell', { name: 'Pro' })).toHaveStyle({
      backgroundColor: 'rgb(239, 246, 255)',
      borderColor: '#60a5fa',
      width: '240px',
    });
    expect(screen.getByRole('columnheader', { name: 'Plan' }).className).toContain('border');
    expect(container.querySelector('table')).toHaveStyle({ minWidth: '720px' });
    expect(container.querySelector('col')).toHaveStyle({ width: '240px', minWidth: '240px' });
    expect(screen.getByRole('columnheader', { name: 'Plan' })).toHaveAttribute('data-colwidth', '240,240');
  });
});
