import { lazy, Suspense } from 'react';
import { inferPostContentFields } from '../../../lib/postContentSource';

const HtmlContentRenderer = lazy(() => import('./HtmlContentRenderer'));
const MarkdownLegacyRenderer = lazy(() => import('./MarkdownLegacyRenderer'));

function PostContentFallback() {
  return <div className="min-h-[320px] w-full rounded-[1.5rem] bg-[var(--bg-surface)]/55" aria-hidden="true" />;
}

export default function PostRichContent({ post = {}, format, contentHtml, legacyMarkdown, content }) {
  const resolved = inferPostContentFields({
    ...post,
    ...(format !== undefined ? { format } : {}),
    ...(contentHtml !== undefined ? { contentHtml } : {}),
    ...(legacyMarkdown !== undefined ? { legacyMarkdown } : {}),
    ...(content !== undefined ? { content } : {}),
  });

  if (resolved.format === 'html' && resolved.contentHtml) {
    return (
      <Suspense fallback={<PostContentFallback />}>
        <HtmlContentRenderer content={resolved.contentHtml} />
      </Suspense>
    );
  }

  if (resolved.legacyMarkdown) {
    return (
      <Suspense fallback={<PostContentFallback />}>
        <MarkdownLegacyRenderer content={resolved.legacyMarkdown} />
      </Suspense>
    );
  }

  return null;
}
