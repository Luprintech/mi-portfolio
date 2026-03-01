import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cmsApi } from '../../lib/cmsApi';

function StatCard({ label, value, to, color }) {
    return (
        <Link
            to={to}
            className={`block p-5 rounded-2xl border bg-white/3 hover:bg-white/5 transition-all group ${color}`}
        >
            <p className="text-3xl font-bold text-white group-hover:scale-105 transition-transform origin-left">{value}</p>
            <p className="text-sm text-gray-400 mt-1">{label}</p>
        </Link>
    );
}

export default function BitacoraHome() {
    const { token } = useAuth();
    const [stats, setStats] = useState({ posts: 0, projects: 0, images: 0 });
    const [posts, setPosts]  = useState([]);

    useEffect(() => {
        Promise.all([
            cmsApi.getPosts(token),
            cmsApi.getProjects(token),
            cmsApi.getImages(token),
        ]).then(([p, pr, img]) => {
            setStats({ posts: p.length, projects: pr.length, images: img.length });
            setPosts(p.slice(0, 5));
        }).catch(console.error);
    }, [token]);

    return (
        <div className="p-8 max-w-4xl">
            <h1 className="text-2xl font-bold text-white mb-1">Resumen</h1>
            <p className="text-sm text-gray-500 mb-8">Estado actual del contenido</p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-10">
                <StatCard label="Posts publicados"  value={stats.posts}    to="/bitacora/posts"     color="border-fuchsia-500/20" />
                <StatCard label="Proyectos"          value={stats.projects} to="/bitacora/proyectos" color="border-cyan-500/20" />
                <StatCard label="Imágenes"           value={stats.images}   to="/bitacora/imagenes"  color="border-violet-500/20" />
            </div>

            {/* Últimos posts */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-white">Últimas entradas</h2>
                <Link to="/bitacora/posts/nuevo" className="text-xs text-fuchsia-400 hover:text-fuchsia-300 transition-colors">
                    + Nuevo post
                </Link>
            </div>

            <div className="space-y-2">
                {posts.map(post => (
                    <div key={post.slug} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/3 border border-white/5">
                        <div className="min-w-0">
                            <p className="text-sm text-white font-medium truncate">{post.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{post.date}</p>
                        </div>
                        <Link
                            to={`/bitacora/posts/editar/${post.slug}`}
                            className="shrink-0 ml-4 text-xs text-gray-500 hover:text-fuchsia-400 transition-colors"
                        >
                            Editar
                        </Link>
                    </div>
                ))}
                {posts.length === 0 && (
                    <p className="text-sm text-gray-600 px-4 py-3">No hay posts todavía.</p>
                )}
            </div>
        </div>
    );
}
