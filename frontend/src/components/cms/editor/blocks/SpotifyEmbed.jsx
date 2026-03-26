import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { useState, useEffect } from 'react';
import RichBlockFrame from '../RichBlockFrame';
import { createRichBlockTextAlignAttribute, getRichBlockHtmlAttributes } from '../blockAlignment';
import { parseSpotifyUrl, getSpotifyEmbedUrl, getDefaultHeight } from '../../../../lib/spotifyUtils';

function SpotifyEmbedView({ node, updateAttributes, selected, deleteNode }) {
  const [urlInput, setUrlInput] = useState(node.attrs.url || '');
  const [error, setError] = useState('');

  const url = node.attrs.url || '';
  const type = node.attrs.type || 'track';
  const theme = node.attrs.theme || 'dark';
  const height = node.attrs.height || getDefaultHeight(type);

  // Parse URL when input changes
  useEffect(() => {
    if (!urlInput.trim()) {
      setError('');
      return;
    }

    const parsed = parseSpotifyUrl(urlInput);
    if (parsed) {
      setError('');
      updateAttributes({
        url: urlInput,
        type: parsed.type,
        height: getDefaultHeight(parsed.type),
      });
    } else if (urlInput.trim()) {
      setError('URL de Spotify no válida');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlInput]);

  const parsed = parseSpotifyUrl(url);
  const embedUrl = parsed ? getSpotifyEmbedUrl(parsed.type, parsed.id, theme) : null;

  return (
    <RichBlockFrame
      alignment={node.attrs.textAlign}
      selected={selected}
      onRemove={deleteNode}
      wrapperClassName="my-6"
      frameClassName="w-full"
    >
      <div
        className={`relative ${selected ? 'ring-2 ring-fuchsia-500 ring-offset-2 rounded-2xl' : ''}`}
        contentEditable={false}
      >
        {/* Preview */}
        {embedUrl ? (
          <div
            className="mx-auto rounded-xl overflow-hidden shadow-lg"
            style={{
              maxWidth: type === 'playlist' || type === 'album' ? '800px' : '600px',
            }}
          >
            <iframe
              src={embedUrl}
              width="100%"
              height={height}
              frameBorder="0"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title={`Spotify ${type}`}
              style={{ borderRadius: '12px' }}
            />
          </div>
        ) : (
          <div className="mx-auto max-w-md rounded-xl border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-elevated)] p-8 text-center">
            <div className="mb-3 text-4xl">🎵</div>
            <p className="text-sm text-[var(--text-muted)]">
              Pega una URL de Spotify para empezar
            </p>
          </div>
        )}

        {/* Editor Controls */}
        {selected && (
          <div className="mt-4 space-y-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-elevated)] p-4">
            <div>
              <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                URL de Spotify
              </label>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://open.spotify.com/track/..."
                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
              />
              {error && (
                <p className="mt-1 text-xs text-red-400">{error}</p>
              )}
              {parsed && (
                <div className="mt-2 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <span className="rounded-full bg-fuchsia-500/20 px-2 py-0.5 text-fuchsia-300">
                    {parsed.type}
                  </span>
                  <span className="font-mono text-[10px]">{parsed.id}</span>
                </div>
              )}
            </div>

            {parsed && (
              <>
                {/* Theme Toggle */}
                <div>
                  <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                    Tema
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateAttributes({ theme: 'dark' })}
                      className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                        theme === 'dark'
                          ? 'bg-fuchsia-500 text-white'
                          : 'border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                      }`}
                    >
                      🌙 Oscuro
                    </button>
                    <button
                      type="button"
                      onClick={() => updateAttributes({ theme: 'light' })}
                      className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                        theme === 'light'
                          ? 'bg-fuchsia-500 text-white'
                          : 'border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                      }`}
                    >
                      ☀️ Claro
                    </button>
                  </div>
                </div>

                {/* Height Adjustment for playlists */}
                {(type === 'playlist' || type === 'album') && (
                  <div>
                    <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                      Altura ({height}px)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="152"
                        max="600"
                        step="50"
                        value={height}
                        onChange={(e) => updateAttributes({ height: Number(e.target.value) })}
                        className="h-1 flex-1 accent-fuchsia-500"
                      />
                      <span className="w-12 text-right text-xs text-[var(--text-muted)]">
                        {height}px
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                      Ajusta la altura para mostrar más o menos canciones
                    </p>
                  </div>
                )}

                {/* Alignment */}
                <div>
                  <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                    Alineación
                  </label>
                  <div className="flex gap-2">
                    {[
                      { key: 'left', label: 'Izquierda' },
                      { key: 'center', label: 'Centro' },
                      { key: 'right', label: 'Derecha' },
                    ].map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => updateAttributes({ textAlign: option.key })}
                        className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                          (node.attrs.textAlign || 'center') === option.key
                            ? 'bg-fuchsia-500 text-white'
                            : 'border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </RichBlockFrame>
  );
}

export const SpotifyEmbedExtension = Node.create({
  name: 'spotifyEmbedBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      url: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-url') || '',
        renderHTML: (attrs) => ({ 'data-url': attrs.url || '' }),
      },
      type: {
        default: 'track',
        parseHTML: (el) => el.getAttribute('data-type') || 'track',
        renderHTML: (attrs) => ({ 'data-type': attrs.type || 'track' }),
      },
      theme: {
        default: 'dark',
        parseHTML: (el) => el.getAttribute('data-theme') || 'dark',
        renderHTML: (attrs) => ({ 'data-theme': attrs.theme || 'dark' }),
      },
      height: {
        default: 152,
        parseHTML: (el) => {
          const value = el.getAttribute('data-height');
          return value ? parseInt(value, 10) : 152;
        },
        renderHTML: (attrs) => ({ 'data-height': String(attrs.height || 152) }),
      },
      textAlign: createRichBlockTextAlignAttribute(),
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-spotify-embed]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(
        getRichBlockHtmlAttributes(HTMLAttributes, node.attrs.textAlign, {
          'data-spotify-embed': '',
          'data-url': node.attrs.url || '',
          'data-type': node.attrs.type || 'track',
          'data-theme': node.attrs.theme || 'dark',
          'data-height': String(node.attrs.height || 152),
        })
      ),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SpotifyEmbedView);
  },

  addCommands() {
    return {
      insertSpotifyEmbed:
        (attrs = {}) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: {
              url: '',
              type: 'track',
              theme: 'dark',
              height: 152,
              textAlign: 'center',
              ...attrs,
            },
          }),
    };
  },
});
