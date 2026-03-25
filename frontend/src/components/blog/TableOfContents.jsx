/**
 * TableOfContents — navegación interna del post con heading activo resaltado.
 */

export default function TableOfContents({ headings, activeId }) {
  return (
    <nav aria-label="Tabla de contenidos">
      <ul className="space-y-1">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`block rounded-lg px-3 py-1.5 text-[0.8rem] leading-5 transition-colors ${
                h.level === 3 ? 'pl-6' : ''
              } ${
                activeId === h.id
                  ? 'bg-[var(--accent-primary)]/10 font-semibold text-[var(--accent-secondary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
