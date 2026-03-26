import { useState, useEffect, useRef } from 'react';

// GIPHY API Key - Configurable via entorno VITE_GIPHY_API_KEY
// Obtener de https://developers.giphy.com/
const GIPHY_API_KEY = import.meta.env.VITE_GIPHY_API_KEY || '';
const GIPHY_API_BASE = 'https://api.giphy.com/v1/gifs';

// Verificar si hay API key configurada
const hasGiphyKey = Boolean(GIPHY_API_KEY);

export default function GifPicker({ onSelect, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [gifs, setGifs] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('trending');
  const [error, setError] = useState(null);
  const searchTimeoutRef = useRef(null);

  const categories = [
    { id: 'trending', label: 'Trending', emoji: '🔥' },
    { id: 'reactions', label: 'Reacciones', emoji: '😂' },
    { id: 'memes', label: 'Memes', emoji: '🎭' },
    { id: 'animals', label: 'Animales', emoji: '🐶' },
    { id: 'sports', label: 'Deportes', emoji: '⚽' },
    { id: 'food', label: 'Comida', emoji: '🍕' },
  ];

  useEffect(() => {
    fetchTrending();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(() => {
        searchGifs(searchQuery);
      }, 500);
    } else {
      setGifs([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  async function fetchTrending() {
    if (!hasGiphyKey) {
      setError('API key de GIPHY no configurada. Añade VITE_GIPHY_API_KEY en tu archivo .env');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `${GIPHY_API_BASE}/trending?api_key=${GIPHY_API_KEY}&limit=30&rating=g`
      );
      const data = await response.json();
      setTrending(data.data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching trending GIFs:', error);
      setError('Error al cargar GIFs');
    } finally {
      setLoading(false);
    }
  }

  async function searchGifs(query) {
    setLoading(true);
    try {
      const response = await fetch(
        `${GIPHY_API_BASE}/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=30&rating=g`
      );
      const data = await response.json();
      setGifs(data.data || []);
    } catch (error) {
      console.error('Error searching GIFs:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchByCategory(category) {
    if (category === 'trending') {
      fetchTrending();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${GIPHY_API_BASE}/search?api_key=${GIPHY_API_KEY}&q=${category}&limit=30&rating=g`
      );
      const data = await response.json();
      setGifs(data.data || []);
    } catch (error) {
      console.error('Error fetching category GIFs:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleCategoryClick(categoryId) {
    setSelectedCategory(categoryId);
    setSearchQuery('');
    fetchByCategory(categoryId);
  }

  function handleGifClick(gif) {
    // Usar la URL del GIF en tamaño original
    const gifUrl = gif.images.original.url;
    onSelect(gifUrl, gif.title || 'GIF animado');
  }

  const displayGifs = searchQuery.trim() ? gifs : trending;

  // Mostrar mensaje de error si no hay API key
  if (!hasGiphyKey) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm">
        <div className="relative flex h-[90vh] w-[90vw] max-w-lg flex-col items-center justify-center rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-8 text-center shadow-2xl">
          <span className="text-6xl mb-4">⚙️</span>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">API de GIPHY no configurada</h2>
          <p className="text-[var(--text-muted)] mb-6">
            Para usar GIFs, necesitas configurar la API key de GIPHY.
          </p>
          <div className="w-full max-w-md rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] p-4 text-left">
            <p className="text-sm text-[var(--text-muted)] mb-2">Añade en tu archivo <code className="text-fuchsia-400">.env</code>:</p>
            <code className="block rounded-lg bg-black/30 px-4 py-3 text-sm text-cyan-400 font-mono">
              VITE_GIPHY_API_KEY=tu_api_key_aqui
            </code>
            <p className="text-xs text-[var(--text-muted)] mt-3">
              Obtén tu API key en <a href="https://developers.giphy.com/" target="_blank" rel="noopener noreferrer" className="text-fuchsia-400 hover:underline">developers.giphy.com</a>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 rounded-lg bg-fuchsia-600 px-6 py-2 text-white hover:bg-fuchsia-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="relative flex h-[90vh] w-[90vw] max-w-5xl flex-col rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎬</span>
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Buscar GIF</h2>
              <p className="text-sm text-[var(--text-muted)]">Powered by GIPHY</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)] transition-colors hover:bg-red-500/20 hover:text-red-400"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="border-b border-[var(--border-color)] px-6 py-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar GIFs... (ej: feliz, triste, celebrar)"
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] px-4 py-3 pl-12 text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
              autoFocus
            />
            <svg
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
        </div>

        {/* Categories */}
        <div className="border-b border-[var(--border-color)] px-6 py-3">
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryClick(category.id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                  selectedCategory === category.id && !searchQuery.trim()
                    ? 'border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-300'
                    : 'border-[var(--border-color)] bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:border-fuchsia-500/50'
                }`}
              >
                <span>{category.emoji}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* GIF Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--border-color)] border-t-fuchsia-500" />
            </div>
          ) : displayGifs.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-[var(--text-muted)]">
              <span className="text-6xl">🔍</span>
              <p className="text-lg font-medium">
                {searchQuery.trim() ? 'No se encontraron GIFs' : 'Busca o selecciona una categoría'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {displayGifs.map((gif) => (
                <button
                  key={gif.id}
                  type="button"
                  onClick={() => handleGifClick(gif)}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] transition-all hover:scale-105 hover:border-fuchsia-500 hover:shadow-lg"
                >
                  <img
                    src={gif.images.fixed_height.url}
                    alt={gif.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-all group-hover:bg-black/20" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--border-color)] px-6 py-3">
          <p className="text-center text-xs text-[var(--text-muted)]">
            GIFs proporcionados por{' '}
            <a
              href="https://giphy.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-fuchsia-400 hover:underline"
            >
              GIPHY
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
