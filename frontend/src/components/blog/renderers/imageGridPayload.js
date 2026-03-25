function normalizeImage(item) {
  if (typeof item === 'string') {
    return { src: item, alt: '', caption: '' };
  }

  if (item && typeof item === 'object') {
    return {
      src: typeof item.src === 'string' ? item.src : '',
      alt: typeof item.alt === 'string' ? item.alt : '',
      caption: typeof item.caption === 'string' ? item.caption : '',
    };
  }

  return { src: '', alt: '', caption: '' };
}

export function parseImageGridPayload(value) {
  if (Array.isArray(value)) {
    return value.map(normalizeImage).filter((item) => item.src);
  }

  if (typeof value !== 'string' || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(normalizeImage).filter((item) => item.src) : [];
  } catch {
    return [];
  }
}
