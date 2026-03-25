// ─── Extensiones TipTap avanzadas para el editor del CMS ─────────────────────
import { Node, Extension, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewContent } from '@tiptap/react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { normalizeContentLinkHref, resolveContentLinkAttributes } from '../../../lib/contentLinkUtils';
import RichBlockFrame from './RichBlockFrame';
import {
    createRichBlockTextAlignAttribute,
    getRichBlockHtmlAttributes,
} from './blockAlignment';

// ─── LineHeight — control de interlineado ─────────────────────────────────────
export const LineHeight = Extension.create({
    name: 'lineHeight',
    addOptions() {
        return { types: ['heading', 'paragraph'], defaultLineHeight: null };
    },
    addGlobalAttributes() {
        return [{
            types: this.options.types,
            attributes: {
                lineHeight: {
                    default: this.options.defaultLineHeight,
                    parseHTML: el => el.style.lineHeight || null,
                    renderHTML: attrs => {
                        if (!attrs.lineHeight) return {};
                        return { style: `line-height: ${attrs.lineHeight}` };
                    },
                },
            },
        }];
    },
    addCommands() {
        return {
            setLineHeight: (lineHeight) => ({ commands }) =>
                this.options.types.every(type => commands.updateAttributes(type, { lineHeight })),
            unsetLineHeight: () => ({ commands }) =>
                this.options.types.every(type => commands.resetAttributes(type, 'lineHeight')),
        };
    },
});

// ─── Accordion — bloques colapsables ──────────────────────────────────────────
function AccordionView({ node, updateAttributes, selected, deleteNode }) {
    const [open, setOpen] = useState(node.attrs.open !== false);
    return (
        <RichBlockFrame
            alignment={node.attrs.textAlign}
            selected={selected}
            onRemove={deleteNode}
            frameClassName="w-full"
        >
            <div className="border border-[var(--border-color)] rounded-xl overflow-hidden my-4">
                <div
                    className="flex items-center gap-2 px-4 py-3 bg-[var(--bg-elevated)] cursor-pointer select-none"
                    onClick={() => { setOpen(!open); updateAttributes({ open: !open }); }}
                >
                    <span className={`transition-transform duration-200 text-xs text-[var(--text-muted)] ${open ? 'rotate-90' : ''}`}>▶</span>
                    <input
                        value={node.attrs.summary}
                        onChange={e => updateAttributes({ summary: e.target.value })}
                        onClick={e => e.stopPropagation()}
                        onKeyDown={e => e.stopPropagation()}
                        className="bg-transparent flex-1 outline-none font-semibold text-[var(--text-primary)] text-sm"
                        placeholder="Título del acordeón…"
                    />
                </div>
                {open && (
                    <div className="px-4 py-3 border-t border-[var(--border-color)]">
                        <NodeViewContent />
                    </div>
                )}
            </div>
        </RichBlockFrame>
    );
}

export const AccordionExtension = Node.create({
    name: 'accordion',
    group: 'block',
    content: 'block+',
    defining: true,
    addAttributes() {
        return {
            summary: {
                default: 'Haz clic para expandir',
                parseHTML: el => el.getAttribute('data-summary') || 'Haz clic para expandir',
                renderHTML: attrs => ({ 'data-summary': attrs.summary }),
            },
            open: {
                default: true,
                parseHTML: el => el.getAttribute('data-open') !== 'false',
                renderHTML: attrs => ({ 'data-open': String(attrs.open) }),
            },
            textAlign: createRichBlockTextAlignAttribute(),
        };
    },
    parseHTML() { return [{ tag: 'div[data-accordion]' }]; },
    renderHTML({ node, HTMLAttributes }) {
        return ['div', mergeAttributes(getRichBlockHtmlAttributes(HTMLAttributes, node.attrs.textAlign, { 'data-accordion': '' })), 0];
    },
    addNodeView() { return ReactNodeViewRenderer(AccordionView); },
    addCommands() {
        return {
            insertAccordion: () => ({ commands }) => commands.insertContent({
                type: this.name,
                attrs: { summary: 'Haz clic para expandir' },
                content: [{ type: 'paragraph' }],
            }),
        };
    },
});

// ─── ContentButton — botones CTA dentro del contenido ─────────────────────────
const VARIANT_STYLES = {
    primary:   'bg-blue-600 text-white shadow-lg shadow-blue-500/25',
    secondary: 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/25',
    fuchsia:   'bg-gradient-to-r from-fuchsia-600 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/25',
    outline:   'border-2 border-blue-500 text-blue-400',
    dark:      'bg-zinc-900 text-white shadow-lg shadow-zinc-900/25',
};

const DEFAULT_CTA_COLORS = [
    { label: 'Fuchsia',  bg: '#c026d3', text: '#ffffff' },
    { label: 'Cyan',     bg: '#0891b2', text: '#ffffff' },
    { label: 'Azul',     bg: '#2563eb', text: '#ffffff' },
    { label: 'Verde',    bg: '#16a34a', text: '#ffffff' },
    { label: 'Naranja',  bg: '#ea580c', text: '#ffffff' },
    { label: 'Rojo',     bg: '#dc2626', text: '#ffffff' },
    { label: 'Negro',    bg: '#18181b', text: '#ffffff' },
    { label: 'Blanco',   bg: '#ffffff', text: '#18181b' },
];

const CTA_PRESETS_KEY = 'cta_custom_presets';
const CTA_BUTTON_CONFIGS_KEY = 'cta_button_configs';

function loadCustomPresets() {
    try {
        return JSON.parse(localStorage.getItem(CTA_PRESETS_KEY)) || [];
    } catch { return []; }
}

function saveCustomPresets(presets) {
    localStorage.setItem(CTA_PRESETS_KEY, JSON.stringify(presets));
}

function loadButtonConfigs() {
    try {
        return JSON.parse(localStorage.getItem(CTA_BUTTON_CONFIGS_KEY)) || [];
    } catch { return []; }
}

function saveButtonConfigs(configs) {
    localStorage.setItem(CTA_BUTTON_CONFIGS_KEY, JSON.stringify(configs));
}

function buildButtonStyle(attrs) {
    const style = {};
    if (attrs.bgColor) {
        style.background = attrs.bgColor;
        style.boxShadow = `0 4px 14px ${attrs.bgColor}40`;
    }
    if (attrs.textColor) style.color = attrs.textColor;
    if (attrs.bold)      style.fontWeight = '700';
    if (attrs.italic)    style.fontStyle = 'italic';
    style.textDecoration = attrs.underline ? 'underline' : 'none';
    if (attrs.uppercase) style.textTransform = 'uppercase';
    if (attrs.fontSize)  style.fontSize = `${attrs.fontSize}px`;
    if (attrs.rounded)   style.borderRadius = `${attrs.rounded}px`;
    return style;
}

function ContentButtonView({ node, updateAttributes, selected, deleteNode }) {
    const hasCustomColor = !!node.attrs.bgColor;
    const variantClass = hasCustomColor ? '' : (VARIANT_STYLES[node.attrs.variant] || VARIANT_STYLES.primary);
    const customStyle = buildButtonStyle(node.attrs);
    const [customPresets, setCustomPresets] = useState(loadCustomPresets);
    const [savedConfigs, setSavedConfigs] = useState(loadButtonConfigs);
    const [showSaveConfig, setShowSaveConfig] = useState(false);
    const [configName, setConfigName] = useState('');
    const allColorPresets = [...DEFAULT_CTA_COLORS, ...customPresets];
    const { token } = useAuth();
    const ctaDocRef = useRef(null);
    const [docUploading, setDocUploading] = useState(false);

    async function handleCtaDocUpload(e) {
        const file = e.target.files?.[0];
        if (!file || !token) return;
        setDocUploading(true);
        try {
            const fd = new FormData();
            fd.append('document', file);
            const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/bitacora/upload-document`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            });
            if (!res.ok) throw new Error('Error uploading document');
            const data = await res.json();
            updateAttributes({ documentUrl: data.url, documentFilename: data.filename });
        } catch (err) { console.error(err); }
        finally { setDocUploading(false); e.target.value = ''; }
    }

    function handleSaveColorPreset() {
        if (!node.attrs.bgColor) return;
        const existing = customPresets.find(p => p.bg === node.attrs.bgColor);
        if (existing) return;
        const name = `Custom ${customPresets.length + 1}`;
        const updated = [...customPresets, { label: name, bg: node.attrs.bgColor, text: node.attrs.textColor || '#ffffff', custom: true }];
        setCustomPresets(updated);
        saveCustomPresets(updated);
    }

    function handleDeletePreset(bg) {
        const updated = customPresets.filter(p => p.bg !== bg);
        setCustomPresets(updated);
        saveCustomPresets(updated);
    }

    function handleSaveButtonConfig() {
        const name = configName.trim() || `Preset ${savedConfigs.length + 1}`;
        const config = {
            name,
            bgColor: node.attrs.bgColor,
            textColor: node.attrs.textColor,
            variant: node.attrs.variant,
            bold: node.attrs.bold,
            italic: node.attrs.italic,
            underline: node.attrs.underline,
            uppercase: node.attrs.uppercase,
            fontSize: node.attrs.fontSize,
            rounded: node.attrs.rounded,
        };
        const updated = [...savedConfigs, config];
        setSavedConfigs(updated);
        saveButtonConfigs(updated);
        setShowSaveConfig(false);
        setConfigName('');
    }

    function handleLoadConfig(config) {
        updateAttributes({
            bgColor: config.bgColor || '',
            textColor: config.textColor || '',
            variant: config.variant || 'primary',
            bold: config.bold || false,
            italic: config.italic || false,
            underline: config.underline || false,
            uppercase: config.uppercase || false,
            fontSize: config.fontSize || 14,
            rounded: config.rounded || 12,
        });
    }

    function handleDeleteConfig(idx) {
        const updated = savedConfigs.filter((_, i) => i !== idx);
        setSavedConfigs(updated);
        saveButtonConfigs(updated);
    }

    // Force white text on variant presets — browser <a> default color overrides Tailwind
    const variantInlineStyle = !hasCustomColor ? {
        color: node.attrs.variant === 'outline' ? undefined : '#ffffff',
        textDecoration: node.attrs.underline ? 'underline' : 'none',
    } : {};

    return (
        <RichBlockFrame
            alignment={node.attrs.textAlign}
            selected={selected}
            onRemove={deleteNode}
            dragHandle
            frameClassName="inline-block"
        >
            <div className={`group/cta relative inline-block ${selected ? 'ring-2 ring-fuchsia-500 ring-offset-2 ring-offset-transparent rounded-xl p-2' : ''}`}>
                {/* Drag handle */}
                <div
                    className="absolute -left-7 top-1/2 -translate-y-1/2 opacity-0 group-hover/cta:opacity-60 hover:!opacity-100 cursor-grab active:cursor-grabbing transition-opacity"
                    contentEditable={false}
                    draggable="true"
                    data-drag-handle=""
                >
                    <svg className="w-4 h-4 text-[var(--text-muted)]" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>
                </div>
                <a
                    {...resolveContentLinkAttributes({
                        href: node.attrs.documentUrl || node.attrs.href,
                        target: node.attrs.documentUrl ? '_self' : (node.attrs.newTab ? '_blank' : '_self'),
                        rel: 'noopener noreferrer',
                    })}
                    {...(node.attrs.documentUrl ? { download: node.attrs.documentFilename || '' } : {})}
                    className={`inline-block px-6 py-3 text-sm transition-all cursor-pointer ${variantClass} ${!hasCustomColor ? 'rounded-xl font-semibold' : ''}`}
                    style={{
                        ...customStyle,
                        ...variantInlineStyle,
                        ...(!hasCustomColor ? {} : { borderRadius: `${node.attrs.rounded || 12}px` }),
                    }}
                    onClick={e => e.preventDefault()}
                    contentEditable={false}
                >
                    {node.attrs.documentUrl && <span className="mr-1.5">📎</span>}{node.attrs.text}
                </a>

                {selected && (
                    <div className="mt-3 p-4 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-2xl space-y-3 max-w-md"
                         onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>

                        {/* Configs guardados */}
                        {savedConfigs.length > 0 && (
                            <div>
                                <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1.5">Mis configuraciones guardadas</label>
                                <div className="flex gap-1.5 flex-wrap">
                                    {savedConfigs.map((cfg, i) => (
                                        <div key={i} className="relative group/cfg">
                                            <button
                                                type="button"
                                                onClick={() => handleLoadConfig(cfg)}
                                                className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-fuchsia-500/50 hover:text-fuchsia-400 transition-all flex items-center gap-1.5"
                                            >
                                                <span className="w-3 h-3 rounded-full shrink-0 border border-white/20" style={{ background: cfg.bgColor || '#2563eb' }} />
                                                {cfg.name}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteConfig(i)}
                                                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] leading-none flex items-center justify-center opacity-0 group-hover/cfg:opacity-100 transition-opacity shadow"
                                                title="Eliminar"
                                            >×</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Texto y Enlace */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1">Texto</label>
                                <input
                                    value={node.attrs.text}
                                    onChange={e => updateAttributes({ text: e.target.value })}
                                    className="w-full px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500/60"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1">Enlace</label>
                                    <input
                                        value={node.attrs.href}
                                        onChange={e => updateAttributes({ href: normalizeContentLinkHref(e.target.value) })}
                                        placeholder="https://…"
                                        className="w-full px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500/60"
                                    />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1.5">Posicion en el contenido</label>
                            <div className="flex gap-1.5">
                                {[
                                    { key: 'left', label: 'Izquierda' },
                                    { key: 'center', label: 'Centrado' },
                                    { key: 'right', label: 'Derecha' },
                                ].map(option => (
                                    <button
                                        key={option.key}
                                        type="button"
                                        onClick={() => updateAttributes({ textAlign: option.key })}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                            (node.attrs.textAlign || 'left') === option.key
                                                ? 'bg-fuchsia-500 text-white'
                                                : 'bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)]'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Formato de texto */}
                        <div>
                            <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1.5">Formato del texto</label>
                            <div className="flex gap-1">
                                {[
                                    { key: 'bold',      icon: 'B',  title: 'Negrita',   cls: 'font-bold' },
                                    { key: 'italic',    icon: 'I',  title: 'Cursiva',   cls: 'italic' },
                                    { key: 'underline', icon: 'U̲',  title: 'Subrayado', cls: '' },
                                    { key: 'uppercase', icon: 'AA', title: 'Mayúsculas', cls: 'text-[10px]' },
                                ].map(opt => (
                                    <button
                                        key={opt.key}
                                        type="button"
                                        title={opt.title}
                                        onClick={() => updateAttributes({ [opt.key]: !node.attrs[opt.key] })}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs transition-all ${opt.cls} ${
                                            node.attrs[opt.key]
                                                ? 'bg-fuchsia-500/20 text-fuchsia-400 ring-1 ring-fuchsia-500/40'
                                                : 'bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                        }`}
                                    >{opt.icon}</button>
                                ))}
                                <div className="mx-1 w-px bg-[var(--border-color)]" />
                                <select
                                    value={node.attrs.fontSize || 14}
                                    onChange={e => updateAttributes({ fontSize: Number(e.target.value) })}
                                    className="h-8 px-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] outline-none"
                                    title="Tamaño de fuente"
                                >
                                    {[12, 13, 14, 15, 16, 18, 20, 24].map(s => (
                                        <option key={s} value={s}>{s}px</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Colores */}
                        <div>
                            <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1.5">Color del botón</label>
                            <div className="flex gap-1.5 flex-wrap items-center">
                                {allColorPresets.map(c => (
                                    <div key={c.bg + c.label} className="relative group/preset">
                                        <button
                                            type="button"
                                            title={c.label}
                                            onClick={() => updateAttributes({ bgColor: c.bg, textColor: c.text, variant: '' })}
                                            className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                                                node.attrs.bgColor === c.bg ? 'ring-2 ring-fuchsia-400 ring-offset-1 ring-offset-[var(--bg-elevated)] scale-110' : 'border-transparent'
                                            }`}
                                            style={{ background: c.bg }}
                                        />
                                        {c.custom && (
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); handleDeletePreset(c.bg); }}
                                                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] leading-none flex items-center justify-center opacity-0 group-hover/preset:opacity-100 transition-opacity shadow"
                                                title="Eliminar preset"
                                            >×</button>
                                        )}
                                    </div>
                                ))}
                                <div className="mx-0.5 w-px h-6 bg-[var(--border-color)]" />
                                <label className="relative cursor-pointer" title="Color personalizado">
                                    <input
                                        type="color"
                                        value={node.attrs.bgColor || '#2563eb'}
                                        onChange={e => updateAttributes({ bgColor: e.target.value, variant: '' })}
                                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                    />
                                    <span className="flex items-center justify-center w-7 h-7 rounded-full border-2 border-dashed border-[var(--border-color)] text-[var(--text-muted)] text-xs hover:border-fuchsia-500/50">
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.7-.8 1.7-1.7 0-.4-.2-.8-.4-1.1-.2-.3-.4-.6-.4-1 0-.9.8-1.7 1.7-1.7H16c3.3 0 6-2.7 6-6 0-5.5-4.5-9.5-10-9.5z"/><circle cx="7.5" cy="11.5" r="1.5"/><circle cx="10.5" cy="7.5" r="1.5"/><circle cx="16.5" cy="11.5" r="1.5"/><circle cx="13.5" cy="7.5" r="1.5"/></svg>
                                    </span>
                                </label>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <label className="text-[10px] text-[var(--text-muted)]">Texto:</label>
                                <input
                                    type="color"
                                    value={node.attrs.textColor || '#ffffff'}
                                    onChange={e => updateAttributes({ textColor: e.target.value })}
                                    className="w-6 h-6 rounded cursor-pointer border border-[var(--border-color)]"
                                />
                                <span className="text-[10px] text-[var(--text-muted)] font-mono">{node.attrs.textColor || '#ffffff'}</span>
                                {node.attrs.bgColor && !allColorPresets.find(p => p.bg === node.attrs.bgColor) && (
                                    <button
                                        type="button"
                                        onClick={handleSaveColorPreset}
                                        className="ml-auto text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                                        title="Guardar este color como preset"
                                    >
                                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14m-7-7h14"/></svg>
                                        Guardar color
                                    </button>
                                )}
                                {node.attrs.bgColor && (
                                    <button
                                        type="button"
                                        onClick={() => updateAttributes({ bgColor: '', textColor: '', variant: 'primary' })}
                                        className={`text-[10px] text-[var(--text-muted)] hover:text-red-400 underline ${allColorPresets.find(p => p.bg === node.attrs.bgColor) ? 'ml-auto' : ''}`}
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Estilo preset */}
                        {!hasCustomColor && (
                            <div>
                                <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1">Estilo preset</label>
                                <div className="flex gap-1.5 mt-1 flex-wrap">
                                    {Object.keys(VARIANT_STYLES).map(v => (
                                        <button
                                            key={v} type="button"
                                            onClick={() => updateAttributes({ variant: v })}
                                            className={`px-3 py-1 rounded-lg text-xs capitalize transition-colors ${
                                                node.attrs.variant === v
                                                    ? 'bg-fuchsia-500 text-white'
                                                    : 'bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)]'
                                            }`}
                                        >{v}</button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Bordes y opciones */}
                        <div className="flex items-center gap-3 pt-1 border-t border-[var(--border-default)]">
                            <div className="flex items-center gap-1.5">
                                <label className="text-[10px] text-[var(--text-muted)]">Radio:</label>
                                <input
                                    type="range" min="0" max="50" step="2"
                                    value={node.attrs.rounded || 12}
                                    onChange={e => updateAttributes({ rounded: Number(e.target.value) })}
                                    className="w-20 h-1 accent-fuchsia-500"
                                />
                                <span className="text-[10px] text-[var(--text-muted)] font-mono w-6">{node.attrs.rounded || 12}</span>
                            </div>
                            <label className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] cursor-pointer ml-auto">
                                <input
                                    type="checkbox"
                                    checked={node.attrs.newTab}
                                    onChange={e => updateAttributes({ newTab: e.target.checked })}
                                    className="rounded accent-fuchsia-500"
                                />
                                Nueva pestaña
                            </label>
                        </div>

                        {/* Documento descargable */}
                        <div className="pt-1 border-t border-[var(--border-default)]">
                            <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1.5">Documento descargable</label>
                            {node.attrs.documentUrl ? (
                                <div className="flex items-center gap-2 p-2 bg-[var(--bg-surface)] rounded-lg">
                                    <span className="text-lg">📎</span>
                                    <span className="text-xs text-[var(--text-primary)] truncate flex-1">{node.attrs.documentFilename}</span>
                                    <button type="button" onClick={() => updateAttributes({ documentUrl: '', documentFilename: '' })}
                                        className="text-xs text-red-400 hover:text-red-300 transition-colors">✕</button>
                                </div>
                            ) : (
                                <button type="button" onClick={() => ctaDocRef.current?.click()} disabled={docUploading}
                                    className="w-full py-2 rounded-xl text-xs font-medium border border-dashed border-[var(--border-color)] text-[var(--text-muted)] hover:text-fuchsia-400 hover:border-fuchsia-500/50 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50">
                                    {docUploading ? (
                                        <div className="w-3.5 h-3.5 border-2 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin" />
                                    ) : (
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                    )}
                                    Subir documento
                                </button>
                            )}
                            <input ref={ctaDocRef} type="file" accept=".pdf,.zip,.docx,.doc" className="hidden" onChange={handleCtaDocUpload} />
                        </div>

                        {/* Guardar configuración completa */}
                        <div className="pt-1 border-t border-[var(--border-default)]">
                            {!showSaveConfig ? (
                                <button
                                    type="button"
                                    onClick={() => setShowSaveConfig(true)}
                                    className="w-full py-2 rounded-xl text-xs font-medium bg-fuchsia-500/10 text-fuchsia-400 hover:bg-fuchsia-500/20 transition-colors flex items-center justify-center gap-1.5"
                                >
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                                    Guardar esta configuración
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        value={configName}
                                        onChange={e => setConfigName(e.target.value)}
                                        placeholder="Nombre del preset…"
                                        className="flex-1 px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg text-xs text-[var(--text-primary)] outline-none focus:border-fuchsia-500/60"
                                        autoFocus
                                        onKeyDown={e => { if (e.key === 'Enter') handleSaveButtonConfig(); if (e.key === 'Escape') setShowSaveConfig(false); }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSaveButtonConfig}
                                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-fuchsia-500 text-white hover:bg-fuchsia-600 transition-colors"
                                    >Guardar</button>
                                    <button
                                        type="button"
                                        onClick={() => setShowSaveConfig(false)}
                                        className="px-2 py-1.5 rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                                    >×</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </RichBlockFrame>
    );
}

export const ContentButtonExtension = Node.create({
    name: 'contentButton',
    group: 'block',
    atom: true,
    draggable: true,
    addAttributes() {
        return {
            text:      { default: 'Click aquí' },
            href:      { default: '#' },
            variant:   { default: 'primary' },
            newTab:    { default: true },
            bgColor:   { default: '' },
            textColor: { default: '' },
            bold:      { default: false },
            italic:    { default: false },
            underline: { default: false },
            uppercase: { default: false },
            fontSize:  { default: 14 },
            rounded:   { default: 12 },
            documentUrl:      { default: '' },
            documentFilename: { default: '' },
            textAlign: createRichBlockTextAlignAttribute(),
        };
    },
    parseHTML() { return [{ tag: 'a[data-content-button]' }]; },
    renderHTML({ node, HTMLAttributes }) {
        const style = [];
        if (node.attrs.bgColor)   style.push(`background:${node.attrs.bgColor};box-shadow:0 4px 14px ${node.attrs.bgColor}40`);
        if (node.attrs.textColor) style.push(`color:${node.attrs.textColor}`);
        if (node.attrs.bold)      style.push('font-weight:700');
        if (node.attrs.italic)    style.push('font-style:italic');
        style.push(node.attrs.underline ? 'text-decoration:underline' : 'text-decoration:none');
        if (node.attrs.uppercase) style.push('text-transform:uppercase');
        if (node.attrs.fontSize)  style.push(`font-size:${node.attrs.fontSize}px`);
        if (node.attrs.rounded)   style.push(`border-radius:${node.attrs.rounded}px`);
        const htmlAttrs = {
            'data-content-button': '',
            class: `content-button content-button--${node.attrs.variant || 'custom'}`,
            style: style.join(';'),
            ...resolveContentLinkAttributes({
                href: node.attrs.documentUrl || node.attrs.href,
                target: node.attrs.documentUrl ? '_self' : (node.attrs.newTab ? '_blank' : '_self'),
                rel: 'noopener noreferrer',
            }),
        };
        if (node.attrs.documentUrl) htmlAttrs.download = node.attrs.documentFilename || '';
        return ['a', mergeAttributes(getRichBlockHtmlAttributes(HTMLAttributes, node.attrs.textAlign, htmlAttrs)), node.attrs.text];
    },
    addNodeView() { return ReactNodeViewRenderer(ContentButtonView); },
    addCommands() {
        return {
            insertContentButton: (attrs) => ({ commands }) => commands.insertContent({
                type: this.name,
                attrs: { text: 'Click aquí', href: '#', variant: 'primary', newTab: true, ...attrs },
            }),
        };
    },
});

// ─── DocumentAttachment — documentos adjuntos (PDF, ZIP, DOCX) ────────────────
function formatFileSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
}

// ─── PdfCarousel — visor de PDF por páginas con navegación ────────────────────
function PdfCarousel({ src, height }) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [pdfDoc, setPdfDoc] = useState(null);
    const [page, setPage] = useState(1);
    const [numPages, setNumPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const renderTaskRef = useRef(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const pdfjsLib = await import('pdfjs-dist');
                if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
                    pdfjsLib.GlobalWorkerOptions.workerSrc =
                        `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
                }
                const doc = await pdfjsLib.getDocument(src).promise;
                if (!cancelled) {
                    setPdfDoc(doc);
                    setNumPages(doc.numPages);
                    setLoading(false);
                }
            } catch (err) {
                console.error('Error loading PDF:', err);
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [src]);

    useEffect(() => {
        if (!pdfDoc || !canvasRef.current || !containerRef.current) return;
        let cancelled = false;
        (async () => {
            try {
                if (renderTaskRef.current) {
                    try { renderTaskRef.current.cancel(); } catch {
                        renderTaskRef.current = null;
                    }
                }
                const pdfPage = await pdfDoc.getPage(page);
                if (cancelled) return;
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                const containerWidth = containerRef.current.clientWidth || 600;
                const navHeight = 48;
                const availableHeight = height - navHeight;
                const unscaledViewport = pdfPage.getViewport({ scale: 1 });
                const scale = Math.min(
                    containerWidth / unscaledViewport.width,
                    availableHeight / unscaledViewport.height
                );
                const dpr = window.devicePixelRatio || 1;
                const viewport = pdfPage.getViewport({ scale: scale * dpr });
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                canvas.style.width = `${viewport.width / dpr}px`;
                canvas.style.height = `${viewport.height / dpr}px`;
                const task = pdfPage.render({ canvasContext: ctx, viewport });
                renderTaskRef.current = task;
                await task.promise;
            } catch (err) {
                if (err?.name !== 'RenderingCancelledException') console.error(err);
            }
        })();
        return () => { cancelled = true; };
    }, [pdfDoc, page, height]);

    if (loading) {
        return (
            <div className="flex items-center justify-center bg-[var(--bg-primary)]" style={{ height: `${height}px` }}>
                <div className="w-6 h-6 border-2 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!pdfDoc) {
        return (
            <div className="flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-muted)] text-sm" style={{ height: `${height}px` }}>
                Error al cargar el PDF
            </div>
        );
    }

    return (
        <div ref={containerRef} className="relative bg-[var(--bg-primary)] select-none" style={{ height: `${height}px` }}>
            <div className="flex items-center justify-center overflow-hidden" style={{ height: `${height - 48}px` }}>
                <canvas ref={canvasRef} />
            </div>
            {numPages > 1 && (
                <>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setPage(p => Math.max(1, p - 1)); }}
                        disabled={page <= 1}
                        className="absolute left-3 top-[calc(50%-24px)] w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors disabled:opacity-20 disabled:cursor-not-allowed backdrop-blur-sm shadow-lg"
                        contentEditable={false}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M15 19l-7-7 7-7"/></svg>
                    </button>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setPage(p => Math.min(numPages, p + 1)); }}
                        disabled={page >= numPages}
                        className="absolute right-3 top-[calc(50%-24px)] w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors disabled:opacity-20 disabled:cursor-not-allowed backdrop-blur-sm shadow-lg"
                        contentEditable={false}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M9 5l7 7-7 7"/></svg>
                    </button>
                </>
            )}
            <div className="absolute bottom-0 inset-x-0 h-12 flex items-center justify-center bg-gradient-to-t from-black/40 to-transparent">
                <div className="px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-sm font-medium tabular-nums">
                    {page} / {numPages}
                </div>
            </div>
        </div>
    );
}

function DocumentView({ node, updateAttributes, selected, deleteNode }) {
    const isPdf = node.attrs.fileType === 'pdf';
    const mode = node.attrs.displayMode || (isPdf ? 'embed' : 'link');
    const ICONS = { pdf: '📄', zip: '📦', docx: '📝' };
    const wrapRef = useRef(null);
    const [resizing, setResizing] = useState(false);
    const startData = useRef(null);

    function startResize(e, corner) {
        e.preventDefault();
        e.stopPropagation();
        const el = wrapRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        startData.current = {
            corner,
            startX: e.clientX,
            startY: e.clientY,
            startW: rect.width,
            startH: node.attrs.embedHeight || 500,
        };
        setResizing(true);

        function onMove(ev) {
            const { corner: c, startX, startY, startW, startH } = startData.current;
            const dx = c.includes('r') ? ev.clientX - startX : startX - ev.clientX;
            const dy = c.includes('b') ? ev.clientY - startY : startY - ev.clientY;
            const newW = Math.max(300, startW + dx);
            const newH = Math.max(200, Math.round(startH + dy));
            updateAttributes({ embedWidth: Math.round(newW), embedHeight: newH });
        }
        function onUp() {
            setResizing(false);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        }
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    }

    const embedWidth = node.attrs.embedWidth || null;
    const handleCls = 'absolute w-3 h-3 bg-fuchsia-500 border-2 border-white rounded-full z-10';

    return (
        <RichBlockFrame
            alignment={node.attrs.textAlign}
            selected={selected}
            onRemove={deleteNode}
            frameClassName="w-full"
        >
            <div
                ref={wrapRef}
                className={`relative group border border-[var(--border-color)] rounded-xl overflow-hidden ${selected ? 'ring-2 ring-fuchsia-500 ring-offset-2 ring-offset-transparent' : ''}`}
                style={{ width: embedWidth ? `${embedWidth}px` : '100%', maxWidth: '100%', cursor: resizing ? 'nwse-resize' : 'default' }}
            >
                {/* Resize handles */}
                {isPdf && mode === 'embed' && (
                    <div className={`${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                        <div className={`${handleCls} top-[-6px] left-[-6px] cursor-nwse-resize`} onMouseDown={e => startResize(e, 'tl')} />
                        <div className={`${handleCls} top-[-6px] right-[-6px] cursor-nesw-resize`} onMouseDown={e => startResize(e, 'tr')} />
                        <div className={`${handleCls} bottom-[-6px] left-[-6px] cursor-nesw-resize`} onMouseDown={e => startResize(e, 'bl')} />
                        <div className={`${handleCls} bottom-[-6px] right-[-6px] cursor-nwse-resize`} onMouseDown={e => startResize(e, 'br')} />
                    </div>
                )}
                {/* PDF carousel viewer */}
                {isPdf && mode === 'embed' && (
                    <PdfCarousel src={node.attrs.src} height={node.attrs.embedHeight || 500} />
                )}

                {/* Bottom bar — always visible */}
                <div className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-elevated)]">
                    <span className="text-2xl">{ICONS[node.attrs.fileType] || '📎'}</span>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{node.attrs.filename}</p>
                        <div className="flex items-center gap-2">
                            {node.attrs.fileSize > 0 && (
                                <p className="text-xs text-[var(--text-muted)]">{formatFileSize(node.attrs.fileSize)}</p>
                            )}
                            {isPdf && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-fuchsia-500/15 text-fuchsia-400 font-medium">
                                    {mode === 'embed' ? 'Incrustado' : 'Enlace'}
                                </span>
                            )}
                        </div>
                    </div>
                    {mode !== 'embed' && (
                        <a
                            href={node.attrs.src}
                            download={node.attrs.filename}
                            className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-lg text-sm font-medium transition-colors"
                            contentEditable={false}
                        >
                            Descargar
                        </a>
                    )}
                </div>

                {/* Editing controls when selected */}
                {selected && (
                    <div className="px-4 py-3 border-t border-[var(--border-color)] bg-[var(--bg-surface)] space-y-2"
                         onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
                        {isPdf && (
                            <div>
                                <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1.5">Modo de visualización</label>
                                <div className="flex gap-1.5">
                                    <button type="button"
                                        onClick={() => updateAttributes({ displayMode: 'embed' })}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                            mode === 'embed' ? 'bg-fuchsia-500 text-white' : 'bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)]'
                                        }`}>
                                        📄 Incrustado (LinkedIn)
                                    </button>
                                    <button type="button"
                                        onClick={() => updateAttributes({ displayMode: 'link' })}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                            mode === 'link' ? 'bg-fuchsia-500 text-white' : 'bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)]'
                                        }`}>
                                        🔗 Solo enlace
                                    </button>
                                </div>
                            </div>
                        )}
                        {isPdf && mode === 'embed' && (
                            <div className="flex items-center gap-2">
                                <label className="text-[10px] text-[var(--text-muted)]">Altura:</label>
                                <input type="range" min="200" max="800" step="50"
                                    value={node.attrs.embedHeight || 500}
                                    onChange={e => updateAttributes({ embedHeight: Number(e.target.value) })}
                                    className="flex-1 h-1 accent-fuchsia-500" />
                                <span className="text-[10px] text-[var(--text-muted)] font-mono w-10">{node.attrs.embedHeight || 500}px</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </RichBlockFrame>
    );
}

export const DocumentAttachmentExtension = Node.create({
    name: 'documentAttachment',
    group: 'block',
    atom: true,
    addAttributes() {
        return {
            src: {
                default: '',
                parseHTML: el => el.getAttribute('data-src') || el.getAttribute('src') || '',
            },
            filename: {
                default: '',
                parseHTML: el => el.getAttribute('data-filename') || el.getAttribute('filename') || '',
            },
            fileType: {
                default: '',
                parseHTML: el => el.getAttribute('data-file-type') || el.getAttribute('filetype') || '',
            },
            fileSize: {
                default: 0,
                parseHTML: el => parseInt(el.getAttribute('data-file-size') || el.getAttribute('filesize')) || 0,
            },
            displayMode: {
                default: 'embed',
                parseHTML: el => el.getAttribute('data-display-mode') || el.getAttribute('displaymode') || 'embed',
            },
            embedHeight: {
                default: 500,
                parseHTML: el => parseInt(el.getAttribute('data-embed-height') || el.getAttribute('embedheight')) || 500,
            },
            embedWidth: {
                default: null,
                parseHTML: el => {
                    const v = el.getAttribute('data-embed-width') || el.getAttribute('embedwidth');
                    return v ? parseInt(v) : null;
                },
            },
            textAlign: createRichBlockTextAlignAttribute(),
        };
    },
    parseHTML() { return [{ tag: 'div[data-document]' }, { tag: 'div[data-block="document"]' }]; },
    renderHTML({ node, HTMLAttributes }) {
        const isPdf = node.attrs.fileType === 'pdf';
        const mode = node.attrs.displayMode || (isPdf ? 'embed' : 'link');
        const height = node.attrs.embedHeight || 500;
        const width = node.attrs.embedWidth;
        const ICONS = { pdf: '📄', zip: '📦', docx: '📝' };
        const icon = ICONS[node.attrs.fileType] || '📎';

        const containerStyle = [
            'border:1px solid var(--border-color,rgba(255,255,255,0.1))',
            'border-radius:12px',
            'overflow:hidden',
            'margin:16px 0',
            width ? `width:${width}px;max-width:100%` : '',
        ].filter(Boolean).join(';');

        const containerAttrs = mergeAttributes(getRichBlockHtmlAttributes(HTMLAttributes, node.attrs.textAlign, {
            'data-block': 'document',
            'data-version': '1',
            'data-document': '',
            'data-src': node.attrs.src,
            'data-title': node.attrs.filename,
            'data-filename': node.attrs.filename,
            'data-file-type': node.attrs.fileType,
            'data-display': mode,
            'data-display-mode': mode,
            'data-embed-height': String(height),
            style: containerStyle,
        }));

        const barStyle = 'display:flex;align-items:center;gap:12px;padding:10px 16px;background:var(--bg-elevated,rgba(15,15,30,0.8))';
        const nameStyle = 'font-size:14px;font-weight:500;color:var(--text-primary,#e2e8f0);margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';

        if (isPdf && mode === 'embed') {
            return ['div', containerAttrs,
                ['iframe', {
                    src: node.attrs.src,
                    style: `width:100%;height:${height}px;border:none;`,
                    loading: 'lazy',
                    title: node.attrs.filename,
                    allowfullscreen: 'true',
                }],
                ['div', { style: barStyle },
                    ['span', { style: 'font-size:1.25rem' }, icon],
                    ['span', { style: nameStyle }, node.attrs.filename],
                ],
            ];
        }

        // Link mode or non-PDF
        return ['div', containerAttrs,
            ['div', { style: barStyle },
                ['span', { style: 'font-size:1.5rem' }, icon],
                ['span', { style: `flex:1;${nameStyle}` }, node.attrs.filename],
                ['a', {
                    href: node.attrs.src,
                    download: node.attrs.filename,
                    style: 'padding:8px 16px;background:#c026d3;color:white;border-radius:8px;font-size:14px;font-weight:500;text-decoration:none;white-space:nowrap',
                }, 'Descargar'],
            ],
        ];
    },
    addNodeView() { return ReactNodeViewRenderer(DocumentView); },
    addCommands() {
        return {
            insertDocument: (attrs) => ({ commands }) => commands.insertContent({
                type: this.name,
                attrs,
            }),
        };
    },
});

// ─── ImageGrid — contenedor grid para imágenes ───────────────────────────────
function normalizeImageGridItem(item) {
    if (typeof item === 'string') {
        return { src: item, alt: '', caption: '' };
    }

    if (item && typeof item === 'object') {
        return {
            src: typeof item.src === 'string' ? item.src : '',
            alt: typeof item.alt === 'string' ? item.alt : '',
            caption: typeof item.caption === 'string' ? item.caption : '',
        };
    }

    return { src: '', alt: '', caption: '' };
}

function normalizeImageGridItems(items) {
    if (!Array.isArray(items)) return [];
    return items.map(normalizeImageGridItem).filter(item => item.src);
}

function ImageGridView({ node, updateAttributes, selected, deleteNode }) {
    const cols = node.attrs.cols || 2;
    const images = normalizeImageGridItems(node.attrs.images);
    const { token } = useAuth();
    const fileRef = useRef(null);
    const [uploadIdx, setUploadIdx] = useState(null);
    const [uploading, setUploading] = useState(false);

    function openPicker(idx) {
        setUploadIdx(idx);
        setTimeout(() => fileRef.current?.click(), 0);
    }

    async function handleFile(e) {
        const file = e.target.files?.[0];
        if (!file || !token) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('image', file);
            const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/bitacora/upload`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            });
            if (!res.ok) throw new Error('Error al subir imagen');
            const { url } = await res.json();
            const next = [...images];
            if (uploadIdx !== null && uploadIdx < next.length) {
                next[uploadIdx] = { ...next[uploadIdx], src: url };
            } else {
                next.push({ src: url, alt: '', caption: '' });
            }
            updateAttributes({ images: next });
        } catch (err) { console.error(err); }
        finally { setUploading(false); e.target.value = ''; setUploadIdx(null); }
    }

    function removeImage(idx) {
        const next = images.filter((_, i) => i !== idx);
        updateAttributes({ images: next });
    }

    return (
        <RichBlockFrame
            alignment={node.attrs.textAlign}
            selected={selected}
            onRemove={deleteNode}
            wrapperClassName="my-6"
            frameClassName="w-full"
        >
            <div className={`${selected ? 'ring-2 ring-fuchsia-500 ring-offset-2 ring-offset-transparent rounded-xl' : ''}`}>
                {selected && (
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider">Columnas:</span>
                        {[2, 3, 4].map(n => (
                            <button
                                key={n} type="button"
                                onClick={() => updateAttributes({ cols: n })}
                                className={`w-6 h-6 rounded text-xs ${cols === n ? 'bg-fuchsia-500 text-white' : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'}`}
                            >{n}</button>
                        ))}
                    </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '8px' }}>
                    {images.map((image, i) => (
                        <div key={`${image.src}-${i}`} className="relative group rounded-lg overflow-hidden bg-[var(--bg-elevated)] aspect-square">
                            <img src={image.src} alt={image.alt || ''} className="w-full h-full object-cover" />
                            {selected && (
                                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button type="button" onClick={() => openPicker(i)}
                                        className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs" title="Cambiar imagen">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                                    </button>
                                    <button type="button" onClick={() => removeImage(i)}
                                        className="p-1.5 rounded-full bg-red-500/70 hover:bg-red-500 text-white text-xs" title="Eliminar imagen">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    {/* Add image cell */}
                    <button type="button" onClick={() => openPicker(null)}
                        disabled={uploading}
                        className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[var(--border-color)] hover:border-fuchsia-500/50 bg-[var(--bg-elevated)]/50 text-[var(--text-muted)] hover:text-fuchsia-400 transition-colors aspect-square cursor-pointer">
                        {uploading
                            ? <span className="text-xs animate-pulse">Subiendo…</span>
                            : <>
                                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                                <span className="text-xs">Añadir imagen</span>
                              </>}
                    </button>
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                {selected && images.length > 0 && (
                    <div className="mt-3 space-y-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)]/60 p-3">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Metadata de imagen</p>
                        {images.map((image, index) => (
                            <div key={`${image.src}-meta-${index}`} className="grid gap-2 md:grid-cols-2">
                                <input
                                    type="text"
                                    value={image.alt || ''}
                                    onChange={(event) => {
                                        const next = [...images];
                                        next[index] = { ...next[index], alt: event.target.value };
                                        updateAttributes({ images: next });
                                    }}
                                    placeholder={`Alt imagen ${index + 1}`}
                                    className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
                                />
                                <input
                                    type="text"
                                    value={image.caption || ''}
                                    onChange={(event) => {
                                        const next = [...images];
                                        next[index] = { ...next[index], caption: event.target.value };
                                        updateAttributes({ images: next });
                                    }}
                                    placeholder={`Caption imagen ${index + 1}`}
                                    className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </RichBlockFrame>
    );
}

export const ImageGridExtension = Node.create({
    name: 'imageGrid',
    group: 'block',
    atom: true,
    defining: true,
    addAttributes() {
        return {
            cols: {
                default: 2,
                parseHTML: el => parseInt(el.getAttribute('data-cols')) || 2,
                renderHTML: attrs => ({ 'data-cols': attrs.cols }),
            },
            images: {
                default: [],
                parseHTML: el => {
                    try { return normalizeImageGridItems(JSON.parse(el.getAttribute('data-images') || '[]')); }
                    catch { return []; }
                },
                renderHTML: attrs => ({ 'data-images': JSON.stringify(normalizeImageGridItems(attrs.images)) }),
            },
            textAlign: createRichBlockTextAlignAttribute(),
        };
    },
    parseHTML() { return [{ tag: 'div[data-image-grid]' }, { tag: 'div[data-block="image-grid"]' }]; },
    renderHTML({ node, HTMLAttributes }) {
        const cols = node.attrs.cols || 2;
        const images = normalizeImageGridItems(node.attrs.images);
        const gridStyle = `display:grid;grid-template-columns:repeat(${cols},1fr);gap:8px;margin:1.5em 0`;
        const children = images.map(image => ['figure', { style: 'border-radius:8px;overflow:hidden;aspect-ratio:1;background:rgba(15,23,42,0.08);margin:0' },
            ['img', { src: image.src, alt: image.alt || '', style: 'width:100%;height:100%;object-fit:cover', loading: 'lazy' }],
            image.caption || image.alt ? ['figcaption', { style: 'padding:8px 10px;font-size:12px;line-height:1.5;color:var(--text-muted,#94a3b8);border-top:1px solid rgba(148,163,184,0.18)' }, image.caption || image.alt] : null,
        ].filter(Boolean));
        return ['div', mergeAttributes(getRichBlockHtmlAttributes(HTMLAttributes, node.attrs.textAlign, {
            'data-block': 'image-grid',
            'data-version': '1',
            'data-image-grid': '',
            'data-columns': cols,
            'data-images': JSON.stringify(images),
            style: gridStyle,
        })), ...children];
    },
    addNodeView() { return ReactNodeViewRenderer(ImageGridView); },
    addCommands() {
        return {
            insertImageGrid: (cols = 2) => ({ commands }) => commands.insertContent({
                type: this.name,
                attrs: { cols, images: [] },
            }),
        };
    },
});
