export function looksLikeHtmlContent(value = '') {
  return /<\/?[a-z][\s\S]*>/i.test(String(value || ''));
}

export function createPostContentPayload(sourceContent = '', preferredFormat = 'html') {
  const normalizedContent = typeof sourceContent === 'string' ? sourceContent : '';
  const trimmedContent = normalizedContent.trim();
  const resolvedFormat = looksLikeHtmlContent(trimmedContent)
    ? 'html'
    : preferredFormat === 'markdown'
      ? 'markdown'
      : 'html';

  return {
    format: resolvedFormat,
    content: normalizedContent,
    contentHtml: resolvedFormat === 'html' ? normalizedContent : '',
    legacyMarkdown: resolvedFormat === 'markdown' ? normalizedContent : '',
  };
}

export function inferPostContentFields(post = {}) {
  const explicitFormat = post.format === 'html' || post.format === 'markdown' ? post.format : '';
  const fallbackContent = typeof post.content === 'string' ? post.content : '';
  const htmlCandidate = typeof post.contentHtml === 'string' ? post.contentHtml : '';
  const legacyCandidate = typeof post.legacyMarkdown === 'string' ? post.legacyMarkdown : '';
  const inferredFormat = explicitFormat || (htmlCandidate ? 'html' : legacyCandidate ? 'markdown' : looksLikeHtmlContent(fallbackContent) ? 'html' : 'markdown');
  const contentHtml = htmlCandidate || (inferredFormat === 'html' ? fallbackContent : '');
  const legacyMarkdown = legacyCandidate || (inferredFormat === 'markdown' ? fallbackContent : '');

  return {
    format: inferredFormat,
    contentHtml,
    legacyMarkdown,
    sourceContent: inferredFormat === 'html' ? contentHtml : legacyMarkdown,
  };
}
