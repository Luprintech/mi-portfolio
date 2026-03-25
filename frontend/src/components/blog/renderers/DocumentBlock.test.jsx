import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import DocumentBlock from './DocumentBlock';

const getDocumentMock = vi.fn();

vi.mock('pdfjs-dist', () => ({
  version: '5.5.207',
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: getDocumentMock,
}));

function mockMatchMedia(matches) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe('DocumentBlock', () => {
  beforeEach(() => {
    mockMatchMedia(false);
    getDocumentMock.mockReset();
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({}));
  });

  it('renderiza visor paginado de PDF en desktop y respeta embedWidth', async () => {
    getDocumentMock.mockReturnValue({
      promise: Promise.resolve({
        numPages: 3,
        destroy: vi.fn().mockResolvedValue(undefined),
        getPage: vi.fn(async () => ({
          getViewport: ({ scale }) => ({ width: 600 * scale, height: 800 * scale }),
          render: () => ({ promise: Promise.resolve(), cancel: vi.fn() }),
        })),
      }),
    });

    const { container } = render(
      <DocumentBlock
        src="/docs/guia.pdf"
        title="Guia PDF"
        filename="guia.pdf"
        fileType="pdf"
        display="embed"
        embedHeight={640}
        embedWidth={720}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Pagina 1 / 3')).toBeInTheDocument();
    });

    expect(screen.getByText('Vista PDF')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeInTheDocument();
    expect(container.querySelector('[data-rendered-pdf-preview="true"]')).not.toBeNull();

    expect(screen.getByText('Vista previa paginada para escritorio y acceso directo al archivo completo.')).toBeInTheDocument();
    expect(screen.getByText('Vista previa paginada para escritorio y acceso directo al archivo completo.').closest('section')).toHaveStyle({
      width: '720px',
      maxWidth: '100%',
    });
  });

  it('degrada el PDF a CTA responsive en mobile', () => {
    mockMatchMedia(true);

    render(
      <DocumentBlock
        src="/docs/guia.pdf"
        title="Guia PDF"
        filename="guia.pdf"
        fileType="pdf"
        display="embed"
      />
    );

    expect(screen.getByText('Abrilo o descargalo en una pestaña aparte para verlo con comodidad.')).toBeInTheDocument();
    expect(screen.queryByText('Vista PDF')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Abrir' })).toHaveAttribute('href', '/docs/guia.pdf');
  });
});
