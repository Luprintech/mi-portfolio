import { createElement, Fragment, useMemo } from 'react';
import { sanitizePostContent } from '../../../lib/postContentSanitizer';
import { resolveContentLinkAttributes } from '../../../lib/contentLinkUtils';
import { slugifyHeading } from '../markdownComponents';
import DocumentBlock from './DocumentBlock';
import ImageGridBlock from './ImageGridBlock';
import VideoGalleryBlock from './VideoGalleryBlock';
import CodeBlock from './CodeBlock';
import QuoteCardBlock from './QuoteCardBlock';
import StatsCounterBlock from './StatsCounterBlock';
import TimelineBlock from './TimelineBlock';
import ComparisonSliderBlock from './ComparisonSliderBlock';
import CountdownTimerBlock from './CountdownTimerBlock';
import ProgressBarsBlock from './ProgressBarsBlock';
import SpotifyEmbedBlock from './SpotifyEmbedBlock';
import { parseImageGridConfigFromElement, parseImageGridPayload } from './imageGridPayload';
import { normalizeVideoGalleryConfig, normalizeVideoGalleryItems } from '../../../lib/videoGallery';
import { normalizeRichBlockAlignment } from '../../cms/editor/blockAlignment';

function joinClassNames(...values) {
  return values.filter(Boolean).join(' ');
}

function parseStyle(styleText = '') {
  return styleText.split(';').reduce((acc, chunk) => {
    const [rawKey, rawValue] = chunk.split(':');
    if (!rawKey || !rawValue) return acc;
    const key = rawKey.trim().replace(/-([a-z])/g, (_, char) => char.toUpperCase());
    const value = rawValue.trim();
    if (!key || !value) return acc;
    if ([
      'textAlign',
      'background',
      'backgroundColor',
      'border',
      'borderColor',
      'borderStyle',
      'borderWidth',
      'borderTopColor',
      'borderRightColor',
      'borderBottomColor',
      'borderLeftColor',
      'color',
      'fontWeight',
      'fontStyle',
      'textDecoration',
      'textTransform',
      'fontSize',
      'borderRadius',
      'boxShadow',
      'width',
      'minWidth',
      'maxWidth',
      'verticalAlign',
    ].includes(key)) {
      acc[key] = value;
    }
    return acc;
  }, {});
}

function parseColwidthValue(value = '') {
  const firstToken = String(value || '').split(',').map(item => item.trim()).find(Boolean);
  const numericValue = Number(firstToken);
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : null;
}

function getTableWidthProps(node) {
  const dataColwidth = node.getAttribute('data-colwidth') || node.getAttribute('colwidth') || '';
  const parsedWidth = parseColwidthValue(dataColwidth);
  if (!parsedWidth) return {};

  return {
    'data-colwidth': dataColwidth,
    style: {
      width: `${parsedWidth}px`,
      minWidth: `${parsedWidth}px`,
    },
  };
}

function getElementProps(node, extra = {}) {
  const props = { key: extra.key };
  for (const attr of Array.from(node.attributes || [])) {
    if (attr.name === 'class') props.className = attr.value;
    else if (attr.name === 'style') props.style = parseStyle(attr.value);
    else if (attr.name === 'download') props.download = attr.value || true;
    else if (attr.name === 'colspan') props.colSpan = Number(attr.value) || undefined;
    else if (attr.name === 'rowspan') props.rowSpan = Number(attr.value) || undefined;
    else if (attr.name === 'data-colwidth') props['data-colwidth'] = attr.value;
    else if (!attr.name.startsWith('data-')) props[attr.name] = attr.value;
  }
  return props;
}

function getBlockWrapperClassName(alignment) {
  if (alignment === 'center') return 'flex justify-center';
  if (alignment === 'right') return 'flex justify-end';
  return '';
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
    const alignment = normalizeRichBlockAlignment(node.getAttribute('data-align'));
    return (
      <div key={path} className={getBlockWrapperClassName(alignment)}>
        <DocumentBlock
          src={node.getAttribute('data-src') || ''}
          title={node.getAttribute('data-title') || ''}
          filename={node.getAttribute('data-filename') || ''}
          fileType={node.getAttribute('data-file-type') || ''}
          display={node.getAttribute('data-display') || node.getAttribute('data-display-mode') || 'embed'}
          embedHeight={node.getAttribute('data-embed-height') || 560}
          embedWidth={node.getAttribute('data-embed-width') || null}
        />
      </div>
    );
  }

  if (dataBlock === 'image-grid' || node.hasAttribute('data-image-grid')) {
    const alignment = normalizeRichBlockAlignment(node.getAttribute('data-align'));
    return (
        <div key={path} className={getBlockWrapperClassName(alignment)}>
          <ImageGridBlock
            images={parseImageGridPayload(node.getAttribute('data-images') || '[]')}
            config={parseImageGridConfigFromElement(node)}
          />
        </div>
      );
  }

  if (dataBlock === 'video-gallery' || node.hasAttribute('data-video-gallery')) {
    const alignment = normalizeRichBlockAlignment(node.getAttribute('data-align'));
    const config = normalizeVideoGalleryConfig({
      layout: node.getAttribute('data-layout'),
      columns: node.getAttribute('data-columns'),
      aspectRatio: node.getAttribute('data-aspect-ratio'),
      showTitles: node.getAttribute('data-show-titles'),
      showDurations: node.getAttribute('data-show-durations'),
    });
    
    return (
      <div key={path} className={getBlockWrapperClassName(alignment)}>
        <VideoGalleryBlock
          videos={normalizeVideoGalleryItems(JSON.parse(node.getAttribute('data-videos') || '[]'))}
          config={config}
        />
      </div>
    );
  }

  if (dataBlock === 'gif' || node.hasAttribute('data-gif')) {
    const alignment = normalizeRichBlockAlignment(node.getAttribute('data-align'));
    const img = node.querySelector('img');
    const figcaption = node.querySelector('figcaption');
    
    if (img) {
      const width = parseInt(node.getAttribute('data-width')) || 400;
      const autoplay = node.getAttribute('data-autoplay') !== 'false';
      
      return (
        <div key={path} className={getBlockWrapperClassName(alignment)}>
          <figure style={{ maxWidth: `${width}px`, margin: '1em auto' }}>
            <img
              src={img.src}
              alt={img.alt || ''}
              className="w-full rounded-xl"
              style={{ imageRendering: autoplay ? 'auto' : 'pixelated' }}
            />
            {figcaption && (
              <figcaption className="mt-2 text-center text-sm italic text-[var(--text-muted)]">
                {figcaption.textContent}
              </figcaption>
            )}
          </figure>
        </div>
      );
    }
  }

  if (dataBlock === 'quote-card' || node.hasAttribute('data-quote-card')) {
    const alignment = normalizeRichBlockAlignment(node.getAttribute('data-align'));
    const quote = node.querySelector('blockquote')?.textContent || '';
    const authorDiv = node.querySelector('div[style*="display:flex"]');
    let author = '';
    let role = '';
    
    if (authorDiv) {
      const textDivs = authorDiv.querySelectorAll('p');
      if (textDivs.length > 0) author = textDivs[0]?.textContent || '';
      if (textDivs.length > 1) role = textDivs[1]?.textContent || '';
    }
    
    return (
      <div key={path} className={getBlockWrapperClassName(alignment)}>
        <QuoteCardBlock
          quote={quote}
          author={author}
          role={role}
          style={node.getAttribute('data-style') || 'modern'}
        />
      </div>
    );
  }

  if (dataBlock === 'stats-counter' || node.hasAttribute('data-stats-counter')) {
    const alignment = normalizeRichBlockAlignment(node.getAttribute('data-align'));
    const statsData = node.getAttribute('data-stats') || '[]';
    let stats = [];
    
    try {
      stats = JSON.parse(statsData);
    } catch (e) {
      console.error('Failed to parse stats data:', e);
    }
    
    return (
      <div key={path} className={getBlockWrapperClassName(alignment)}>
        <StatsCounterBlock
          stats={stats}
          layout={node.getAttribute('data-layout') || 'grid'}
        />
      </div>
    );
  }

  if (dataBlock === 'timeline' || node.hasAttribute('data-timeline')) {
    const alignment = normalizeRichBlockAlignment(node.getAttribute('data-align'));
    const eventsData = node.getAttribute('data-events') || '[]';
    let events = [];
    
    try {
      events = JSON.parse(eventsData);
    } catch (e) {
      console.error('Failed to parse timeline events data:', e);
    }
    
    return (
      <div key={path} className={getBlockWrapperClassName(alignment)}>
        <TimelineBlock
          events={events}
          layout={node.getAttribute('data-layout') || 'vertical'}
          theme={node.getAttribute('data-theme') || 'default'}
        />
      </div>
    );
  }

  if (dataBlock === 'countdown-timer' || node.hasAttribute('data-countdown-timer')) {
    const alignment = normalizeRichBlockAlignment(node.getAttribute('data-align'));
    return (
      <div key={path} className={getBlockWrapperClassName(alignment)}>
        <CountdownTimerBlock
          targetDate={node.getAttribute('data-target-date') || ''}
          title={node.getAttribute('data-title') || 'Event Countdown'}
          description={node.getAttribute('data-description') || ''}
          theme={node.getAttribute('data-theme') || 'default'}
        />
      </div>
    );
  }

  if (dataBlock === 'progress-bars' || node.hasAttribute('data-progress-bars')) {
    const alignment = normalizeRichBlockAlignment(node.getAttribute('data-align'));
    const barsData = node.getAttribute('data-bars') || '[]';
    let bars = [];
    
    try {
      bars = JSON.parse(barsData);
    } catch (e) {
      console.error('Failed to parse progress bars data:', e);
    }
    
    return (
      <div key={path} className={getBlockWrapperClassName(alignment)}>
        <ProgressBarsBlock
          bars={bars}
          theme={node.getAttribute('data-theme') || 'default'}
          animated={node.getAttribute('data-animated') !== 'false'}
        />
      </div>
    );
  }

  if (dataBlock === 'spotify-embed' || node.hasAttribute('data-spotify-embed')) {
    const alignment = normalizeRichBlockAlignment(node.getAttribute('data-align'));
    return (
      <div key={path} className={getBlockWrapperClassName(alignment)}>
        <SpotifyEmbedBlock
          url={node.getAttribute('data-url') || ''}
          type={node.getAttribute('data-type') || 'track'}
          theme={node.getAttribute('data-theme') || 'dark'}
          height={parseInt(node.getAttribute('data-height') || '152', 10)}
        />
      </div>
    );
  }

  if (dataBlock === 'comparison-slider' || node.hasAttribute('data-comparison-slider')) {
    const alignment = normalizeRichBlockAlignment(node.getAttribute('data-align'));
    return (
      <div key={path} className={getBlockWrapperClassName(alignment)}>
        <ComparisonSliderBlock
          beforeImage={node.getAttribute('data-before-image') || ''}
          afterImage={node.getAttribute('data-after-image') || ''}
          beforeLabel={node.getAttribute('data-before-label') || 'Antes'}
          afterLabel={node.getAttribute('data-after-label') || 'Después'}
          initialPosition={parseInt(node.getAttribute('data-initial-position') || '50', 10)}
        />
      </div>
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
    const alignment = normalizeRichBlockAlignment(node.getAttribute('data-align') || node.style?.textAlign || '');
    const figure = (
      <figure key={path} className="my-10">
        <img src={node.getAttribute('src') || ''} alt={alt} loading={node.getAttribute('loading') || 'lazy'} className="w-full rounded-[1.5rem] border border-[var(--border-default)] bg-[var(--bg-surface)] object-cover" />
        {alt ? <figcaption className="mt-3 text-center text-sm italic text-[var(--text-muted)]">{alt}</figcaption> : null}
      </figure>
    );

    if (!getBlockWrapperClassName(alignment)) return figure;

    return <div key={`${path}-wrap`} className={getBlockWrapperClassName(alignment)}>{figure}</div>;
  }

  if (tagName === 'a' && node.hasAttribute('data-content-button')) {
    const elementProps = getElementProps(node, { key: path });
    const linkProps = resolveContentLinkAttributes({
      href: elementProps.href,
      target: node.getAttribute('target') || '',
      rel: node.getAttribute('rel') || '',
    });
    const alignment = normalizeRichBlockAlignment(
      node.getAttribute('data-align') || elementProps.style?.textAlign || ''
    );

    return createElement('a', {
      ...elementProps,
      ...linkProps,
      className: joinClassNames(
        elementProps.className,
        'my-8 inline-flex max-w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold no-underline transition-transform hover:-translate-y-0.5'
      ),
      'data-content-button': '',
      ...(alignment !== 'left' ? { 'data-align': alignment } : {}),
    }, ...renderChildren(node, path));
  }

  if (tagName === 'a') {
    const linkProps = resolveContentLinkAttributes({
      href: node.getAttribute('href') || '',
      target: node.getAttribute('target') || '',
      rel: node.getAttribute('rel') || '',
    });

    return createElement('a', {
      ...getElementProps(node, { key: path }),
      ...linkProps,
      className: 'font-medium text-[var(--accent-secondary)] underline decoration-[var(--accent-secondary)]/30 underline-offset-4 transition-colors hover:text-[var(--text-primary)]',
    }, ...renderChildren(node, path));
  }

  if (tagName === 'blockquote') return <blockquote key={path} className="my-8 rounded-r-[1.2rem] border-l-4 border-[var(--accent-secondary)] bg-[var(--bg-surface)]/85 px-5 py-4 text-justify italic leading-8 text-[var(--text-secondary)]">{renderChildren(node, path)}</blockquote>;
  if (tagName === 'ul') return <ul key={path} className="mb-8 ml-6 list-disc space-y-3 text-justify text-[1.02rem] leading-8 text-[var(--text-secondary)]">{renderChildren(node, path)}</ul>;
  if (tagName === 'ol') return <ol key={path} className="mb-8 ml-6 list-decimal space-y-3 text-justify text-[1.02rem] leading-8 text-[var(--text-secondary)]">{renderChildren(node, path)}</ol>;
  if (tagName === 'li') return <li key={path} className="pl-2 text-justify">{renderChildren(node, path)}</li>;
  if (tagName === 'hr') return <hr key={path} className="my-10 border-0 border-t border-[var(--border-default)]" />;
  if (tagName === 'table') {
    const elementProps = getElementProps(node, { key: path });
    return (
      <div key={path} className="my-8 overflow-x-auto rounded-[1.2rem] border border-[var(--border-default)] bg-[var(--bg-primary)]/55 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <table
          {...elementProps}
          className={joinClassNames('min-w-full border-collapse text-left', elementProps.className)}
        >
          {renderChildren(node, path)}
        </table>
      </div>
    );
  }
  if (tagName === 'thead') {
    const elementProps = getElementProps(node, { key: path });
    return <thead {...elementProps} className={joinClassNames('bg-[var(--bg-surface)]/85', elementProps.className)}>{renderChildren(node, path)}</thead>;
  }
  if (tagName === 'col') {
    const elementProps = getElementProps(node, { key: path });
    const widthProps = getTableWidthProps(node);
    return <col {...elementProps} {...widthProps} style={{ ...widthProps.style, ...elementProps.style }} />;
  }
  if (tagName === 'th') {
    const elementProps = getElementProps(node, { key: path });
    const widthProps = getTableWidthProps(node);
    return <th {...elementProps} {...widthProps} style={{ ...widthProps.style, ...elementProps.style }} className={joinClassNames('border border-[var(--border-default)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)] align-top', elementProps.className)}>{renderChildren(node, path)}</th>;
  }
  if (tagName === 'td') {
    const elementProps = getElementProps(node, { key: path });
    const widthProps = getTableWidthProps(node);
    return <td {...elementProps} {...widthProps} style={{ ...widthProps.style, ...elementProps.style }} className={joinClassNames('border border-[var(--border-default)] px-4 py-3 text-justify text-sm leading-7 text-[var(--text-secondary)] align-top', elementProps.className)}>{renderChildren(node, path)}</td>;
  }
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
