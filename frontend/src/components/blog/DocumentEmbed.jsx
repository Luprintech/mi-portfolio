/**
 * DocumentEmbed — renderiza un documento (PDF, ZIP, DOCX) embebido o como enlace de descarga.
 * Extraído de BlogPost.jsx para reutilizabilidad.
 */

export default function DocumentEmbed({ src, filename, fileType, displayMode, embedHeight }) {
  const isPdf = fileType === 'pdf';
  const mode = displayMode || (isPdf ? 'embed' : 'link');
  const height = parseInt(embedHeight, 10) || 500;
  const iconLabel = { pdf: 'PDF', zip: 'ZIP', docx: 'DOC' }[fileType] || 'FILE';

  return (
    <div className="my-6 overflow-hidden rounded-[1.35rem] border border-[var(--border-default)] bg-[var(--bg-elevated)]/70">
      {isPdf && mode === 'embed' && (
        <iframe
          src={src}
          className="block w-full border-none"
          style={{ height }}
          loading="lazy"
          title={filename}
          allowFullScreen
        />
      )}

      <div className="flex items-center gap-3 border-t border-[var(--border-default)] bg-[var(--bg-surface)]/80 px-4 py-3">
        <span className="rounded-full border border-[var(--border-default)] bg-[var(--bg-primary)] px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
          {iconLabel}
        </span>
        <p className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--text-primary)]">{filename}</p>
        {!(isPdf && mode === 'embed') && src && (
          <a
            href={src}
            download={filename}
            className="rounded-full border border-[var(--border-default)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--accent-secondary)]/30 hover:text-[var(--accent-secondary)]"
          >
            Descargar
          </a>
        )}
      </div>
    </div>
  );
}
