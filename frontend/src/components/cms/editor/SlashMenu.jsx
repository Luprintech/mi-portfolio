// ─── SlashMenu — menú de comandos rápidos tipo Notion ("/") ───────────────────
import { useState, useEffect, useRef, useCallback } from 'react';
import {
    filterInsertMenuItems,
    groupInsertMenuItems,
    INSERT_MENU_CATEGORY_STYLES,
    INSERT_MENU_ITEMS,
    runInsertMenuEditorActionWithOptions,
} from './insertMenuConfig';

export default function SlashMenu({ editor, coords, query, onClose, onAction }) {
    const [selected, setSelected] = useState(0);
    const menuRef = useRef(null);
    const itemRefs = useRef([]);

    const filtered = filterInsertMenuItems(INSERT_MENU_ITEMS, query);

    // Reset selection when filter changes
    useEffect(() => { setSelected(0); }, [query]);

    // Keep selected item in view
    useEffect(() => {
        itemRefs.current[selected]?.scrollIntoView({ block: 'nearest' });
    }, [selected]);

    // Reposition if menu would go off-screen
    useEffect(() => {
        if (!menuRef.current) return;
        const rect = menuRef.current.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        if (rect.right > vw - 16) {
            menuRef.current.style.left = `${Math.max(16, vw - rect.width - 16)}px`;
        }
        if (rect.bottom > vh - 16) {
            menuRef.current.style.top = `${Math.max(16, coords.top - rect.height - 8)}px`;
        }
    }, [coords]);

    const executeAction = useCallback((action) => {
        if (!editor) return;

        const { state } = editor;
        const { $from } = state.selection;
        const textBefore = $from.parent.textBetween(0, $from.parentOffset);
        const slashIndex = textBefore.lastIndexOf('/');
        const slashRange = slashIndex >= 0
            ? { from: $from.start() + slashIndex, to: $from.pos }
            : null;

        if (!runInsertMenuEditorActionWithOptions(editor, action, { range: slashRange })) {
            if (slashRange) {
                editor.chain().focus().deleteRange(slashRange).run();
            }
            onAction?.(action);
        }
        onClose();
    }, [editor, onClose, onAction]);

    // Keyboard navigation
    useEffect(() => {
        function handleKeyDown(e) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelected(s => (s + 1) % filtered.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelected(s => (s - 1 + filtered.length) % filtered.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filtered[selected]) executeAction(filtered[selected].action);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        }
        document.addEventListener('keydown', handleKeyDown, true);
        return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [filtered, selected, executeAction, onClose]);

    if (filtered.length === 0) return null;

    // Group by category
    const grouped = groupInsertMenuItems(filtered);

    let globalIdx = 0;

    return (
        <div
            ref={menuRef}
            className="fixed z-[9999] bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-2xl shadow-2xl shadow-black/40 w-[320px] max-h-[380px] overflow-y-auto overflow-x-hidden backdrop-blur-sm"
            style={{ top: coords.top, left: coords.left }}
            onMouseDown={e => e.preventDefault()}
        >
            {/* Header */}
            <div className="sticky top-0 z-10 px-4 pt-3 pb-2 bg-[var(--bg-elevated)] border-b border-[var(--border-color)]">
                <p className="text-xs font-semibold text-[var(--text-primary)]">Insertar bloque</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Escribe para filtrar o usa ↑↓ Enter</p>
            </div>

            <div className="p-1.5">
                {Object.entries(grouped).map(([category, items]) => {
                    const catStyle = INSERT_MENU_CATEGORY_STYLES[category] || INSERT_MENU_CATEGORY_STYLES.Extra;
                    return (
                        <div key={category}>
                            <p className={`text-[10px] uppercase tracking-wider font-bold px-3 pt-2.5 pb-1 ${catStyle.color}`}>{category}</p>
                            {items.map(item => {
                                const idx = globalIdx++;
                                return (
                                    <button
                                        key={item.action}
                                        ref={el => itemRefs.current[idx] = el}
                                        type="button"
                                        onClick={() => executeAction(item.action)}
                                        onMouseEnter={() => setSelected(idx)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all duration-100 ${
                                            selected === idx
                                                ? 'bg-fuchsia-500/15 text-[var(--text-primary)] scale-[1.01]'
                                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'
                                        }`}
                                    >
                                        <span className={`w-8 h-8 flex items-center justify-center rounded-xl ${catStyle.bg} text-sm shrink-0 ${catStyle.color}`}>
                                            {item.icon}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[13px] font-medium truncate">{item.title}</p>
                                            <p className="text-[11px] text-[var(--text-muted)] truncate leading-tight">{item.desc}</p>
                                        </div>
                                        {selected === idx && (
                                            <span className="text-[10px] text-[var(--text-muted)] shrink-0">↵</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
