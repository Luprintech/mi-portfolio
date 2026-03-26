// ─── Utilidades para compartir en redes sociales ─────────────────────────────

/**
 * Colores de marca de redes sociales
 */
export const SOCIAL_BRAND_COLORS = {
  twitter: '#1DA1F2',
  facebook: '#1877F2',
  linkedin: '#0A66C2',
  whatsapp: '#25D366',
  telegram: '#0088cc',
  reddit: '#FF4500',
  email: '#6B7280',
  copy: '#8B5CF6',
};

/**
 * Genera URL de compartir para cada red social
 * @param {string} network - Nombre de la red social
 * @param {object} params - Parámetros { url, title, description }
 * @returns {string} URL de compartir
 */
export function getSocialShareUrl(network, { url, title, description = '' }) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description);

  const urls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDesc ? encodedDesc + '%0A%0A' : ''}${encodedUrl}`,
  };

  return urls[network] || '';
}

/**
 * Abre popup centrado para compartir
 * @param {string} url - URL a abrir
 * @param {number} width - Ancho del popup
 * @param {number} height - Alto del popup
 */
export function openSharePopup(url, width = 600, height = 400) {
  if (!url) return;

  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;
  const features = `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`;

  window.open(url, 'share-dialog', features);
}

/**
 * Copia texto al portapapeles
 * @param {string} text - Texto a copiar
 * @returns {Promise<boolean>} true si se copió exitosamente
 */
export async function copyToClipboard(text) {
  // Modern clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy with clipboard API:', err);
    }
  }

  // Fallback para navegadores antiguos
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  } catch (err) {
    console.error('Failed to copy with fallback:', err);
    return false;
  }
}

/**
 * Obtiene metadata de la página actual
 * @returns {object} { url, title, description }
 */
export function getCurrentPageMetadata() {
  const url = window.location.href;
  const title =
    document.querySelector('meta[property="og:title"]')?.content ||
    document.querySelector('meta[name="twitter:title"]')?.content ||
    document.title ||
    'Compartir';
  const description =
    document.querySelector('meta[property="og:description"]')?.content ||
    document.querySelector('meta[name="description"]')?.content ||
    '';

  return { url, title, description };
}
