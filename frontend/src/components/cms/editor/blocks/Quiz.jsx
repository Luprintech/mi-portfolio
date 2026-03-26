import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import RichBlockFrame from '../RichBlockFrame';
import { createRichBlockTextAlignAttribute, getRichBlockHtmlAttributes } from '../blockAlignment';

function QuizView({ node, updateAttributes, selected, deleteNode }) {
  const question = node.attrs.question || '';
  const options = node.attrs.options || [];
  const explanation = node.attrs.explanation || '';
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
      options: [...options, { id: newId, text: '', isCorrect: false }] 
    });
  }

  function removeOption(index) {
    if (options.length <= 2) return;
    updateAttributes({ options: options.filter((_, i) => i !== index) });
  }

  function setCorrectOption(index) {
    const newOptions = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    updateAttributes({ options: newOptions });
  }

  const hasMinOptions = options.length >= 2;
  const hasMaxOptions = options.length >= 6;

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
            <span className="text-2xl">❓</span>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                {question || 'Escribe tu pregunta aquí...'}
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
                  relative rounded-xl border-2 p-4 transition-all
                  ${opt.isCorrect 
                    ? 'border-green-500/50 bg-green-500/5' 
                    : 'border-[var(--border-color)] bg-[var(--bg-surface)]/50'
                  }
                  ${style === 'cards' ? 'shadow-sm' : ''}
                `}
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--bg-elevated)] text-xs font-medium text-[var(--text-muted)]">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <p className="flex-1 text-sm text-[var(--text-primary)]">
                    {opt.text || `Opción ${idx + 1}`}
                  </p>
                  {opt.isCorrect && (
                    <span className="text-green-500" title="Respuesta correcta">✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {explanation && (
            <div className="mt-4 rounded-lg border border-blue-500/30 bg-blue-500/5 p-3">
              <p className="text-xs text-[var(--text-muted)]">
                <strong>Explicación:</strong> {explanation}
              </p>
            </div>
          )}
        </div>

        {/* Editor panel */}
        {selected && (
          <div className="mt-4 space-y-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] p-4">
            <div>
              <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                Pregunta
              </label>
              <input
                type="text"
                value={question}
                onChange={(e) => updateAttributes({ question: e.target.value })}
                placeholder="¿Cuál es la capital de Francia?"
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
                    <input
                      type="radio"
                      name="correct-option"
                      checked={opt.isCorrect}
                      onChange={() => setCorrectOption(idx)}
                      className="h-4 w-4 cursor-pointer accent-green-500"
                      title="Marcar como correcta"
                    />
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

            <div>
              <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                Explicación (opcional)
              </label>
              <textarea
                value={explanation}
                onChange={(e) => updateAttributes({ explanation: e.target.value })}
                placeholder="Explica por qué esta es la respuesta correcta..."
                rows={2}
                className="w-full resize-none rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
              />
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

export const QuizExtension = Node.create({
  name: 'quiz',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      question: {
        default: '',
        parseHTML: (el) => {
          const data = el.getAttribute('data-quiz');
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
          { id: 'opt_1', text: 'Opción 1', isCorrect: true },
          { id: 'opt_2', text: 'Opción 2', isCorrect: false },
        ],
        parseHTML: (el) => {
          const data = el.getAttribute('data-quiz');
          if (data) {
            try {
              return JSON.parse(data).options || [];
            } catch { return []; }
          }
          return [];
        },
        renderHTML: () => ({}),
      },
      explanation: {
        default: '',
        parseHTML: (el) => {
          const data = el.getAttribute('data-quiz');
          if (data) {
            try {
              return JSON.parse(data).explanation || '';
            } catch { return ''; }
          }
          return '';
        },
        renderHTML: () => ({}),
      },
      style: {
        default: 'cards',
        parseHTML: (el) => {
          const data = el.getAttribute('data-quiz');
          if (data) {
            try {
              return JSON.parse(data).style || 'cards';
            } catch { return 'cards'; }
          }
          return 'cards';
        },
        renderHTML: () => ({}),
      },
      showResults: {
        default: false,
        parseHTML: (el) => {
          const data = el.getAttribute('data-quiz');
          if (data) {
            try {
              return JSON.parse(data).showResults || false;
            } catch { return false; }
          }
          return false;
        },
        renderHTML: () => ({}),
      },
      textAlign: createRichBlockTextAlignAttribute(),
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-quiz]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const quizData = {
      question: node.attrs.question,
      options: node.attrs.options,
      explanation: node.attrs.explanation,
      style: node.attrs.style,
      showResults: node.attrs.showResults,
    };

    return [
      'div',
      mergeAttributes(
        getRichBlockHtmlAttributes(HTMLAttributes, node.attrs.textAlign, {
          'data-quiz': JSON.stringify(quizData),
          class: 'quiz-block',
        })
      ),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(QuizView);
  },

  addCommands() {
    return {
      insertQuiz: () => ({ commands }) =>
        commands.insertContent({
          type: this.name,
          attrs: {
            question: '¿Cuál es tu pregunta?',
            options: [
              { id: `opt_${Date.now()}_1`, text: 'Opción 1', isCorrect: true },
              { id: `opt_${Date.now()}_2`, text: 'Opción 2', isCorrect: false },
            ],
            explanation: '',
            style: 'cards',
            showResults: false,
          },
        }),
    };
  },
});
