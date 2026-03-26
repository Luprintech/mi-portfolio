import { parseSpotifyUrl, getSpotifyEmbedUrl, getMaxWidth } from '../../../lib/spotifyUtils';

export default function SpotifyEmbedBlock({ url, theme = 'dark', height = 152 }) {
  // Validate URL
  const parsed = parseSpotifyUrl(url);
  
  if (!parsed) {
    return (
      <div className="my-6 mx-auto max-w-md rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
        <p className="text-sm text-red-400">
          URL de Spotify no válida: {url}
        </p>
      </div>
    );
  }

  const embedUrl = getSpotifyEmbedUrl(parsed.type, parsed.id, theme);
  const maxWidth = getMaxWidth(parsed.type);

  return (
    <div
      className="my-6 mx-auto"
      style={{
        maxWidth,
      }}
    >
      <div className="overflow-hidden rounded-xl shadow-lg">
        <iframe
          src={embedUrl}
          width="100%"
          height={height}
          frameBorder="0"
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title={`Spotify ${parsed.type}`}
          style={{
            borderRadius: '12px',
          }}
        />
      </div>
    </div>
  );
}
