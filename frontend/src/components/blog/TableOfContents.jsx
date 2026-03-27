/**
 * TableOfContents — navegación interna del post con heading activo resaltado.
 */

export default function TableOfContents({ headings, activeId }) {
  return (
    <nav aria-label="Tabla de contenidos">
      <ul className="space-y-0.5 relative">
        {/* Línea vertical decorativa */}
        <div className="absolute left-1 top-2 bottom-2 w-[2px] bg-gradient-to-b from-[var(--accent-primary)]/30 via-[var(--accent-secondary)]/20 to-transparent rounded-full" />
        
        {headings.map((h) => (
          <li key={h.id} className="relative">
            <a
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById(h.id);
                if (element) {
                  const offset = 100;
                  const elementPosition = element.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.pageYOffset - offset;
                  window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
              }}
              className={`block rounded-lg px-4 py-2 text-[0.813rem] leading-5 transition-all duration-200 ${
                h.level === 3 ? 'pl-7' : 'pl-4'
              } ${
                activeId === h.id
                  ? 'bg-gradient-to-r from-[var(--accent-primary)]/15 to-transparent font-semibold text-[var(--accent-secondary)] translate-x-1 shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:translate-x-0.5 hover:bg-[var(--bg-surface)]/40'
              }`}
            >
              <span className="flex items-center gap-2">
                {activeId === h.id && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-secondary)] animate-pulse" />
                )}
                <span className={`line-clamp-2 ${h.level === 2 ? 'font-medium' : ''}`}>
                  {h.text}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
