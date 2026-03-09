import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cmsApi } from '../../lib/cmsApi';

export default function BitacoraProjects() {
    const { token } = useAuth();
    const [projects,      setProjects]      = useState([]);
    const [loading,       setLoading]       = useState(true);
    const [deleting,      setDeleting]      = useState(null);
    const [pendingDelete, setPendingDelete] = useState(null);
    const [deleteError,   setDeleteError]   = useState('');

    async function load() {
        setLoading(true);
        try {
            setProjects(await cmsApi.getProjects(token));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, [token]);

    function requestDelete(id) {
        setDeleteError('');
        setPendingDelete(id);
    }

    function cancelDelete() {
        setPendingDelete(null);
        setDeleteError('');
    }

    async function confirmDelete(id) {
        setDeleting(id);
        setDeleteError('');
        try {
            await cmsApi.deleteProject(token, id);
            setProjects(prev => prev.filter(p => p.id !== id));
            setPendingDelete(null);
        } catch (err) {
            setDeleteError(err.message);
        } finally {
            setDeleting(null);
        }
    }

    return (
        <div className="p-8 max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Proyectos</h1>
                    <p className="text-sm text-[var(--text-secondary)]">{projects.length} proyectos en el portfolio</p>
                </div>
                <Link
                    to="/bitacora/proyectos/nuevo"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-cyan-500 text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo proyecto
                </Link>
            </div>

            {deleteError && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {deleteError}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                </div>
            ) : projects.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-[var(--text-secondary)] text-sm">No hay proyectos todavía.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {projects.map(project => (
                        <div
                            key={project.id}
                            className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] hover:border-[var(--border-color)] transition-all"
                        >
                            {project.image && (
                                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-[var(--bg-elevated)]">
                                    <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                                </div>
                            )}

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{project.title}</p>
                                    {project.featured && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-fuchsia-500/15 text-fuchsia-400 border border-fuchsia-500/20 shrink-0">
                                            Destacado
                                        </span>
                                    )}
                                    {project.category === 'cms' ? (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20 shrink-0">
                                            WordPress & CMS
                                        </span>
                                    ) : (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20 shrink-0">
                                            Código
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{project.description}</p>
                                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                                    {project.tech?.slice(0, 4).map(t => (
                                        <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)]">{t}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                {pendingDelete === project.id ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-[var(--text-muted)]">¿Eliminar?</span>
                                        <button
                                            onClick={() => confirmDelete(project.id)}
                                            disabled={deleting === project.id}
                                            className="px-3 py-1 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-40"
                                        >
                                            {deleting === project.id ? 'Eliminando…' : 'Confirmar'}
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
                                        {project.demo && (
                                            <a
                                                href={project.demo}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                                                title="Ver demo"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        )}
                                        <Link
                                            to={`/bitacora/proyectos/editar/${project.id}`}
                                            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-fuchsia-400 hover:bg-fuchsia-500/10 transition-all"
                                            title="Editar"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </Link>
                                        <button
                                            onClick={() => requestDelete(project.id)}
                                            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10 transition-all"
                                            title="Eliminar"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
