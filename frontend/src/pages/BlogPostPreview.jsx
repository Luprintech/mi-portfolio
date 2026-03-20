import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { sanitizePostContent } from '../lib/postContentSanitizer';

// Mismo estilo visual que BlogPost.jsx — renderiza HTML del editor TipTap
export default function BlogPostPreview() {
    const [post, setPost] = useState(null);
    const contentRef = useRef(null);

    useEffect(() => {
        try {
            const raw = sessionStorage.getItem('cms_preview');
            if (raw) setPost(JSON.parse(raw));
        } catch {
            // sessionStorage no disponible
        }
    }, []);

    const cleanHtml = post ? sanitizePostContent(post.content || '') : '';

    // Hydrate document embed blocks after render
    useEffect(() => {
        if (!contentRef.current) return;
        contentRef.current.querySelectorAll('[data-document]').forEach(el => {
            if (el.querySelector('iframe, .doc-bar')) return;
            const src = el.getAttribute('data-src');
            const filename = el.getAttribute('data-filename');
            const fileType = el.getAttribute('data-file-type');
            const mode = el.getAttribute('data-display-mode') || 'embed';
            const height = parseInt(el.getAttribute('data-embed-height') || el.getAttribute('embedheight')) || 500;
            if (!src || !filename) return;
            const isPdf = fileType === 'pdf';
            const ICONS = { pdf: '\uD83D\uDCC4', zip: '\uD83D\uDCE6', docx: '\uD83D\uDCDD' };
            const icon = ICONS[fileType] || '\uD83D\uDCCE';
            el.textContent = '';
            el.style.cssText = 'border:1px solid var(--border-color,rgba(255,255,255,0.1));border-radius:12px;overflow:hidden;margin:16px 0';
            if (isPdf && mode === 'embed') {
                const iframe = document.createElement('iframe');
                iframe.src = src;
                iframe.style.cssText = `width:100%;height:${height}px;border:none;display:block`;
                iframe.loading = 'lazy';
                iframe.title = filename;
                el.appendChild(iframe);
            }
            const bar = document.createElement('div');
            bar.className = 'doc-bar';
            bar.style.cssText = 'display:flex;align-items:center;gap:12px;padding:10px 16px;background:var(--bg-elevated,rgba(15,15,30,0.8))';
            const iconSpan = document.createElement('span');
            iconSpan.style.fontSize = '1.25rem';
            iconSpan.textContent = icon;
            bar.appendChild(iconSpan);
            const nameSpan = document.createElement('span');
            nameSpan.className = 'doc-name';
            nameSpan.style.cssText = 'flex:1;font-size:14px;font-weight:500;color:var(--text-primary,#e2e8f0);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin:0';
            nameSpan.textContent = filename;
            bar.appendChild(nameSpan);
            if (!(isPdf && mode === 'embed') && src) {
                const dl = document.createElement('a');
                dl.href = src;
                dl.download = filename;
                dl.textContent = 'Descargar';
                dl.className = 'doc-download';
                dl.style.cssText = 'padding:8px 16px;background:#c026d3;color:white;border-radius:8px;font-size:14px;font-weight:500;text-decoration:none;white-space:nowrap';
                bar.appendChild(dl);
            }
            el.appendChild(bar);
        });
    }, [cleanHtml]);

    if (!post) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4">
                <div className="text-center text-gray-500 space-y-4">
                    <p className="text-lg">No hay datos de vista previa.</p>
                    <p className="text-sm">Abre la vista previa desde el editor del CMS.</p>
                    <Link to="/bitacora/posts" className="text-fuchsia-400 hover:underline text-sm">
                        ← Volver al CMS
                    </Link>
                </div>
            </div>
        );
    }

    const dateStr = post.date
        ? new Date(`${post.date}T00:00:00`).toLocaleDateString('es-ES', {
            year: 'numeric', month: 'long', day: 'numeric',
          })
        : '';

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-[var(--bg-primary)] px-6 py-28 text-[var(--text-primary)] md:px-16">

            {/* Banner de vista previa */}
            <div className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-2.5
                bg-amber-500/90 backdrop-blur text-amber-950 text-sm font-semibold shadow-lg">
                <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                    VISTA PREVIA — Este post aún no está publicado
                </span>
                <button onClick={() => window.close()} className="hover:underline opacity-70 hover:opacity-100">
                    Cerrar ✕
                </button>
            </div>

            <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.06),transparent_30%)]" />

            <motion.article
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 max-w-3xl mx-auto w-full"
            >
                {/* Cabecera */}
                <div className="mb-10">
                    <h1 className="mb-6 text-3xl font-extrabold leading-tight text-white md:text-5xl">
                        {post.title || 'Sin título'}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 border-b border-[var(--border-color)] pb-8 text-sm font-mono text-[var(--text-muted)]">
                        {dateStr && (
                            <time className="text-[var(--accent-secondary)]/80">{dateStr}</time>
                        )}
                        {dateStr && post.tags?.length > 0 && <span>•</span>}
                        <div className="flex flex-wrap gap-2">
                            {(post.tags || []).map(tag => (
                                <span key={tag} className="text-fuchsia-400">{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Contenido renderizado */}
                <div className="bg-[var(--bg-surface)] backdrop-blur-md rounded-2xl border border-[var(--border-color)] shadow-[var(--shadow-md)] p-6 md:p-10">
                    {cleanHtml ? (
                        <div
                            ref={contentRef}
                            className="
                                prose prose-invert prose-sm md:prose-base lg:prose-lg max-w-none
                                prose-headings:font-bold
                                prose-h1:text-3xl prose-h1:text-white prose-h1:border-b prose-h1:border-[var(--border-color)] prose-h1:pb-4 prose-h1:mt-8 prose-h1:mb-6
                                prose-h2:text-2xl prose-h2:text-white prose-h2:border-b prose-h2:border-[var(--border-color)] prose-h2:pb-2 prose-h2:mt-10 prose-h2:mb-4
                                prose-h3:text-xl prose-h3:text-cyan-400 prose-h3:mt-8 prose-h3:mb-3
                                prose-p:text-[var(--text-secondary)] prose-p:leading-relaxed prose-p:mb-5
                                prose-a:text-cyan-400 prose-a:underline-offset-4 hover:prose-a:text-cyan-300
                                prose-blockquote:border-l-4 prose-blockquote:border-cyan-500 prose-blockquote:italic prose-blockquote:text-[var(--text-muted)] prose-blockquote:bg-[var(--bg-elevated)] prose-blockquote:py-3 prose-blockquote:pr-4 prose-blockquote:rounded-r-lg
                                prose-code:text-cyan-300 prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                                prose-pre:bg-[#0a0a12] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl
                                prose-img:rounded-2xl prose-img:shadow-2xl prose-img:mx-auto
                                prose-ul:text-[var(--text-secondary)] prose-ol:text-[var(--text-secondary)]
                                prose-table:w-full prose-th:bg-white/5 prose-th:p-2 prose-td:p-2
                                [&_audio]:w-full [&_audio]:rounded-lg [&_audio]:my-4
                                [&_iframe]:w-full [&_iframe]:rounded-xl [&_iframe]:my-4
                            "
                            dangerouslySetInnerHTML={{ __html: cleanHtml }}
                        />
                    ) : (
                        <p className="text-gray-600 italic">Sin contenido.</p>
                    )}
                </div>
            </motion.article>
        </div>
    );
}
