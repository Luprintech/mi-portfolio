import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
    expect(screen.getByTitle('Guia editorial')).toBeInTheDocument();
    expect(screen.getByText('deploy.sh')).toBeInTheDocument();
    expect(container.querySelectorAll('[data-rendered-block="image-grid"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-rendered-block="document"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-rendered-block="code"]')).toHaveLength(1);
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
});
