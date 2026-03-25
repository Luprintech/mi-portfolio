/**
 * Componentes de ReactMarkdown reutilizables para el blog.
 * Incluye helpers de heading, render de documentos embebidos y mapeo completo.
 */

import DocumentEmbed from './DocumentEmbed';

// ── Helpers ─────────────────────────────────────────────────────────────────

export function slugifyHeading(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export const formatDate = (dateString) =>
  new Date(`${dateString}T00:00:00`).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

export const getReadTime = (post) => Math.max(4, Number(post?.readingTime) || 4);

export function getChildrenText(children) {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(getChildrenText).join('');
  if (children?.props?.children) return getChildrenText(children.props.children);
  return '';
}

export function isImageOnlyParagraph(node) {
  if (!node?.children?.length) return false;

  const meaningfulChildren = node.children.filter(
    (child) => !(child.type === 'text' && typeof child.value === 'string' && child.value.trim() === '')
  );

  if (meaningfulChildren.length !== 1) return false;

  const [child] = meaningfulChildren;
  if (child.type === 'image') return true;

  if (child.type === 'link' && child.children?.length === 1) {
    return child.children[0].type === 'image';
  }

  return false;
}

export function extractHeadings(content) {
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

// ── URL helpers ──────────────────────────────────────────────────────────────

const PUBLIC_SITE_URL = import.meta.env.VITE_SITE_URL || 'https://guadalupecano.es';

export function resolvePublicPostUrl(postMeta) {
  if (postMeta?.canonicalUrl) return postMeta.canonicalUrl;

  if (typeof window === 'undefined') return PUBLIC_SITE_URL;

  const currentUrl = new URL(window.location.href);
  const isLocalHost = ['localhost', '127.0.0.1'].includes(currentUrl.hostname);

  if (isLocalHost) {
    return new URL(currentUrl.pathname, PUBLIC_SITE_URL).href;
  }

  return currentUrl.href;
}

export function buildShareLinks(postMeta) {
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

// ── Markdown component map ───────────────────────────────────────────────────

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
          className="typo-title mt-0 mb-6 scroll-mt-24 text-[clamp(1.9rem,3.5vw,2.8rem)] leading-tight text-[var(--text-primary)]"
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
          className="typo-title mt-14 mb-5 scroll-mt-24 border-b border-[var(--border-default)] pb-3 text-3xl leading-tight text-[var(--text-primary)]"
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
    p: ({ node, ...props }) => {
      if (isImageOnlyParagraph(node)) {
        return <>{props.children}</>;
      }

      return <p className="mb-6 text-[1.02rem] leading-8 text-justify text-[var(--text-secondary)]" {...props} />;
    },
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

export const markdownComponents = buildMarkdownComponents();
