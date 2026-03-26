import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import RichBlockFrame from '../RichBlockFrame';
import { createRichBlockTextAlignAttribute, getRichBlockHtmlAttributes } from '../blockAlignment';
import { getGradientsList, getGradientPreset } from '../../../../lib/gradients';

const THEMES = {
  default: { name: 'Por defecto', icon: '━' },
  gradient: { name: 'Gradiente', icon: '🌈' },
  neon: { name: 'Neón', icon: '✨' },
  minimal: { name: 'Minimalista', icon: '─' },
};

const DEFAULT_BARS = [
  { label: 'JavaScript', percentage: 85, color: '#f7df1e' },
  { label: 'React', percentage: 90, color: '#61dafb' },
  { label: 'Node.js', percentage: 75, color: '#68a063' },
  { label: 'TypeScript', percentage: 80, color: '#3178c6' },
];

function ProgressBarsView({ node, updateAttributes, selected, deleteNode }) {
  const bars = node.attrs.bars || DEFAULT_BARS;
  const theme = node.attrs.theme || 'default';
  const animated = node.attrs.animated !== false;

  const gradientOptions = getGradientsList();

  function updateBar(index, updates) {
    const newBars = [...bars];
    newBars[index] = { ...newBars[index], ...updates };
    updateAttributes({ bars: newBars });
  }

  function addBar() {
    updateAttributes({
      bars: [...bars, { label: 'Nueva habilidad', percentage: 50, color: '#3b82f6' }],
    });
  }

  function removeBar(index) {
    updateAttributes({ bars: bars.filter((_, i) => i !== index) });
  }

  function getBarStyle(bar, theme) {
    const baseStyle = { width: `${bar.percentage}%` };
    
    if (theme === 'gradient') {
      // Check if color is a gradient preset name
      const gradientPreset = getGradientPreset(bar.color);
      if (gradientPreset && gradientPreset.gradient) {
        return { ...baseStyle, background: gradientPreset.gradient };
      }
      return { ...baseStyle, backgroundColor: bar.color };
    }
    
    if (theme === 'neon') {
      return {
        ...baseStyle,
        backgroundColor: bar.color,
        boxShadow: `0 0 10px ${bar.color}, 0 0 20px ${bar.color}80`,
      };
    }
    
    return { ...baseStyle, backgroundColor: bar.color };
  }

  function getBarContainerClass(theme) {
    if (theme === 'minimal') return 'h-2 bg-slate-800/30 rounded-full overflow-hidden';
    if (theme === 'neon') return 'h-8 bg-slate-900/50 rounded-lg overflow-hidden backdrop-blur-sm';
    return 'h-7 bg-slate-800/40 rounded-lg overflow-hidden';
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
        {/* Progress bars preview */}
        <div className="space-y-4 rounded-2xl border border-[var(--border-color)] bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-6">
          {bars.length === 0 ? (
            <p className="text-center text-sm text-[var(--text-muted)]">
              No hay barras. Añade una para empezar.
            </p>
          ) : (
            bars.map((bar, index) => (
              <div key={index} className="group relative">
                {/* Label and percentage */}
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-semibold text-[var(--text-primary)]">
                    {bar.label || 'Sin nombre'}
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      theme === 'neon'
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400'
                        : 'text-[var(--text-muted)]'
                    }`}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {Math.min(100, Math.max(0, bar.percentage))}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className={getBarContainerClass(theme)}>
                  <div
                    className="h-full rounded-lg transition-all duration-300"
                    style={getBarStyle(bar, theme)}
                  />
                </div>

                {/* Remove button on hover */}
                {selected && bars.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBar(index)}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20 text-red-400 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    ×
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Editor controls */}
        {selected && (
          <div className="mt-3 space-y-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)]/65 p-4">
            {/* Theme selector and controls */}
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                Configuración de barras
              </h4>
              <div className="flex gap-2">
                <label className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <input
                    type="checkbox"
                    checked={animated}
                    onChange={(e) => updateAttributes({ animated: e.target.checked })}
                    className="rounded border-[var(--border-color)]"
                  />
                  Animado
                </label>
                <button
                  type="button"
                  onClick={addBar}
                  className="rounded-lg border border-fuchsia-500/40 bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-300"
                >
                  + Añadir
                </button>
              </div>
            </div>

            {/* Theme buttons */}
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(THEMES).map(([key, { name, icon }]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => updateAttributes({ theme: key })}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                    theme === key
                      ? 'border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-300'
                      : 'border-[var(--border-color)] bg-[var(--bg-primary)]/60 text-[var(--text-muted)] hover:border-fuchsia-500/50'
                  }`}
                >
                  {icon} {name}
                </button>
              ))}
            </div>

            {/* Bar editors */}
            {bars.map((bar, index) => (
              <div
                key={index}
                className="space-y-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]/60 p-3"
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    type="text"
                    value={bar.label}
                    onChange={(e) => updateBar(index, { label: e.target.value })}
                    placeholder="Nombre de la habilidad"
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={bar.percentage}
                    onChange={(e) =>
                      updateBar(index, {
                        percentage: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)),
                      })
                    }
                    placeholder="Porcentaje (0-100)"
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
                  />
                </div>

                {/* Color/Gradient selector */}
                {theme === 'gradient' ? (
                  <select
                    value={bar.color}
                    onChange={(e) => updateBar(index, { color: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
                  >
                    {gradientOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bar.color}
                      onChange={(e) => updateBar(index, { color: e.target.value })}
                      className="h-10 w-16 cursor-pointer rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]/80"
                    />
                    <input
                      type="text"
                      value={bar.color}
                      onChange={(e) => updateBar(index, { color: e.target.value })}
                      placeholder="#3b82f6"
                      className="flex-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-sm font-mono text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </RichBlockFrame>
  );
}

export const ProgressBarsExtension = Node.create({
  name: 'progressBars',
  group: 'block',
  atom: true,
  defining: true,
  addAttributes() {
    return {
      bars: {
        default: DEFAULT_BARS,
      },
      theme: {
        default: 'default',
      },
      animated: {
        default: true,
      },
      textAlign: createRichBlockTextAlignAttribute(),
    };
  },
  parseHTML() {
    return [
      { tag: 'div[data-progress-bars]' },
      { tag: 'div[data-block="progress-bars"]' },
    ];
  },
  renderHTML({ node, HTMLAttributes }) {
    const { bars, theme, animated } = node.attrs;

    return [
      'div',
      mergeAttributes(
        getRichBlockHtmlAttributes(HTMLAttributes, node.attrs.textAlign, {
          'data-block': 'progress-bars',
          'data-progress-bars': '',
          'data-bars': JSON.stringify(bars),
          'data-theme': theme,
          'data-animated': animated.toString(),
          style: 'margin:1.5em 0;',
        })
      ),
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(ProgressBarsView);
  },
  addCommands() {
    return {
      insertProgressBars:
        () =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: {
              bars: DEFAULT_BARS,
              theme: 'default',
              animated: true,
            },
          }),
    };
  },
});
