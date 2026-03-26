// Parse Spotify URL to extract type and ID
export function parseSpotifyUrl(url) {
  if (!url || typeof url !== 'string') return null;

  try {
    // Handle both open.spotify.com and spotify.com domains
    const urlObj = new URL(url.trim());
    
    if (!urlObj.hostname.includes('spotify.com')) return null;

    // Extract path: /track/ID, /album/ID, /playlist/ID, /episode/ID
    const pathMatch = urlObj.pathname.match(/\/(track|album|playlist|episode)\/([a-zA-Z0-9]{22})/);
    
    if (!pathMatch) return null;

    const [, type, id] = pathMatch;
    
    // Validate ID format (Spotify IDs are 22 chars alphanumeric)
    if (!/^[a-zA-Z0-9]{22}$/.test(id)) return null;

    return { type, id };
  } catch {
    return null;
  }
}

// Generate Spotify embed URL
export function getSpotifyEmbedUrl(type, id, theme = 'dark') {
  return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=${theme}`;
}

// Get default height based on content type
export function getDefaultHeight(type) {
  if (type === 'playlist' || type === 'album') return 352;
  return 152; // track, episode
}

// Get container max-width based on content type
export function getMaxWidth(type) {
  if (type === 'playlist' || type === 'album') return '800px';
  return '600px';
}
