import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cmsApi } from '../../lib/cmsApi';
import { Copy, ExternalLink, Pencil, Trash2 } from 'lucide-react';

const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
        return new Date(`${dateString}T00:00:00`).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return dateString;
    }
};

export default function BitacoraPosts() {
    const { token } = useAuth();
    const [posts,         setPosts]         = useState([]);
    const [loading,       setLoading]       = useState(true);
    const [deleting,      setDeleting]      = useState(null);
    const [pendingDelete, setPendingDelete] = useState(null);
    const [deleteError,   setDeleteError]   = useState('');
    const [filter,        setFilter]        = useState('all'); // 'all' | 'draft' | 'published'
    const [toast,         setToast]         = useState(null);

    function showToast(message) {
        setToast(message);
        setTimeout(() => setToast(null), 3200);
    }

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setPosts(await cmsApi.getPosts(token));
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { load(); }, [load]);

    function requestDelete(slug) {
        setDeleteError('');
        setPendingDelete(slug);
    }

    function cancelDelete() {
        setPendingDelete(null);
        setDeleteError('');
    }

    async function confirmDelete(slug) {
        setDeleting(slug);
        setDeleteError('');
        try {
            await cmsApi.deletePost(token, slug);
            setPosts(prev => prev.filter(p => p.slug !== slug));
            setPendingDelete(null);
        } catch (err) {
            setDeleteError(err.message);
        } finally {
            setDeleting(null);
        }
    }

    function handleDuplicate(post) {
        showToast(`Duplicar "${post.title}" — funcionalidad disponible próximamente`);
    }

    const filtered = posts.filter(p => filter === 'all' || (p.status || 'published') === filter);
    const totalPublished = posts.filter(p => (p.status || 'published') === 'published').length;
    const totalDrafts    = posts.filter(p => p.status === 'draft').length;

    return (
        <div className="p-6 md:p-8 max-w-4xl">

            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Posts</h1>
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">Gestiona los artículos del blog</p>

                    {/* Stats row */}
                    {!loading && posts.length > 0 && (
                        <div className="flex items-center gap-4 mt-3">
                            <span className="text-xs font-medium text-[var(--text-muted)]">
                                <span className="font-bold text-[var(--text-primary)]">{posts.length}</span> total
                            </span>
                            <span className="h-3 w-px bg-[var(--border-default)]" aria-hidden="true" />
                            <span className="text-xs font-medium text-[var(--text-muted)]">
                                <span className="font-bold text-emerald-400">{totalPublished}</span> publicados
                            </span>
                            <span className="h-3 w-px bg-[var(--border-default)]" aria-hidden="true" />
                            <span className="text-xs font-medium text-[var(--text-muted)]">
                                <span className="font-bold text-amber-400">{totalDrafts}</span> borradores
                            </span>
                        </div>
                    )}

                    {/* Filter tabs */}
                    <div className="flex gap-1 mt-3">
                        {[['all', 'Todos'], ['published', 'Publicados'], ['draft', 'Borradores']].map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => setFilter(key)}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                    filter === key
                                        ? 'bg-fuchsia-500/20 text-fuchsia-400'
                                        : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <Link
                    to="/bitacora/posts/nuevo"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-cyan-500 text-white text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo post
                </Link>
            </div>

            {deleteError && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {deleteError}
                </div>
            )}

            {/* ── List ───────────────────────────────────────────────────── */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin" />
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-[var(--text-secondary)] text-sm">No hay posts todavía.</p>
                    <Link to="/bitacora/posts/nuevo" className="inline-block mt-3 text-fuchsia-400 text-sm hover:text-fuchsia-300">
                        Crear el primero →
                    </Link>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-sm text-[var(--text-muted)]">
                    No hay posts con ese filtro.
                </div>
            ) : (
                <div className="space-y-2.5">
                    {filtered.map(post => (
                        <div
                            key={post.slug}
                            className="flex items-start gap-4 px-5 py-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] hover:border-[var(--border-color)] transition-all"
                        >
                            <div className="flex-1 min-w-0 py-0.5">
                                {/* Title + badges */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{post.title}</p>
                                    {post.featured && (
                                        <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 font-medium">
                                            Destacado
                                        </span>
                                    )}
                                    {(post.status || 'published') === 'draft' ? (
                                        <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-medium">Borrador</span>
                                    ) : (
                                        <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium">Publicado</span>
                                    )}
                                </div>

                                {/* Excerpt subtitle */}
                                {post.excerpt && (
                                    <p className="mt-1 text-xs leading-5 text-[var(--text-muted)] line-clamp-2 max-w-xl">
                                        {post.excerpt}
                                    </p>
                                )}

                                {/* Date + tags */}
                                <div className="flex items-center gap-3 mt-2 flex-wrap">
                                    <span className="text-xs text-[var(--text-secondary)]">{formatDate(post.date)}</span>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {post.tags?.slice(0, 3).map(tag => (
                                            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 shrink-0 pt-0.5">
                                {pendingDelete === post.slug ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-[var(--text-muted)]">¿Eliminar?</span>
                                        <button
                                            onClick={() => confirmDelete(post.slug)}
                                            disabled={deleting === post.slug}
                                            className="px-3 py-1 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-40"
                                        >
                                            {deleting === post.slug ? 'Eliminando…' : 'Confirmar'}
                                        </button>
                                        <button
                                            onClick={cancelDelete}
                                            className="px-3 py-1 rounded-lg text-xs font-medium bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => handleDuplicate(post)}
                                            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-fuchsia-400 hover:bg-fuchsia-500/10 transition-all"
                                            title="Duplicar post"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                        <a
                                            href={`/blog/${post.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                                            title="Ver post"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                        <Link
                                            to={`/bitacora/posts/editar/${post.slug}`}
                                            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-fuchsia-400 hover:bg-fuchsia-500/10 transition-all"
                                            title="Editar"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => requestDelete(post.slug)}
                                            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10 transition-all"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Toast ──────────────────────────────────────────────────── */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)]/95 px-4 py-3 text-sm text-[var(--text-primary)] shadow-2xl backdrop-blur-sm">
                    {toast}
                </div>
            )}
        </div>
    );
}
