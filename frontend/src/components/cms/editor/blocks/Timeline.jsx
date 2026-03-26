import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import RichBlockFrame from '../RichBlockFrame';
import { createRichBlockTextAlignAttribute, getRichBlockHtmlAttributes } from '../blockAlignment';

const TIMELINE_THEMES = {
  default: { name: 'Por defecto', icon: '📅' },
  minimal: { name: 'Minimalista', icon: '⚪' },
  bold: { name: 'Audaz', icon: '🔥' },
};

const TIMELINE_LAYOUTS = {
  vertical: { name: 'Vertical', icon: '↓' },
  horizontal: { name: 'Horizontal', icon: '→' },
};

function TimelineView({ node, updateAttributes, selected, deleteNode }) {
  const events = node.attrs.events || [];
  const layout = node.attrs.layout || 'vertical';
  const theme = node.attrs.theme || 'default';

  function updateEvent(index, updates) {
    const newEvents = [...events];
    newEvents[index] = { ...newEvents[index], ...updates };
    updateAttributes({ events: newEvents });
  }

  function addEvent() {
    updateAttributes({
      events: [
        ...events,
        {
          date: new Date().toISOString().split('T')[0],
          title: 'Nuevo evento',
          description: 'Descripción del evento',
          icon: '📌',
        },
      ],
    });
  }

  function removeEvent(index) {
    updateAttributes({ events: events.filter((_, i) => i !== index) });
  }

  function moveEvent(index, direction) {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === events.length - 1)
    ) {
      return;
    }

    const newEvents = [...events];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newEvents[index], newEvents[targetIndex]] = [newEvents[targetIndex], newEvents[index]];
    updateAttributes({ events: newEvents });
  }

  const themeClasses = {
    default: 'from-violet-900/10 to-fuchsia-900/10',
    minimal: 'from-slate-900/5 to-slate-800/5',
    bold: 'from-orange-900/20 to-red-900/20',
  };

  const lineColors = {
    default: 'bg-gradient-to-b from-fuchsia-500 to-cyan-500',
    minimal: 'bg-slate-400',
    bold: 'bg-gradient-to-b from-orange-500 to-red-500',
  };

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
        <div className={`${layout === 'horizontal' ? 'overflow-x-auto' : ''}`}>
          <div
            className={`${
              layout === 'vertical'
                ? 'relative space-y-8 border-l-2 pl-8'
                : 'flex gap-8 pb-8 pt-12'
            } ${layout === 'vertical' ? lineColors[theme] : ''}`}
          >
            {layout === 'horizontal' && (
              <div
                className={`absolute left-0 top-6 h-0.5 ${lineColors[theme]}`}
                style={{ width: `${events.length * 280}px` }}
              />
            )}

            {events.map((event, index) => (
              <div
                key={index}
                className={`relative ${layout === 'horizontal' ? 'min-w-[260px]' : ''}`}
              >
                {/* Timeline dot/marker */}
                <div
                  className={`absolute flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--bg-primary)] ${
                    theme === 'default'
                      ? 'bg-gradient-to-br from-fuchsia-500 to-cyan-500'
                      : theme === 'minimal'
                      ? 'bg-slate-400'
                      : 'bg-gradient-to-br from-orange-500 to-red-500'
                  } text-lg ${
                    layout === 'vertical' ? '-left-[2.6rem] top-0' : 'left-0 -top-11'
                  }`}
                >
                  {event.icon || '📌'}
                </div>

                {/* Event card */}
                <div
                  className={`group rounded-xl border border-[var(--border-color)] bg-gradient-to-br ${themeClasses[theme]} p-4 transition-transform hover:-translate-y-1`}
                >
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    {event.date || 'Fecha'}
                  </div>
                  <h4 className="mb-1 text-lg font-bold text-[var(--text-primary)]">
                    {event.title || 'Título'}
                  </h4>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                    {event.description || 'Descripción'}
                  </p>

                  {selected && (
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => moveEvent(index, 'up')}
                        disabled={index === 0}
                        className="rounded bg-slate-700/50 px-2 py-1 text-xs text-slate-300 disabled:opacity-30"
                        title="Mover arriba"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveEvent(index, 'down')}
                        disabled={index === events.length - 1}
                        className="rounded bg-slate-700/50 px-2 py-1 text-xs text-slate-300 disabled:opacity-30"
                        title="Mover abajo"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeEvent(index)}
                        className="ml-auto rounded bg-red-500/20 px-2 py-1 text-xs text-red-400"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Editor controls */}
        {selected && (
          <div className="mt-4 space-y-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)]/65 p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                Editar timeline
              </h4>
              <button
                type="button"
                onClick={addEvent}
                className="rounded-lg border border-fuchsia-500/40 bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-300"
              >
                + Añadir evento
              </button>
            </div>

            {/* Layout selector */}
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
                Diseño
              </label>
              <div className="flex gap-2">
                {Object.entries(TIMELINE_LAYOUTS).map(([key, { name, icon }]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => updateAttributes({ layout: key })}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                      layout === key
                        ? 'border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-300'
                        : 'border-[var(--border-color)] bg-[var(--bg-primary)]/60 text-[var(--text-muted)] hover:border-fuchsia-500/50'
                    }`}
                  >
                    {icon} {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme selector */}
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
                Tema
              </label>
              <div className="flex gap-2">
                {Object.entries(TIMELINE_THEMES).map(([key, { name, icon }]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => updateAttributes({ theme: key })}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                      theme === key
                        ? 'border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-300'
                        : 'border-[var(--border-color)] bg-[var(--bg-primary)]/60 text-[var(--text-muted)] hover:border-fuchsia-500/50'
                    }`}
                  >
                    {icon} {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Event editors */}
            <div className="space-y-2">
              {events.map((event, index) => (
                <div
                  key={index}
                  className="space-y-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]/60 p-3"
                >
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      type="date"
                      value={event.date || ''}
                      onChange={(e) => updateEvent(index, { date: e.target.value })}
                      className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
                    />
                    <input
                      type="text"
                      value={event.icon || ''}
                      onChange={(e) => updateEvent(index, { icon: e.target.value })}
                      placeholder="📌 Icono/emoji"
                      maxLength={2}
                      className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
                    />
                  </div>
                  <input
                    type="text"
                    value={event.title || ''}
                    onChange={(e) => updateEvent(index, { title: e.target.value })}
                    placeholder="Título del evento"
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
                  />
                  <textarea
                    value={event.description || ''}
                    onChange={(e) => updateEvent(index, { description: e.target.value })}
                    placeholder="Descripción del evento"
                    rows={2}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </RichBlockFrame>
  );
}

export const TimelineExtension = Node.create({
  name: 'timelineBlock',
  group: 'block',
  atom: true,
  defining: true,
  addAttributes() {
    return {
      events: {
        default: [
          {
            date: '2024-01-15',
            title: 'Inicio del proyecto',
            description: 'Planificación inicial y definición de objetivos',
            icon: '🚀',
          },
          {
            date: '2024-03-20',
            title: 'Primera versión',
            description: 'Lanzamiento de la versión beta',
            icon: '✨',
          },
          {
            date: '2024-06-10',
            title: 'Versión final',
            description: 'Lanzamiento oficial al público',
            icon: '🎉',
          },
        ],
      },
      layout: { default: 'vertical' },
      theme: { default: 'default' },
      textAlign: createRichBlockTextAlignAttribute(),
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-timeline]' }, { tag: 'div[data-block="timeline"]' }];
  },
  renderHTML({ node, HTMLAttributes }) {
    const { events, layout, theme } = node.attrs;

    return [
      'div',
      mergeAttributes(
        getRichBlockHtmlAttributes(HTMLAttributes, node.attrs.textAlign, {
          'data-block': 'timeline',
          'data-timeline': '',
          'data-layout': layout,
          'data-theme': theme,
          'data-events': JSON.stringify(events),
          style: 'margin:1.5em 0;',
        })
      ),
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(TimelineView);
  },
  addCommands() {
    return {
      insertTimeline: () => ({ commands }) =>
        commands.insertContent({
          type: this.name,
          attrs: {
            events: [
              {
                date: '2024-01-15',
                title: 'Inicio del proyecto',
                description: 'Planificación inicial y definición de objetivos',
                icon: '🚀',
              },
              {
                date: '2024-03-20',
                title: 'Primera versión',
                description: 'Lanzamiento de la versión beta',
                icon: '✨',
              },
              {
                date: '2024-06-10',
                title: 'Versión final',
                description: 'Lanzamiento oficial al público',
                icon: '🎉',
              },
            ],
            layout: 'vertical',
            theme: 'default',
          },
        }),
    };
  },
});
