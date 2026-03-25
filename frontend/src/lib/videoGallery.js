// Video Gallery - Configuración y utilidades para galerías de videos

const VIDEO_GALLERY_LAYOUTS = ['grid', 'list', 'carousel'];
const VIDEO_GALLERY_PROVIDERS = ['youtube', 'vimeo', 'local'];
const VIDEO_GALLERY_ASPECT_RATIOS = ['16/9', '4/3', '21/9', 'auto'];

export const VIDEO_GALLERY_DEFAULTS = {
  layout: 'grid',
  columns: 2,
  aspectRatio: '16/9',
  showTitles: true,
  showDurations: false,
  autoplay: false,
};

function normalizeInteger(value, fallback, allowedValues) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return allowedValues?.includes(parsed) ? parsed : fallback;
}

function normalizeEnum(value, fallback, allowedValues) {
  const normalized = String(value || '').trim().toLowerCase();
  return allowedValues.includes(normalized) ? normalized : fallback;
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

function extractVideoId(url, provider = 'youtube') {
  if (!url || typeof url !== 'string') return '';

  try {
    const u = new URL(url);

    if (provider === 'youtube') {
      if (u.hostname.includes('youtube.com')) {
        return u.searchParams.get('v') || '';
      }
      if (u.hostname.includes('youtu.be')) {
        return u.pathname.slice(1);
      }
    }

    if (provider === 'vimeo') {
      const match = url.match(/vimeo\.com\/(\d+)/);
      return match ? match[1] : '';
    }

    return '';
  } catch {
    return '';
  }
}

export function normalizeVideoGalleryItem(item) {
  if (typeof item === 'string') {
    return {
      src: item,
      title: '',
      provider: 'youtube',
      thumbnail: '',
      duration: '',
      videoId: extractVideoId(item, 'youtube'),
    };
  }

  if (item && typeof item === 'object') {
    const provider = normalizeEnum(item.provider, 'youtube', VIDEO_GALLERY_PROVIDERS);
    const videoId = item.videoId || extractVideoId(item.src, provider);

    return {
      src: item.src || '',
      title: item.title || '',
      provider,
      thumbnail: item.thumbnail || getDefaultThumbnail(videoId, provider),
      duration: item.duration || '',
      videoId,
    };
  }

  return {
    src: '',
    title: '',
    provider: 'youtube',
    thumbnail: '',
    duration: '',
    videoId: '',
  };
}

export function normalizeVideoGalleryItems(items) {
  if (!Array.isArray(items)) return [];
  return items.map(normalizeVideoGalleryItem).filter((item) => item.src);
}

export function normalizeVideoGalleryConfig(config = {}) {
  return {
    layout: normalizeEnum(config.layout, VIDEO_GALLERY_DEFAULTS.layout, VIDEO_GALLERY_LAYOUTS),
    columns: normalizeInteger(config.columns, VIDEO_GALLERY_DEFAULTS.columns, [1, 2, 3, 4]),
    aspectRatio: normalizeEnum(config.aspectRatio, VIDEO_GALLERY_DEFAULTS.aspectRatio, VIDEO_GALLERY_ASPECT_RATIOS),
    showTitles: normalizeBoolean(config.showTitles, VIDEO_GALLERY_DEFAULTS.showTitles),
    showDurations: normalizeBoolean(config.showDurations, VIDEO_GALLERY_DEFAULTS.showDurations),
    autoplay: normalizeBoolean(config.autoplay, VIDEO_GALLERY_DEFAULTS.autoplay),
  };
}

export function getDefaultThumbnail(videoId, provider = 'youtube') {
  if (!videoId) return '';

  if (provider === 'youtube') {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }

  if (provider === 'vimeo') {
    // Vimeo thumbnails require API call, return placeholder
    return `https://vumbnail.com/${videoId}.jpg`;
  }

  return '';
}

export function getVideoEmbedUrl(item) {
  const normalized = normalizeVideoGalleryItem(item);

  if (normalized.provider === 'youtube' && normalized.videoId) {
    return `https://www.youtube-nocookie.com/embed/${normalized.videoId}?autoplay=1`;
  }

  if (normalized.provider === 'vimeo' && normalized.videoId) {
    return `https://player.vimeo.com/video/${normalized.videoId}?autoplay=1`;
  }

  if (normalized.provider === 'local') {
    return normalized.src;
  }

  return normalized.src;
}

export function getVideoGalleryColumnsClass(columns = VIDEO_GALLERY_DEFAULTS.columns) {
  const normalized = normalizeInteger(columns, VIDEO_GALLERY_DEFAULTS.columns, [1, 2, 3, 4]);

  if (normalized === 1) return 'grid-cols-1';
  if (normalized === 2) return 'grid-cols-1 md:grid-cols-2';
  if (normalized === 3) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
}

export function getVideoGalleryAspectClass(aspectRatio = VIDEO_GALLERY_DEFAULTS.aspectRatio) {
  const normalized = normalizeEnum(aspectRatio, VIDEO_GALLERY_DEFAULTS.aspectRatio, VIDEO_GALLERY_ASPECT_RATIOS);

  if (normalized === '4/3') return 'aspect-[4/3]';
  if (normalized === '21/9') return 'aspect-[21/9]';
  if (normalized === 'auto') return '';
  return 'aspect-video'; // 16/9
}

export {
  VIDEO_GALLERY_LAYOUTS,
  VIDEO_GALLERY_PROVIDERS,
  VIDEO_GALLERY_ASPECT_RATIOS,
};
