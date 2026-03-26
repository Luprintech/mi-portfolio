import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import RichBlockFrame from '../RichBlockFrame';
import { createRichBlockTextAlignAttribute, getRichBlockHtmlAttributes } from '../blockAlignment';

const CHART_TYPES = {
  line: { name: 'Línea', icon: '📈' },
  bar: { name: 'Barras', icon: '📊' },
  pie: { name: 'Circular', icon: '🥧' },
  area: { name: 'Área', icon: '📉' },
};

const DEFAULT_DATA = [
  { name: 'Ene', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Abr', value: 800 },
  { name: 'May', value: 500 },
];

const DEFAULT_COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

function ChartsBlockView({ node, updateAttributes, selected, deleteNode }) {
  const chartType = node.attrs.chartType || 'line';
  const data = node.attrs.data || DEFAULT_DATA;
  const title = node.attrs.title || '';
  const xKey = node.attrs.xKey || 'name';
  const yKey = node.attrs.yKey || 'value';
  const colors = node.attrs.colors || DEFAULT_COLORS;
  
  const [editMode, setEditMode] = useState('simple');
  const [jsonInput, setJsonInput] = useState(JSON.stringify(data, null, 2));
  const [jsonError, setJsonError] = useState('');

  function handleChartTypeChange(newType) {
    updateAttributes({ chartType: newType });
  }

  function handleTitleChange(e) {
    updateAttributes({ title: e.target.value });
  }

  function handleXKeyChange(e) {
    updateAttributes({ xKey: e.target.value });
  }

  function handleYKeyChange(e) {
    updateAttributes({ yKey: e.target.value });
  }

  function handleSimpleDataChange(index, field, value) {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: field === yKey ? Number(value) || 0 : value };
    updateAttributes({ data: newData });
    setJsonInput(JSON.stringify(newData, null, 2));
  }

  function addDataPoint() {
    const newData = [...data, { [xKey]: 'Nuevo', [yKey]: 0 }];
    updateAttributes({ data: newData });
    setJsonInput(JSON.stringify(newData, null, 2));
  }

  function removeDataPoint(index) {
    const newData = data.filter((_, i) => i !== index);
    updateAttributes({ data: newData });
    setJsonInput(JSON.stringify(newData, null, 2));
  }

  function handleJsonChange(value) {
    setJsonInput(value);
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        setJsonError('Los datos deben ser un array');
        return;
      }
      setJsonError('');
      updateAttributes({ data: parsed });
    } catch (error) {
      setJsonError('JSON inválido: ' + error.message);
    }
  }

  function handleColorChange(index, value) {
    const newColors = [...colors];
    newColors[index] = value;
    updateAttributes({ colors: newColors });
  }

  function renderChart() {
    if (!data || data.length === 0) {
      return (
        <div className="flex h-64 items-center justify-center text-sm text-[var(--text-muted)]">
          No hay datos para mostrar
        </div>
      );
    }

    const commonProps = {
      data,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
    };

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey={xKey} stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={yKey}
                stroke={colors[0]}
                strokeWidth={2}
                dot={{ fill: colors[0], r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey={xKey} stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey={yKey} radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey={yKey}
                nameKey={xKey}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart {...commonProps}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[0]} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={colors[0]} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey={xKey} stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey={yKey}
                stroke={colors[0]}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
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
        {/* Chart preview */}
        <div className="space-y-4 rounded-2xl border border-[var(--border-color)] bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-6">
          {title && (
            <h3 className="text-center text-xl font-semibold text-[var(--text-primary)]">
              {title}
            </h3>
          )}
          {renderChart()}
        </div>

        {/* Editor controls */}
        {selected && (
          <div className="mt-4 space-y-4 rounded-xl border border-[var(--border-color)] bg-slate-900/50 p-4">
            {/* Chart type selector */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-[var(--text-muted)]">
                Tipo de gráfico
              </label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(CHART_TYPES).map(([type, { name, icon }]) => (
                  <button
                    key={type}
                    onClick={() => handleChartTypeChange(type)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                      chartType === type
                        ? 'border-fuchsia-500 bg-fuchsia-500/20 text-fuchsia-400'
                        : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                    }`}
                  >
                    <span className="mr-1">{icon}</span>
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Title input */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-[var(--text-muted)]">
                Título (opcional)
              </label>
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="Título del gráfico"
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-fuchsia-500 focus:outline-none focus:ring-1 focus:ring-fuchsia-500"
              />
            </div>

            {/* Key names for non-pie charts */}
            {chartType !== 'pie' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-xs font-semibold text-[var(--text-muted)]">
                    Clave eje X
                  </label>
                  <input
                    type="text"
                    value={xKey}
                    onChange={handleXKeyChange}
                    placeholder="name"
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-fuchsia-500 focus:outline-none focus:ring-1 focus:ring-fuchsia-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold text-[var(--text-muted)]">
                    Clave eje Y
                  </label>
                  <input
                    type="text"
                    value={yKey}
                    onChange={handleYKeyChange}
                    placeholder="value"
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-fuchsia-500 focus:outline-none focus:ring-1 focus:ring-fuchsia-500"
                  />
                </div>
              </div>
            )}

            {/* Edit mode toggle */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-[var(--text-muted)]">
                Modo de edición
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setEditMode('simple')}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                    editMode === 'simple'
                      ? 'border-fuchsia-500 bg-fuchsia-500/20 text-fuchsia-400'
                      : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  Simple
                </button>
                <button
                  onClick={() => setEditMode('json')}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                    editMode === 'json'
                      ? 'border-fuchsia-500 bg-fuchsia-500/20 text-fuchsia-400'
                      : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  JSON avanzado
                </button>
              </div>
            </div>

            {/* Data editor */}
            {editMode === 'simple' ? (
              <div>
                <label className="mb-2 block text-xs font-semibold text-[var(--text-muted)]">
                  Datos
                </label>
                <div className="space-y-2">
                  {data.map((point, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={point[xKey] || ''}
                        onChange={(e) => handleSimpleDataChange(index, xKey, e.target.value)}
                        placeholder="Nombre"
                        className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-fuchsia-500 focus:outline-none focus:ring-1 focus:ring-fuchsia-500"
                      />
                      <input
                        type="number"
                        value={point[yKey] || 0}
                        onChange={(e) => handleSimpleDataChange(index, yKey, e.target.value)}
                        placeholder="Valor"
                        className="w-24 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-fuchsia-500 focus:outline-none focus:ring-1 focus:ring-fuchsia-500"
                      />
                      <button
                        onClick={() => removeDataPoint(index)}
                        className="rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-400 hover:bg-red-500/30"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addDataPoint}
                    className="w-full rounded-lg border border-dashed border-slate-600 bg-slate-800/50 px-3 py-2 text-sm text-slate-400 hover:border-fuchsia-500 hover:text-fuchsia-400"
                  >
                    + Añadir punto
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label className="mb-2 block text-xs font-semibold text-[var(--text-muted)]">
                  Datos (JSON)
                </label>
                <textarea
                  value={jsonInput}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  rows={8}
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 font-mono text-sm text-white placeholder-slate-500 focus:border-fuchsia-500 focus:outline-none focus:ring-1 focus:ring-fuchsia-500"
                  placeholder='[{"name": "Ene", "value": 400}]'
                />
                {jsonError && (
                  <p className="mt-1 text-xs text-red-400">{jsonError}</p>
                )}
              </div>
            )}

            {/* Color picker */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-[var(--text-muted)]">
                Colores
              </label>
              <div className="grid grid-cols-6 gap-2">
                {colors.slice(0, 6).map((color, index) => (
                  <div key={index} className="relative">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => handleColorChange(index, e.target.value)}
                      className="h-10 w-full cursor-pointer rounded-lg border border-slate-600"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </RichBlockFrame>
  );
}

export const ChartsBlockExtension = Node.create({
  name: 'chartsBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      chartType: { default: 'line' },
      data: { default: DEFAULT_DATA },
      title: { default: '' },
      xKey: { default: 'name' },
      yKey: { default: 'value' },
      colors: { default: DEFAULT_COLORS },
      textAlign: createRichBlockTextAlignAttribute(),
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="chart"]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'chart',
        'data-chart-type': node.attrs.chartType,
        'data-data': JSON.stringify(node.attrs.data),
        'data-title': node.attrs.title,
        'data-x-key': node.attrs.xKey,
        'data-y-key': node.attrs.yKey,
        'data-colors': JSON.stringify(node.attrs.colors),
        ...getRichBlockHtmlAttributes(node.attrs.textAlign),
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ChartsBlockView);
  },

  addCommands() {
    return {
      insertChart:
        (type = 'line') =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { chartType: type },
          });
        },
    };
  },
});
