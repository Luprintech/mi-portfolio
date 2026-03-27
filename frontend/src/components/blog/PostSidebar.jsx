/**
 * PostSidebar — panel lateral sticky del post: TOC + resumen de meta.
 */

import TableOfContents from './TableOfContents';
import { formatDate, getReadTime } from './markdownComponents';

export default function PostSidebar({ postMeta, headings, activeHeadingId, hasToc }) {
  return (
    <aside className="order-2 hidden self-start lg:block lg:sticky lg:top-24 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--border-default)] scrollbar-track-transparent">
      <div className="space-y-4">
        {/* ToC panel */}
        {hasToc && (
          <div className="rounded-[1.6rem] border border-[var(--accent-primary)]/20 bg-gradient-to-br from-[var(--bg-elevated)]/90 to-[var(--bg-elevated)]/70 backdrop-blur-sm p-6 shadow-lg shadow-[var(--accent-primary)]/5">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-[var(--accent-secondary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <p className="text-[0.75rem] font-bold uppercase tracking-[0.24em] text-[var(--accent-secondary)]">
                Contenidos
              </p>
            </div>
            <p className="text-[0.65rem] text-[var(--text-muted)] mb-4">
              Navega rápidamente por las secciones
            </p>
            <div className="mt-4">
              <TableOfContents headings={headings} activeId={activeHeadingId} />
            </div>
          </div>
        )}

        {/* Post meta panel */}
        <div className="rounded-[1.6rem] border border-[var(--border-default)] bg-[var(--bg-elevated)]/72 p-5">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">
            Resumen
          </p>
          <div className="mt-5 space-y-4 text-sm text-[var(--text-secondary)]">
            <div>
              <p className="mb-1 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                Publicado
              </p>
              <p className="leading-6">{formatDate(postMeta.date)}</p>
            </div>
            <div>
              <p className="mb-1 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                Lectura
              </p>
              <p>{getReadTime(postMeta)} min</p>
            </div>
            {postMeta.tags?.length > 0 && (
              <div>
                <p className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                  Tecnologías
                </p>
                <div className="flex flex-wrap gap-2">
                  {postMeta.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)]/70 px-2.5 py-1 text-xs text-[var(--text-secondary)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
