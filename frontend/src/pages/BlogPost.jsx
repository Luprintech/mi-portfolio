import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ChevronUp, ArrowRight } from 'lucide-react';
import { buildShareLinks, extractHeadings } from '../components/blog/markdownComponents';
import { usePost } from '../hooks/usePost';
import { useReadingProgress } from '../hooks/useReadingProgress';
import { useActiveHeading } from '../hooks/useActiveHeading';
import { inferPostContentFields } from '../lib/postContentSource';
import PostSkeleton from '../components/blog/PostSkeleton';
import PostHeader from '../components/blog/PostHeader';
import PostContent from '../components/blog/PostContent';
import PostSidebar from '../components/blog/PostSidebar';
import ShareButtons from '../components/blog/ShareButtons';
import 'highlight.js/styles/atom-one-dark.css';

const BlogPost = () => {
  const { slug } = useParams();

  const { postMeta, content, loading, error } = usePost(slug);
  const { readProgress, showScrollTop } = useReadingProgress();

  const resolvedContent = useMemo(() => inferPostContentFields(postMeta || { content }), [postMeta, content]);
  const headings = useMemo(() => extractHeadings(resolvedContent.sourceContent), [resolvedContent.sourceContent]);
  const hasToc = headings.length >= 3;

  const activeHeadingId = useActiveHeading(headings, hasToc);

  // ── Estados de carga y error ───────────────────────────────────────────────

  if (loading) return <PostSkeleton />;

  if (error) {
    return (
      <div className="relative flex min-h-screen items-center justify-center blog-cosmic-grid px-4 text-[var(--text-primary)]">
        <div className="pointer-events-none absolute inset-0" style={{ background: 'var(--blog-bg)' }} />
        <div className="max-w-md rounded-[1.4rem] border border-red-500/20 bg-red-500/10 p-8 text-center text-red-400">
          <p className="mb-4">{error}</p>
          <Link to="/blog" className="font-medium text-[var(--text-primary)] transition-colors hover:text-[var(--accent-secondary)]">
            Volver al blog
          </Link>
        </div>
      </div>
    );
  }

  if (!postMeta) return null;

  const shareLinks = buildShareLinks(postMeta);

  return (
    <div className="relative min-h-screen blog-cosmic-grid px-6 py-24 text-[var(--text-primary)] selection:bg-violet-500/30 md:px-10 lg:px-14">
      <Helmet>
        <title>{postMeta.seoTitle || postMeta.title} | Guadalupe Cano</title>
        <meta name="description" content={postMeta.seoDescription || postMeta.excerpt} />
        <meta property="og:url" content={shareLinks.url} />
        <meta property="og:title" content={postMeta.seoTitle || postMeta.title} />
        <meta property="og:description" content={postMeta.seoDescription || postMeta.excerpt} />
        {postMeta.ogImage && (
          <meta
            property="og:image"
            content={postMeta.ogImage.startsWith('http') ? postMeta.ogImage : `${window.location.origin}${postMeta.ogImage}`}
          />
        )}
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={shareLinks.url} />
        <meta name="twitter:title" content={postMeta.seoTitle || postMeta.title} />
        <meta name="twitter:description" content={postMeta.seoDescription || postMeta.excerpt} />
        {postMeta.ogImage && (
          <meta
            name="twitter:image"
            content={postMeta.ogImage.startsWith('http') ? postMeta.ogImage : `${window.location.origin}${postMeta.ogImage}`}
          />
        )}
        {postMeta.canonicalUrl && <link rel="canonical" href={postMeta.canonicalUrl} />}
        {postMeta.noindex && <meta name="robots" content="noindex" />}
      </Helmet>

      {/* Barra de progreso de lectura */}
      <div
        className="pointer-events-none fixed left-0 top-0 z-50 h-[3px] transition-all duration-75"
        style={{
          width: `${readProgress}%`,
          background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
        }}
        role="progressbar"
        aria-valuenow={Math.round(readProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progreso de lectura"
      />

      <div className="pointer-events-none absolute inset-0" style={{ background: 'var(--blog-bg)' }} />
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.02] mix-blend-overlay" />

      <article className="relative z-10 mx-auto w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <PostHeader postMeta={postMeta} />

          <div className="mx-auto mt-10 grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
            <PostSidebar
              postMeta={postMeta}
              headings={headings}
              activeHeadingId={activeHeadingId}
              hasToc={hasToc}
            />

            <div className="order-1 min-w-0">
              <div className="mx-auto max-w-3xl">
                <PostContent post={postMeta} />
                <ShareButtons postMeta={postMeta} />

                {/* CTA — Seguir leyendo */}
                <div className="mt-6 overflow-hidden rounded-[1.8rem] border border-[var(--border-default)] bg-[var(--bg-elevated)]/72">
                  <div className="bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.07),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(232,121,249,0.07),transparent_55%)] p-8">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-[var(--text-muted)]">
                      Seguir leyendo
                    </p>
                    <h2 className="typo-title mt-3 text-2xl leading-snug text-[var(--text-primary)]">
                      Explorar más artículos
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                      Guías técnicas, despliegues, automatización e ingeniería aplicada al desarrollo real.
                    </p>
                    <Link
                      to="/blog"
                      className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)]/80 px-5 py-3 text-sm font-semibold text-[var(--text-primary)] transition-all hover:border-[var(--accent-secondary)]/30 hover:text-[var(--accent-secondary)]"
                    >
                      Ver todos los artículos
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </article>

      {/* Scroll-to-top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            key="scroll-top"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Volver al inicio"
            className="fixed bottom-8 right-8 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)]/90 text-[var(--text-secondary)] shadow-lg backdrop-blur-sm transition-colors hover:border-[var(--accent-secondary)]/30 hover:text-[var(--accent-secondary)]"
          >
            <ChevronUp className="h-5 w-5" aria-hidden="true" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BlogPost;
