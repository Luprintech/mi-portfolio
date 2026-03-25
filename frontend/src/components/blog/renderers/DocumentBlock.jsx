import { useEffect, useState } from 'react';

const FILE_LABELS = {
  pdf: 'PDF',
  zip: 'ZIP',
  docx: 'DOCX',
  doc: 'DOC',
};

function useIsMobileDocument() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 767px)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const media = window.matchMedia('(max-width: 767px)');
    const handleChange = (event) => setIsMobile(event.matches);
    setIsMobile(media.matches);
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  return isMobile;
}

export default function DocumentBlock({
  src = '',
  title = '',
  filename = '',
  fileType = '',
  display = 'embed',
  embedHeight = 560,
}) {
  const isMobile = useIsMobileDocument();
  const normalizedType = String(fileType || '').toLowerCase();
  const isPdf = normalizedType === 'pdf';
  const shouldEmbed = isPdf && display === 'embed' && !isMobile;
  const resolvedName = title || filename || 'Documento adjunto';
  const label = FILE_LABELS[normalizedType] || 'FILE';

  if (!src) return null;

  return (
    <section className="my-10 overflow-hidden rounded-[1.5rem] border border-[var(--border-default)] bg-[var(--bg-elevated)]/80 shadow-[0_22px_60px_rgba(15,23,42,0.14)]" data-rendered-block="document">
      {shouldEmbed && (
        <div className="border-b border-[var(--border-default)] bg-[var(--bg-primary)]/75 p-2 md:p-3">
          <iframe
            src={src}
            title={resolvedName}
            loading="lazy"
            className="block w-full rounded-[1rem] border-0 bg-white"
            style={{ height: `${Math.max(360, Number(embedHeight) || 560)}px` }}
          />
        </div>
      )}

      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-3">
            <span className="rounded-full border border-[var(--border-default)] bg-[var(--bg-primary)] px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
              {label}
            </span>
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">
              {shouldEmbed ? 'Vista enriquecida' : isPdf ? 'Abrir documento' : 'Descargar archivo'}
            </span>
          </div>
          <p className="truncate text-base font-semibold text-[var(--text-primary)]">{resolvedName}</p>
          <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
            {isPdf
              ? isMobile
                ? 'En mobile priorizamos apertura directa o descarga para evitar un visor roto o ilegible.'
                : 'El PDF se incrusta en desktop y mantiene acciones directas para abrirlo completo.'
              : `Archivo ${label} disponible para descarga.`}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-primary)]/80 px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:border-[var(--accent-secondary)]/35 hover:text-[var(--accent-secondary)]"
          >
            Abrir
          </a>
          <a
            href={src}
            download={resolvedName}
            className="inline-flex items-center justify-center rounded-full bg-[var(--accent-secondary)] px-4 py-2.5 text-sm font-semibold text-[var(--text-inverse)] transition-transform hover:-translate-y-0.5"
          >
            Descargar
          </a>
        </div>
      </div>
    </section>
  );
}
