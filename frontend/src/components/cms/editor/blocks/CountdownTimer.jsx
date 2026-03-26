import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { useState, useEffect } from 'react';
import RichBlockFrame from '../RichBlockFrame';
import { createRichBlockTextAlignAttribute, getRichBlockHtmlAttributes } from '../blockAlignment';

function CountdownTimerView({ node, updateAttributes, selected, deleteNode }) {
  const [timeRemaining, setTimeRemaining] = useState(null);

  // Calculate time remaining
  useEffect(() => {
    if (!node.attrs.targetDate) return;

    function updateCountdown() {
      const now = new Date().getTime();
      const target = new Date(node.attrs.targetDate).getTime();
      const diff = target - now;
      
      if (diff <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds, expired: false });
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [node.attrs.targetDate]);

  // Format number with leading zero
  const pad = (num) => String(num).padStart(2, '0');

  // Get default date (30 days from now)
  const getDefaultDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().slice(0, 16);
  };

  const theme = node.attrs.theme || 'default';

  // Render countdown based on theme
  const renderCountdown = () => {
    if (!timeRemaining) return null;

    if (timeRemaining.expired) {
      return (
        <div className="text-center py-8">
          <p className="text-2xl font-bold text-fuchsia-400">Event Started!</p>
        </div>
      );
    }

    const { days, hours, minutes, seconds } = timeRemaining;

    if (theme === 'compact') {
      return (
        <div className="flex justify-center items-center gap-1 text-3xl font-mono font-bold text-[var(--text-primary)]">
          <span>{pad(days)}</span>
          <span className="text-[var(--text-muted)]">:</span>
          <span>{pad(hours)}</span>
          <span className="text-[var(--text-muted)]">:</span>
          <span>{pad(minutes)}</span>
          <span className="text-[var(--text-muted)]">:</span>
          <span>{pad(seconds)}</span>
        </div>
      );
    }

    if (theme === 'bold') {
      return (
        <div className="grid grid-cols-4 gap-4 text-center">
          {[
            { value: days, label: 'Days' },
            { value: hours, label: 'Hours' },
            { value: minutes, label: 'Minutes' },
            { value: seconds, label: 'Seconds' }
          ].map((unit, idx) => (
            <div key={idx}>
              <div className="text-6xl font-black bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
                {pad(unit.value)}
              </div>
              <div className="text-xs uppercase text-[var(--text-muted)] mt-1">{unit.label}</div>
            </div>
          ))}
        </div>
      );
    }

    if (theme === 'neon') {
      return (
        <div className="grid grid-cols-4 gap-4 text-center">
          {[
            { value: days, label: 'Days' },
            { value: hours, label: 'Hours' },
            { value: minutes, label: 'Minutes' },
            { value: seconds, label: 'Seconds' }
          ].map((unit, idx) => (
            <div key={idx}>
              <div 
                className="text-5xl font-bold text-cyan-400 animate-pulse"
                style={{ 
                  textShadow: '0 0 10px rgba(6, 182, 212, 0.8), 0 0 20px rgba(6, 182, 212, 0.5), 0 0 30px rgba(6, 182, 212, 0.3)' 
                }}
              >
                {pad(unit.value)}
              </div>
              <div className="text-xs uppercase text-cyan-300 mt-2">{unit.label}</div>
            </div>
          ))}
        </div>
      );
    }

    // Default theme - cards
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { value: days, label: 'Days' },
          { value: hours, label: 'Hours' },
          { value: minutes, label: 'Minutes' },
          { value: seconds, label: 'Seconds' }
        ].map((unit, idx) => (
          <div 
            key={idx}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-[var(--border-color)] bg-gradient-to-br from-violet-900/10 to-fuchsia-900/10"
          >
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-cyan-500">
              {pad(unit.value)}
            </div>
            <div className="text-xs uppercase text-[var(--text-muted)] mt-2 font-medium">{unit.label}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <RichBlockFrame
      alignment={node.attrs.textAlign}
      selected={selected}
      onRemove={deleteNode}
      wrapperClassName="my-6"
      frameClassName="w-full"
    >
      <div className={`${selected ? 'ring-2 ring-fuchsia-500 ring-offset-2 rounded-2xl p-4' : 'p-4'}`} contentEditable={false}>
        {/* Title */}
        {node.attrs.title && (
          <h3 className="text-center text-2xl font-bold text-[var(--text-primary)] mb-2">
            {node.attrs.title}
          </h3>
        )}

        {/* Description */}
        {node.attrs.description && (
          <p className="text-center text-sm text-[var(--text-muted)] mb-6">
            {node.attrs.description}
          </p>
        )}

        {/* Countdown Display */}
        {renderCountdown()}

        {/* Editor Controls */}
        {selected && (
          <div className="mt-6 space-y-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)]/65 p-4">
            <div>
              <label className="text-xs uppercase text-[var(--text-muted)] tracking-wider block mb-2">
                Event Title
              </label>
              <input
                type="text"
                value={node.attrs.title}
                onChange={(e) => updateAttributes({ title: e.target.value })}
                placeholder="Product Launch"
                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
              />
            </div>

            <div>
              <label className="text-xs uppercase text-[var(--text-muted)] tracking-wider block mb-2">
                Description (optional)
              </label>
              <input
                type="text"
                value={node.attrs.description}
                onChange={(e) => updateAttributes({ description: e.target.value })}
                placeholder="Join us for the big reveal..."
                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
              />
            </div>

            <div>
              <label className="text-xs uppercase text-[var(--text-muted)] tracking-wider block mb-2">
                Target Date & Time
              </label>
              <input
                type="datetime-local"
                value={node.attrs.targetDate ? new Date(node.attrs.targetDate).toISOString().slice(0, 16) : ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value).toISOString() : getDefaultDate();
                  updateAttributes({ targetDate: date });
                }}
                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
              />
            </div>

            <div>
              <label className="text-xs uppercase text-[var(--text-muted)] tracking-wider block mb-2">
                Theme
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'default', label: 'Cards' },
                  { key: 'compact', label: 'Compact' },
                  { key: 'bold', label: 'Bold' },
                  { key: 'neon', label: 'Neon' }
                ].map(option => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => updateAttributes({ theme: option.key })}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      theme === option.key
                        ? 'bg-fuchsia-500 text-white'
                        : 'bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </RichBlockFrame>
  );
}

export const CountdownTimerExtension = Node.create({
  name: 'countdownTimer',
  group: 'block',
  atom: true,
  defining: true,

  addAttributes() {
    return {
      targetDate: {
        default: (() => {
          const date = new Date();
          date.setDate(date.getDate() + 30);
          return date.toISOString();
        })(),
        parseHTML: el => el.getAttribute('data-target-date') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        renderHTML: attrs => ({ 'data-target-date': attrs.targetDate }),
      },
      title: {
        default: 'Product Launch',
        parseHTML: el => el.getAttribute('data-title') || 'Product Launch',
        renderHTML: attrs => ({ 'data-title': attrs.title }),
      },
      description: {
        default: '',
        parseHTML: el => el.getAttribute('data-description') || '',
        renderHTML: attrs => attrs.description ? { 'data-description': attrs.description } : {},
      },
      theme: {
        default: 'default',
        parseHTML: el => el.getAttribute('data-theme') || 'default',
        renderHTML: attrs => ({ 'data-theme': attrs.theme || 'default' }),
      },
      textAlign: createRichBlockTextAlignAttribute(),
    };
  },

  parseHTML() {
    return [
      { tag: 'div[data-countdown-timer]' },
      { tag: 'div[data-block="countdown-timer"]' }
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return ['div', mergeAttributes(getRichBlockHtmlAttributes(HTMLAttributes, node.attrs.textAlign, {
      'data-block': 'countdown-timer',
      'data-countdown-timer': '',
      'data-target-date': node.attrs.targetDate,
      'data-title': node.attrs.title,
      'data-description': node.attrs.description || '',
      'data-theme': node.attrs.theme || 'default',
      style: 'margin:1.5em 0;',
    }))];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CountdownTimerView);
  },

  addCommands() {
    return {
      insertCountdownTimer: (attrs) => ({ commands }) => {
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 30);
        
        return commands.insertContent({
          type: this.name,
          attrs: {
            targetDate: defaultDate.toISOString(),
            title: 'Product Launch',
            description: '',
            theme: 'default',
            ...attrs,
          },
        });
      },
    };
  },
});
