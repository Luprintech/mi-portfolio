// ─── SocialShare — Editor Block ───────────────────────────────────────────────
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import RichBlockFrame from '../RichBlockFrame';
import { createRichBlockTextAlignAttribute, getRichBlockHtmlAttributes } from '../blockAlignment';

const AVAILABLE_NETWORKS = [
  { id: 'twitter', label: 'Twitter/X', icon: '𝕏' },
  { id: 'facebook', label: 'Facebook', icon: 'f' },
  { id: 'linkedin', label: 'LinkedIn', icon: 'in' },
  { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { id: 'telegram', label: 'Telegram', icon: '✈️' },
  { id: 'reddit', label: 'Reddit', icon: '🤖' },
  { id: 'email', label: 'Email', icon: '✉️' },
  { id: 'copy', label: 'Copiar enlace', icon: '🔗' },
];

const STYLE_OPTIONS = [
  { value: 'icons', label: 'Solo íconos' },
  { value: 'buttons', label: 'Botones con texto' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'floating', label: 'Flotante' },
];

const SHAPE_OPTIONS = [
  { value: 'rounded', label: 'Redondeado' },
  { value: 'square', label: 'Cuadrado' },
  { value: 'circle', label: 'Círculo' },
];

const SIZE_OPTIONS = [
  { value: 'sm', label: 'Pequeño' },
  { value: 'md', label: 'Mediano' },
  { value: 'lg', label: 'Grande' },
];

const LAYOUT_OPTIONS = [
  { value: 'horizontal', label: 'Horizontal' },
  { value: 'vertical', label: 'Vertical' },
  { value: 'grid', label: 'Grid' },
];

function SocialShareView({ node, updateAttributes, selected, deleteNode }) {
  const networks = node.attrs.networks || ['twitter', 'facebook', 'linkedin'];
  const style = node.attrs.style || 'icons';
  const shape = node.attrs.shape || 'rounded';
  const size = node.attrs.size || 'md';
  const showCount = node.attrs.showCount || false;
  const layout = node.attrs.layout || 'horizontal';

  function toggleNetwork(networkId) {
    if (networks.includes(networkId)) {
      updateAttributes({ networks: networks.filter(id => id !== networkId) });
    } else {
      updateAttributes({ networks: [...networks, networkId] });
    }
  }

  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-14 h-14 text-xl' : 'w-10 h-10 text-sm';
  const shapeClass = shape === 'circle' ? 'rounded-full' : shape === 'square' ? 'rounded-none' : 'rounded-lg';
  const gapClass = size === 'sm' ? 'gap-1.5' : size === 'lg' ? 'gap-3' : 'gap-2';

  const layoutClass =
    layout === 'vertical'
      ? 'flex-col items-start'
      : layout === 'grid'
        ? 'grid grid-cols-2 sm:grid-cols-4'
        : 'flex-wrap';

  return (
    <RichBlockFrame
      alignment={node.attrs.textAlign}
      selected={selected}
      onRemove={deleteNode}
      frameClassName="w-full"
    >
      <div
        className={`${selected ? 'ring-2 ring-fuchsia-500 ring-offset-2 rounded-xl p-2' : ''}`}
        contentEditable={false}
      >
        {/* Preview */}
        <div className={`flex ${layoutClass} ${gapClass} items-center`}>
          {networks.map(netId => {
            const net = AVAILABLE_NETWORKS.find(n => n.id === netId);
            if (!net) return null;
            return (
              <div
                key={netId}
                className={`${sizeClass} ${shapeClass} flex items-center justify-center bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-muted)] transition-all hover:scale-105`}
              >
                {net.icon}
              </div>
            );
          })}
        </div>

        {/* Editor panel */}
        {selected && (
          <div className="mt-4 space-y-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)]/80 p-4">
            {/* Networks */}
            <div>
              <label className="mb-2 block text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                Redes sociales
              </label>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_NETWORKS.map(net => (
                  <label
                    key={net.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-2 text-xs text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-elevated)]"
                  >
                    <input
                      type="checkbox"
                      checked={networks.includes(net.id)}
                      onChange={() => toggleNetwork(net.id)}
                      className="rounded accent-fuchsia-500"
                    />
                    <span className="text-base">{net.icon}</span>
                    <span className="flex-1">{net.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Style */}
            <div>
              <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                Estilo visual
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {STYLE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateAttributes({ style: opt.value })}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      style === opt.value
                        ? 'bg-fuchsia-500 text-white'
                        : 'border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Shape & Size */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                  Forma
                </label>
                <div className="flex gap-1.5">
                  {SHAPE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateAttributes({ shape: opt.value })}
                      className={`flex-1 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors ${
                        shape === opt.value
                          ? 'bg-fuchsia-500 text-white'
                          : 'border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                  Tamaño
                </label>
                <div className="flex gap-1.5">
                  {SIZE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateAttributes({ size: opt.value })}
                      className={`flex-1 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors ${
                        size === opt.value
                          ? 'bg-fuchsia-500 text-white'
                          : 'border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Layout */}
            <div>
              <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                Disposición
              </label>
              <div className="flex gap-1.5">
                {LAYOUT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateAttributes({ layout: opt.value })}
                    className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      layout === opt.value
                        ? 'bg-fuchsia-500 text-white'
                        : 'border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Show count toggle */}
            <label className="flex cursor-pointer items-center gap-2 text-xs text-[var(--text-muted)]">
              <input
                type="checkbox"
                checked={showCount}
                onChange={e => updateAttributes({ showCount: e.target.checked })}
                className="rounded accent-fuchsia-500"
              />
              Mostrar contador (visual)
            </label>
          </div>
        )}
      </div>
    </RichBlockFrame>
  );
}

export const SocialShareExtension = Node.create({
  name: 'socialShare',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      networks: {
        default: ['twitter', 'facebook', 'linkedin'],
        parseHTML: el => {
          try {
            return JSON.parse(el.getAttribute('data-social-share') || '{}').networks || ['twitter', 'facebook', 'linkedin'];
          } catch {
            return ['twitter', 'facebook', 'linkedin'];
          }
        },
        renderHTML: () => ({}),
      },
      style: {
        default: 'icons',
        parseHTML: el => {
          try {
            return JSON.parse(el.getAttribute('data-social-share') || '{}').style || 'icons';
          } catch {
            return 'icons';
          }
        },
        renderHTML: () => ({}),
      },
      shape: {
        default: 'rounded',
        parseHTML: el => {
          try {
            return JSON.parse(el.getAttribute('data-social-share') || '{}').shape || 'rounded';
          } catch {
            return 'rounded';
          }
        },
        renderHTML: () => ({}),
      },
      size: {
        default: 'md',
        parseHTML: el => {
          try {
            return JSON.parse(el.getAttribute('data-social-share') || '{}').size || 'md';
          } catch {
            return 'md';
          }
        },
        renderHTML: () => ({}),
      },
      showCount: {
        default: false,
        parseHTML: el => {
          try {
            return JSON.parse(el.getAttribute('data-social-share') || '{}').showCount || false;
          } catch {
            return false;
          }
        },
        renderHTML: () => ({}),
      },
      layout: {
        default: 'horizontal',
        parseHTML: el => {
          try {
            return JSON.parse(el.getAttribute('data-social-share') || '{}').layout || 'horizontal';
          } catch {
            return 'horizontal';
          }
        },
        renderHTML: () => ({}),
      },
      textAlign: createRichBlockTextAlignAttribute(),
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-social-share]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const config = {
      networks: node.attrs.networks || ['twitter', 'facebook', 'linkedin'],
      style: node.attrs.style || 'icons',
      shape: node.attrs.shape || 'rounded',
      size: node.attrs.size || 'md',
      showCount: node.attrs.showCount || false,
      layout: node.attrs.layout || 'horizontal',
    };

    return [
      'div',
      mergeAttributes(
        getRichBlockHtmlAttributes(HTMLAttributes, node.attrs.textAlign, {
          'data-social-share': JSON.stringify(config),
        })
      ),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SocialShareView);
  },

  addCommands() {
    return {
      insertSocialShare: attrs => ({ commands }) =>
        commands.insertContent({
          type: this.name,
          attrs: {
            networks: ['twitter', 'facebook', 'linkedin'],
            style: 'icons',
            shape: 'rounded',
            size: 'md',
            showCount: false,
            layout: 'horizontal',
            ...attrs,
          },
        }),
    };
  },
});
