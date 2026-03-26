import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewContent } from '@tiptap/react';
import { useState } from 'react';
import RichBlockFrame from '../RichBlockFrame';
import { createRichBlockTextAlignAttribute, getRichBlockHtmlAttributes } from '../blockAlignment';

const TAB_STYLES = {
  underline: { name: 'Subrayado', icon: '_' },
  pills: { name: 'Píldoras', icon: '○' },
  boxed: { name: 'Cajas', icon: '▢' },
  minimal: { name: 'Minimal', icon: '·' },
};

const EMOJI_PRESETS = ['📄', '📊', '⚙️', '💡', '🎯', '📝', '🔧', '✨', '🚀', '📌'];

function TabsView({ node, updateAttributes, selected, deleteNode }) {
  const tabs = node.attrs.tabs || [];
  const style = node.attrs.style || 'underline';
  const alignment = node.attrs.alignment || 'left';
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id || null);

  const addTab = () => {
    if (tabs.length >= 6) return;
    const newTab = {
      id: `tab-${Date.now()}`,
      title: `Tab ${tabs.length + 1}`,
      icon: '',
      content: '',
    };
    const updatedTabs = [...tabs, newTab];
    updateAttributes({ tabs: updatedTabs });
    setActiveTabId(newTab.id);
  };

  const removeTab = (id) => {
    if (tabs.length <= 2) return;
    const updatedTabs = tabs.filter(t => t.id !== id);
    updateAttributes({ tabs: updatedTabs });
    if (activeTabId === id) {
      setActiveTabId(updatedTabs[0]?.id || null);
    }
  };

  const updateTab = (id, updates) => {
    const updatedTabs = tabs.map(t => t.id === id ? { ...t, ...updates } : t);
    updateAttributes({ tabs: updatedTabs });
  };

  const activeTab = tabs.find(t => t.id === activeTabId);

  const getTabButtonStyle = (isActive) => {
    const base = 'px-4 py-2 text-sm font-medium transition-all cursor-pointer';
    
    if (style === 'underline') {
      return `${base} border-b-2 ${isActive 
        ? 'border-fuchsia-500 text-fuchsia-400' 
        : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`;
    }
    
    if (style === 'pills') {
      return `${base} rounded-full ${isActive 
        ? 'bg-fuchsia-500/20 text-fuchsia-400 ring-1 ring-fuchsia-500/40' 
        : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-secondary)]'}`;
    }
    
    if (style === 'boxed') {
      return `${base} rounded-t-lg border-x border-t ${isActive 
        ? 'border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-400 -mb-px' 
        : 'border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`;
    }
    
    // minimal
    return `${base} ${isActive 
      ? 'text-fuchsia-400' 
      : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`;
  };

  const getAlignmentClass = () => {
    if (alignment === 'center') return 'justify-center';
    if (alignment === 'right') return 'justify-end';
    return 'justify-start';
  };

  return (
    <RichBlockFrame
      alignment={node.attrs.textAlign}
      selected={selected}
      onRemove={deleteNode}
      wrapperClassName="my-6"
      frameClassName="w-full"
    >
      <div className={`relative ${selected ? 'ring-2 ring-fuchsia-500 ring-offset-2 rounded-2xl p-2' : ''}`} contentEditable={false}>
        {/* Tab Headers */}
        <div className={`flex gap-1 ${getAlignmentClass()} ${style === 'boxed' ? 'border-b border-[var(--border-color)]' : ''} mb-4 overflow-x-auto`}>
          {tabs.map((tab) => (
            <div key={tab.id} className="relative group/tab flex items-center">
              <button
                type="button"
                onClick={() => setActiveTabId(tab.id)}
                className={getTabButtonStyle(activeTab?.id === tab.id)}
              >
                {tab.icon && <span className="mr-1.5">{tab.icon}</span>}
                {selected ? (
                  <input
                    type="text"
                    value={tab.title}
                    onChange={(e) => updateTab(tab.id, { title: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-transparent border-none outline-none inline-block min-w-[60px] max-w-[150px]"
                    placeholder="Título..."
                  />
                ) : (
                  tab.title
                )}
              </button>
              
              {selected && tabs.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeTab(tab.id)}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] leading-none flex items-center justify-center opacity-0 group-hover/tab:opacity-100 transition-opacity shadow z-10"
                  title="Eliminar tab"
                >×</button>
              )}
            </div>
          ))}
          
          {selected && tabs.length < 6 && (
            <button
              type="button"
              onClick={addTab}
              className="px-3 py-2 text-sm text-[var(--text-muted)] hover:text-fuchsia-400 transition-colors"
              title="Añadir tab"
            >
              + Tab
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="min-h-[120px] rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)]/30 p-4">
          {activeTab && (
            <div className="prose prose-invert max-w-none">
              <textarea
                value={activeTab.content}
                onChange={(e) => updateTab(activeTab.id, { content: e.target.value })}
                placeholder="Contenido del tab..."
                rows={4}
                className="w-full bg-transparent border-none outline-none text-sm text-[var(--text-primary)] resize-none"
              />
            </div>
          )}
        </div>

        {/* Editor Panel */}
        {selected && (
          <div className="mt-3 space-y-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)]/65 p-3">
            {/* Style selector */}
            <div>
              <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1.5">Estilo</label>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(TAB_STYLES).map(([key, { name, icon }]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => updateAttributes({ style: key })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      style === key
                        ? 'bg-fuchsia-500 text-white'
                        : 'bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                    }`}
                  >
                    {icon} {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Alignment selector */}
            <div>
              <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1.5">Alineación</label>
              <div className="flex gap-2">
                {[
                  { key: 'left', label: 'Izquierda' },
                  { key: 'center', label: 'Centro' },
                  { key: 'right', label: 'Derecha' },
                ].map(option => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => updateAttributes({ alignment: option.key })}
                    className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      alignment === option.key
                        ? 'bg-fuchsia-500 text-white'
                        : 'bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-muted)]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Icon picker for active tab */}
            {activeTab && (
              <div className="pt-2 border-t border-[var(--border-color)]">
                <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1.5">
                  Icono para "{activeTab.title}"
                </label>
                <div className="flex gap-1.5 flex-wrap items-center">
                  {EMOJI_PRESETS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => updateTab(activeTab.id, { icon: emoji })}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all ${
                        activeTab.icon === emoji
                          ? 'bg-fuchsia-500/20 ring-1 ring-fuchsia-500/40'
                          : 'bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)]/80'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                  {activeTab.icon && (
                    <button
                      type="button"
                      onClick={() => updateTab(activeTab.id, { icon: '' })}
                      className="text-[10px] text-red-400 hover:text-red-300 underline ml-1"
                    >
                      Quitar
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </RichBlockFrame>
  );
}

export const TabsExtension = Node.create({
  name: 'tabs',
  group: 'block',
  content: 'block+',
  atom: false,
  defining: true,

  addAttributes() {
    return {
      tabs: {
        default: [
          { id: 'tab-1', title: 'Tab 1', icon: '', content: '' },
          { id: 'tab-2', title: 'Tab 2', icon: '', content: '' },
        ],
        parseHTML: el => {
          const data = el.getAttribute('data-tabs');
          if (!data) return [
            { id: 'tab-1', title: 'Tab 1', icon: '', content: '' },
            { id: 'tab-2', title: 'Tab 2', icon: '', content: '' },
          ];
          try {
            return JSON.parse(data);
          } catch {
            return [
              { id: 'tab-1', title: 'Tab 1', icon: '', content: '' },
              { id: 'tab-2', title: 'Tab 2', icon: '', content: '' },
            ];
          }
        },
        renderHTML: attrs => ({ 'data-tabs': JSON.stringify(attrs.tabs || []) }),
      },
      style: {
        default: 'underline',
        parseHTML: el => el.getAttribute('data-style') || 'underline',
        renderHTML: attrs => ({ 'data-style': attrs.style || 'underline' }),
      },
      alignment: {
        default: 'left',
        parseHTML: el => el.getAttribute('data-alignment') || 'left',
        renderHTML: attrs => ({ 'data-alignment': attrs.alignment || 'left' }),
      },
      textAlign: createRichBlockTextAlignAttribute(),
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-tabs]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return ['div', mergeAttributes(getRichBlockHtmlAttributes(HTMLAttributes, node.attrs.textAlign, {
      'data-tabs': JSON.stringify(node.attrs.tabs || []),
      'data-style': node.attrs.style || 'underline',
      'data-alignment': node.attrs.alignment || 'left',
    })), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TabsView);
  },

  addCommands() {
    return {
      insertTabs: () => ({ commands }) => commands.insertContent({
        type: this.name,
        attrs: {
          tabs: [
            { id: `tab-${Date.now()}-1`, title: 'Tab 1', icon: '', content: '' },
            { id: `tab-${Date.now()}-2`, title: 'Tab 2', icon: '', content: '' },
          ],
          style: 'underline',
          alignment: 'left',
        },
        content: [{ type: 'paragraph' }],
      }),
    };
  },
});
