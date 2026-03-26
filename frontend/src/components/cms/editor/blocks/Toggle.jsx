import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewContent } from '@tiptap/react';
import { useState } from 'react';
import RichBlockFrame from '../RichBlockFrame';
import { createRichBlockTextAlignAttribute, getRichBlockHtmlAttributes } from '../blockAlignment';

const TOGGLE_STYLES = {
  clean: { name: 'Limpio', icon: '▶' },
  boxed: { name: 'Con caja', icon: '📦' },
  underline: { name: 'Subrayado', icon: '_' },
  minimal: { name: 'Minimal', icon: '·' },
};

const ACCENT_COLORS = [
  { key: 'blue', label: 'Azul', light: '#3b82f6', dark: '#60a5fa' },
  { key: 'purple', label: 'Morado', light: '#a855f7', dark: '#c084fc' },
  { key: 'green', label: 'Verde', light: '#22c55e', dark: '#4ade80' },
  { key: 'red', label: 'Rojo', light: '#ef4444', dark: '#f87171' },
  { key: 'orange', label: 'Naranja', light: '#f97316', dark: '#fb923c' },
  { key: 'pink', label: 'Rosa', light: '#ec4899', dark: '#f472b6' },
  { key: 'teal', label: 'Teal', light: '#14b8a6', dark: '#2dd4bf' },
  { key: 'gray', label: 'Gris', light: '#6b7280', dark: '#9ca3af' },
];

function ToggleView({ node, updateAttributes, selected, deleteNode }) {
  const [isOpen, setIsOpen] = useState(node.attrs.defaultOpen !== false);
  const title = node.attrs.title || 'Toggle';
  const icon = node.attrs.icon || '';
  const style = node.attrs.style || 'clean';
  const accentColor = node.attrs.accentColor || 'blue';
  const defaultOpen = node.attrs.defaultOpen !== false;

  const accentConfig = ACCENT_COLORS.find(c => c.key === accentColor) || ACCENT_COLORS[0];
  const accentValue = accentConfig.light;

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <RichBlockFrame
      alignment={node.attrs.textAlign}
      selected={selected}
      onRemove={deleteNode}
      wrapperClassName="my-6"
      frameClassName="w-full"
    >
      <div className={`relative ${selected ? 'ring-2 ring-fuchsia-500 ring-offset-2 rounded-xl' : ''}`} contentEditable={false}>
        {/* Preview del toggle */}
        <div
          className={`rounded-xl overflow-hidden transition-all ${
            style === 'clean' ? 'border-l-4 bg-white/5 shadow-sm' :
            style === 'boxed' ? 'border-2 bg-gray-50/5' :
            style === 'underline' ? 'border-b-2' :
            'border-0'
          }`}
          style={{
            borderColor: style === 'clean' || style === 'boxed' || style === 'underline' ? accentValue : 'transparent',
          }}
        >
          {/* Header */}
          <div
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer select-none transition-colors ${
              style === 'boxed' ? 'bg-opacity-10' : ''
            }`}
            style={{
              backgroundColor: style === 'boxed' ? `${accentValue}20` : 'transparent',
            }}
            onClick={toggleOpen}
          >
            {icon && (
              <span className="text-xl shrink-0">{icon}</span>
            )}
            <span className={`flex-1 font-semibold text-[var(--text-primary)] ${style === 'underline' ? 'text-base' : 'text-sm'}`}
                  style={{ color: style === 'underline' ? accentValue : undefined }}>
              {title}
            </span>
            <svg
              className="w-5 h-5 transition-transform duration-300 shrink-0"
              style={{
                transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                color: style === 'minimal' ? accentValue : 'var(--text-muted)',
              }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>

          {/* Content */}
          <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{
              maxHeight: isOpen ? '2000px' : '0px',
            }}
          >
            <div className={`px-4 py-3 ${style !== 'minimal' && style !== 'underline' ? 'border-t border-[var(--border-color)]' : ''}`}>
              <NodeViewContent />
            </div>
          </div>
        </div>

        {/* Panel de configuración */}
        {selected && (
          <div className="mt-3 space-y-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)]/65 p-4">
            {/* Título */}
            <div>
              <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1.5">
                Título del toggle
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => updateAttributes({ title: e.target.value })}
                placeholder="Toggle"
                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
              />
            </div>

            {/* Icono/Emoji */}
            <div>
              <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1.5">
                Icono/Emoji (opcional)
              </label>
              <input
                type="text"
                value={icon}
                onChange={(e) => updateAttributes({ icon: e.target.value })}
                placeholder="▶️ 📌 💡 ⚡"
                maxLength={4}
                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
              />
              <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                Sugerencias: ▶️ 📌 💡 ⚡ 🔔 📝 ℹ️ ⚙️
              </p>
            </div>

            {/* Toggle expandido por defecto */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={defaultOpen}
                  onChange={(e) => updateAttributes({ defaultOpen: e.target.checked })}
                  className="rounded accent-fuchsia-500"
                />
                <span className="text-sm text-[var(--text-secondary)]">
                  Expandido por defecto
                </span>
              </label>
            </div>

            {/* Estilo visual */}
            <div>
              <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1.5">
                Estilo visual
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(TOGGLE_STYLES).map(([key, { name, icon }]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => updateAttributes({ style: key })}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                      style === key
                        ? 'border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-300'
                        : 'border-[var(--border-color)] bg-[var(--bg-primary)]/60 text-[var(--text-muted)] hover:border-fuchsia-500/50'
                    }`}
                  >
                    <span className="text-sm">{icon}</span>
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Color acento */}
            <div>
              <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1.5">
                Color de acento
              </label>
              <div className="flex gap-2 flex-wrap">
                {ACCENT_COLORS.map((color) => (
                  <button
                    key={color.key}
                    type="button"
                    title={color.label}
                    onClick={() => updateAttributes({ accentColor: color.key })}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                      accentColor === color.key
                        ? 'ring-2 ring-fuchsia-400 ring-offset-1 ring-offset-[var(--bg-elevated)] scale-110 border-white'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color.light }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </RichBlockFrame>
  );
}

export const ToggleExtension = Node.create({
  name: 'toggle',
  group: 'block',
  content: 'block+',
  defining: true,
  addAttributes() {
    return {
      title: {
        default: 'Toggle',
        parseHTML: (el) => el.getAttribute('data-title') || 'Toggle',
        renderHTML: (attrs) => ({ 'data-title': attrs.title }),
      },
      icon: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-icon') || '',
        renderHTML: (attrs) => attrs.icon ? { 'data-icon': attrs.icon } : {},
      },
      defaultOpen: {
        default: false,
        parseHTML: (el) => el.getAttribute('data-default-open') !== 'false',
        renderHTML: (attrs) => ({ 'data-default-open': String(attrs.defaultOpen !== false) }),
      },
      style: {
        default: 'clean',
        parseHTML: (el) => el.getAttribute('data-style') || 'clean',
        renderHTML: (attrs) => ({ 'data-style': attrs.style || 'clean' }),
      },
      accentColor: {
        default: 'blue',
        parseHTML: (el) => el.getAttribute('data-accent-color') || 'blue',
        renderHTML: (attrs) => ({ 'data-accent-color': attrs.accentColor || 'blue' }),
      },
      textAlign: createRichBlockTextAlignAttribute(),
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-toggle]' }];
  },
  renderHTML({ node, HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(
        getRichBlockHtmlAttributes(HTMLAttributes, node.attrs.textAlign, {
          'data-toggle': '',
          'data-title': node.attrs.title || 'Toggle',
          'data-icon': node.attrs.icon || '',
          'data-default-open': String(node.attrs.defaultOpen !== false),
          'data-style': node.attrs.style || 'clean',
          'data-accent-color': node.attrs.accentColor || 'blue',
        })
      ),
      0,
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(ToggleView);
  },
  addCommands() {
    return {
      insertToggle: () => ({ commands }) =>
        commands.insertContent({
          type: this.name,
          attrs: { title: 'Toggle', defaultOpen: false, style: 'clean', accentColor: 'blue' },
          content: [{ type: 'paragraph' }],
        }),
    };
  },
});
