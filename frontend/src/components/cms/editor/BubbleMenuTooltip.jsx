// ─── BubbleMenuTooltip — interfaz de edición de tooltips inline ──────────────
import { BubbleMenu } from '@tiptap/react/menus';
import { offset } from '@floating-ui/dom';
import { useState, useEffect } from 'react';

export default function BubbleMenuTooltip({ editor }) {
    const [showPanel, setShowPanel] = useState(false);
    const [tooltipText, setTooltipText] = useState('');
    const [position, setPosition] = useState('top');
    const [theme, setTheme] = useState('dark');
    
    // Sincronizar con marca activa
    useEffect(() => {
        if (!editor) return;
        
        const updateState = () => {
            const isActive = editor.isActive('tooltip');
            if (isActive) {
                const attrs = editor.getAttributes('tooltip');
                setTooltipText(attrs.text || '');
                setPosition(attrs.position || 'top');
                setTheme(attrs.theme || 'dark');
            }
        };
        
        editor.on('selectionUpdate', updateState);
        editor.on('transaction', updateState);
        
        return () => {
            editor.off('selectionUpdate', updateState);
            editor.off('transaction', updateState);
        };
    }, [editor]);
    
    if (!editor) return null;
    
    const shouldShow = ({ state, from, to }) => {
        // Mostrar solo si hay selección de texto no vacía
        const { empty } = state.selection;
        if (empty) return false;
        
        // Verificar que hay contenido seleccionado
        const hasContent = state.doc.textBetween(from, to).length > 0;
        if (!hasContent) return false;
        
        return true;
    };
    
    const applyTooltip = () => {
        if (!tooltipText.trim()) {
            // Si no hay texto, remover tooltip
            editor.chain().focus().unsetTooltip().run();
            setShowPanel(false);
            return;
        }
        
        editor.chain()
            .focus()
            .setTooltip({ text: tooltipText, position, theme })
            .run();
        
        setShowPanel(false);
    };
    
    const removeTooltip = () => {
        editor.chain().focus().unsetTooltip().run();
        setTooltipText('');
        setShowPanel(false);
    };
    
    const isTooltipActive = editor.isActive('tooltip');
    
    return (
        <BubbleMenu
            editor={editor}
            shouldShow={shouldShow}
            options={{
                duration: 100,
                placement: 'top',
                offset: 6,
            }}
            className="flex items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] p-2 shadow-2xl"
        >
            {!showPanel ? (
                <>
                    {/* Botón para abrir panel de tooltip */}
                    <button
                        type="button"
                        onClick={() => {
                            setShowPanel(true);
                            if (isTooltipActive) {
                                const attrs = editor.getAttributes('tooltip');
                                setTooltipText(attrs.text || '');
                                setPosition(attrs.position || 'top');
                                setTheme(attrs.theme || 'dark');
                            }
                        }}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                            isTooltipActive
                                ? 'bg-fuchsia-500/20 text-fuchsia-400 ring-1 ring-fuchsia-500/40'
                                : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                        title="Añadir tooltip"
                    >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4" />
                            <path d="M12 8h.01" />
                        </svg>
                        Tooltip
                    </button>
                    
                    {/* Botón para remover tooltip si está activo */}
                    {isTooltipActive && (
                        <button
                            type="button"
                            onClick={removeTooltip}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Remover tooltip"
                        >
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </>
            ) : (
                /* Panel de configuración de tooltip */
                <div className="flex flex-col gap-2 p-2" style={{ minWidth: '320px' }}>
                    {/* Input de texto del tooltip */}
                    <div>
                        <label className="mb-1 block text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                            Texto del tooltip
                        </label>
                        <input
                            type="text"
                            value={tooltipText}
                            onChange={(e) => setTooltipText(e.target.value)}
                            placeholder="Escribe el texto del tooltip..."
                            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-1.5 text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500/60"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    applyTooltip();
                                }
                                if (e.key === 'Escape') {
                                    setShowPanel(false);
                                }
                            }}
                        />
                    </div>
                    
                    {/* Selector de posición */}
                    <div>
                        <label className="mb-1 block text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                            Posición
                        </label>
                        <div className="flex gap-1">
                            {['top', 'bottom', 'left', 'right'].map((pos) => (
                                <button
                                    key={pos}
                                    type="button"
                                    onClick={() => setPosition(pos)}
                                    className={`flex-1 rounded-lg px-2 py-1 text-xs font-medium capitalize transition-colors ${
                                        position === pos
                                            ? 'bg-fuchsia-500 text-white'
                                            : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                    }`}
                                >
                                    {pos}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Selector de tema */}
                    <div>
                        <label className="mb-1 block text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                            Tema
                        </label>
                        <div className="flex gap-1">
                            {[
                                { value: 'dark', label: 'Dark', icon: '🌙' },
                                { value: 'light', label: 'Light', icon: '☀️' },
                                { value: 'info', label: 'Info', icon: 'ℹ️' },
                                { value: 'warning', label: 'Warning', icon: '⚠️' },
                            ].map((t) => (
                                <button
                                    key={t.value}
                                    type="button"
                                    onClick={() => setTheme(t.value)}
                                    className={`flex-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                                        theme === t.value
                                            ? 'bg-fuchsia-500 text-white'
                                            : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                    }`}
                                    title={t.label}
                                >
                                    <span className="mr-1">{t.icon}</span>
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Botones de acción */}
                    <div className="flex gap-2 border-t border-[var(--border-color)] pt-2">
                        <button
                            type="button"
                            onClick={applyTooltip}
                            className="flex-1 rounded-lg bg-fuchsia-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-fuchsia-600"
                        >
                            Aplicar
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowPanel(false)}
                            className="rounded-lg px-3 py-1.5 text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </BubbleMenu>
    );
}
