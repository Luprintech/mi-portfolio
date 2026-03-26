import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { useState, useRef } from 'react';
import RichBlockFrame from '../RichBlockFrame';
import { createRichBlockTextAlignAttribute, getRichBlockHtmlAttributes } from '../blockAlignment';
import { cmsApi } from '../../../../lib/cmsApi';
import { useAuth } from '../../../../context/AuthContext';

const AUDIO_THEMES = {
  default: { name: 'Por defecto', icon: '🎵' },
  minimal: { name: 'Minimalista', icon: '⚪' },
  compact: { name: 'Compacto', icon: '🔹' },
};

const WAVEFORM_COLORS = [
  { label: 'Violeta', value: '#8b5cf6' },
  { label: 'Fucsia', value: '#d946ef' },
  { label: 'Cyan', value: '#06b6d4' },
  { label: 'Naranja', value: '#f97316' },
  { label: 'Verde', value: '#10b981' },
  { label: 'Rosa', value: '#ec4899' },
];

function AudioPlayerView({ node, updateAttributes, selected, deleteNode }) {
  const { token } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [duration, setDuration] = useState(null);
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);

  const audioUrl = node.attrs.audioUrl || '';
  const title = node.attrs.title || '';
  const artist = node.attrs.artist || '';
  const waveformColor = node.attrs.waveformColor || '#8b5cf6';
  const theme = node.attrs.theme || 'default';

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/x-m4a'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|m4a)$/i)) {
      setUploadError('Formato no soportado. Usa MP3, WAV, OGG o M4A.');
      return;
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError('El archivo es demasiado grande. Máximo 50MB.');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('image', file); // Backend uses 'image' field for all media

      const response = await cmsApi.uploadImage(formData, token);
      
      if (response.success && response.url) {
        updateAttributes({
          audioUrl: response.url,
          title: title || file.name.replace(/\.[^/.]+$/, ''), // Use filename as default title
        });
        
        // Load audio to get duration
        const audio = new Audio(response.url);
        audio.addEventListener('loadedmetadata', () => {
          setDuration(audio.duration);
        });
      } else {
        setUploadError('Error al subir el archivo.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Error al subir el archivo.');
    } finally {
      setUploading(false);
    }
  }

  function formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function handleAudioLoad(e) {
    if (e.target.duration && !isNaN(e.target.duration)) {
      setDuration(e.target.duration);
    }
  }

  return (
    <RichBlockFrame
      alignment={node.attrs.textAlign}
      selected={selected}
      onRemove={deleteNode}
      wrapperClassName="my-6"
      frameClassName="w-full"
    >
      <div
        className={`${selected ? 'ring-2 ring-fuchsia-500 ring-offset-2 rounded-2xl' : ''}`}
        contentEditable={false}
      >
        {/* Configuration Panel */}
        <div className="mb-4 space-y-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-4">
          {/* Upload Button */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Archivo de audio
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp3,.wav,.ogg,.m4a,audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/x-m4a"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] px-4 py-3 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-elevated)] disabled:opacity-50"
            >
              {uploading ? '⏳ Subiendo...' : audioUrl ? '🔄 Cambiar archivo' : '📁 Subir archivo'}
            </button>
            {uploadError && (
              <p className="mt-2 text-xs text-red-400">{uploadError}</p>
            )}
            {audioUrl && (
              <div className="mt-2 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <span className="truncate">✅ {title || 'Audio cargado'}</span>
                {duration && <span>• {formatDuration(duration)}</span>}
              </div>
            )}
          </div>

          {/* Title Input */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => updateAttributes({ title: e.target.value })}
              placeholder="Título de la pista..."
              className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20"
            />
          </div>

          {/* Artist Input */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Artista / Autor
            </label>
            <input
              type="text"
              value={artist}
              onChange={(e) => updateAttributes({ artist: e.target.value })}
              placeholder="Nombre del artista..."
              className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20"
            />
          </div>

          {/* Waveform Color Picker */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Color de onda
            </label>
            <div className="flex gap-2">
              {WAVEFORM_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateAttributes({ waveformColor: color.value })}
                  className={`h-10 w-10 rounded-lg border-2 transition-all hover:scale-110 ${
                    waveformColor === color.value
                      ? 'border-white shadow-lg'
                      : 'border-transparent opacity-70'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          {/* Theme Selector */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Tema
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(AUDIO_THEMES).map(([key, { name, icon }]) => (
                <button
                  key={key}
                  onClick={() => updateAttributes({ theme: key })}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    theme === key
                      ? 'border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-400'
                      : 'border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
                  }`}
                >
                  {icon} {name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        {audioUrl && (
          <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-4">
            <div className="mb-2 text-center">
              <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                {title || 'Sin título'}
              </h4>
              {artist && (
                <p className="text-xs text-[var(--text-muted)]">{artist}</p>
              )}
            </div>
            
            {/* Static preview waveform */}
            <div className="my-4 flex items-center justify-center gap-1" style={{ height: theme === 'compact' ? '30px' : '60px' }}>
              {Array.from({ length: theme === 'compact' ? 40 : 60 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full transition-all"
                  style={{
                    backgroundColor: i < 20 ? waveformColor : '#4a5568',
                    opacity: i < 20 ? 1 : 0.3,
                    height: `${Math.random() * 60 + 40}%`,
                  }}
                />
              ))}
            </div>

            <div className="flex items-center justify-center gap-4">
              <button className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-500 text-xl text-white shadow-lg">
                ▶
              </button>
              <span className="font-mono text-xs text-[var(--text-muted)]">
                0:00 / {formatDuration(duration)}
              </span>
            </div>
            
            {theme !== 'compact' && (
              <div className="mt-3 text-center text-xs text-[var(--text-muted)]">
                Vista previa (no funcional en el editor)
              </div>
            )}
            
            {/* Hidden audio element for duration detection */}
            <audio
              ref={audioRef}
              src={audioUrl}
              onLoadedMetadata={handleAudioLoad}
              className="hidden"
            />
          </div>
        )}
      </div>
    </RichBlockFrame>
  );
}

export const AudioPlayerExtension = Node.create({
  name: 'audioPlayerBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      audioUrl: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-audio-url') || '',
        renderHTML: (attrs) => ({ 'data-audio-url': attrs.audioUrl }),
      },
      title: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-title') || '',
        renderHTML: (attrs) => ({ 'data-title': attrs.title }),
      },
      artist: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-artist') || '',
        renderHTML: (attrs) => ({ 'data-artist': attrs.artist }),
      },
      waveformColor: {
        default: '#8b5cf6',
        parseHTML: (el) => el.getAttribute('data-waveform-color') || '#8b5cf6',
        renderHTML: (attrs) => ({ 'data-waveform-color': attrs.waveformColor }),
      },
      theme: {
        default: 'default',
        parseHTML: (el) => el.getAttribute('data-theme') || 'default',
        renderHTML: (attrs) => ({ 'data-theme': attrs.theme }),
      },
      textAlign: createRichBlockTextAlignAttribute(),
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="audioPlayer"]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(
        getRichBlockHtmlAttributes(HTMLAttributes, node.attrs.textAlign, {
          'data-type': 'audioPlayer',
          'data-block': 'audioPlayer',
        })
      ),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AudioPlayerView);
  },

  addCommands() {
    return {
      insertAudioPlayer:
        () =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: {
              audioUrl: '',
              title: '',
              artist: '',
              waveformColor: '#8b5cf6',
              theme: 'default',
            },
          }),
    };
  },
});
