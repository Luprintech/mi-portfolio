export const RICH_BLOCK_ALIGNMENTS = ['left', 'center', 'right'];

export const RICH_BLOCK_NODE_TYPES = [
  'image',
  'youtube',
  'audio',
  'callout',
  'mermaid',
  'accordion',
  'contentButton',
  'documentAttachment',
  'imageGrid',
];

export function normalizeRichBlockAlignment(value = '') {
  if (value === 'center' || value === 'right') return value;
  return 'left';
}

export function getRichBlockWrapperStyle(value = '') {
  const alignment = normalizeRichBlockAlignment(value);

  if (alignment === 'center') {
    return { display: 'flex', justifyContent: 'center' };
  }

  if (alignment === 'right') {
    return { display: 'flex', justifyContent: 'flex-end' };
  }

  return undefined;
}

export function createRichBlockTextAlignAttribute() {
  return {
    default: 'left',
    parseHTML: (element) =>
      normalizeRichBlockAlignment(
        element.getAttribute('data-align') || element.style.textAlign || ''
      ),
    renderHTML: () => ({}),
  };
}

export function getRichBlockHtmlAttributes(htmlAttributes = {}, alignment, extra = {}) {
  const next = { ...htmlAttributes, ...extra };

  if (typeof next.style === 'string') {
    const sanitizedStyle = next.style
      .split(';')
      .map((chunk) => chunk.trim())
      .filter(Boolean)
      .filter((chunk) => chunk.split(':')[0]?.trim().toLowerCase() !== 'text-align')
      .join(';');

    if (sanitizedStyle) next.style = sanitizedStyle;
    else delete next.style;
  }

  const normalizedAlignment = normalizeRichBlockAlignment(alignment);

  if (normalizedAlignment === 'left') delete next['data-align'];
  else next['data-align'] = normalizedAlignment;

  return next;
}

export function isRichBlockNodeActive(editor) {
  if (!editor) return false;
  return RICH_BLOCK_NODE_TYPES.some((nodeType) => editor.isActive(nodeType));
}

export function canUseJustifyAlignment(editor) {
  if (!editor) return false;
  return editor.isActive('paragraph') || editor.isActive('heading');
}
