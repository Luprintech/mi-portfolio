// ─── SlashMenu — menú de comandos rápidos tipo Notion ("/") ───────────────────
import { useState, useEffect, useRef, useCallback } from 'react';

const SLASH_ITEMS = [
    { title: 'Título 1',         icon: 'H1',  desc: 'Título principal',            category: 'Bloques',   action: 'h1' },
    { title: 'Título 2',         icon: 'H2',  desc: 'Subtítulo',                   category: 'Bloques',   action: 'h2' },
    { title: 'Título 3',         icon: 'H3',  desc: 'Sección',                     category: 'Bloques',   action: 'h3' },
    { title: 'Lista viñetas',    icon: '•',   desc: 'Lista no ordenada',           category: 'Bloques',   action: 'bulletList' },
    { title: 'Lista numerada',   icon: '#',   desc: 'Lista ordenada',              category: 'Bloques',   action: 'orderedList' },
    { title: 'Cita',             icon: '❝',   desc: 'Blockquote',                  category: 'Bloques',   action: 'blockquote' },
    { title: 'Separador',        icon: '—',   desc: 'Línea horizontal',            category: 'Bloques',   action: 'hr' },
    { title: 'Bloque de código', icon: '</>',  desc: 'Código con syntax highlight', category: 'Código',    action: 'codeBlock' },
    { title: 'Código inline',    icon: '`c`', desc: 'Código dentro del texto',     category: 'Código',    action: 'code' },
    { title: 'Terminal',         icon: '$_',  desc: 'Bloque de comandos',          category: 'Código',    action: 'terminal' },
    { title: 'Imagen',           icon: '🖼',  desc: 'Subir una imagen',            category: 'Media',     action: 'image' },
    { title: 'Grid de imágenes', icon: '▦',   desc: 'Varias imágenes en grid',     category: 'Media',     action: 'imageGrid' },
    { title: 'YouTube',          icon: '▶',   desc: 'Vídeo de YouTube',            category: 'Media',     action: 'youtube' },
    { title: 'Audio',            icon: '🎧',  desc: 'Archivo de audio',            category: 'Media',     action: 'audio' },
    { title: 'PDF / Documento',  icon: '📎',  desc: 'Adjuntar PDF, ZIP o DOCX',    category: 'Media',     action: 'document' },
    { title: 'Tabla',            icon: '▤',   desc: 'Tabla 3x3',                   category: 'Avanzado',  action: 'table' },
    { title: 'Callout - Tip',    icon: '💡',  desc: 'Consejo destacado',           category: 'Avanzado',  action: 'callout-tip' },
    { title: 'Callout - Warning',icon: '⚠️',  desc: 'Advertencia',                 category: 'Avanzado',  action: 'callout-warning' },
    { title: 'Callout - Info',   icon: 'ℹ️',  desc: 'Nota informativa',            category: 'Avanzado',  action: 'callout-info' },
    { title: 'Callout - Note',   icon: '📌',  desc: 'Nota general',                category: 'Avanzado',  action: 'callout-note' },
    { title: 'Acordeón',         icon: '▼',   desc: 'Bloque colapsable',           category: 'Avanzado',  action: 'accordion' },
    { title: 'Botón CTA',        icon: '🔘',  desc: 'Botón con enlace',            category: 'Avanzado',  action: 'contentButton' },
    { title: 'Diagrama flujo',   icon: '📊',  desc: 'Mermaid flowchart',           category: 'Diagramas', action: 'mermaid-flowchart' },
    { title: 'Mapa mental',      icon: '🌐',  desc: 'Mermaid mindmap',             category: 'Diagramas', action: 'mermaid-mindmap' },
    { title: 'Secuencia',        icon: '↔',   desc: 'Mermaid sequence',            category: 'Diagramas', action: 'mermaid-sequence' },
    { title: 'Emoji',            icon: '😀',  desc: 'Insertar emoji',              category: 'Extra',     action: 'emoji' },
];

const CATEGORY_ICONS = {
    Bloques:   { color: 'text-violet-400', bg: 'bg-violet-500/15' },
    Código:    { color: 'text-cyan-400',   bg: 'bg-cyan-500/15' },
    Media:     { color: 'text-amber-400',  bg: 'bg-amber-500/15' },
    Avanzado:  { color: 'text-emerald-400',bg: 'bg-emerald-500/15' },
    Diagramas: { color: 'text-fuchsia-400',bg: 'bg-fuchsia-500/15' },
    Extra:     { color: 'text-orange-400', bg: 'bg-orange-500/15' },
};

export default function SlashMenu({ editor, coords, query, onClose, onAction }) {
    const [selected, setSelected] = useState(0);
    const menuRef = useRef(null);
    const itemRefs = useRef([]);

    const filtered = SLASH_ITEMS.filter(item =>
        !query || item.title.toLowerCase().includes(query.toLowerCase()) || item.desc.toLowerCase().includes(query.toLowerCase())
    );

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

        // Delete the slash command text first
        const { state } = editor;
        const { $from } = state.selection;
        const textBefore = $from.parent.textBetween(0, $from.parentOffset);
        const slashIndex = textBefore.lastIndexOf('/');
        if (slashIndex >= 0) {
            const deleteFrom = $from.start() + slashIndex;
            const deleteTo = $from.pos;
            editor.chain().focus().deleteRange({ from: deleteFrom, to: deleteTo }).run();
        }

        // Execute the command
        const actions = {
            h1:           () => editor.chain().focus().setHeading({ level: 1 }).run(),
            h2:           () => editor.chain().focus().setHeading({ level: 2 }).run(),
            h3:           () => editor.chain().focus().setHeading({ level: 3 }).run(),
            bulletList:   () => editor.chain().focus().toggleBulletList().run(),
            orderedList:  () => editor.chain().focus().toggleOrderedList().run(),
            blockquote:   () => editor.chain().focus().setBlockquote().run(),
            hr:           () => editor.chain().focus().setHorizontalRule().run(),
            codeBlock:    () => editor.chain().focus().setCodeBlock().run(),
            code:         () => editor.chain().focus().toggleCode().run(),
            terminal:     () => editor.chain().focus().setCodeBlock().updateAttributes('codeBlock', { language: 'bash' }).run(),
            table:        () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
            'callout-tip':     () => editor.chain().focus().insertCallout('tip').run(),
            'callout-warning': () => editor.chain().focus().insertCallout('warning').run(),
            'callout-info':    () => editor.chain().focus().insertCallout('info').run(),
            'callout-note':    () => editor.chain().focus().insertCallout('note').run(),
            accordion:    () => editor.chain().focus().insertAccordion().run(),
            contentButton:() => editor.chain().focus().insertContentButton().run(),
            imageGrid:    () => editor.chain().focus().insertImageGrid(2).run(),
        };

        if (actions[action]) {
            actions[action]();
        } else {
            // Delegate to parent for actions that need UI (image upload, youtube URL, etc.)
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
    const grouped = {};
    filtered.forEach((item, idx) => {
        if (!grouped[item.category]) grouped[item.category] = [];
        grouped[item.category].push({ ...item, globalIdx: idx });
    });

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
                    const catStyle = CATEGORY_ICONS[category] || CATEGORY_ICONS.Extra;
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
