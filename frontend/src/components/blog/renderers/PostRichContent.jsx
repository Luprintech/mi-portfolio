import { inferPostContentFields } from '../../../lib/postContentSource';
import HtmlContentRenderer from './HtmlContentRenderer';
import MarkdownLegacyRenderer from './MarkdownLegacyRenderer';

export default function PostRichContent({ post = {}, format, contentHtml, legacyMarkdown, content }) {
  const resolved = inferPostContentFields({
    ...post,
    ...(format !== undefined ? { format } : {}),
    ...(contentHtml !== undefined ? { contentHtml } : {}),
    ...(legacyMarkdown !== undefined ? { legacyMarkdown } : {}),
    ...(content !== undefined ? { content } : {}),
  });

  if (resolved.format === 'html' && resolved.contentHtml) {
    return <HtmlContentRenderer content={resolved.contentHtml} />;
  }

  if (resolved.legacyMarkdown) {
    return <MarkdownLegacyRenderer content={resolved.legacyMarkdown} />;
  }

  return null;
}
