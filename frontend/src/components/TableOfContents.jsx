import { useMemo } from 'react';
import { slugify } from '../utils/slugify';

function parseHeadings(html) {
    const headings = [];
    const regex = /<h([23])[^>]*>(.*?)<\/h\1>/gi;
    let match;
    while ((match = regex.exec(html)) !== null) {
        const level = parseInt(match[1]);
        const text = match[2].replace(/<[^>]+>/g, '').trim();
        if (text) headings.push({ level, text, id: `heading-${slugify(text)}` });
    }
    return headings;
}

export default function TableOfContents({ content }) {
    const headings = useMemo(() => parseHeadings(content || ''), [content]);
    if (headings.length < 3) return null;

    return (
        <nav aria-label="Tabla de contenidos" className="mb-8 p-5 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/>
                </svg>
                Contenido
            </p>
            <ol className="space-y-1.5">
                {headings.map((h, i) => (
                    <li key={i} style={{ paddingLeft: h.level === 3 ? '1rem' : '0' }}>
                        <a
                            href={`#${h.id}`}
                            className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
                        >
                            {h.level === 3 && <span className="text-[var(--text-muted)] mr-1">└</span>}
                            {h.text}
                        </a>
                    </li>
                ))}
            </ol>
        </nav>
    );
}
