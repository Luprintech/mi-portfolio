import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ArrowRight, CalendarDays, ChevronUp, Clock3 } from 'lucide-react';
import { sanitizePostContent } from '../lib/postContentSanitizer';
import { publicRequest } from '../lib/publicApi';
import 'highlight.js/styles/atom-one-dark.css';

// ── Helpers ────────────────────────────────────────────────────────────────────

function slugifyHeading(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const formatDate = (dateString) =>
  new Date(`${dateString}T00:00:00`).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const getReadTime = (post) => Math.max(4, Number(post?.readingTime) || 4);

// ── DocumentEmbed ──────────────────────────────────────────────────────────────

function DocumentEmbed({ src, filename, fileType, displayMode, embedHeight }) {
  const isPdf = fileType === 'pdf';
  const mode = displayMode || (isPdf ? 'embed' : 'link');
  const height = parseInt(embedHeight, 10) || 500;
  const iconLabel = { pdf: 'PDF', zip: 'ZIP', docx: 'DOC' }[fileType] || 'FILE';

  return (
    <div className="my-6 overflow-hidden rounded-[1.35rem] border border-[var(--border-default)] bg-[var(--bg-elevated)]/70">
      {isPdf && mode === 'embed' && (
        <iframe
          src={src}
          className="block w-full border-none"
          style={{ height }}
          loading="lazy"
          title={filename}
          allowFullScreen
        />
      )}

      <div className="flex items-center gap-3 border-t border-[var(--border-default)] bg-[var(--bg-surface)]/80 px-4 py-3">
        <span className="rounded-full border border-[var(--border-default)] bg-[var(--bg-primary)] px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
          {iconLabel}
        </span>
        <p className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--text-primary)]">{filename}</p>
        {!(isPdf && mode === 'embed') && src && (
          <a
            href={src}
            download={filename}
            className="rounded-full border border-[var(--border-default)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--accent-secondary)]/30 hover:text-[var(--accent-secondary)]"
          >
            Descargar
          </a>
        )}
      </div>
    </div>
  );
}

// ── Loading Skeleton ───────────────────────────────────────────────────────────

function PostSkeleton() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--bg-primary)] px-6 py-24 text-[var(--text-primary)] md:px-10 lg:px-14">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.06),transparent_30%),linear-gradient(180deg,var(--bg-primary)_0%,var(--bg-secondary)_100%)]" />
      <div className="relative z-10 mx-auto w-full max-w-6xl animate-pulse">
        {/* Back link */}
        <div className="h-4 w-28 rounded-full bg-[var(--bg-elevated)]" />
        {/* Title */}
        <div className="mt-8 space-y-3">
          <div className="h-10 w-3/4 rounded-2xl bg-[var(--bg-elevated)]" />
          <div className="h-10 w-1/2 rounded-2xl bg-[var(--bg-elevated)]" />
        </div>
        {/* Excerpt */}
        <div className="mt-6 space-y-2">
          <div className="h-4 w-full rounded-full bg-[var(--bg-elevated)]" />
          <div className="h-4 w-5/6 rounded-full bg-[var(--bg-elevated)]" />
        </div>
        {/* Meta row */}
        <div className="mt-8 flex gap-3">
          <div className="h-9 w-36 rounded-full bg-[var(--bg-elevated)]" />
          <div className="h-9 w-32 rounded-full bg-[var(--bg-elevated)]" />
          <div className="h-9 w-20 rounded-full bg-[var(--bg-elevated)]" />
        </div>
        {/* Cover image placeholder */}
        <div className="mt-10 h-64 w-full rounded-[1.8rem] bg-[var(--bg-elevated)] md:h-80" />
        {/* Content blocks */}
        <div className="mt-10 space-y-4">
          {[1, 0.9, 0.95, 0.8, 0.92, 0.7, 0.88, 0.6].map((w, i) => (
            <div
              key={i}
              className="h-4 rounded-full bg-[var(--bg-elevated)]"
              style={{ width: `${w * 100}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Table of Contents ──────────────────────────────────────────────────────────

function TableOfContents({ headings, activeId }) {
  return (
    <nav aria-label="Tabla de contenidos">
      <ul className="space-y-1">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`block rounded-lg px-3 py-1.5 text-[0.8rem] leading-5 transition-colors ${
                h.level === 3 ? 'pl-6' : ''
              } ${
                activeId === h.id
                  ? 'bg-[var(--accent-primary)]/10 font-semibold text-[var(--accent-secondary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// ── Markdown components (with heading IDs for ToC) ────────────────────────────

function buildMarkdownComponents() {
  return {
    div: ({ node, ...props }) => {
      if (props['data-document'] !== undefined) {
        const align = props['data-align'];
        const alignClass =
          align === 'center'
            ? 'flex justify-center'
            : align === 'right'
              ? 'flex justify-end'
              : '';

        const embed = (
          <DocumentEmbed
            src={props['data-src']}
            filename={props['data-filename']}
            fileType={props['data-file-type']}
            displayMode={props['data-display-mode']}
            embedHeight={props['data-embed-height'] || props.embedheight}
          />
        );

        return alignClass ? <div className={alignClass}>{embed}</div> : embed;
      }

      return <div {...props} />;
    },
    h1: ({ node, children, ...props }) => {
      const id = slugifyHeading(getChildrenText(children));
      return (
        <h1
          id={id}
          className="mt-0 mb-6 scroll-mt-24 font-serif text-[clamp(1.9rem,3.5vw,2.8rem)] leading-tight text-[var(--text-primary)]"
          {...props}
        >
          {children}
        </h1>
      );
    },
    h2: ({ node, children, ...props }) => {
      const id = slugifyHeading(getChildrenText(children));
      return (
        <h2
          id={id}
          className="mt-14 mb-5 scroll-mt-24 border-b border-[var(--border-default)] pb-3 font-serif text-3xl leading-tight text-[var(--text-primary)]"
          {...props}
        >
          {children}
        </h2>
      );
    },
    h3: ({ node, children, ...props }) => {
      const id = slugifyHeading(getChildrenText(children));
      return (
        <h3
          id={id}
          className="mt-10 mb-4 scroll-mt-24 font-semibold text-[1.6rem] leading-snug text-[var(--text-primary)]"
          {...props}
        >
          {children}
        </h3>
      );
    },
    h4: ({ node, ...props }) => (
      <h4 className="mt-8 mb-3 text-lg font-semibold leading-snug text-[var(--text-primary)]" {...props} />
    ),
    p: ({ node, ...props }) => (
      <p className="mb-6 text-[1.02rem] leading-8 text-justify text-[var(--text-secondary)]" {...props} />
    ),
    ul: ({ node, ...props }) => (
      <ul className="mb-8 ml-6 list-disc space-y-3 text-justify text-[1.02rem] leading-8 text-[var(--text-secondary)]" {...props} />
    ),
    ol: ({ node, ...props }) => (
      <ol className="mb-8 ml-6 list-decimal space-y-3 text-justify text-[1.02rem] leading-8 text-[var(--text-secondary)]" {...props} />
    ),
    li: ({ node, ...props }) => <li className="pl-2 text-justify" {...props} />,
    a: ({ node, title, ...props }) => {
      if (props['data-content-button'] !== undefined) {
        return <a {...props} />;
      }

      if (title === 'button') {
        return (
          <span className="my-8 flex">
            <a
              className="inline-flex items-center gap-2 rounded-full bg-[var(--text-primary)] px-5 py-3 text-sm font-semibold text-[var(--text-inverse)] no-underline transition-transform hover:-translate-y-0.5"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              {props.children}
            </a>
          </span>
        );
      }

      return (
        <a
          className="font-medium text-[var(--accent-secondary)] underline decoration-[var(--accent-secondary)]/30 underline-offset-4 transition-colors hover:text-[var(--text-primary)]"
          target="_blank"
          rel="noopener noreferrer"
          title={title}
          {...props}
        />
      );
    },
    blockquote: ({ node, ...props }) => (
      <blockquote
        className="my-8 rounded-r-[1.2rem] border-l-4 border-[var(--accent-secondary)] bg-[var(--bg-surface)]/85 px-5 py-4 text-justify italic leading-8 text-[var(--text-secondary)]"
        {...props}
      />
    ),
    img: ({ node, alt, ...props }) => (
      <figure className="my-10">
        <img
          alt={alt || ''}
          className="w-full rounded-[1.5rem] border border-[var(--border-default)] bg-[var(--bg-surface)] object-cover"
          loading="lazy"
          {...props}
        />
        {alt && <figcaption className="mt-3 text-center text-sm italic text-[var(--text-muted)]">{alt}</figcaption>}
      </figure>
    ),
    hr: () => <hr className="my-10 border-0 border-t border-[var(--border-default)]" />,
    table: ({ node, ...props }) => (
      <div className="my-8 overflow-x-auto rounded-[1.2rem] border border-[var(--border-default)]">
        <table className="min-w-full border-collapse text-left" {...props} />
      </div>
    ),
    thead: ({ node, ...props }) => <thead className="bg-[var(--bg-surface)]/85" {...props} />,
    th: ({ node, ...props }) => (
      <th className="border-b border-[var(--border-default)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)]" {...props} />
    ),
    td: ({ node, ...props }) => (
      <td
        className="border-b border-[var(--border-default)] px-4 py-3 text-justify text-sm leading-7 text-[var(--text-secondary)]"
        {...props}
      />
    ),
    code: ({ node, inline, className, children, ...props }) =>
      inline ? (
        <code
          className="rounded-md border border-cyan-500/15 bg-[var(--bg-code)] px-1.5 py-0.5 font-mono text-[0.92em] text-cyan-300"
          {...props}
        >
          {children}
        </code>
      ) : (
        <div className="terminal-window relative mb-8 overflow-hidden rounded-[1.25rem] border border-[var(--border-default)]">
          <div
            className="terminal-window__header flex items-center gap-2 border-b border-white/5 bg-[var(--bg-code-header)] px-4 py-3"
            aria-hidden="true"
          >
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <span className="h-3 w-3 rounded-full bg-green-500/80" />
          </div>
          <pre className="terminal-window__body overflow-x-auto bg-[var(--bg-code)] p-5">
            <code className={`${className || ''} block font-mono text-sm leading-7`} {...props}>
              {children}
            </code>
          </pre>
        </div>
      ),
  };
}

const markdownComponents = buildMarkdownComponents();

// ── Extract headings — supports both HTML (TipTap) and markdown ───────────────

function getChildrenText(children) {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(getChildrenText).join('');
  if (children?.props?.children) return getChildrenText(children.props.children);
  return '';
}

function extractHeadings(content) {
  const headings = [];

  // HTML headings (TipTap editor output: <h1>, <h2>, <h3>)
  if (/<h[123][\s>]/i.test(content)) {
    const htmlRegex = /<h([123])[^>]*>([\s\S]*?)<\/h[123]>/gi;
    let match;
    while ((match = htmlRegex.exec(content)) !== null) {
      const level = parseInt(match[1], 10);
      const text = match[2].replace(/<[^>]*>/g, '').trim();
      if (text) headings.push({ level, text, id: slugifyHeading(text) });
    }
    return headings;
  }

  // Markdown headings fallback
  const mdRegex = /^(#{1,3})\s+(.+)$/gm;
  let match;
  while ((match = mdRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim().replace(/[*_`~[\]()]/g, '').trim();
    if (text) headings.push({ level, text, id: slugifyHeading(text) });
  }

  return headings;
}

// ── Main component ─────────────────────────────────────────────────────────────

const PUBLIC_SITE_URL = import.meta.env.VITE_SITE_URL || 'https://guadalupecano.es';

function resolvePublicPostUrl(postMeta) {
  if (postMeta?.canonicalUrl) return postMeta.canonicalUrl;

  if (typeof window === 'undefined') return PUBLIC_SITE_URL;

  const currentUrl = new URL(window.location.href);
  const isLocalHost = ['localhost', '127.0.0.1'].includes(currentUrl.hostname);

  if (isLocalHost) {
    return new URL(currentUrl.pathname, PUBLIC_SITE_URL).href;
  }

  return currentUrl.href;
}

function buildShareLinks(postMeta) {
  const url = resolvePublicPostUrl(postMeta);
  const title = postMeta?.seoTitle || postMeta?.title || 'Articulo';
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return {
    url,
    title,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${url}`)}`,
  };
}

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [postMeta, setPostMeta] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [readProgress, setReadProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState('');
  const [copied, setCopied] = useState(false);

  const sanitizedContent = useMemo(() => sanitizePostContent(content), [content]);

  const headings = useMemo(() => extractHeadings(content), [content]);
  const hasToc = headings.length >= 3;

  // ── Fetch post ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const controller = new AbortController();

    const fetchPost = async () => {
      try {
        const found = await publicRequest(`/api/posts/${slug}`, { signal: controller.signal });
        setPostMeta(found);
        setContent(found.content || '');
      } catch (err) {
        if (err.name !== 'AbortError') {
          if (err.status === 404) {
            navigate('/blog', { replace: true });
            return;
          }
          console.error('Error cargando post:', err);
          setError('No se pudo cargar el artículo.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
    return () => controller.abort();
  }, [slug, navigate]);

  // ── Reading progress + scroll-to-top visibility ───────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setReadProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
      setShowScrollTop(scrollTop > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Active heading tracking for ToC ──────────────────────────────────────────
  useEffect(() => {
    if (!hasToc) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHeadingId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings, hasToc]);

  // ── Scroll to top ─────────────────────────────────────────────────────────────
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleCopyLink() {
    if (typeof navigator === 'undefined') return;

    try {
      await navigator.clipboard.writeText(buildShareLinks(postMeta).url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch (copyError) {
      console.error('No se pudo copiar el enlace del artículo:', copyError);
      setCopied(false);
    }
  }

  // ── States ────────────────────────────────────────────────────────────────────

  if (loading) return <PostSkeleton />;

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-4 text-[var(--text-primary)]">
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

  const shareLinks = buildShareLinks(postMeta); /*
    ? `${postMeta.title} — ${postMeta.excerpt}`


  */
  return (
    <div className="relative min-h-screen bg-[var(--bg-primary)] px-6 py-24 text-[var(--text-primary)] selection:bg-violet-500/30 md:px-10 lg:px-14">
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

      {/* Reading progress bar */}
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

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.08),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(232,121,249,0.08),transparent_20%),linear-gradient(180deg,var(--bg-primary)_0%,var(--bg-secondary)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.02] mix-blend-overlay" />

      <article className="relative z-10 mx-auto w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <header className="mx-auto max-w-4xl">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Volver al blog
          </Link>

          {postMeta.excerpt && (
            <p className="mt-6 max-w-3xl text-lg leading-8 text-justify text-[var(--text-secondary)] md:text-[1.05rem]">
              {postMeta.excerpt}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-[var(--text-secondary)]">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)]/80 px-3.5 py-2">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              {formatDate(postMeta.date)}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)]/80 px-3.5 py-2">
              <Clock3 className="h-4 w-4" aria-hidden="true" />
              {getReadTime(postMeta)} min de lectura
            </span>
            {postMeta.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {postMeta.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)]/65 px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* ── Main layout: sidebar + content ───────────────────────────────── */}
        <div className="mx-auto mt-10 grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">

          {/* ── Sidebar (desktop, sticky) ─────────────────────────────────── */}
          <aside className="order-2 hidden self-start lg:block lg:sticky lg:top-28">
            <div className="space-y-4">
              {/* ToC panel */}
              {hasToc && (
                <div className="rounded-[1.6rem] border border-[var(--border-default)] bg-[var(--bg-elevated)]/72 p-5">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">
                    Contenidos
                  </p>
                  <div className="mt-4">
                    <TableOfContents headings={headings} activeId={activeHeadingId} />
                  </div>
                </div>
              )}

              {/* Post meta panel */}
              <div className="rounded-[1.6rem] border border-[var(--border-default)] bg-[var(--bg-elevated)]/72 p-5">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">
                  Resumen
                </p>
                <div className="mt-5 space-y-4 text-sm text-[var(--text-secondary)]">
                  <div>
                    <p className="mb-1 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                      Publicado
                    </p>
                    <p className="leading-6">{formatDate(postMeta.date)}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                      Lectura
                    </p>
                    <p>{getReadTime(postMeta)} min</p>
                  </div>
                  {postMeta.tags?.length > 0 && (
                    <div>
                      <p className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                        Tecnologías
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {postMeta.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)]/70 px-2.5 py-1 text-xs text-[var(--text-secondary)]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>

          <div className="order-1 min-w-0">
            <div className="rounded-[2rem] border border-[var(--border-default)] bg-[var(--bg-elevated)]/78 px-6 py-8 text-justify shadow-[0_20px_80px_rgba(15,23,42,0.06)] md:px-10 md:py-12">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeHighlight]}
                components={markdownComponents}
              >
                {sanitizedContent}
              </ReactMarkdown>
            </div>

            {/* ── Share buttons ────────────────────────────────────────────── */}
            <div className="mt-8 rounded-[1.8rem] border border-[var(--border-default)] bg-[var(--bg-elevated)]/72 px-6 py-5">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-[var(--text-muted)]">
                Compartir artículo
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={shareLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)]/80 px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-all hover:border-[#1d9bf0]/30 hover:text-[#1d9bf0]"
                  aria-label="Compartir en X / Twitter"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  X / Twitter
                </a>
                <a
                  href={shareLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)]/80 px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-all hover:border-[#0a66c2]/30 hover:text-[#0a66c2]"
                  aria-label="Compartir en LinkedIn"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </a>
                <a
                  href={shareLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)]/80 px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-all hover:border-[#25d366]/30 hover:text-[#25d366]"
                  aria-label="Compartir en WhatsApp"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)]/80 px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-all hover:border-[var(--accent-secondary)]/30 hover:text-[var(--accent-secondary)]"
                  aria-label="Copiar enlace del artículo"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  {copied ? 'Enlace copiado' : 'Copiar enlace'}
                </button>
              </div>
            </div>

            {/* ── End CTA ─────────────────────────────────────────────────── */}
            <div className="mt-6 overflow-hidden rounded-[1.8rem] border border-[var(--border-default)] bg-[var(--bg-elevated)]/72">
              <div className="bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.07),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(232,121,249,0.07),transparent_55%)] p-8">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-[var(--text-muted)]">
                  Seguir leyendo
                </p>
                <h2 className="mt-3 font-serif text-2xl leading-snug text-[var(--text-primary)]">
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
        </motion.div>
      </article>

      {/* ── Scroll-to-top button ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            key="scroll-top"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={scrollToTop}
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
