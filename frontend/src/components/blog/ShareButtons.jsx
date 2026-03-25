/**
 * ShareButtons — botones de compartir el post en redes + copiar enlace.
 */

import { useState } from 'react';
import { buildShareLinks } from './markdownComponents';

export default function ShareButtons({ postMeta }) {
  const [copied, setCopied] = useState(false);
  const shareLinks = buildShareLinks(postMeta);

  async function handleCopyLink() {
    if (typeof navigator === 'undefined') return;

    try {
      await navigator.clipboard.writeText(shareLinks.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch (copyError) {
      console.error('No se pudo copiar el enlace del artículo:', copyError);
      setCopied(false);
    }
  }

  return (
    <div className="mt-8 rounded-[1.8rem] border border-[var(--border-default)] bg-[var(--bg-elevated)]/72 px-6 py-5">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-[var(--text-muted)]">
        Compartir artículo
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)]/80 px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-all hover:border-[#1d9bf0]/30 hover:text-[#1d9bf0]"
          aria-label="Compartir en X / Twitter"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          X / Twitter
        </a>
        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)]/80 px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-all hover:border-[#0a66c2]/30 hover:text-[#0a66c2]"
          aria-label="Compartir en LinkedIn"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          LinkedIn
        </a>
        <a
          href={shareLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)]/80 px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-all hover:border-[#25d366]/30 hover:text-[#25d366]"
          aria-label="Compartir en WhatsApp"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp
        </a>
        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)]/80 px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-all hover:border-[var(--accent-secondary)]/30 hover:text-[var(--accent-secondary)]"
          aria-label="Copiar enlace del artículo"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {copied ? 'Enlace copiado' : 'Copiar enlace'}
        </button>
      </div>
    </div>
  );
}
