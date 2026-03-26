import { useState, useRef, useEffect } from 'react';

const ACCENT_COLORS = {
  blue: { light: '#3b82f6', dark: '#60a5fa' },
  purple: { light: '#a855f7', dark: '#c084fc' },
  green: { light: '#22c55e', dark: '#4ade80' },
  red: { light: '#ef4444', dark: '#f87171' },
  orange: { light: '#f97316', dark: '#fb923c' },
  pink: { light: '#ec4899', dark: '#f472b6' },
  teal: { light: '#14b8a6', dark: '#2dd4bf' },
  gray: { light: '#6b7280', dark: '#9ca3af' },
};

export default function ToggleBlock({
  title = 'Toggle',
  icon = '',
  content = '',
  defaultOpen = false,
  style = 'clean',
  accentColor = 'blue',
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  // Medir la altura del contenido cuando cambia
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [content, isOpen]);

  const accentConfig = ACCENT_COLORS[accentColor] || ACCENT_COLORS.blue;
  const accentValue = accentConfig.light;

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  // Estilos según el tipo
  const containerStyles = {
    clean: {
      border: 'none',
      borderLeft: `4px solid ${accentValue}`,
      background: 'rgba(255, 255, 255, 0.05)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    boxed: {
      border: `2px solid ${accentValue}`,
      background: 'rgba(255, 255, 255, 0.02)',
    },
    underline: {
      border: 'none',
      borderBottom: `2px solid ${accentValue}`,
      background: 'transparent',
    },
    minimal: {
      border: 'none',
      background: 'transparent',
    },
  };

  const headerStyles = {
    clean: {},
    boxed: {
      backgroundColor: `${accentValue}20`,
    },
    underline: {},
    minimal: {},
  };

  const titleStyles = {
    clean: {},
    boxed: {},
    underline: {
      color: accentValue,
    },
    minimal: {},
  };

  const chevronStyles = {
    clean: { color: 'var(--text-muted)' },
    boxed: { color: 'var(--text-muted)' },
    underline: { color: 'var(--text-muted)' },
    minimal: { color: accentValue },
  };

  return (
    <div
      className="my-6 rounded-xl overflow-hidden transition-all"
      style={containerStyles[style]}
      data-toggle=""
      data-style={style}
      data-accent-color={accentColor}
    >
      {/* Header clickable */}
      <button
        type="button"
        className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer select-none transition-all hover:opacity-80"
        style={headerStyles[style]}
        onClick={handleToggle}
        aria-expanded={isOpen}
      >
        {icon && (
          <span className="text-xl shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
        <span
          className={`flex-1 text-left font-semibold ${
            style === 'underline' ? 'text-base' : 'text-sm'
          }`}
          style={{
            color: titleStyles[style].color || 'var(--text-primary)',
          }}
        >
          {title}
        </span>
        <svg
          className="w-5 h-5 shrink-0 transition-transform duration-300 ease-in-out"
          style={{
            transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
            color: chevronStyles[style].color,
          }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Contenido colapsable */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isOpen ? `${contentHeight}px` : '0px',
        }}
      >
        <div
          ref={contentRef}
          className={`px-4 py-3 ${
            style !== 'minimal' && style !== 'underline'
              ? 'border-t border-[var(--border-color)]'
              : ''
          }`}
        >
          <div
            className="prose prose-invert max-w-none text-[var(--text-primary)]"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </div>
  );
}
