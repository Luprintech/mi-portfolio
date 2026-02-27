import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const POSTS_PER_PAGE = 5;

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch('/posts/index.json')
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setPosts(sorted);
      })
      .catch(err => console.error("Error cargando posts:", err))
      .finally(() => setLoading(false));
  }, []);

  const uniqueTags = useMemo(() => {
    const tags = new Set();
    posts.forEach(post => post.tags.forEach(tag => tags.add(tag)));
    return ['Todos', ...Array.from(tags)];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    let result = posts;
    if (activeTag !== 'Todos') result = result.filter(post => post.tags.includes(activeTag));
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(post =>
        post.title.toLowerCase().includes(q) || post.excerpt.toLowerCase().includes(q)
      );
    }
    return result;
  }, [posts, activeTag, searchQuery]);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const currentPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  useEffect(() => { setCurrentPage(1); }, [activeTag, searchQuery]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] py-28 px-6 md:px-16 relative overflow-x-hidden selection:bg-violet-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/10 via-[var(--bg-primary)] to-[var(--bg-primary)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-noise opacity-[0.02] mix-blend-overlay pointer-events-none z-0" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-cyan-400">
            Arquitectura &amp; Desarrollo
          </h1>
          <p className="text-[var(--text-muted)] text-lg">
            Análisis técnico, decisiones de arquitectura y aprendizajes reales en proyectos full stack.
          </p>
        </motion.div>

        {loading ? (
          <p className="text-center text-[var(--text-muted)]">Cargando artículos...</p>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-10 flex flex-col items-center gap-6"
            >
              {/* Buscador */}
              <div className="w-full flex justify-between items-center gap-4 bg-[var(--bg-surface)] backdrop-blur border border-[var(--border-color)] rounded-2xl p-4">
                <div className="relative w-full max-w-sm flex items-center group">
                  <svg className="w-5 h-5 absolute left-3 text-[var(--text-muted)] group-focus-within:text-[var(--accent-secondary)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Buscar post..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--accent-secondary)]/50 focus:ring-1 focus:ring-[var(--accent-secondary)]/50 transition-all text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)]"
                  />
                </div>
                <div className="text-sm font-mono text-[var(--accent-secondary)] shrink-0">
                  {filteredPosts.length} posts
                </div>
              </div>

              {/* Filtros por Tag */}
              <div className="flex flex-wrap justify-center gap-2">
                {uniqueTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(tag)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      activeTag === tag
                        ? 'bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                        : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--accent-secondary)]'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Listado de Posts */}
            <div className="flex flex-col gap-8">
              <AnimatePresence mode="popLayout">
                {currentPosts.map((post) => (
                  <motion.article
                    layout
                    key={post.slug}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.4 }}
                    className="group relative bg-[var(--bg-elevated)] backdrop-blur-md rounded-2xl p-6 md:p-8 border border-[var(--border-color)] shadow-[var(--card-shadow)] hover:border-[var(--accent-secondary)]/40 hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-4">
                      <h2 className="text-2xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-secondary)] transition-colors">
                        <Link to={`/blog/${post.slug}`} className="before:absolute before:inset-0">
                          {post.title}
                        </Link>
                      </h2>
                      <time className="text-sm font-mono text-[var(--accent-secondary)]/80 mt-2 md:mt-0 shrink-0 md:ml-4">
                        {new Date(post.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </time>
                    </div>

                    <p className="text-[var(--text-secondary)] mb-6 leading-relaxed text-justify">
                      {post.excerpt}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {post.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 text-xs font-medium text-fuchsia-400 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12 gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-elevated)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <div className="flex gap-1 items-center">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                        currentPage === i + 1
                          ? 'bg-[var(--accent-secondary-dim)] border border-[var(--accent-secondary)]/50 text-[var(--accent-secondary)]'
                          : 'bg-transparent text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-elevated)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            )}

            {filteredPosts.length === 0 && (
              <div className="text-center text-[var(--text-muted)] mt-10">
                No se encontraron artículos que coincidan con tu búsqueda.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Blog;
