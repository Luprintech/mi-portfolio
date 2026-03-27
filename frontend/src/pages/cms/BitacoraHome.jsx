import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cmsApi } from '../../lib/cmsApi';


function StatCard({ label, value, to, color }) {
    return (
        <Link
            to={to}
            className={`block p-5 rounded-2xl border bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] transition-all group ${color}`}
        >
            <p className="text-3xl font-bold text-[var(--text-primary)] group-hover:scale-105 transition-transform origin-left">{value}</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{label}</p>
        </Link>
    );
}

export default function BitacoraHome() {
    const { token } = useAuth();
    const [stats, setStats] = useState({ posts: 0, projects: 0, images: 0 });
    const [posts, setPosts]  = useState([]);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        let cancelled = false;

        Promise.allSettled([
            cmsApi.getPosts(token),
            cmsApi.getProjects(token),
            cmsApi.getImages(token),
        ]).then(([postsResult, projectsResult, imagesResult]) => {
            if (cancelled) return;

            const nextPosts = postsResult.status === 'fulfilled' && Array.isArray(postsResult.value)
                ? postsResult.value
                : [];
            const nextProjects = projectsResult.status === 'fulfilled' && Array.isArray(projectsResult.value)
                ? projectsResult.value
                : [];
            const nextImages = imagesResult.status === 'fulfilled' && Array.isArray(imagesResult.value)
                ? imagesResult.value
                : [];

            setStats({
                posts: nextPosts.length,
                projects: nextProjects.length,
                images: nextImages.length,
            });
            setPosts(nextPosts.slice(0, 5));

            const failures = [postsResult, projectsResult, imagesResult].filter(result => result.status === 'rejected');
            setLoadError(failures.length > 0 ? 'No se pudo refrescar todo el resumen del CMS. Los datos visibles pueden estar incompletos.' : '');
        });

        return () => {
            cancelled = true;
        };
    }, [token]);

    return (
        <div className="p-8 max-w-4xl">
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Resumen</h1>
            <p className="text-sm text-[var(--text-secondary)] mb-8">Estado actual del contenido</p>

            {loadError && (
                <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
                    {loadError}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-10">
                <StatCard label="Posts"             value={stats.posts}    to="/bitacora/posts"     color="border-fuchsia-500/20" />
                <StatCard label="Proyectos"          value={stats.projects} to="/bitacora/proyectos" color="border-cyan-500/20" />
                <StatCard label="Imágenes"           value={stats.images}   to="/bitacora/imagenes"  color="border-violet-500/20" />
            </div>

            {/* Últimos posts */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-[var(--text-primary)]">Últimas entradas</h2>
                <Link to="/bitacora/posts/nuevo" className="text-xs text-fuchsia-400 hover:text-fuchsia-300 transition-colors">
                    + Nuevo post
                </Link>
            </div>

            <div className="space-y-2">
                {posts.map(post => (
                    <div key={post.slug} className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)]">
                        <div className="min-w-0">
                            <p className="text-sm text-[var(--text-primary)] font-medium truncate">{post.title}</p>
                            <p className="text-xs text-[var(--text-secondary)] mt-0.5">{post.date}</p>
                        </div>
                        <Link
                            to={`/bitacora/posts/editar/${post.slug}`}
                            className="shrink-0 ml-4 text-xs text-[var(--text-secondary)] hover:text-fuchsia-400 transition-colors"
                        >
                            Editar
                        </Link>
                    </div>
                ))}
                {posts.length === 0 && (
                    <p className="text-sm text-[var(--text-secondary)] px-4 py-3">No hay posts todavía.</p>
                )}
            </div>

            {/* Acceso rápido al CV */}
            <div className="mt-10 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">CV público</p>
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">Gestiona y previsualiza el PDF desde la sección dedicada.</p>
                </div>
                <Link
                    to="/bitacora/cv"
                    className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                >
                    Gestionar CV
                </Link>
            </div>
        </div>
    );
}
