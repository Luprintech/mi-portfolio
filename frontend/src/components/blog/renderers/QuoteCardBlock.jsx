import { useMemo } from 'react';
import { GRADIENT_PRESETS } from '../../../lib/gradients';

const QUOTE_STYLES = {
  classic: {
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    icon: '"',
  },
  modern: {
    gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(232, 121, 249, 0.2) 100%)',
    icon: '💬',
  },
  elegant: {
    gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(20, 184, 166, 0.2) 100%)',
    icon: '✨',
  },
  bold: {
    gradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(239, 68, 68, 0.2) 100%)',
    icon: '💪',
  },
};

export default function QuoteCardBlock({ quote = '', author = '', role = '', style = 'modern' }) {
  const styleConfig = QUOTE_STYLES[style] || QUOTE_STYLES.modern;

  // Get author initial for avatar
  const authorInitial = useMemo(() => {
    if (!author) return '?';
    return author.trim()[0]?.toUpperCase() || '?';
  }, [author]);

  if (!quote) return null;

  return (
    <div
      className="my-10 rounded-2xl border border-[var(--border-default)] p-6 shadow-[0_18px_40px_rgba(15,23,42,0.12)]"
      style={{ background: styleConfig.gradient }}
      data-quote-card=""
      data-style={style}
    >
      {/* Quote icon/emoji */}
      <div className="mb-4 text-6xl opacity-20" aria-hidden="true">
        {styleConfig.icon}
      </div>

      {/* Quote text */}
      <blockquote className="mb-4 text-xl font-medium italic leading-relaxed text-[var(--text-primary)]">
        {quote}
      </blockquote>

      {/* Author attribution */}
      {author && (
        <div className="flex items-center gap-3 border-t border-[var(--border-default)] pt-4">
          {/* Avatar circle with gradient */}
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
            style={{ background: GRADIENT_PRESETS.cyber.gradient }}
            aria-hidden="true"
          >
            {authorInitial}
          </div>

          {/* Author info */}
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-[var(--text-primary)]">{author}</p>
            {role && <p className="text-sm text-[var(--text-muted)]">{role}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
