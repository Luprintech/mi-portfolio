const EXTERNAL_PROTOCOL_REGEX = /^(https?:|mailto:|tel:)/i;
const DOMAIN_LIKE_REGEX = /^(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:[/?#].*)?$/i;
const UNSAFE_PROTOCOL_REGEX = /^(?:javascript|data|vbscript):/i;

function normalizeString(value = '') {
  return String(value || '').trim();
}

export function normalizeContentLinkHref(value = '') {
  const href = normalizeString(value);

  if (!href) return '';
  if (UNSAFE_PROTOCOL_REGEX.test(href)) return '#';
  if (href.startsWith('/') || href.startsWith('#')) return href;
  if (EXTERNAL_PROTOCOL_REGEX.test(href)) return href;
  if (DOMAIN_LIKE_REGEX.test(href)) return `https://${href.replace(/^https?:\/\//i, '')}`;

  return href;
}

export function isExternalContentHref(value = '') {
  return /^https?:\/\//i.test(normalizeContentLinkHref(value));
}

export function resolveContentLinkAttributes({ href = '', target = '', rel = '' } = {}) {
  const normalizedHref = normalizeContentLinkHref(href);
  const resolvedTarget = target || (isExternalContentHref(normalizedHref) ? '_blank' : '_self');
  const resolvedRel = resolvedTarget === '_blank' ? (rel || 'noopener noreferrer') : (rel || undefined);

  return {
    href: normalizedHref,
    target: resolvedTarget,
    rel: resolvedRel,
  };
}
