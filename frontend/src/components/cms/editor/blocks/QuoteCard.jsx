import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import RichBlockFrame from '../RichBlockFrame';
import { createRichBlockTextAlignAttribute, getRichBlockHtmlAttributes } from '../blockAlignment';

const QUOTE_STYLES = {
  classic: { name: 'Clásico', icon: '"' },
  modern: { name: 'Moderno', icon: '💬' },
  elegant: { name: 'Elegante', icon: '✨' },
  bold: { name: 'Audaz', icon: '💪' },
};

function QuoteCardView({ node, updateAttributes, selected, deleteNode }) {
  const quote = node.attrs.quote || '';
  const author = node.attrs.author || '';
  const role = node.attrs.role || '';
  const style = node.attrs.style || 'modern';

  return (
    <RichBlockFrame
      alignment={node.attrs.textAlign}
      selected={selected}
      onRemove={deleteNode}
      wrapperClassName="my-6"
      frameClassName="w-full"
    >
      <div className={`relative ${selected ? 'ring-2 ring-fuchsia-500 ring-offset-2 rounded-2xl' : ''}`} contentEditable={false}>
        <div className={`rounded-2xl border border-[var(--border-color)] bg-gradient-to-br p-6 ${
          style === 'classic' ? 'from-slate-900 to-slate-800' :
          style === 'modern' ? 'from-violet-900/20 to-fuchsia-900/20' :
          style === 'elegant' ? 'from-emerald-900/20 to-teal-900/20' :
          'from-orange-900/20 to-red-900/20'
        }`}>
          <div className="mb-4 text-6xl opacity-20">
            {style === 'classic' ? '"' : style === 'modern' ? '💬' : style === 'elegant' ? '✨' : '💪'}
          </div>
          
          <blockquote className="mb-4 text-xl font-medium italic leading-relaxed text-[var(--text-primary)]">
            {quote || 'Escribe tu cita aquí...'}
          </blockquote>
          
          {(author || role) && (
            <div className="flex items-center gap-3 border-t border-[var(--border-color)] pt-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-500 text-lg font-bold text-white">
                {author ? author[0].toUpperCase() : '?'}
              </div>
              <div>
                <p className="font-semibold text-[var(--text-primary)]">{author || 'Autor'}</p>
                {role && <p className="text-sm text-[var(--text-muted)]">{role}</p>}
              </div>
            </div>
          )}
        </div>

        {selected && (
          <div className="mt-3 space-y-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)]/65 p-3">
            <textarea
              value={quote}
              onChange={(e) => updateAttributes({ quote: e.target.value })}
              placeholder="Escribe la cita..."
              rows={3}
              className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                type="text"
                value={author}
                onChange={(e) => updateAttributes({ author: e.target.value })}
                placeholder="Nombre del autor"
                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
              />
              <input
                type="text"
                value={role}
                onChange={(e) => updateAttributes({ role: e.target.value })}
                placeholder="Rol o cargo (opcional)"
                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
              />
            </div>
            <div className="flex gap-2">
              {Object.entries(QUOTE_STYLES).map(([key, { name, icon }]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => updateAttributes({ style: key })}
                  className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                    style === key
                      ? 'border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-300'
                      : 'border-[var(--border-color)] bg-[var(--bg-primary)]/60 text-[var(--text-muted)] hover:border-fuchsia-500/50'
                  }`}
                >
                  {icon} {name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </RichBlockFrame>
  );
}

export const QuoteCardExtension = Node.create({
  name: 'quoteCard',
  group: 'block',
  atom: true,
  defining: true,
  addAttributes() {
    return {
      quote: { default: '' },
      author: { default: '' },
      role: { default: '' },
      style: { default: 'modern' },
      textAlign: createRichBlockTextAlignAttribute(),
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-quote-card]' }, { tag: 'div[data-block="quote-card"]' }];
  },
  renderHTML({ node, HTMLAttributes }) {
    const { quote, author, role, style } = node.attrs;
    
    const bgClass = style === 'classic' ? 'background:linear-gradient(to bottom right,#0f172a,#1e293b)' :
                    style === 'modern' ? 'background:linear-gradient(to bottom right,rgba(139,92,246,0.2),rgba(232,121,249,0.2))' :
                    style === 'elegant' ? 'background:linear-gradient(to bottom right,rgba(16,185,129,0.2),rgba(20,184,166,0.2))' :
                    'background:linear-gradient(to bottom right,rgba(249,115,22,0.2),rgba(239,68,68,0.2))';
    
    return ['div', mergeAttributes(getRichBlockHtmlAttributes(HTMLAttributes, node.attrs.textAlign, {
      'data-block': 'quote-card',
      'data-quote-card': '',
      'data-style': style,
      style: `margin:1.5em 0;padding:1.5rem;border-radius:1rem;border:1px solid rgba(255,255,255,0.1);${bgClass}`,
    })), ...[
      ['blockquote', { style: 'font-size:1.25rem;font-style:italic;margin-bottom:1rem;color:var(--text-primary,#f1f5f9)' }, quote],
      author ? ['div', { style: 'display:flex;align-items:center;gap:0.75rem;border-top:1px solid rgba(255,255,255,0.1);padding-top:1rem;' },
        ['div', { style: 'width:3rem;height:3rem;border-radius:9999px;background:linear-gradient(to bottom right,#e879f9,#22d3ee);display:flex;align-items:center;justify-content:center;font-weight:700;color:white;' }, author[0]?.toUpperCase()],
        ['div', {},
          ['p', { style: 'font-weight:600;color:var(--text-primary,#f1f5f9)' }, author],
          role ? ['p', { style: 'font-size:0.875rem;color:var(--text-muted,#64748b)' }, role] : null,
        ].filter(Boolean),
      ] : null,
    ].filter(Boolean)];
  },
  addNodeView() {
    return ReactNodeViewRenderer(QuoteCardView);
  },
  addCommands() {
    return {
      insertQuoteCard: () => ({ commands }) => commands.insertContent({
        type: this.name,
        attrs: { quote: '', author: '', role: '', style: 'modern' },
      }),
    };
  },
});
