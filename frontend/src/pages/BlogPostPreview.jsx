import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PostRichContent from '../components/blog/renderers/PostRichContent';
import { inferPostContentFields } from '../lib/postContentSource';

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

    const resolved = inferPostContentFields(post || {});

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
                    <h1 className="mb-6 text-3xl font-extrabold leading-tight text-[var(--text-primary)] md:text-5xl">
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
                    {resolved.sourceContent ? (
                        <div
                            ref={contentRef}
                            className="prose prose-blog dark:prose-invert prose-sm md:prose-base lg:prose-lg max-w-none"
                        >
                            <PostRichContent post={post} />
                        </div>
                    ) : (
                        <p className="text-gray-600 italic">Sin contenido.</p>
                    )}
                </div>
            </motion.article>
        </div>
    );
}
