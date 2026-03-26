const IMAGE_GRID_COLUMNS = [1, 2, 3, 4];
const IMAGE_GRID_MOBILE_COLUMNS = [1, 2];
const IMAGE_GRID_GAPS = ['tight', 'normal', 'loose'];
const IMAGE_GRID_ASPECT_RATIOS = ['landscape', 'square', 'portrait', 'auto'];
const IMAGE_GRID_CAPTION_MODES = ['below', 'overlay', 'hidden'];
const IMAGE_GRID_CORNER_STYLES = ['soft', 'rounded', 'pill'];
const IMAGE_GRID_WIDTHS = ['content', 'wide', 'full'];
const IMAGE_GRID_IMAGE_FITS = ['cover', 'contain'];
const IMAGE_GRID_LAYOUT_STYLES = ['uniform', 'mosaic'];
const IMAGE_GRID_ITEM_SIZES = ['standard', 'wide', 'tall', 'hero'];
const IMAGE_GRID_HOVER_EFFECTS = ['none', 'zoom', 'overlay', 'blur', 'lift'];
const IMAGE_GRID_LOADING_MODES = ['eager', 'lazy', 'progressive'];

export const IMAGE_GRID_DEFAULTS = {
  columns: 2,
  mobileColumns: 1,
  gap: 'normal',
  aspectRatio: 'landscape',
  captionMode: 'below',
  cornerStyle: 'rounded',
  width: 'wide',
  imageFit: 'cover',
  layoutStyle: 'uniform',
  hoverEffect: 'none',
  enableLightbox: false,
  loadingMode: 'lazy',
};

function normalizeInteger(value, fallback, allowedValues) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return allowedValues.includes(parsed) ? parsed : fallback;
}

function normalizeEnum(value, fallback, allowedValues) {
  const normalized = String(value || '').trim().toLowerCase();
  return allowedValues.includes(normalized) ? normalized : fallback;
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'si', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'off'].includes(normalized)) return false;
  }
  return fallback;
}

function normalizeStringArray(value) {
  if (Array.isArray(value)) return value.filter(v => typeof v === 'string' && v.trim()).map(v => v.trim());
  if (typeof value === 'string') return value.split(',').map(v => v.trim()).filter(Boolean);
  return [];
}

export function normalizeImageGridItem(item) {
  if (typeof item === 'string') {
    return { src: item, alt: '', caption: '', href: '', openInNewTab: false, size: 'standard', tags: [] };
  }

  if (item && typeof item === 'object') {
    return {
      src: normalizeText(item.src),
      alt: normalizeText(item.alt),
      caption: normalizeText(item.caption),
      href: normalizeText(item.href),
      openInNewTab: normalizeBoolean(item.openInNewTab, false),
      size: normalizeEnum(item.size, 'standard', IMAGE_GRID_ITEM_SIZES),
      tags: normalizeStringArray(item.tags),
    };
  }

  return { src: '', alt: '', caption: '', href: '', openInNewTab: false, size: 'standard', tags: [] };
}

export function normalizeImageGridItems(items) {
  if (!Array.isArray(items)) return [];
  return items.map(normalizeImageGridItem).filter((item) => item.src);
}

export function parseImageGridPayload(value) {
  if (Array.isArray(value)) {
    return normalizeImageGridItems(value);
  }

  if (typeof value !== 'string' || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? normalizeImageGridItems(parsed) : [];
  } catch {
    return [];
  }
}

export function normalizeImageGridConfig(config = {}) {
  return {
    columns: normalizeInteger(config.columns, IMAGE_GRID_DEFAULTS.columns, IMAGE_GRID_COLUMNS),
    mobileColumns: normalizeInteger(config.mobileColumns, IMAGE_GRID_DEFAULTS.mobileColumns, IMAGE_GRID_MOBILE_COLUMNS),
    gap: normalizeEnum(config.gap, IMAGE_GRID_DEFAULTS.gap, IMAGE_GRID_GAPS),
    aspectRatio: normalizeEnum(config.aspectRatio, IMAGE_GRID_DEFAULTS.aspectRatio, IMAGE_GRID_ASPECT_RATIOS),
    captionMode: normalizeEnum(config.captionMode, IMAGE_GRID_DEFAULTS.captionMode, IMAGE_GRID_CAPTION_MODES),
    cornerStyle: normalizeEnum(config.cornerStyle, IMAGE_GRID_DEFAULTS.cornerStyle, IMAGE_GRID_CORNER_STYLES),
    width: normalizeEnum(config.width, IMAGE_GRID_DEFAULTS.width, IMAGE_GRID_WIDTHS),
    imageFit: normalizeEnum(config.imageFit, IMAGE_GRID_DEFAULTS.imageFit, IMAGE_GRID_IMAGE_FITS),
    layoutStyle: normalizeEnum(config.layoutStyle, IMAGE_GRID_DEFAULTS.layoutStyle, IMAGE_GRID_LAYOUT_STYLES),
    hoverEffect: normalizeEnum(config.hoverEffect, IMAGE_GRID_DEFAULTS.hoverEffect, IMAGE_GRID_HOVER_EFFECTS),
    enableLightbox: normalizeBoolean(config.enableLightbox, IMAGE_GRID_DEFAULTS.enableLightbox),
    loadingMode: normalizeEnum(config.loadingMode, IMAGE_GRID_DEFAULTS.loadingMode, IMAGE_GRID_LOADING_MODES),
  };
}

export function parseImageGridConfigFromElement(element) {
  return normalizeImageGridConfig({
    columns: element?.getAttribute('data-columns') || element?.getAttribute('data-cols'),
    mobileColumns: element?.getAttribute('data-mobile-columns'),
    gap: element?.getAttribute('data-gap'),
    aspectRatio: element?.getAttribute('data-aspect'),
    captionMode: element?.getAttribute('data-caption-mode'),
    cornerStyle: element?.getAttribute('data-corner-style'),
    width: element?.getAttribute('data-width'),
    imageFit: element?.getAttribute('data-image-fit'),
    layoutStyle: element?.getAttribute('data-layout'),
    hoverEffect: element?.getAttribute('data-hover-effect'),
    enableLightbox: element?.getAttribute('data-enable-lightbox'),
    loadingMode: element?.getAttribute('data-loading-mode'),
  });
}

export function getImageGridColumnsClass(config = IMAGE_GRID_DEFAULTS) {
  const { columns, mobileColumns } = normalizeImageGridConfig(config);
  const mobileClass = mobileColumns === 2 ? 'grid-cols-2' : 'grid-cols-1';

  if (columns === 1) return `${mobileClass} lg:grid-cols-1`;
  if (columns === 2) return `${mobileClass} lg:grid-cols-2`;
  if (columns === 3) return `${mobileClass} lg:grid-cols-3`;
  return `${mobileClass} sm:grid-cols-2 xl:grid-cols-4`;
}

export function getImageGridGapClass(gap = IMAGE_GRID_DEFAULTS.gap) {
  switch (normalizeEnum(gap, IMAGE_GRID_DEFAULTS.gap, IMAGE_GRID_GAPS)) {
    case 'tight':
      return 'gap-2 md:gap-3';
    case 'loose':
      return 'gap-5 md:gap-6';
    default:
      return 'gap-4 md:gap-5';
  }
}

export function getImageGridAspectClass(aspectRatio = IMAGE_GRID_DEFAULTS.aspectRatio) {
  switch (normalizeEnum(aspectRatio, IMAGE_GRID_DEFAULTS.aspectRatio, IMAGE_GRID_ASPECT_RATIOS)) {
    case 'square':
      return 'aspect-square';
    case 'portrait':
      return 'aspect-[3/4]';
    case 'auto':
      return '';
    default:
      return 'aspect-[4/3]';
  }
}

export function getImageGridCornerClass(cornerStyle = IMAGE_GRID_DEFAULTS.cornerStyle) {
  switch (normalizeEnum(cornerStyle, IMAGE_GRID_DEFAULTS.cornerStyle, IMAGE_GRID_CORNER_STYLES)) {
    case 'soft':
      return 'rounded-xl';
    case 'pill':
      return 'rounded-[2rem]';
    default:
      return 'rounded-[1.35rem]';
  }
}

export function getImageGridWidthClass(width = IMAGE_GRID_DEFAULTS.width) {
  switch (normalizeEnum(width, IMAGE_GRID_DEFAULTS.width, IMAGE_GRID_WIDTHS)) {
    case 'content':
      return 'w-full max-w-3xl';
    case 'full':
      return 'w-full max-w-none';
    default:
      return 'w-full max-w-5xl';
  }
}

export function getImageGridImageFitClass(imageFit = IMAGE_GRID_DEFAULTS.imageFit) {
  return normalizeEnum(imageFit, IMAGE_GRID_DEFAULTS.imageFit, IMAGE_GRID_IMAGE_FITS) === 'contain'
    ? 'object-contain'
    : 'object-cover';
}

export function getImageGridItemAspectClass(item = {}, config = IMAGE_GRID_DEFAULTS) {
  const normalizedConfig = normalizeImageGridConfig(config);
  const normalizedItem = normalizeImageGridItem(item);

  if (normalizedConfig.layoutStyle !== 'mosaic') {
    return getImageGridAspectClass(normalizedConfig.aspectRatio);
  }

  switch (normalizedItem.size) {
    case 'wide':
      return 'aspect-[16/9]';
    case 'tall':
      return 'aspect-[3/4]';
    case 'hero':
      return 'aspect-[5/4]';
    default:
      return getImageGridAspectClass(normalizedConfig.aspectRatio);
  }
}

export function getImageGridItemSpanClass(item = {}, config = IMAGE_GRID_DEFAULTS) {
  const normalizedConfig = normalizeImageGridConfig(config);
  const normalizedItem = normalizeImageGridItem(item);

  if (normalizedConfig.layoutStyle !== 'mosaic') return '';
  if (!['wide', 'hero'].includes(normalizedItem.size)) return '';

  const mobileClass = normalizedConfig.mobileColumns >= 2 ? 'col-span-2' : '';
  const desktopClass = normalizedConfig.columns >= 2 ? 'lg:col-span-2' : '';

  return [mobileClass, desktopClass].filter(Boolean).join(' ');
}

export function getImageGridItemSizeLabel(size = 'standard') {
  switch (normalizeEnum(size, 'standard', IMAGE_GRID_ITEM_SIZES)) {
    case 'wide':
      return 'Ancho';
    case 'tall':
      return 'Vertical';
    case 'hero':
      return 'Hero';
    default:
      return 'Estandar';
  }
}

export function shouldRenderImageGridCaption(captionMode, image) {
  return normalizeEnum(captionMode, IMAGE_GRID_DEFAULTS.captionMode, IMAGE_GRID_CAPTION_MODES) !== 'hidden'
    && Boolean(image?.caption || image?.alt);
}

export function getImageGridHoverEffectClass(hoverEffect = IMAGE_GRID_DEFAULTS.hoverEffect) {
  switch (normalizeEnum(hoverEffect, IMAGE_GRID_DEFAULTS.hoverEffect, IMAGE_GRID_HOVER_EFFECTS)) {
    case 'zoom':
      return 'hover:scale-105 transition-transform duration-300';
    case 'overlay':
      return 'relative group';
    case 'blur':
      return 'hover:blur-[2px] transition-all duration-300';
    case 'lift':
      return 'hover:-translate-y-1 hover:shadow-2xl transition-all duration-300';
    default:
      return '';
  }
}

export function getImageGridLoadingStrategy(loadingMode = IMAGE_GRID_DEFAULTS.loadingMode) {
  const normalized = normalizeEnum(loadingMode, IMAGE_GRID_DEFAULTS.loadingMode, IMAGE_GRID_LOADING_MODES);
  
  if (normalized === 'eager') return { loading: 'eager', decoding: 'auto' };
  if (normalized === 'progressive') return { loading: 'lazy', decoding: 'async' };
  
  return { loading: 'lazy', decoding: 'auto' };
}

export function collectImageGridTags(items = []) {
  const tagSet = new Set();
  normalizeImageGridItems(items).forEach(item => {
    item.tags.forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}

export function filterImageGridItems(items = [], activeTags = []) {
  if (!activeTags || activeTags.length === 0) return normalizeImageGridItems(items);
  
  const normalizedTags = activeTags.map(t => String(t).trim().toLowerCase()).filter(Boolean);
  if (normalizedTags.length === 0) return normalizeImageGridItems(items);
  
  return normalizeImageGridItems(items).filter(item => {
    const itemTags = item.tags.map(t => t.toLowerCase());
    return normalizedTags.some(tag => itemTags.includes(tag));
  });
}

export {
  IMAGE_GRID_ITEM_SIZES,
  IMAGE_GRID_LAYOUT_STYLES,
  IMAGE_GRID_HOVER_EFFECTS,
  IMAGE_GRID_LOADING_MODES,
};
