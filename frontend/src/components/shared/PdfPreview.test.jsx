import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PdfPreview from './PdfPreview';

const getDocumentMock = vi.fn();

vi.mock('pdfjs-dist', () => ({
  version: '5.5.207',
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: getDocumentMock,
}));

describe('PdfPreview', () => {
  beforeEach(() => {
    getDocumentMock.mockReset();
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({}));
    HTMLElement.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 960,
      height: 720,
      top: 0,
      left: 0,
      right: 960,
      bottom: 720,
    }));
  });

  it('comparte toolbar de pagina, zoom y modos de ajuste', async () => {
    getDocumentMock.mockReturnValue({
      promise: Promise.resolve({
        numPages: 4,
        destroy: vi.fn().mockResolvedValue(undefined),
        getPage: vi.fn(async () => ({
          getViewport: ({ scale }) => ({ width: 600 * scale, height: 800 * scale }),
          render: () => ({ promise: Promise.resolve(), cancel: vi.fn() }),
        })),
      }),
    });

    const user = userEvent.setup();
    render(<PdfPreview src="/docs/guia.pdf" title="Guia PDF" height={640} />);

    await waitFor(() => {
      expect(screen.getByText('Pagina 1 / 4')).toBeInTheDocument();
    });

    expect(screen.getByText('Zoom 100%')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Acercar' }));
    expect(screen.getByText('Zoom 115%')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    await waitFor(() => {
      expect(screen.getByText('Pagina 2 / 4')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Ajustar ancho' }));
    expect(screen.getByRole('button', { name: 'Ajustar ancho' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: '100%' }));
    expect(screen.getByText('Zoom 100%')).toBeInTheDocument();
  });

  it('muestra estado de error renderizable cuando el PDF falla', async () => {
    getDocumentMock.mockReturnValue({
      promise: Promise.reject(new Error('boom')),
    });

    render(<PdfPreview src="/docs/roto.pdf" title="PDF roto" />);

    await waitFor(() => {
      expect(screen.getByText('No se pudo cargar la vista previa del PDF.')).toBeInTheDocument();
    });

    expect(screen.getByText('Si el archivo sigue fallando, abrilo o descargalo desde el CTA del documento.')).toBeInTheDocument();
  });
});
