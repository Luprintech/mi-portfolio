import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import DOMPurify from 'dompurify';

// Mismo estilo visual que BlogPost.jsx — renderiza HTML del editor TipTap
export default function BlogPostPreview() {
    const [post, setPost] = useState(null);

    useEffect(() => {
        try {
            const raw = sessionStorage.getItem('cms_preview');
            if (raw) setPost(JSON.parse(raw));
        } catch {
            // sessionStorage no disponible
        }
    }, []);

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

    const cleanHtml = DOMPurify.sanitize(post.content || '', {
        ADD_TAGS: ['iframe', 'audio', 'video', 'source'],
        ADD_ATTR: ['allowfullscreen', 'frameborder', 'controls', 'src', 'type',
                   'allow', 'loading', 'style', 'class', 'target', 'rel'],
        FORCE_BODY: true,
    });

    const dateStr = post.date
        ? new Date(`${post.date}T00:00:00`).toLocaleDateString('es-ES', {
            year: 'numeric', month: 'long', day: 'numeric',
          })
        : '';

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] py-28 px-6 md:px-16 relative overflow-x-hidden">

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

            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/10 via-[var(--bg-primary)] to-[var(--bg-primary)] pointer-events-none z-0" />

            <motion.article
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 max-w-3xl mx-auto w-full"
            >
                {/* Cabecera */}
                <div className="mb-10">
                    <h1 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-300">
                        {post.title || 'Sin título'}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm font-mono text-[var(--text-muted)] border-b border-[var(--border-color)] pb-8">
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
                            className="
                                prose prose-invert max-w-none
                                prose-headings:font-bold
                                prose-h1:text-3xl prose-h1:text-transparent prose-h1:bg-clip-text prose-h1:bg-gradient-to-r prose-h1:from-violet-300 prose-h1:to-fuchsia-200 prose-h1:border-b prose-h1:border-[var(--border-color)] prose-h1:pb-4 prose-h1:mt-8 prose-h1:mb-6
                                prose-h2:text-2xl prose-h2:text-transparent prose-h2:bg-clip-text prose-h2:bg-gradient-to-r prose-h2:from-cyan-300 prose-h2:to-violet-300 prose-h2:border-b prose-h2:border-[var(--border-color)] prose-h2:pb-2 prose-h2:mt-10 prose-h2:mb-4
                                prose-h3:text-xl prose-h3:text-fuchsia-400 prose-h3:mt-8 prose-h3:mb-3
                                prose-p:text-[var(--text-secondary)] prose-p:leading-relaxed prose-p:mb-5
                                prose-a:text-fuchsia-400 prose-a:underline-offset-4 hover:prose-a:text-fuchsia-300
                                prose-blockquote:border-l-4 prose-blockquote:border-fuchsia-500 prose-blockquote:italic prose-blockquote:text-[var(--text-muted)] prose-blockquote:bg-[var(--bg-elevated)] prose-blockquote:py-3 prose-blockquote:pr-4 prose-blockquote:rounded-r-lg
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
