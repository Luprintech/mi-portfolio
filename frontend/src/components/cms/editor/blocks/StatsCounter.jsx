import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { useState } from 'react';
import RichBlockFrame from '../RichBlockFrame';
import { createRichBlockTextAlignAttribute, getRichBlockHtmlAttributes } from '../blockAlignment';

function StatsCounterView({ node, updateAttributes, selected, deleteNode }) {
  const stats = node.attrs.stats || [];
  const layout = node.attrs.layout || 'grid';
  
  function updateStat(index, updates) {
    const newStats = [...stats];
    newStats[index] = { ...newStats[index], ...updates };
    updateAttributes({ stats: newStats });
  }

  function addStat() {
    updateAttributes({ stats: [...stats, { number: '100', label: 'Nueva métrica', suffix: '+' }] });
  }

  function removeStat(index) {
    updateAttributes({ stats: stats.filter((_, i) => i !== index) });
  }

  return (
    <RichBlockFrame
      alignment={node.attrs.textAlign}
      selected={selected}
      onRemove={deleteNode}
      wrapperClassName="my-6"
      frameClassName="w-full"
    >
      <div className={`${selected ? 'ring-2 ring-fuchsia-500 ring-offset-2 rounded-2xl' : ''}`} contentEditable={false}>
        <div className={`grid gap-6 ${layout === 'grid' ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1'}`}>
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl border border-[var(--border-color)] bg-gradient-to-br from-violet-900/10 to-fuchsia-900/10 p-6 text-center"
            >
              <div className="mb-2 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-cyan-500">
                {stat.number}{stat.suffix}
              </div>
              <p className="text-sm font-medium text-[var(--text-muted)]">{stat.label}</p>
              
              {selected && (
                <button
                  type="button"
                  onClick={() => removeStat(index)}
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20 text-red-400 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {selected && (
          <div className="mt-4 space-y-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)]/65 p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-[var(--text-primary)]">Editar estadísticas</h4>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => updateAttributes({ layout: layout === 'grid' ? 'list' : 'grid' })}
                  className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]/60 px-3 py-1 text-xs text-[var(--text-muted)]"
                >
                  {layout === 'grid' ? 'Grid' : 'Lista'}
                </button>
                <button
                  type="button"
                  onClick={addStat}
                  className="rounded-lg border border-fuchsia-500/40 bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-300"
                >
                  + Añadir
                </button>
              </div>
            </div>

            {stats.map((stat, index) => (
              <div key={index} className="grid gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]/60 p-3 sm:grid-cols-3">
                <input
                  type="text"
                  value={stat.number}
                  onChange={(e) => updateStat(index, { number: e.target.value })}
                  placeholder="100"
                  className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
                />
                <input
                  type="text"
                  value={stat.suffix}
                  onChange={(e) => updateStat(index, { suffix: e.target.value })}
                  placeholder="+"
                  className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
                />
                <input
                  type="text"
                  value={stat.label}
                  onChange={(e) => updateStat(index, { label: e.target.value })}
                  placeholder="Métrica"
                  className="sm:col-span-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </RichBlockFrame>
  );
}

export const StatsCounterExtension = Node.create({
  name: 'statsCounter',
  group: 'block',
  atom: true,
  defining: true,
  addAttributes() {
    return {
      stats: {
        default: [
          { number: '500', suffix: '+', label: 'Proyectos completados' },
          { number: '98', suffix: '%', label: 'Satisfacción' },
        ],
      },
      layout: { default: 'grid' },
      textAlign: createRichBlockTextAlignAttribute(),
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-stats-counter]' }, { tag: 'div[data-block="stats-counter"]' }];
  },
  renderHTML({ node, HTMLAttributes }) {
    const { stats, layout } = node.attrs;
    
    return ['div', mergeAttributes(getRichBlockHtmlAttributes(HTMLAttributes, node.attrs.textAlign, {
      'data-block': 'stats-counter',
      'data-stats-counter': '',
      'data-layout': layout,
      'data-stats': JSON.stringify(stats),
      style: 'margin:1.5em 0;',
    }))];
  },
  addNodeView() {
    return ReactNodeViewRenderer(StatsCounterView);
  },
  addCommands() {
    return {
      insertStatsCounter: () => ({ commands }) => commands.insertContent({
        type: this.name,
        attrs: {
          stats: [
            { number: '500', suffix: '+', label: 'Proyectos completados' },
            { number: '98', suffix: '%', label: 'Satisfacción del cliente' },
          ],
          layout: 'grid',
        },
      }),
    };
  },
});
