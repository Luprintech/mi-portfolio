import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, CalendarDays, Clock3, Search } from 'lucide-react';
import { publicRequest } from '../lib/publicApi';

const POSTS_PER_PAGE = 6;

const formatDate = (dateString) =>
  new Date(`${dateString}T00:00:00`).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const getPrimaryTag = (post) => post.tags?.[0] || 'Ingeniería';
const getReadTime = (post) => Math.max(4, Number(post.readingTime) || 4);

function SoftChip({ children, active = false, asButton = false, onClick, count }) {
  const classes = `rounded-full px-3.5 py-2 text-sm font-medium transition-all ${
    active
      ? 'border border-cyan-500/30 bg-cyan-500/12 text-cyan-400'
      : 'border border-[var(--border-default)] bg-[var(--bg-surface)]/70 text-[var(--text-secondary)] hover:border-[var(--accent-secondary)]/20 hover:text-[var(--text-primary)]'
  }`;

  if (asButton) {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {children}
        {typeof count === 'number' && <span className="ml-2 text-xs opacity-70">{count}</span>}
      </button>
    );
  }

  return <span className={classes}>{children}</span>;
}

function InlineMetric({ label, value }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">
        {label}
      </span>
      <span className="font-serif text-2xl leading-none text-[var(--text-primary)]">{value}</span>
    </div>
  );
}

// ── Skeleton cards ─────────────────────────────────────────────────────────────

function SkeletonCard({ wide = false }) {
  return (
    <div
      className={`animate-pulse rounded-[1.65rem] border border-[var(--border-default)] bg-[var(--bg-elevated)]/70 p-5 md:p-6 ${wide ? 'md:col-span-2' : ''}`}
    >
      <div className="h-3 w-20 rounded-full bg-[var(--bg-surface)]" />
      <div className="mt-4 space-y-2">
        <div className="h-7 w-4/5 rounded-xl bg-[var(--bg-surface)]" />
        <div className="h-7 w-2/3 rounded-xl bg-[var(--bg-surface)]" />
      </div>
      <div className="mt-4 flex gap-3">
        <div className="h-3 w-24 rounded-full bg-[var(--bg-surface)]" />
        <div className="h-3 w-16 rounded-full bg-[var(--bg-surface)]" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3.5 w-full rounded-full bg-[var(--bg-surface)]" />
        <div className="h-3.5 w-5/6 rounded-full bg-[var(--bg-surface)]" />
        <div className="h-3.5 w-4/5 rounded-full bg-[var(--bg-surface)]" />
      </div>
      <div className="mt-5 flex gap-2">
        <div className="h-7 w-16 rounded-full bg-[var(--bg-surface)]" />
        <div className="h-7 w-20 rounded-full bg-[var(--bg-surface)]" />
        <div className="h-7 w-14 rounded-full bg-[var(--bg-surface)]" />
      </div>
    </div>
  );
}

function SkeletonLoading() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <SkeletonCard wide />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}

// ── FeaturedArticle ────────────────────────────────────────────────────────────

function FeaturedArticle({ post }) {
  const primaryTag = getPrimaryTag(post);

  return (
    <article className="rounded-[1.8rem] border border-[var(--border-default)] bg-[var(--bg-elevated)]/72 p-5 md:p-6 lg:p-7">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.02fr)_minmax(280px,0.88fr)] lg:items-center">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-3">
            <SoftChip>{primaryTag}</SoftChip>
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-[var(--text-muted)]">
              Artículo destacado
            </span>
          </div>

          <h2 className="mt-4 font-serif text-[clamp(2rem,3.3vw,3.35rem)] leading-[1] text-[var(--text-primary)]">
            {post.title}
          </h2>

          <p className="mt-4 text-[0.98rem] leading-relaxed text-justify text-[var(--text-secondary)] md:text-base">
            {post.excerpt}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[var(--text-secondary)]">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)]/75 px-3 py-1.5">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              {formatDate(post.date)}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)]/75 px-3 py-1.5">
              <Clock3 className="h-4 w-4" aria-hidden="true" />
              {getReadTime(post)} min de lectura
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags?.slice(0, 4).map((tag) => (
              <SoftChip key={tag}>{tag}</SoftChip>
            ))}
          </div>

          <Link
            to={`/blog/${post.slug}`}
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:text-[var(--accent-secondary)]"
          >
            Leer artículo completo
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <Link
          to={`/blog/${post.slug}`}
          aria-label={`Abrir el artículo ${post.title}`}
          className="group block overflow-hidden rounded-[1.45rem] border border-[var(--border-default)] bg-[linear-gradient(145deg,rgba(247,250,255,0.96),rgba(228,236,251,0.82))] p-3 md:p-4"
        >
          <div className="relative aspect-[5/4] lg:aspect-[4/3]">
            <div className="absolute inset-0 rounded-[1rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.75),rgba(255,255,255,0.12)_58%,transparent_100%)]" />
            {post.coverImage ? (
              <img
                src={post.coverImage}
                alt={post.title}
                className="relative z-[1] h-full w-full object-contain object-center transition-transform duration-500 group-hover:scale-[1.01]"
                loading="lazy"
              />
            ) : (
              <>
                <div className="absolute inset-0 rounded-[1rem] bg-[linear-gradient(135deg,rgba(6,182,212,0.12),rgba(15,23,42,0.03),rgba(232,121,249,0.12))]" />
                {/* Tag placeholder when no cover image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="rounded-full border border-[var(--border-default)] bg-white/60 px-5 py-2.5 text-sm font-semibold tracking-wide text-[var(--text-secondary)] backdrop-blur-sm">
                    {primaryTag}
                  </span>
                </div>
              </>
            )}
          </div>
        </Link>
      </div>
    </article>
  );
}

// ── RecentArticleCard ──────────────────────────────────────────────────────────

function RecentArticleCard({ post, index }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
      className={`group rounded-[1.65rem] border border-[var(--border-default)] bg-[var(--bg-elevated)]/70 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent-secondary)]/20 hover:shadow-[0_12px_40px_rgba(15,23,42,0.08)] ${index === 0 ? 'md:col-span-2' : ''}`}
    >
      <Link to={`/blog/${post.slug}`} className="block p-5 md:p-6">
        {/* Cover image */}
        {post.coverImage && (
          <div className="mb-4 overflow-hidden rounded-[1.2rem] border border-[var(--border-default)]">
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              loading="lazy"
            />
          </div>
        )}

        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">
          {getPrimaryTag(post)}
        </p>

        <h3 className="mt-3 font-serif text-[2rem] leading-[1.04] text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent-secondary)]">
          {post.title}
        </h3>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
          <span>{formatDate(post.date)}</span>
          <span className="h-1 w-1 rounded-full bg-[var(--text-muted)]" aria-hidden="true" />
          <span>{getReadTime(post)} min</span>
        </div>

        <p className="mt-4 text-base leading-relaxed text-justify text-[var(--text-secondary)]">
          {post.excerpt}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {post.tags?.slice(0, 4).map((tag) => (
            <SoftChip key={tag}>{tag}</SoftChip>
          ))}
        </div>
      </Link>
    </motion.article>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <section className="rounded-[1.8rem] border border-[var(--border-default)] bg-[var(--bg-elevated)]/60 py-20 text-center">
      <div className="mx-auto max-w-md px-6">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)]">
          <svg
            className="h-7 w-7 text-[var(--text-muted)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        </div>
        <h2 className="font-serif text-3xl text-[var(--text-primary)]">Aún no hay artículos publicados</h2>
        <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">
          Pronto habrá contenido técnico sobre desarrollo web, infraestructura e inteligencia artificial aplicada a proyectos reales.
        </p>
      </div>
    </section>
  );
}

// ── Blog ───────────────────────────────────────────────────────────────────────

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTag, setActiveTag] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    const controller = new AbortController();

    const fetchPosts = async () => {
      try {
        const data = await publicRequest('/api/posts', { signal: controller.signal });
        setPosts(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error cargando posts:', err);
          setError('No se pudieron cargar los artículos. Inténtalo de nuevo más tarde.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
    return () => controller.abort();
  }, []);

  const tagOptions = useMemo(() => {
    const counts = new Map();
    posts.forEach((post) => post.tags?.forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1)));
    const sortedTags = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'es'))
      .map(([label, count]) => ({ label, count }));

    return [{ label: 'Todos', count: posts.length }, ...sortedTags];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const q = deferredSearchQuery.trim().toLowerCase();

    return posts.filter((post) => {
      if (activeTag !== 'Todos' && !post.tags?.includes(activeTag)) {
        return false;
      }

      if (!q) {
        return true;
      }

      return [post.title, post.excerpt, ...(post.tags || [])].join(' ').toLowerCase().includes(q);
    });
  }, [activeTag, deferredSearchQuery, posts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTag, searchQuery]);

  const featuredPost = useMemo(
    () => filteredPosts.find((post) => post.featured) || filteredPosts[0] || null,
    [filteredPosts]
  );
  const remainingPosts = featuredPost
    ? filteredPosts.filter((post) => post.slug !== featuredPost.slug)
    : filteredPosts;
  const totalPages = Math.ceil(remainingPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = remainingPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);
  const latestPost = posts[0] || null;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--bg-primary)] px-6 py-24 text-[var(--text-primary)] selection:bg-violet-500/30 md:px-12 xl:px-16">
      <Helmet>
        <title>Blog técnico | Guadalupe Cano - Desarrollo web e IA</title>
        <meta
          name="description"
          content="Blog técnico de Guadalupe Cano sobre desarrollo web, inteligencia artificial, arquitectura, despliegue e infraestructura aplicada a proyectos reales."
        />
        <link rel="canonical" href="https://guadalupecano.es/blog" />
      </Helmet>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.08),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(232,121,249,0.08),transparent_24%),linear-gradient(180deg,var(--bg-primary)_0%,var(--bg-secondary)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.02] mix-blend-overlay" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-12">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.36em] text-[var(--text-muted)]">
            Blog técnico
          </p>
          <h1 className="mt-5 max-w-4xl font-serif text-[clamp(3.2rem,6vw,5.8rem)] leading-[0.94] text-[var(--text-primary)]">
            Blog de desarrollo, IA y automatización
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-justify text-[var(--text-secondary)] md:text-xl">
            Proyectos reales, despliegues, automatización e ingeniería aplicada explicados desde la práctica.
          </p>
        </header>

        {loading ? (
          <>
            <section className="mb-10 animate-pulse rounded-[1.8rem] border border-[var(--border-default)] bg-[var(--bg-elevated)]/65 p-5 md:p-6">
              <div className="flex flex-wrap gap-x-8 gap-y-3">
                <div className="h-7 w-28 rounded-xl bg-[var(--bg-surface)]" />
                <div className="h-7 w-24 rounded-xl bg-[var(--bg-surface)]" />
                <div className="h-7 w-36 rounded-xl bg-[var(--bg-surface)]" />
              </div>
              <div className="mt-5 h-11 w-full rounded-full bg-[var(--bg-surface)]" />
              <div className="mt-5 flex gap-2">
                {[70, 90, 80, 65, 85].map((w, i) => (
                  <div key={i} className="h-9 rounded-full bg-[var(--bg-surface)]" style={{ width: w }} />
                ))}
              </div>
            </section>
            <SkeletonLoading />
          </>
        ) : error ? (
          <div className="rounded-[1.6rem] border border-red-500/20 bg-red-500/10 p-8 text-center text-red-400">
            {error}
          </div>
        ) : (
          <>
            <section className="mb-10 rounded-[1.8rem] border border-[var(--border-default)] bg-[var(--bg-elevated)]/65 p-5 md:p-6">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                  <InlineMetric label="Artículos" value={posts.length} />
                  <InlineMetric label="Temas" value={Math.max(tagOptions.length - 1, 0)} />
                  <InlineMetric label="Último" value={latestPost ? formatDate(latestPost.date) : 'Próximamente'} />
                </div>

                <label className="relative block w-full xl:max-w-md">
                  <Search
                    className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    aria-label="Buscar artículo"
                    placeholder="Buscar por stack, problema técnico o palabra clave..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="w-full rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)]/80 py-3 pl-12 pr-4 text-sm text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--accent-secondary)]/35 focus:ring-2 focus:ring-[var(--accent-secondary)]/10"
                  />
                </label>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {tagOptions.map((tag) => (
                  <SoftChip
                    key={tag.label}
                    asButton
                    active={activeTag === tag.label}
                    onClick={() => setActiveTag(tag.label)}
                    count={tag.count}
                  >
                    {tag.label}
                  </SoftChip>
                ))}
              </div>
            </section>

            {/* No posts at all */}
            {posts.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {featuredPost ? (
                  <section className="mb-12">
                    <FeaturedArticle post={featuredPost} />
                  </section>
                ) : null}

                <section className="mb-10">
                  <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-t border-[var(--border-default)] pt-8">
                    <div>
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-[var(--text-muted)]">
                        Artículos recientes
                      </p>
                      <h2 className="mt-3 font-serif text-4xl text-[var(--text-primary)]">Más artículos</h2>
                    </div>
                    <p className="max-w-xl text-sm leading-relaxed text-justify text-[var(--text-secondary)]">
                      Una selección de guías, despliegues, arquitectura y aprendizajes técnicos organizados para una lectura más limpia y directa.
                    </p>
                  </div>

                  {paginatedPosts.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2">
                      <AnimatePresence mode="popLayout">
                        {paginatedPosts.map((post, index) => (
                          <RecentArticleCard key={post.slug} post={post} index={index} />
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="rounded-[1.6rem] border border-[var(--border-default)] bg-[var(--bg-elevated)]/60 px-8 py-14 text-center">
                      <p className="font-serif text-2xl text-[var(--text-primary)]">Sin resultados</p>
                      <p className="mt-3 text-sm text-[var(--text-secondary)]">
                        Prueba con otra tecnología, elimina el filtro temático o busca un concepto más amplio.
                      </p>
                      <button
                        type="button"
                        onClick={() => { setActiveTag('Todos'); setSearchQuery(''); }}
                        className="mt-5 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)]/80 px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
                      >
                        Limpiar filtros
                      </button>
                    </div>
                  )}
                </section>

                {tagOptions.length > 1 && (
                  <section className="border-t border-[var(--border-default)] pt-8">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                      <div>
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-[var(--text-muted)]">
                          Tecnologías y temas
                        </p>
                        <h2 className="mt-3 font-serif text-4xl text-[var(--text-primary)]">Explorar por tema</h2>
                      </div>
                      <p className="max-w-xl text-sm leading-relaxed text-justify text-[var(--text-secondary)]">
                        React, Docker, automatización, despliegue, IA y otras tecnologías que aparecen de forma recurrente en el blog.
                      </p>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {tagOptions.slice(1).map((tag) => (
                        <SoftChip
                          key={tag.label}
                          asButton
                          active={activeTag === tag.label}
                          onClick={() => setActiveTag(tag.label)}
                          count={tag.count}
                        >
                          {tag.label}
                        </SoftChip>
                      ))}
                    </div>
                  </section>
                )}

                {totalPages > 1 && (
                  <nav className="mt-12 flex justify-center gap-2" aria-label="Paginación">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={currentPage === 1}
                      className="rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)]/70 px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      return (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          aria-current={currentPage === page ? 'page' : undefined}
                          className={`h-10 w-10 rounded-full text-sm font-semibold transition-colors ${
                            currentPage === page
                              ? 'bg-[var(--text-primary)] text-[var(--text-inverse)]'
                              : 'border border-[var(--border-default)] bg-[var(--bg-surface)]/70 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)]/70 px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Siguiente
                    </button>
                  </nav>
                )}

                {filteredPosts.length === 0 && posts.length > 0 && (
                  <section className="border-t border-[var(--border-default)] py-10">
                    <h2 className="font-serif text-3xl text-[var(--text-primary)]">No hay resultados para esa búsqueda</h2>
                    <p className="mt-4 max-w-2xl text-justify text-[var(--text-secondary)]">
                      Prueba con otra tecnología, elimina el filtro temático o busca un concepto más amplio.
                    </p>
                  </section>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Blog;
