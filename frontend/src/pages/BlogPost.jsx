import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { Helmet } from 'react-helmet-async';
import { sanitizePostContent } from '../lib/postContentSanitizer';
import 'highlight.js/styles/atom-one-dark.css';

// Helper: render a document embed block from data attributes
function DocumentEmbed({ src, filename, fileType, displayMode, embedHeight }) {
    const isPdf = fileType === 'pdf';
    const mode = displayMode || (isPdf ? 'embed' : 'link');
    const height = parseInt(embedHeight) || 500;
    const ICONS = { pdf: '📄', zip: '📦', docx: '📝' };
    const icon = ICONS[fileType] || '📎';

    return (
        <div style={{ border: '1px solid var(--border-color, rgba(255,255,255,0.1))', borderRadius: 12, overflow: 'hidden', margin: '16px 0' }}>
            {isPdf && mode === 'embed' && (
                <iframe
                    src={src}
                    style={{ width: '100%', height, border: 'none', display: 'block' }}
                    loading="lazy"
                    title={filename}
                    allowFullScreen
                />
            )}
            <div className="doc-bar" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: 'var(--bg-elevated, rgba(15,15,30,0.8))' }}>
                <span style={{ fontSize: '1.25rem' }}>{icon}</span>
                <span className="doc-name" style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--text-primary, #e2e8f0)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{filename}</span>
                {!(isPdf && mode === 'embed') && src && (
                    <a href={src} download={filename} className="doc-download" style={{ padding: '8px 16px', background: '#c026d3', color: 'white', borderRadius: 8, fontSize: 14, fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                        Descargar
                    </a>
                )}
            </div>
        </div>
    );
}

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [postMeta, setPostMeta] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sanitizedContent = useMemo(() => sanitizePostContent(content), [content]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchPost = async () => {
      try {
        const indexRes = await fetch('/posts/index.json', { signal: controller.signal });
        if (!indexRes.ok) throw new Error(`Error ${indexRes.status} cargando índice`);
        const data = await indexRes.json();

        const found = data.find(p => p.slug === slug && p.status !== 'draft');
        if (!found) {
          navigate('/blog', { replace: true });
          return;
        }
        setPostMeta(found);

        const mdRes = await fetch(`/posts/${found.filename}`, { signal: controller.signal });
        if (!mdRes.ok) throw new Error(`Error ${mdRes.status} cargando artículo`);
        const mdText = await mdRes.text();
        setContent(mdText);
      } catch (err) {
        if (err.name !== 'AbortError') {
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

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center">
      <p className="text-[var(--accent-secondary)]">Cargando artículo...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center px-4">
      <div className="text-center text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-8 max-w-md">
        <p className="mb-4">{error}</p>
        <Link to="/blog" className="text-[var(--accent-secondary)] hover:underline">
          ← Volver al Blog
        </Link>
      </div>
    </div>
  );

  if (!postMeta) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] py-28 px-6 md:px-16 relative overflow-x-hidden selection:bg-violet-500/30">
      <Helmet>
        <title>{postMeta.seoTitle || postMeta.title} | Guadalupe Cano</title>
        <meta name="description" content={postMeta.seoDescription || postMeta.excerpt} />
        <meta property="og:title" content={postMeta.seoTitle || postMeta.title} />
        <meta property="og:description" content={postMeta.seoDescription || postMeta.excerpt} />
        {postMeta.ogImage && <meta property="og:image" content={postMeta.ogImage.startsWith('http') ? postMeta.ogImage : `${window.location.origin}${postMeta.ogImage}`} />}
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={postMeta.seoTitle || postMeta.title} />
        <meta name="twitter:description" content={postMeta.seoDescription || postMeta.excerpt} />
        {postMeta.ogImage && <meta name="twitter:image" content={postMeta.ogImage.startsWith('http') ? postMeta.ogImage : `${window.location.origin}${postMeta.ogImage}`} />}
        {postMeta.canonicalUrl && <link rel="canonical" href={postMeta.canonicalUrl} />}
        {postMeta.noindex && <meta name="robots" content="noindex" />}
      </Helmet>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/10 via-[var(--bg-primary)] to-[var(--bg-primary)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-noise opacity-[0.02] mix-blend-overlay pointer-events-none z-0" />

      <motion.article
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-3xl mx-auto w-full"
      >
        <div className="mb-10">
          <Link to="/blog" className="inline-flex items-center text-[var(--accent-secondary)] hover:text-[var(--accent-primary)] font-medium mb-8 transition-colors group">
            <svg className="mr-2 w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Blog
          </Link>

          <h1 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-300">
            {postMeta.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm font-mono text-[var(--text-muted)] border-b border-[var(--border-color)] pb-8">
            <time dateTime={postMeta.date} className="text-[var(--accent-secondary)]/80">
              {new Date(`${postMeta.date}T00:00:00`).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </time>
            <span aria-hidden="true">•</span>
            <div className="flex flex-wrap gap-2">
              {postMeta.tags.map(tag => (
                <span key={tag} className="text-fuchsia-400">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Contenido Markdown */}
        <div className="bg-[var(--bg-surface)] backdrop-blur-md rounded-2xl border border-[var(--border-color)] shadow-[var(--shadow-md)] p-6 md:p-10">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeHighlight]}
            components={{
              div: ({node, ...props}) => {
                if (props['data-document'] !== undefined) {
                  const align = props['data-align'];
                  const alignStyle = align === 'center' ? { display: 'flex', justifyContent: 'center' }
                                   : align === 'right' ? { display: 'flex', justifyContent: 'flex-end' }
                                   : undefined;
                  const embed = <DocumentEmbed
                    src={props['data-src']}
                    filename={props['data-filename']}
                    fileType={props['data-file-type']}
                    displayMode={props['data-display-mode']}
                    embedHeight={props['data-embed-height'] || props.embedheight}
                  />;
                  return alignStyle ? <div style={alignStyle}>{embed}</div> : embed;
                }
                return <div {...props} />;
              },
              h1: ({node, ...props}) => <h1 className="flex items-center justify-center text-center text-4xl font-bold mt-8 mb-8 border-b border-[var(--border-color)] pb-6 text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-fuchsia-200 min-h-[80px]" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-center md:text-left text-2xl md:text-3xl font-semibold mt-12 mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-violet-300 border-b border-[var(--border-color)] pb-3" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-center md:text-left text-xl md:text-2xl font-bold mt-8 mb-4 text-fuchsia-400 drop-shadow-sm" {...props} />,
              h4: ({node, ...props}) => <h4 className="text-center text-xl md:text-2xl font-medium italic mt-12 mb-10 text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-cyan-300 drop-shadow-sm tracking-wide" {...props} />,
              p:  ({node, ...props}) => <p className="text-[var(--text-secondary)] leading-relaxed mb-6 text-justify" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc list-outside text-[var(--text-secondary)] space-y-2 mb-8 ml-6" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal list-outside text-[var(--text-secondary)] space-y-2 mb-8 ml-6" {...props} />,
              li: ({node, ...props}) => <li className="pl-2 text-justify" {...props} />,
              a: ({node, title, ...props}) => {
                // CTA button from editor
                if (props['data-content-button'] !== undefined) {
                  return <a {...props} />;
                }
                if (title === 'button') {
                  return (
                    <span className="flex justify-center my-8">
                      <a className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] no-underline"
                        target="_blank" rel="noopener noreferrer" {...props}>
                        {props.children}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      </a>
                    </span>
                  );
                }
                return <a className="text-fuchsia-400 hover:text-fuchsia-300 hover:underline underline-offset-4 transition-colors" target="_blank" rel="noopener noreferrer" title={title} {...props} />;
              },
              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-fuchsia-500 pl-5 italic text-[var(--text-muted)] bg-[var(--bg-elevated)] py-4 pr-4 rounded-r-lg my-8 text-justify shadow-md" {...props} />,
              img: ({node, alt, ...props}) => (
                <span className="flex flex-col items-center my-10">
                  <img alt={alt || ''} className="max-w-full h-auto rounded-2xl shadow-2xl border border-[var(--border-color)] mx-auto" loading="lazy" {...props} />
                  {alt && <span className="text-sm text-[var(--text-muted)] mt-4 text-center italic">{alt}</span>}
                </span>
              ),
              code: ({node, inline, className, children, ...props}) => {
                return inline ? (
                  <code className="bg-[var(--bg-code)] text-cyan-300 px-1.5 py-0.5 rounded text-sm font-mono border border-cyan-500/20" {...props}>
                    {children}
                  </code>
                ) : (
                  <div className="relative mb-8 rounded-lg overflow-hidden border border-[var(--border-color)] shadow-2xl">
                    <div className="flex items-center bg-[var(--bg-code-header)] px-4 py-3 border-b border-white/5" aria-hidden="true">
                      <span className="flex gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500/80" />
                        <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <span className="w-3 h-3 rounded-full bg-green-500/80" />
                      </span>
                    </div>
                    <code className={`${className} block overflow-x-auto p-5 text-sm font-mono bg-[var(--bg-code)] leading-relaxed`} {...props}>
                      {children}
                    </code>
                  </div>
                );
              },
            }}
          >
            {sanitizedContent}
          </ReactMarkdown>
        </div>

        {/* Botón inferior Volver */}
        <div className="mt-8 mb-10 flex justify-center md:justify-start">
          <Link to="/blog"
            className="inline-flex items-center text-[var(--accent-secondary)] hover:text-[var(--accent-primary)] font-medium transition-colors group px-6 py-3 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] border border-[var(--accent-secondary)]/30 hover:border-[var(--accent-primary)] rounded-xl shadow-[var(--shadow-sm)]">
            <svg className="mr-2 w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al listado del Blog
          </Link>
        </div>
      </motion.article>
    </div>
  );
};

export default BlogPost;
