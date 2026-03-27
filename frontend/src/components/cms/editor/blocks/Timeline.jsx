import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import React from 'react';
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

// Lista de iconos predefinidos para seleccionar
const ICON_OPTIONS = [
  '📌', '🚀', '💡', '🎯', '⭐', '🔥', '💎', '🏆', '🎉', '✨',
  '📅', '🗓️', '⏰', '⚡', '💪', '🎨', '🔧', '📱', '💻', '🌐',
  '🎓', '📚', '🔬', '💼', '🏠', '✈️', '🎸', '📷', '🎬', '💡',
];

// Opciones de color para línea y fondo
const LINE_COLOR_OPTIONS = [
  { value: 'fuchsia-cyan', label: 'Fuchsia → Cyan', class: 'from-fuchsia-500 to-cyan-500', bgClass: 'bg-gradient-to-b from-fuchsia-500 to-cyan-500' },
  { value: 'blue-cyan', label: 'Blue → Cyan', class: 'from-blue-500 to-cyan-500', bgClass: 'bg-gradient-to-b from-blue-500 to-cyan-500' },
  { value: 'purple-pink', label: 'Purple → Pink', class: 'from-purple-500 to-pink-500', bgClass: 'bg-gradient-to-b from-purple-500 to-pink-500' },
  { value: 'orange-red', label: 'Orange → Red', class: 'from-orange-500 to-red-500', bgClass: 'bg-gradient-to-b from-orange-500 to-red-500' },
  { value: 'green-teal', label: 'Green → Teal', class: 'from-green-500 to-teal-500', bgClass: 'bg-gradient-to-b from-green-500 to-teal-500' },
  { value: 'yellow-amber', label: 'Yellow → Amber', class: 'from-yellow-500 to-amber-500', bgClass: 'bg-gradient-to-b from-yellow-500 to-amber-500' },
  { value: 'slate', label: 'Gris (Minimal)', class: 'slate-400', bgClass: 'bg-slate-400' },
  { value: 'white', label: 'Blanco', class: 'white', bgClass: 'bg-white' },
];

const CARD_BG_OPTIONS = [
  { value: 'violet-fuchsia', label: 'Violet → Fuchsia', class: 'from-violet-900/10 to-fuchsia-900/10' },
  { value: 'blue-indigo', label: 'Blue → Indigo', class: 'from-blue-900/10 to-indigo-900/10' },
  { value: 'emerald-teal', label: 'Emerald → Teal', class: 'from-emerald-900/10 to-teal-900/10' },
  { value: 'orange-amber', label: 'Orange → Amber', class: 'from-orange-900/10 to-amber-900/10' },
  { value: 'slate', label: 'Gris (Minimal)', class: 'from-slate-900/5 to-slate-800/5' },
  { value: 'white', label: 'Blanco', class: 'from-white/10 to-white/5' },
  { value: 'transparent', label: 'Transparente', class: 'from-transparent to-transparent' },
];

// Opciones de tamaño
const SIZE_OPTIONS = [
  { value: 'sm', label: 'Pequeño' },
  { value: 'md', label: 'Mediano' },
  { value: 'lg', label: 'Grande' },
];

function TimelineView({ node, updateAttributes, selected, deleteNode }) {
  const events = node.attrs.events || [];
  const layout = node.attrs.layout || 'vertical';
  const theme = node.attrs.theme || 'default';
  const lineColor = node.attrs.lineColor || 'fuchsia-cyan';
  const cardBg = node.attrs.cardBg || 'violet-fuchsia';
  const size = node.attrs.size || 'md';

  // Estado para el popup de iconos
  const [showIconPicker, setShowIconPicker] = React.useState(null);

  // Encontrar el estilo de línea correspondiente
  const currentLineColor = LINE_COLOR_OPTIONS.find(c => c.value === lineColor) || LINE_COLOR_OPTIONS[0];
  const currentCardBg = CARD_BG_OPTIONS.find(c => c.value === cardBg) || CARD_BG_OPTIONS[0];

  // Determinar clases de tamaño
  const sizeClasses = {
    sm: { date: 'text-[10px]', title: 'text-sm', desc: 'text-xs', dot: 'h-8 w-8 text-sm', card: 'p-3' },
    md: { date: 'text-xs', title: 'text-base', desc: 'text-sm', dot: 'h-10 w-10 text-lg', card: 'p-4' },
    lg: { date: 'text-sm', title: 'text-lg', desc: 'text-base', dot: 'h-12 w-12 text-xl', card: 'p-5' },
  };

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
            } ${currentLineColor.bgClass}`}
          >
            {layout === 'horizontal' && (
              <div
                className={`absolute left-0 top-6 h-0.5 ${currentLineColor.bgClass}`}
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
                  className={`absolute flex ${sizeClasses[size].dot} items-center justify-center rounded-full border-2 border-[var(--bg-primary)] ${currentLineColor.bgClass} ${
                    layout === 'vertical' ? '-left-[2.6rem] top-0' : 'left-0 -top-11'
                  }`}
                >
                  {event.icon || '📌'}
                </div>

                {/* Event card */}
                <div
                  className={`group rounded-xl border border-[var(--bg-primary)]/30 bg-gradient-to-br ${currentCardBg.class} ${sizeClasses[size].card} transition-transform hover:-translate-y-1`}
                >
                  <div className={`mb-2 font-semibold uppercase tracking-wider text-[var(--text-muted)] ${sizeClasses[size].date}`}>
                    {event.date || 'Fecha'}
                  </div>
                  <h4 className={`mb-1 font-bold text-[var(--text-primary)] ${sizeClasses[size].title}`}>
                    {event.title || 'Título'}
                  </h4>
                  <p className={`leading-relaxed text-[var(--text-secondary)] ${sizeClasses[size].desc}`}>
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

            {/* Color de línea selector */}
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
                Color de línea
              </label>
              <div className="flex flex-wrap gap-2">
                {LINE_COLOR_OPTIONS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => updateAttributes({ lineColor: color.value })}
                    className={`h-8 w-8 rounded-full border-2 transition-all ${
                      lineColor === color.value
                        ? 'border-fuchsia-500 scale-110'
                        : 'border-transparent hover:scale-105'
                    } ${color.bgClass}`}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            {/* Color de fondo de tarjetas selector */}
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
                Fondo de tarjetas
              </label>
              <div className="flex flex-wrap gap-2">
                {CARD_BG_OPTIONS.map((bg) => (
                  <button
                    key={bg.value}
                    type="button"
                    onClick={() => updateAttributes({ cardBg: bg.value })}
                    className={`h-6 w-6 rounded border ${
                      cardBg === bg.value
                        ? 'ring-2 ring-fuchsia-500'
                        : 'border-[var(--border-color)]'
                    } bg-gradient-to-br ${bg.class}`}
                    title={bg.label}
                  />
                ))}
              </div>
            </div>

            {/* Tamaño selector */}
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
                Tamaño
              </label>
              <div className="flex gap-2">
                {SIZE_OPTIONS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => updateAttributes({ size: s.value })}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                      size === s.value
                        ? 'border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-300'
                        : 'border-[var(--border-color)] bg-[var(--bg-primary)]/60 text-[var(--text-muted)] hover:border-fuchsia-500/50'
                    }`}
                  >
                    {s.label}
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
                    {/* Selector de icono */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowIconPicker(showIconPicker === index ? null : index)}
                        className="flex w-full items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500 hover:bg-[var(--bg-elevated)]"
                      >
                        <span className="text-lg">{event.icon || '📌'}</span>
                        <span className="text-xs text-[var(--text-muted)]">Elegir icono</span>
                      </button>
                      {/* Dropdown de iconos */}
                      {showIconPicker === index && (
                        <div className="absolute z-10 mt-1 w-full grid grid-cols-6 gap-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] p-2 shadow-xl max-h-40 overflow-y-auto">
                          {ICON_OPTIONS.map((icon) => (
                            <button
                              key={icon}
                              type="button"
                              onClick={() => {
                                updateEvent(index, { icon });
                                setShowIconPicker(null);
                              }}
                              className={`flex h-8 w-8 items-center justify-center rounded hover:bg-fuchsia-500/20 text-lg ${event.icon === icon ? 'bg-fuchsia-500/30' : ''}`}
                            >
                              {icon}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
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
      lineColor: { default: 'fuchsia-cyan' },
      cardBg: { default: 'violet-fuchsia' },
      size: { default: 'md' },
      textAlign: createRichBlockTextAlignAttribute(),
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-timeline]' }, { tag: 'div[data-block="timeline"]' }];
  },
  renderHTML({ node, HTMLAttributes }) {
    const { events, layout, theme, lineColor, cardBg, size } = node.attrs;

    return [
      'div',
      mergeAttributes(
        getRichBlockHtmlAttributes(HTMLAttributes, node.attrs.textAlign, {
          'data-block': 'timeline',
          'data-timeline': '',
          'data-layout': layout,
          'data-theme': theme,
          'data-line-color': lineColor,
          'data-card-bg': cardBg,
          'data-size': size,
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
            lineColor: 'fuchsia-cyan',
            cardBg: 'violet-fuchsia',
            size: 'md',
          },
        }),
    };
  },
});
