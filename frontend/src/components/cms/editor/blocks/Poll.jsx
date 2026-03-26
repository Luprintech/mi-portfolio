import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import RichBlockFrame from '../RichBlockFrame';
import { createRichBlockTextAlignAttribute, getRichBlockHtmlAttributes } from '../blockAlignment';

function PollView({ node, updateAttributes, selected, deleteNode }) {
  const question = node.attrs.question || '';
  const options = node.attrs.options || [];
  const style = node.attrs.style || 'cards';

  function updateOption(index, updates) {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], ...updates };
    updateAttributes({ options: newOptions });
  }

  function addOption() {
    if (options.length >= 6) return;
    const newId = `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    updateAttributes({ 
      options: [...options, { id: newId, text: '' }] 
    });
  }

  function removeOption(index) {
    if (options.length <= 2) return;
    updateAttributes({ options: options.filter((_, i) => i !== index) });
  }

  const hasMinOptions = options.length >= 2;
  const hasMaxOptions = options.length >= 6;

  // Mock percentages for preview
  const mockPercentages = options.map((_, idx) => 
    idx === 0 ? 45 : Math.floor(Math.random() * 30) + 15
  );

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
        {/* Preview */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-elevated)]/50 p-6">
          <div className="mb-4 flex items-start gap-2">
            <span className="text-2xl">📊</span>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                {question || 'Escribe tu pregunta de encuesta aquí...'}
              </h3>
            </div>
          </div>

          {/* Options preview */}
          <div className={`gap-3 ${
            style === 'grid' ? 'grid grid-cols-2' : 
            style === 'list' ? 'flex flex-col' : 
            'grid grid-cols-1 sm:grid-cols-2'
          }`}>
            {options.map((opt, idx) => (
              <div
                key={opt.id}
                className={`
                  group relative overflow-hidden rounded-xl border-2 border-[var(--border-color)] bg-[var(--bg-surface)]/50 p-4 transition-all hover:border-fuchsia-500/50
                  ${style === 'cards' ? 'shadow-sm' : ''}
                `}
              >
                <div className="relative z-10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--bg-elevated)] text-xs font-medium text-[var(--text-muted)]">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <p className="flex-1 text-sm text-[var(--text-primary)]">
                      {opt.text || `Opción ${idx + 1}`}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-fuchsia-400">
                    {mockPercentages[idx]}%
                  </span>
                </div>
                
                {/* Progress bar background */}
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 to-cyan-500/10 transition-all"
                  style={{ width: `${mockPercentages[idx]}%` }}
                />
              </div>
            ))}
          </div>

          <p className="mt-3 text-center text-xs text-[var(--text-muted)]">
            Vista previa — Los resultados se mostrarán tras votar
          </p>
        </div>

        {/* Editor panel */}
        {selected && (
          <div className="mt-4 space-y-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] p-4">
            <div>
              <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                Pregunta de encuesta
              </label>
              <input
                type="text"
                value={question}
                onChange={(e) => updateAttributes({ question: e.target.value })}
                placeholder="¿Cuál es tu lenguaje de programación favorito?"
                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                  Opciones ({options.length}/6)
                </label>
                <button
                  type="button"
                  onClick={addOption}
                  disabled={hasMaxOptions}
                  className="rounded-lg border border-fuchsia-500/40 bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-300 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  + Añadir opción
                </button>
              </div>

              <div className="space-y-2">
                {options.map((opt, idx) => (
                  <div
                    key={opt.id}
                    className="flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] p-2"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--bg-elevated)] text-xs font-medium text-[var(--text-muted)]">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => updateOption(idx, { text: e.target.value })}
                      placeholder={`Opción ${idx + 1}`}
                      className="flex-1 rounded border-0 bg-transparent px-2 py-1 text-sm text-[var(--text-primary)] outline-none focus:bg-[var(--bg-elevated)]"
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(idx)}
                      disabled={!hasMinOptions}
                      className="flex h-6 w-6 items-center justify-center rounded-full text-red-400 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-30"
                      title="Eliminar opción"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 border-t border-[var(--border-color)] pt-3">
              <label className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                Estilo visual
              </label>
              <div className="flex gap-1.5">
                {[
                  { key: 'cards', label: 'Cards' },
                  { key: 'list', label: 'Lista' },
                  { key: 'grid', label: 'Grid' },
                ].map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => updateAttributes({ style: option.key })}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      style === option.key
                        ? 'bg-fuchsia-500 text-white'
                        : 'border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)]'
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

export const PollExtension = Node.create({
  name: 'poll',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      question: {
        default: '',
        parseHTML: (el) => {
          const data = el.getAttribute('data-poll');
          if (data) {
            try {
              return JSON.parse(data).question || '';
            } catch { return ''; }
          }
          return '';
        },
        renderHTML: () => ({}),
      },
      options: {
        default: [
          { id: 'opt_1', text: 'Opción 1' },
          { id: 'opt_2', text: 'Opción 2' },
        ],
        parseHTML: (el) => {
          const data = el.getAttribute('data-poll');
          if (data) {
            try {
              return JSON.parse(data).options || [];
            } catch { return []; }
          }
          return [];
        },
        renderHTML: () => ({}),
      },
      style: {
        default: 'cards',
        parseHTML: (el) => {
          const data = el.getAttribute('data-poll');
          if (data) {
            try {
              return JSON.parse(data).style || 'cards';
            } catch { return 'cards'; }
          }
          return 'cards';
        },
        renderHTML: () => ({}),
      },
      textAlign: createRichBlockTextAlignAttribute(),
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-poll]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const pollData = {
      question: node.attrs.question,
      options: node.attrs.options,
      style: node.attrs.style,
    };

    return [
      'div',
      mergeAttributes(
        getRichBlockHtmlAttributes(HTMLAttributes, node.attrs.textAlign, {
          'data-poll': JSON.stringify(pollData),
          class: 'poll-block',
        })
      ),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PollView);
  },

  addCommands() {
    return {
      insertPoll: () => ({ commands }) =>
        commands.insertContent({
          type: this.name,
          attrs: {
            question: '¿Cuál es tu opinión?',
            options: [
              { id: `opt_${Date.now()}_1`, text: 'Opción 1' },
              { id: `opt_${Date.now()}_2`, text: 'Opción 2' },
            ],
            style: 'cards',
          },
        }),
    };
  },
});
