import { useEffect, useMemo, useRef, useState } from 'react';

const MIN_VIEWER_HEIGHT = 420;
const DEFAULT_VIEWER_HEIGHT = 560;
const VIEWER_CHROME_HEIGHT = 84;
const MIN_SCALE = 0.35;
const MAX_SCALE = 3;
const MIN_ZOOM_FACTOR = 0.7;
const MAX_ZOOM_FACTOR = 2.4;
const ZOOM_STEP = 0.15;

function getViewerHeight(value) {
  return Math.max(MIN_VIEWER_HEIGHT, Number(value) || DEFAULT_VIEWER_HEIGHT);
}

function clampScale(value) {
  return Math.min(Math.max(value, MIN_SCALE), MAX_SCALE);
}

function clampZoomFactor(value) {
  return Math.min(Math.max(value, MIN_ZOOM_FACTOR), MAX_ZOOM_FACTOR);
}

function getVisiblePage(page, total) {
  return Math.min(page, Math.max(total, 1));
}

export default function PdfCanvasViewer({
  src = '',
  title = 'Documento PDF',
  height = DEFAULT_VIEWER_HEIGHT,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fitMode, setFitMode] = useState('page');
  const [zoomFactor, setZoomFactor] = useState(1);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const viewerHeight = useMemo(() => getViewerHeight(height), [height]);

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return undefined;

    const updateSize = () => {
      const bounds = containerRef.current?.getBoundingClientRect();
      if (!bounds) return;
      setContainerSize({
        width: Math.round(bounds.width),
        height: Math.round(bounds.height),
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    let observer;
    if ('ResizeObserver' in window) {
      observer = new window.ResizeObserver(updateSize);
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateSize);
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let activeDocument = null;

    if (!src) {
      setPdfDoc(null);
      setNumPages(0);
      setPage(1);
      setLoading(false);
      setError('');
      return undefined;
    }

    setLoading(true);
    setError('');
    setPdfDoc(null);
    setNumPages(0);
    setPage(1);
    setFitMode('page');
    setZoomFactor(1);

    (async () => {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
        }

        const documentTask = pdfjsLib.getDocument(src);
        const documentProxy = await documentTask.promise;
        if (cancelled) {
          await documentProxy.destroy();
          return;
        }

        activeDocument = documentProxy;
        setPdfDoc(documentProxy);
        setNumPages(documentProxy.numPages);
      } catch (loadError) {
        if (!cancelled) {
          console.error('Error loading PDF preview:', loadError);
          setError('No se pudo cargar la vista previa del PDF.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      try {
        renderTaskRef.current?.cancel();
      } catch {
        renderTaskRef.current = null;
      }
      if (activeDocument) {
        activeDocument.destroy().catch(() => {});
      }
    };
  }, [src]);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || !containerSize.width || !containerSize.height) return undefined;

    let cancelled = false;

    (async () => {
      try {
        const pdfPage = await pdfDoc.getPage(page);
        if (cancelled) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) {
          setError('El visor PDF no pudo inicializar el canvas.');
          return;
        }

        const viewport = pdfPage.getViewport({ scale: 1 });
        const availableWidth = Math.max(containerSize.width - 32, 240);
        const availableHeight = Math.max(containerSize.height - 32, 240);
        const widthScale = availableWidth / viewport.width;
        const pageScale = Math.min(widthScale, availableHeight / viewport.height);
        const baseScale = fitMode === 'width' ? widthScale : pageScale;
        const chosenScale = clampScale(baseScale * zoomFactor);
        const pixelRatio = window.devicePixelRatio || 1;
        const scaledViewport = pdfPage.getViewport({ scale: chosenScale * pixelRatio });

        try {
          renderTaskRef.current?.cancel();
        } catch {
          renderTaskRef.current = null;
        }

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;
        canvas.style.width = `${Math.round(scaledViewport.width / pixelRatio)}px`;
        canvas.style.height = `${Math.round(scaledViewport.height / pixelRatio)}px`;

        const renderTask = pdfPage.render({
          canvasContext: context,
          viewport: scaledViewport,
        });
        renderTaskRef.current = renderTask;
        await renderTask.promise;
      } catch (renderError) {
        if (!cancelled && renderError?.name !== 'RenderingCancelledException') {
          console.error('Error rendering PDF preview:', renderError);
          setError('No se pudo renderizar esta pagina del PDF.');
        }
      }
    })();

    return () => {
      cancelled = true;
      try {
        renderTaskRef.current?.cancel();
      } catch {
        renderTaskRef.current = null;
      }
    };
  }, [containerSize.height, containerSize.width, fitMode, page, pdfDoc, zoomFactor]);

  if (!src) return null;

  return (
    <div
      className="overflow-hidden rounded-[1.25rem] border border-[var(--border-default)] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(15,23,42,0.08))]"
      data-rendered-pdf-preview="true"
      data-rendered-pdf-canvas-viewer="true"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-default)] bg-[var(--bg-elevated)]/85 px-4 py-3">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">Vista PDF</p>
          <p className="text-sm font-medium text-[var(--text-primary)]">{title}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-[var(--border-default)] bg-[var(--bg-primary)]/75 px-3 py-1.5 font-medium text-[var(--text-secondary)]">
            Pagina {getVisiblePage(page, numPages)} / {Math.max(numPages, 1)}
          </span>
          <span className="rounded-full border border-[var(--border-default)] bg-[var(--bg-primary)]/75 px-3 py-1.5 font-medium text-[var(--text-secondary)]">
            Zoom {Math.round(zoomFactor * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomFactor((currentZoom) => clampZoomFactor(currentZoom - ZOOM_STEP))}
            disabled={loading || Boolean(error) || zoomFactor <= MIN_ZOOM_FACTOR}
            className="rounded-full border border-[var(--border-default)] bg-[var(--bg-primary)]/75 px-3 py-1.5 font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-secondary)]/35 hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-45"
            aria-label="Alejar"
          >
            -
          </button>
          <button
            type="button"
            onClick={() => setZoomFactor(1)}
            disabled={loading || Boolean(error) || zoomFactor === 1}
            className="rounded-full border border-[var(--border-default)] bg-[var(--bg-primary)]/75 px-3 py-1.5 font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-secondary)]/35 hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-45"
          >
            100%
          </button>
          <button
            type="button"
            onClick={() => setZoomFactor((currentZoom) => clampZoomFactor(currentZoom + ZOOM_STEP))}
            disabled={loading || Boolean(error) || zoomFactor >= MAX_ZOOM_FACTOR}
            className="rounded-full border border-[var(--border-default)] bg-[var(--bg-primary)]/75 px-3 py-1.5 font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-secondary)]/35 hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-45"
            aria-label="Acercar"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => {
              setFitMode('width');
              setZoomFactor(1);
            }}
            disabled={loading || Boolean(error) || fitMode === 'width'}
            className="rounded-full border border-[var(--border-default)] bg-[var(--bg-primary)]/75 px-3 py-1.5 font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-secondary)]/35 hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-45"
          >
            Ajustar ancho
          </button>
          <button
            type="button"
            onClick={() => {
              setFitMode('page');
              setZoomFactor(1);
            }}
            disabled={loading || Boolean(error) || fitMode === 'page'}
            className="rounded-full border border-[var(--border-default)] bg-[var(--bg-primary)]/75 px-3 py-1.5 font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-secondary)]/35 hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-45"
          >
            Pagina completa
          </button>
          <button
            type="button"
            onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
            disabled={page <= 1 || loading || Boolean(error)}
            className="rounded-full border border-[var(--border-default)] bg-[var(--bg-primary)]/75 px-3 py-1.5 font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-secondary)]/35 hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-45"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() => setPage((currentPage) => Math.min(numPages, currentPage + 1))}
            disabled={page >= numPages || loading || Boolean(error)}
            className="rounded-full border border-[var(--border-default)] bg-[var(--bg-primary)]/75 px-3 py-1.5 font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-secondary)]/35 hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-45"
          >
            Siguiente
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative overflow-auto bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.12),transparent_55%),linear-gradient(180deg,rgba(15,23,42,0.22),rgba(15,23,42,0.06))] p-4"
        style={{ height: `${viewerHeight + VIEWER_CHROME_HEIGHT}px` }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-primary)]/45 backdrop-blur-sm">
            <div className="flex items-center gap-3 rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)]/90 px-4 py-2 text-sm text-[var(--text-secondary)]">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent-secondary)]/25 border-t-[var(--accent-secondary)]" />
              Cargando PDF...
            </div>
          </div>
        )}

        {error && !loading ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-sm leading-6 text-[var(--text-muted)]">
            <p>{error}</p>
            <p className="max-w-md text-xs text-[var(--text-muted)]/85">
              Si el archivo sigue fallando, abrilo o descargalo desde el CTA del documento.
            </p>
          </div>
        ) : (
          <div className="flex min-h-full items-start justify-center">
            <canvas
              ref={canvasRef}
              className="max-w-full rounded-[1rem] border border-black/5 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.22)]"
            />
          </div>
        )}
      </div>
    </div>
  );
}
