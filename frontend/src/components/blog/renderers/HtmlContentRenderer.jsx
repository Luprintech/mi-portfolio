import { createElement, Fragment, useMemo } from 'react';
import { sanitizePostContent } from '../../../lib/postContentSanitizer';
import { slugifyHeading } from '../markdownComponents';
import DocumentBlock from './DocumentBlock';
import ImageGridBlock from './ImageGridBlock';
import CodeBlock from './CodeBlock';
import { parseImageGridPayload } from './imageGridPayload';

function parseStyle(styleText = '') {
  return styleText.split(';').reduce((acc, chunk) => {
    const [rawKey, rawValue] = chunk.split(':');
    if (!rawKey || !rawValue) return acc;
    const key = rawKey.trim().replace(/-([a-z])/g, (_, char) => char.toUpperCase());
    const value = rawValue.trim();
    if (!key || !value) return acc;
    if (['textAlign', 'background', 'color', 'fontWeight', 'fontStyle', 'textDecoration', 'textTransform', 'fontSize', 'borderRadius', 'boxShadow'].includes(key)) {
      acc[key] = value;
    }
    return acc;
  }, {});
}

function getElementProps(node, extra = {}) {
  const props = { key: extra.key };
  for (const attr of Array.from(node.attributes || [])) {
    if (attr.name === 'class') props.className = attr.value;
    else if (attr.name === 'style') props.style = parseStyle(attr.value);
    else if (attr.name === 'download') props.download = attr.value || true;
    else if (attr.name === 'colspan') props.colSpan = Number(attr.value) || undefined;
    else if (attr.name === 'rowspan') props.rowSpan = Number(attr.value) || undefined;
    else if (!attr.name.startsWith('data-')) props[attr.name] = attr.value;
  }
  return props;
}

function renderChildren(node, path) {
  return Array.from(node.childNodes || []).map((child, index) => renderNode(child, `${path}-${index}`));
}

function inferLanguageFromClassName(className = '') {
  const languageToken = String(className || '').split(/\s+/).find(token => token.startsWith('language-'));
  return languageToken ? languageToken.replace('language-', '') : '';
}

function buildCodeBlockProps(node) {
  const nestedCode = node.tagName?.toLowerCase() === 'code' ? node : node.querySelector('code');
  const codeSource = nestedCode || node;
  const language =
    node.getAttribute('data-language') ||
    nestedCode?.getAttribute('data-language') ||
    inferLanguageFromClassName(nestedCode?.getAttribute('class') || node.getAttribute('class') || '');

  return {
    code: codeSource?.textContent || '',
    language,
    filename: node.getAttribute('data-filename') || nestedCode?.getAttribute('data-filename') || '',
    title: node.getAttribute('data-title') || nestedCode?.getAttribute('data-title') || '',
    variant: node.getAttribute('data-variant') || nestedCode?.getAttribute('data-variant') || '',
  };
}

function renderNode(node, path) {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent;
  if (node.nodeType !== Node.ELEMENT_NODE) return null;

  const tagName = node.tagName.toLowerCase();
  const dataBlock = node.getAttribute('data-block');

  if (dataBlock === 'document' || node.hasAttribute('data-document')) {
    return (
      <DocumentBlock
        key={path}
        src={node.getAttribute('data-src') || ''}
        title={node.getAttribute('data-title') || ''}
        filename={node.getAttribute('data-filename') || ''}
        fileType={node.getAttribute('data-file-type') || ''}
        display={node.getAttribute('data-display') || node.getAttribute('data-display-mode') || 'embed'}
        embedHeight={node.getAttribute('data-embed-height') || 560}
      />
    );
  }

  if (dataBlock === 'image-grid' || node.hasAttribute('data-image-grid')) {
    return (
      <ImageGridBlock
        key={path}
        columns={Number(node.getAttribute('data-columns') || node.getAttribute('data-cols')) || 2}
        images={parseImageGridPayload(node.getAttribute('data-images') || '[]')}
      />
    );
  }

  if (dataBlock === 'code') {
    return <CodeBlock key={path} {...buildCodeBlockProps(node)} />;
  }

  if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3' || tagName === 'h4') {
    const text = node.textContent?.trim() || '';
    const classes = {
      h1: 'typo-title mt-0 mb-6 scroll-mt-24 text-[clamp(1.9rem,3.5vw,2.8rem)] leading-tight text-[var(--text-primary)]',
      h2: 'typo-title mt-14 mb-5 scroll-mt-24 border-b border-[var(--border-default)] pb-3 text-3xl leading-tight text-[var(--text-primary)]',
      h3: 'mt-10 mb-4 scroll-mt-24 font-semibold text-[1.6rem] leading-snug text-[var(--text-primary)]',
      h4: 'mt-8 mb-3 text-lg font-semibold leading-snug text-[var(--text-primary)]',
    };
    return createElement(tagName, {
      ...getElementProps(node, { key: path }),
      id: node.getAttribute('id') || slugifyHeading(text),
      className: classes[tagName],
    }, ...renderChildren(node, path));
  }

  if (tagName === 'p') {
    const onlyImage = node.children.length === 1 && node.children[0].tagName?.toLowerCase() === 'img';
    if (onlyImage) return <Fragment key={path}>{renderChildren(node, path)}</Fragment>;
    return <p key={path} className="mb-6 text-[1.02rem] leading-8 text-justify text-[var(--text-secondary)]">{renderChildren(node, path)}</p>;
  }

  if (tagName === 'img') {
    const alt = node.getAttribute('alt') || '';
    return (
      <figure key={path} className="my-10">
        <img src={node.getAttribute('src') || ''} alt={alt} loading={node.getAttribute('loading') || 'lazy'} className="w-full rounded-[1.5rem] border border-[var(--border-default)] bg-[var(--bg-surface)] object-cover" />
        {alt ? <figcaption className="mt-3 text-center text-sm italic text-[var(--text-muted)]">{alt}</figcaption> : null}
      </figure>
    );
  }

  if (tagName === 'a' && node.hasAttribute('data-content-button')) {
    return createElement('a', {
      ...getElementProps(node, { key: path }),
      className: 'my-8 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold no-underline transition-transform hover:-translate-y-0.5',
      target: node.getAttribute('target') || '_blank',
      rel: node.getAttribute('rel') || 'noopener noreferrer',
    }, node.textContent || 'Abrir enlace');
  }

  if (tagName === 'a') {
    return createElement('a', {
      ...getElementProps(node, { key: path }),
      className: 'font-medium text-[var(--accent-secondary)] underline decoration-[var(--accent-secondary)]/30 underline-offset-4 transition-colors hover:text-[var(--text-primary)]',
      target: node.getAttribute('target') || '_blank',
      rel: node.getAttribute('rel') || 'noopener noreferrer',
    }, ...renderChildren(node, path));
  }

  if (tagName === 'blockquote') return <blockquote key={path} className="my-8 rounded-r-[1.2rem] border-l-4 border-[var(--accent-secondary)] bg-[var(--bg-surface)]/85 px-5 py-4 text-justify italic leading-8 text-[var(--text-secondary)]">{renderChildren(node, path)}</blockquote>;
  if (tagName === 'ul') return <ul key={path} className="mb-8 ml-6 list-disc space-y-3 text-justify text-[1.02rem] leading-8 text-[var(--text-secondary)]">{renderChildren(node, path)}</ul>;
  if (tagName === 'ol') return <ol key={path} className="mb-8 ml-6 list-decimal space-y-3 text-justify text-[1.02rem] leading-8 text-[var(--text-secondary)]">{renderChildren(node, path)}</ol>;
  if (tagName === 'li') return <li key={path} className="pl-2 text-justify">{renderChildren(node, path)}</li>;
  if (tagName === 'hr') return <hr key={path} className="my-10 border-0 border-t border-[var(--border-default)]" />;
  if (tagName === 'table') return <div key={path} className="my-8 overflow-x-auto rounded-[1.2rem] border border-[var(--border-default)]"><table className="min-w-full border-collapse text-left">{renderChildren(node, path)}</table></div>;
  if (tagName === 'thead') return <thead key={path} className="bg-[var(--bg-surface)]/85">{renderChildren(node, path)}</thead>;
  if (tagName === 'th') return <th key={path} className="border-b border-[var(--border-default)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)]">{renderChildren(node, path)}</th>;
  if (tagName === 'td') return <td key={path} {...getElementProps(node, { key: path })} className="border-b border-[var(--border-default)] px-4 py-3 text-justify text-sm leading-7 text-[var(--text-secondary)]">{renderChildren(node, path)}</td>;
  if (tagName === 'pre') return <CodeBlock key={path} {...buildCodeBlockProps(node)} />;
  if (tagName === 'code') {
    if (node.parentElement?.tagName?.toLowerCase() === 'pre') return <code key={path} className={`${node.getAttribute('class') || ''} block font-mono text-sm leading-7`}>{node.textContent}</code>;
    return <code key={path} className="rounded-md border border-cyan-500/15 bg-[var(--bg-code)] px-1.5 py-0.5 font-mono text-[0.92em] text-cyan-300">{node.textContent}</code>;
  }
  if (tagName === 'br') return <br key={path} />;
  return createElement(tagName, getElementProps(node, { key: path }), ...renderChildren(node, path));
}

export default function HtmlContentRenderer({ content = '' }) {
  const nodes = useMemo(() => {
    if (!content || typeof window === 'undefined') return [];
    const parser = new window.DOMParser();
    const sanitized = sanitizePostContent(content);
    const document = parser.parseFromString(sanitized, 'text/html');
    return Array.from(document.body.childNodes).map((node, index) => renderNode(node, `html-${index}`));
  }, [content]);

  return <>{nodes}</>;
}
