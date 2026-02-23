import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Helmet } from 'react-helmet-async';
import 'highlight.js/styles/atom-one-dark.css';

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [postMeta, setPostMeta] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/posts/index.json')
      .then(res => res.json())
      .then(data => {
        const found = data.find(p => p.slug === slug);
        if (!found) {
          navigate('/blog');
          throw new Error('Post no encontrado =(');
        }
        setPostMeta(found);
        return fetch(`/posts/${found.filename}`);
      })
      .then(res => res.text())
      .then(mdText => {
        setContent(mdText);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">
        <p className="text-cyan-400">Cargando artículo...</p>
      </div>
    );
  }

  if (!postMeta) return null;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white py-28 px-6 md:px-16 relative overflow-x-hidden selection:bg-violet-500/30">
      {/* SEO Dinámico con React Helmet Async */}
      <Helmet>
        <title>{postMeta.title} | Guadalupe Cano</title>
        <meta name="description" content={postMeta.excerpt} />
        <meta property="og:title" content={postMeta.title} />
        <meta property="og:description" content={postMeta.excerpt} />
        <meta property="og:type" content="article" />
      </Helmet>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/10 via-[#0f172a] to-[#0f172a] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-noise opacity-[0.02] mix-blend-overlay pointer-events-none z-0" />

      <motion.article 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-3xl mx-auto w-full"
      >
        <div className="mb-10">
          <Link 
            to="/blog" 
            className="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-medium mb-8 transition-colors group"
          >
            <svg 
              className="mr-2 w-4 h-4 transform group-hover:-translate-x-1 transition-transform" 
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Blog
          </Link>
          
          <h1 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-300">
            {postMeta.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm font-mono text-slate-400 border-b border-white/10 pb-8">
            <time className="text-cyan-500/80">
              {new Date(postMeta.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </time>
            <span>•</span>
            <div className="flex flex-wrap gap-2">
              {postMeta.tags.map(tag => (
                <span key={tag} className="text-fuchsia-400">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#111827]/80 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-6 md:p-10">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              h1: ({node, ...props}) => <h1 className="flex items-center justify-center text-center text-4xl font-bold mt-8 mb-8 border-b border-slate-700/50 pb-6 text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-fuchsia-200 min-h-[80px]" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-center md:text-left text-2xl md:text-3xl font-semibold mt-12 mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-violet-300 border-b border-slate-700/50 pb-3" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-center md:text-left text-xl md:text-2xl font-bold mt-8 mb-4 text-fuchsia-400 drop-shadow-sm" {...props} />,
              h4: ({node, ...props}) => <h4 className="text-center text-xl md:text-2xl font-medium italic mt-12 mb-10 text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-cyan-300 drop-shadow-sm tracking-wide" {...props} />,
              p: ({node, ...props}) => <p className="text-slate-300 leading-relaxed mb-6 text-justify" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc list-outside text-slate-300 space-y-2 mb-8 ml-6" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal list-outside text-slate-300 space-y-2 mb-8 ml-6" {...props} />,
              li: ({node, ...props}) => <li className="pl-2 text-justify" {...props} />,
              a: ({node, title, ...props}) => {
                // Si el enlace tiene un title="button", lo renderizamos como un botón premium
                if (title === 'button') {
                  return (
                    <span className="flex justify-center my-8">
                      <a 
                        className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] no-underline"
                        target="_blank" 
                        rel="noopener noreferrer" 
                        {...props}
                      >
                        {props.children}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      </a>
                    </span>
                  );
                }
                // Si es un enlace normal
                return <a className="text-fuchsia-400 hover:text-fuchsia-300 hover:underline underline-offset-4 transition-colors" target="_blank" rel="noopener noreferrer" title={title} {...props} />;
              },
              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-fuchsia-500 pl-5 italic text-slate-400 bg-white/5 py-4 pr-4 rounded-r-lg my-8 text-justify shadow-md" {...props} />,
              img: ({node, alt, ...props}) => (
                <span className="flex flex-col items-center my-10">
                  <img 
                    alt={alt} 
                    className="max-w-full h-auto rounded-2xl shadow-2xl border border-white/5 mx-auto" 
                    loading="lazy"
                    {...props} 
                  />
                  {alt && <span className="text-sm text-slate-500 mt-4 text-center italic">{alt}</span>}
                </span>
              ),
              code: ({node, inline, className, children, ...props}) => {
                return inline ? (
                  <code className="bg-[#1e293b] text-cyan-300 px-1.5 py-0.5 rounded text-sm font-mono border border-cyan-500/20" {...props}>
                    {children}
                  </code>
                ) : (
                  <div className="relative mb-8 rounded-lg overflow-hidden border border-white/10 shadow-2xl">
                     <div className="flex items-center bg-[#0f172a] px-4 py-3 border-b border-white/5">
                        <span className="flex gap-2">
                          <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                          <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
                          <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
                        </span>
                     </div>
                     <code className={`${className} block overflow-x-auto p-5 text-sm font-mono bg-[#1e293b] leading-relaxed`} {...props}>
                      {children}
                     </code>
                  </div>
                )
              }
            }}
          >
            {content}
          </ReactMarkdown>
        </div>

        {/* Botón inferior Volver al Blog */}
        <div className="mt-8 mb-10 flex justify-center md:justify-start">
          <Link 
            to="/blog" 
            className="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-medium transition-colors group px-6 py-3 bg-slate-800/50 hover:bg-slate-800 border border-cyan-500/30 hover:border-cyan-400 rounded-xl shadow-lg"
          >
            <svg 
              className="mr-2 w-4 h-4 transform group-hover:-translate-x-1 transition-transform" 
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
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
