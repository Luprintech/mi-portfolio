// ─── Extensiones TipTap avanzadas para el editor del CMS ─────────────────────
import { Node, Extension, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewContent } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { cmsApi } from '../../../lib/cmsApi';
import { normalizeContentLinkHref, resolveContentLinkAttributes } from '../../../lib/contentLinkUtils';
import {
    getImageGridAspectClass,
    getImageGridColumnsClass,
    getImageGridCornerClass,
    getImageGridGapClass,
    getImageGridImageFitClass,
    getImageGridItemAspectClass,
    getImageGridItemSizeLabel,
    getImageGridItemSpanClass,
    getImageGridWidthClass,
    normalizeImageGridConfig,
    normalizeImageGridItems,
} from '../../../lib/imageGrid';
import {
    getVideoGalleryAspectClass,
    getVideoGalleryColumnsClass,
    normalizeVideoGalleryConfig,
    normalizeVideoGalleryItems,
} from '../../../lib/videoGallery';
import GifPicker from './GifPicker';
import { validateImageFile } from '../../../lib/mediaUploadPolicy';
import PdfPreview from '../../shared/PdfPreview';
import { QuoteCardExtension } from './blocks/QuoteCard';
import { StatsCounterExtension } from './blocks/StatsCounter';
import { TimelineExtension } from './blocks/Timeline';
import { ComparisonSliderExtension } from './blocks/ComparisonSlider';
import { SpotifyEmbedExtension } from './blocks/SpotifyEmbed';
import { ProgressBarsExtension } from './blocks/ProgressBars';
import { CountdownTimerExtension } from './blocks/CountdownTimer';
import { SocialShareExtension } from './blocks/SocialShare';
import { TabsExtension } from './blocks/Tabs';
import { ToggleExtension } from './blocks/Toggle';
import { QuizExtension } from './blocks/Quiz';
import { PollExtension } from './blocks/Poll';
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
                    contentEditable={false}
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

function parseBooleanAttribute(value, fallback = false) {
    if (value === null || value === undefined || value === '') return fallback;
    if (typeof value === 'boolean') return value;

    const normalized = String(value).toLowerCase();

    if (['false', '0', 'no', 'off'].includes(normalized)) return false;
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true;

    return fallback;
}

function parseIntegerAttribute(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function getStyleProperty(el, propertyName) {
    return el?.style?.[propertyName] || '';
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
    const [isCustomizationOpen, setIsCustomizationOpen] = useState(true);

    useEffect(() => {
        if (selected) {
            setIsCustomizationOpen(true);
        }
    }, [selected]);

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
            onSecondaryAction={() => setIsCustomizationOpen(open => !open)}
            secondaryActionLabel={isCustomizationOpen ? 'Colapsar personalizacion' : 'Abrir personalizacion'}
            secondaryActionPressed={isCustomizationOpen}
            renderSecondaryIcon={() => (
                <svg className={`h-4 w-4 transition-transform ${isCustomizationOpen ? '' : 'rotate-180'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" />
                </svg>
            )}
            dragHandle
            frameClassName="inline-block"
        >
            <div className={`group/cta relative inline-block ${selected ? 'ring-2 ring-fuchsia-500 ring-offset-2 ring-offset-transparent rounded-xl p-2' : ''}`} contentEditable={false}>
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

                {selected && isCustomizationOpen && (
                    <div className="mt-3 max-w-md space-y-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-elevated)] p-4"
                         contentEditable={false}
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
                {selected && !isCustomizationOpen && (
                    <div
                        className="mt-3 flex max-w-md items-center justify-between gap-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-elevated)] px-4 py-3 text-xs text-[var(--text-secondary)]"
                        contentEditable={false}
                        onClick={e => e.stopPropagation()}
                        onMouseDown={e => e.stopPropagation()}
                    >
                        <span className="font-medium text-[var(--text-primary)]">Personalizacion CTA colapsada</span>
                        <button
                            type="button"
                            onClick={() => setIsCustomizationOpen(true)}
                            className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-1.5 text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:border-fuchsia-500/50 hover:text-fuchsia-400"
                        >
                            Abrir panel
                        </button>
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
            text: {
                default: 'Click aquí',
                parseHTML: el => el.getAttribute('data-text') || el.textContent || 'Click aquí',
                renderHTML: attrs => ({ 'data-text': attrs.text || 'Click aquí' }),
            },
            href: {
                default: '#',
                parseHTML: el => el.getAttribute('data-href') || el.getAttribute('href') || '#',
                renderHTML: attrs => ({ 'data-href': attrs.href || '#' }),
            },
            variant: {
                default: 'primary',
                parseHTML: el => el.getAttribute('data-variant') || Array.from(el.classList).find(cls => cls.startsWith('content-button--'))?.replace('content-button--', '') || 'primary',
                renderHTML: attrs => ({ 'data-variant': attrs.variant || 'primary' }),
            },
            newTab: {
                default: true,
                parseHTML: el => parseBooleanAttribute(el.getAttribute('data-new-tab'), el.getAttribute('target') === '_blank'),
                renderHTML: attrs => ({ 'data-new-tab': String(attrs.newTab !== false) }),
            },
            bgColor: {
                default: '',
                parseHTML: el => el.getAttribute('data-bg-color') || getStyleProperty(el, 'background') || '',
                renderHTML: attrs => attrs.bgColor ? { 'data-bg-color': attrs.bgColor } : {},
            },
            textColor: {
                default: '',
                parseHTML: el => el.getAttribute('data-text-color') || getStyleProperty(el, 'color') || '',
                renderHTML: attrs => attrs.textColor ? { 'data-text-color': attrs.textColor } : {},
            },
            bold: {
                default: false,
                parseHTML: el => parseBooleanAttribute(el.getAttribute('data-bold'), ['bold', '700'].includes(getStyleProperty(el, 'fontWeight'))),
                renderHTML: attrs => attrs.bold ? { 'data-bold': 'true' } : {},
            },
            italic: {
                default: false,
                parseHTML: el => parseBooleanAttribute(el.getAttribute('data-italic'), getStyleProperty(el, 'fontStyle') === 'italic'),
                renderHTML: attrs => attrs.italic ? { 'data-italic': 'true' } : {},
            },
            underline: {
                default: false,
                parseHTML: el => parseBooleanAttribute(el.getAttribute('data-underline'), getStyleProperty(el, 'textDecoration').includes('underline')),
                renderHTML: attrs => attrs.underline ? { 'data-underline': 'true' } : {},
            },
            uppercase: {
                default: false,
                parseHTML: el => parseBooleanAttribute(el.getAttribute('data-uppercase'), getStyleProperty(el, 'textTransform') === 'uppercase'),
                renderHTML: attrs => attrs.uppercase ? { 'data-uppercase': 'true' } : {},
            },
            fontSize: {
                default: 14,
                parseHTML: el => parseIntegerAttribute(el.getAttribute('data-font-size') || getStyleProperty(el, 'fontSize'), 14),
                renderHTML: attrs => ({ 'data-font-size': String(attrs.fontSize || 14) }),
            },
            rounded: {
                default: 12,
                parseHTML: el => parseIntegerAttribute(el.getAttribute('data-rounded') || getStyleProperty(el, 'borderRadius'), 12),
                renderHTML: attrs => ({ 'data-rounded': String(attrs.rounded || 12) }),
            },
            documentUrl: {
                default: '',
                parseHTML: el => el.getAttribute('data-document-url') || '',
                renderHTML: attrs => attrs.documentUrl ? { 'data-document-url': attrs.documentUrl } : {},
            },
            documentFilename: {
                default: '',
                parseHTML: el => el.getAttribute('data-document-filename') || el.getAttribute('download') || '',
                renderHTML: attrs => attrs.documentFilename ? { 'data-document-filename': attrs.documentFilename } : {},
            },
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
            'data-text': node.attrs.text || 'Click aquí',
            'data-href': node.attrs.href || '#',
            'data-variant': node.attrs.variant || 'primary',
            'data-new-tab': String(node.attrs.newTab !== false),
            ...(node.attrs.bgColor ? { 'data-bg-color': node.attrs.bgColor } : {}),
            ...(node.attrs.textColor ? { 'data-text-color': node.attrs.textColor } : {}),
            ...(node.attrs.bold ? { 'data-bold': 'true' } : {}),
            ...(node.attrs.italic ? { 'data-italic': 'true' } : {}),
            ...(node.attrs.underline ? { 'data-underline': 'true' } : {}),
            ...(node.attrs.uppercase ? { 'data-uppercase': 'true' } : {}),
            'data-font-size': String(node.attrs.fontSize || 14),
            'data-rounded': String(node.attrs.rounded || 12),
            ...(node.attrs.documentUrl ? { 'data-document-url': node.attrs.documentUrl } : {}),
            ...(node.attrs.documentFilename ? { 'data-document-filename': node.attrs.documentFilename } : {}),
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
                contentEditable={false}
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
                    <div className="bg-[var(--bg-primary)]/70 p-2">
                        <PdfPreview
                            src={node.attrs.src}
                            title={node.attrs.filename || 'Documento PDF'}
                            height={node.attrs.embedHeight || 500}
                        />
                    </div>
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
                         contentEditable={false}
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
            ...(width ? { 'data-embed-width': String(width) } : {}),
            style: containerStyle,
        }));

        return ['div', containerAttrs];
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

// ─── ImageGrid — constructor de galerías para imágenes ───────────────────────
const IMAGE_GRID_SELECT_OPTIONS = {
    columns: [
        { value: '1', label: '1 columna' },
        { value: '2', label: '2 columnas' },
        { value: '3', label: '3 columnas' },
        { value: '4', label: '4 columnas' },
    ],
    mobileColumns: [
        { value: '1', label: '1 columna' },
        { value: '2', label: '2 columnas' },
    ],
    gap: [
        { value: 'tight', label: 'Compacto' },
        { value: 'normal', label: 'Equilibrado' },
        { value: 'loose', label: 'Amplio' },
    ],
    aspectRatio: [
        { value: 'landscape', label: 'Panorámico 4:3' },
        { value: 'square', label: 'Cuadrado 1:1' },
        { value: 'portrait', label: 'Vertical 3:4' },
        { value: 'auto', label: 'Altura automática' },
    ],
    captionMode: [
        { value: 'below', label: 'Debajo' },
        { value: 'overlay', label: 'Superpuesta' },
        { value: 'hidden', label: 'Ocultas' },
    ],
    cornerStyle: [
        { value: 'soft', label: 'Suave' },
        { value: 'rounded', label: 'Redondeado' },
        { value: 'pill', label: 'Editorial' },
    ],
    width: [
        { value: 'content', label: 'Contenido' },
        { value: 'wide', label: 'Ancho' },
        { value: 'full', label: 'Completo' },
    ],
    imageFit: [
        { value: 'cover', label: 'Cubrir' },
        { value: 'contain', label: 'Completa' },
    ],
    layoutStyle: [
        { value: 'uniform', label: 'Uniforme' },
        { value: 'mosaic', label: 'Mosaico flexible' },
    ],
    itemSize: [
        { value: 'standard', label: 'Estandar' },
        { value: 'wide', label: 'Ancho' },
        { value: 'tall', label: 'Vertical' },
        { value: 'hero', label: 'Hero' },
    ],
    hoverEffect: [
        { value: 'none', label: 'Ninguno' },
        { value: 'zoom', label: 'Zoom' },
        { value: 'overlay', label: 'Overlay oscuro' },
        { value: 'blur', label: 'Blur suave' },
        { value: 'lift', label: 'Elevación' },
    ],
    loadingMode: [
        { value: 'lazy', label: 'Lazy (recomendado)' },
        { value: 'eager', label: 'Inmediato' },
        { value: 'progressive', label: 'Progresivo' },
    ],
};

function joinClassNames(...values) {
    return values.filter(Boolean).join(' ');
}

function moveImageGridItem(items, fromIndex, toIndex) {
    if (toIndex < 0 || toIndex >= items.length || fromIndex === toIndex) return items;
    const next = [...items];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    return next;
}

function getImageGridAspectStyle(aspectRatio) {
    if (aspectRatio === 'square') return { aspectRatio: '1 / 1' };
    if (aspectRatio === 'portrait') return { aspectRatio: '3 / 4' };
    if (aspectRatio === 'auto') return { minHeight: '180px' };
    return { aspectRatio: '4 / 3' };
}

function getImageGridGapValue(gap) {
    if (gap === 'tight') return '8px';
    if (gap === 'loose') return '20px';
    return '14px';
}

function getImageGridBorderRadiusValue(cornerStyle) {
    if (cornerStyle === 'soft') return '14px';
    if (cornerStyle === 'pill') return '28px';
    return '22px';
}

function getImageGridObjectFit(imageFit) {
    return imageFit === 'contain' ? 'contain' : 'cover';
}

function ImageGridSelectField({ label, value, options, onChange }) {
    return (
        <label className="grid gap-1.5 text-xs text-[var(--text-muted)]">
            <span className="text-[10px] uppercase tracking-[0.24em]">{label}</span>
            <select
                value={value}
                onChange={onChange}
                className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
        </label>
    );
}

function ImageGridView({ node, updateAttributes, selected, deleteNode }) {
    const config = normalizeImageGridConfig(node.attrs);
    const images = normalizeImageGridItems(node.attrs.images);
    const { token } = useAuth();
    const fileRef = useRef(null);
    const [uploadIdx, setUploadIdx] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [dragState, setDragState] = useState({ sourceIndex: null, targetIndex: null });

    function setGridAttributes(patch) {
        updateAttributes({ ...patch });
    }

    function updateImageItem(index, patch) {
        const next = [...images];
        next[index] = { ...next[index], ...patch };
        setGridAttributes({ images: next });
    }

    function handleDragStart(index) {
        setDragState({ sourceIndex: index, targetIndex: index });
    }

    function handleDragOver(event, index) {
        event.preventDefault();
        if (dragState.targetIndex !== index) {
            setDragState(current => ({ ...current, targetIndex: index }));
        }
    }

    function handleDrop(event, index) {
        event.preventDefault();
        if (dragState.sourceIndex === null) return;
        setGridAttributes({ images: moveImageGridItem(images, dragState.sourceIndex, index) });
        setDragState({ sourceIndex: null, targetIndex: null });
    }

    function resetDragState() {
        setDragState({ sourceIndex: null, targetIndex: null });
    }

    function openPicker(idx) {
        setUploadIdx(idx);
        setTimeout(() => fileRef.current?.click(), 0);
    }

    async function handleFile(e) {
        const file = e.target.files?.[0];
        if (!file || !token) return;
        const validationError = validateImageFile(file);
        if (validationError) {
            console.error(validationError);
            e.target.value = '';
            return;
        }
        setUploading(true);
        try {
            const { url } = await cmsApi.uploadImage(token, file);
            const next = [...images];
            if (uploadIdx !== null && uploadIdx < next.length) {
                next[uploadIdx] = { ...next[uploadIdx], src: url };
            } else {
                next.push({ src: url, alt: '', caption: '', href: '', openInNewTab: false });
            }
            setGridAttributes({ images: next });
        } catch (err) { console.error(err); }
        finally { setUploading(false); e.target.value = ''; setUploadIdx(null); }
    }

    function removeImage(idx) {
        const next = images.filter((_, i) => i !== idx);
        setGridAttributes({ images: next });
    }

    return (
        <RichBlockFrame
            alignment={node.attrs.textAlign}
            selected={selected}
            onRemove={deleteNode}
            wrapperClassName="my-6"
            frameClassName="w-full"
        >
            <div className={joinClassNames(selected ? 'rounded-[1.75rem] ring-2 ring-fuchsia-500 ring-offset-2 ring-offset-transparent' : '', 'space-y-4')} contentEditable={false}>
                <div className="rounded-[1.6rem] border border-[var(--border-color)] bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(15,23,42,0.72))] p-4 shadow-[0_22px_70px_rgba(15,23,42,0.18)]">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Image grid</p>
                            <h3 className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Galeria estilo constructor</h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-muted)]">
                            <span className="rounded-full border border-[var(--border-color)] bg-[var(--bg-primary)]/65 px-3 py-1">{images.length} items</span>
                            <span className="rounded-full border border-[var(--border-color)] bg-[var(--bg-primary)]/65 px-3 py-1">{config.columns} col desktop</span>
                            <span className="rounded-full border border-[var(--border-color)] bg-[var(--bg-primary)]/65 px-3 py-1">{config.mobileColumns} col mobile</span>
                        </div>
                    </div>

                    <div className={joinClassNames('mx-auto', getImageGridWidthClass(config.width))}>
                        <div className={joinClassNames('grid', getImageGridColumnsClass(config), getImageGridGapClass(config.gap))} style={{ gap: getImageGridGapValue(config.gap) }}>
                    {images.map((image, i) => (
                        <div
                            key={`${image.src}-${i}`}
                            draggable={selected}
                            onDragStart={(event) => {
                                event.dataTransfer.effectAllowed = 'move';
                                handleDragStart(i);
                            }}
                            onDragOver={(event) => handleDragOver(event, i)}
                            onDrop={(event) => handleDrop(event, i)}
                            onDragEnd={resetDragState}
                            className={joinClassNames(
                                'relative group/item overflow-hidden border border-white/10 bg-[var(--bg-elevated)]/80 transition-all',
                                getImageGridCornerClass(config.cornerStyle),
                                getImageGridItemSpanClass(image, config),
                                dragState.sourceIndex === i ? 'cursor-grabbing opacity-70 ring-2 ring-fuchsia-400/40' : selected ? 'cursor-grab' : '',
                                dragState.targetIndex === i && dragState.sourceIndex !== i ? 'ring-2 ring-cyan-400/70 ring-offset-2 ring-offset-slate-950/20' : ''
                            )}
                            style={{
                                ...(getImageGridItemAspectClass(image, config) ? {} : getImageGridAspectStyle(config.aspectRatio)),
                                borderRadius: getImageGridBorderRadiusValue(config.cornerStyle),
                            }}
                            data-image-grid-item-size={image.size || 'standard'}
                        >
                            <img
                                src={image.src}
                                alt={image.alt || ''}
                                className={joinClassNames(
                                    'h-full w-full bg-[var(--bg-primary)]/70',
                                    getImageGridItemAspectClass(image, config) || getImageGridAspectClass(config.aspectRatio),
                                    getImageGridImageFitClass(config.imageFit)
                                )}
                                style={{ objectFit: getImageGridObjectFit(config.imageFit) }}
                            />
                            {selected && (
                                <div className="absolute left-3 top-3 rounded-full border border-white/15 bg-slate-950/78 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-100 backdrop-blur">
                                    Arrastrar
                                </div>
                            )}
                            {config.layoutStyle === 'mosaic' && image.size !== 'standard' && (
                                <div className="absolute right-3 top-3 rounded-full border border-white/15 bg-slate-950/78 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-100 backdrop-blur">
                                    {getImageGridItemSizeLabel(image.size)}
                                </div>
                            )}
                            {config.captionMode === 'overlay' && (image.caption || image.alt) && (
                                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent px-3 pb-3 pt-10 text-xs leading-5 text-white">
                                    {image.caption || image.alt}
                                </div>
                            )}
                            {config.captionMode === 'below' && (image.caption || image.alt) && (
                                <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-slate-950/78 px-3 py-2 text-xs leading-5 text-slate-100">
                                    {image.caption || image.alt}
                                </div>
                            )}
                            {image.href && (
                                <div className={joinClassNames('absolute left-3 rounded-full bg-slate-950/75 px-2.5 py-1 text-[10px] font-medium text-slate-100 backdrop-blur', selected ? 'top-12' : 'top-3')}>
                                    Enlace {image.openInNewTab ? 'externo' : 'interno'}
                                </div>
                            )}
                            {selected && (
                                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/55 opacity-0 transition-opacity group-hover/item:opacity-100">
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
                    <button type="button" onClick={() => openPicker(null)}
                        disabled={uploading}
                        className={joinClassNames('flex min-h-[180px] flex-col items-center justify-center gap-2 border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-elevated)]/45 text-[var(--text-muted)] transition-colors hover:border-fuchsia-500/50 hover:text-fuchsia-400', getImageGridCornerClass(config.cornerStyle))}
                        style={{ borderRadius: getImageGridBorderRadiusValue(config.cornerStyle) }}>
                        {uploading
                            ? <span className="text-xs animate-pulse">Subiendo…</span>
                            : <>
                                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                                <span className="text-xs">Anadir item</span>
                              </>}
                    </button>
                        </div>
                    </div>
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

                {selected && (
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.35fr)]">
                        <div className="space-y-3 rounded-[1.4rem] border border-[var(--border-color)] bg-[var(--bg-elevated)]/65 p-4">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Layout</p>
                                <h4 className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Opciones del bloque</h4>
                            </div>
                            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)]/45 px-3 py-2 text-xs leading-5 text-[var(--text-secondary)]">
                                Usa drag & drop sobre la vista previa para reordenar. El modo mosaico activa tamanos por item sin romper grids existentes.
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <ImageGridSelectField label="Columnas desktop" value={String(config.columns)} options={IMAGE_GRID_SELECT_OPTIONS.columns} onChange={(event) => setGridAttributes({ columns: Number(event.target.value) })} />
                                <ImageGridSelectField label="Columnas mobile" value={String(config.mobileColumns)} options={IMAGE_GRID_SELECT_OPTIONS.mobileColumns} onChange={(event) => setGridAttributes({ mobileColumns: Number(event.target.value) })} />
                                <ImageGridSelectField label="Gap" value={config.gap} options={IMAGE_GRID_SELECT_OPTIONS.gap} onChange={(event) => setGridAttributes({ gap: event.target.value })} />
                                <ImageGridSelectField label="Relacion" value={config.aspectRatio} options={IMAGE_GRID_SELECT_OPTIONS.aspectRatio} onChange={(event) => setGridAttributes({ aspectRatio: event.target.value })} />
                                <ImageGridSelectField label="Captions" value={config.captionMode} options={IMAGE_GRID_SELECT_OPTIONS.captionMode} onChange={(event) => setGridAttributes({ captionMode: event.target.value })} />
                                <ImageGridSelectField label="Esquinas" value={config.cornerStyle} options={IMAGE_GRID_SELECT_OPTIONS.cornerStyle} onChange={(event) => setGridAttributes({ cornerStyle: event.target.value })} />
                                <ImageGridSelectField label="Ancho" value={config.width} options={IMAGE_GRID_SELECT_OPTIONS.width} onChange={(event) => setGridAttributes({ width: event.target.value })} />
                                <ImageGridSelectField label="Ajuste imagen" value={config.imageFit} options={IMAGE_GRID_SELECT_OPTIONS.imageFit} onChange={(event) => setGridAttributes({ imageFit: event.target.value })} />
                                <ImageGridSelectField label="Estilo del bloque" value={config.layoutStyle} options={IMAGE_GRID_SELECT_OPTIONS.layoutStyle} onChange={(event) => setGridAttributes({ layoutStyle: event.target.value })} />
                                <ImageGridSelectField label="Efecto hover" value={config.hoverEffect || 'none'} options={IMAGE_GRID_SELECT_OPTIONS.hoverEffect} onChange={(event) => setGridAttributes({ hoverEffect: event.target.value })} />
                                <ImageGridSelectField label="Modo de carga" value={config.loadingMode || 'lazy'} options={IMAGE_GRID_SELECT_OPTIONS.loadingMode} onChange={(event) => setGridAttributes({ loadingMode: event.target.value })} />
                            </div>
                            <label className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/70 px-3 py-2.5 text-sm text-[var(--text-secondary)] transition-colors hover:border-fuchsia-500/40">
                                <input
                                    type="checkbox"
                                    checked={Boolean(config.enableLightbox)}
                                    onChange={(event) => setGridAttributes({ enableLightbox: event.target.checked })}
                                    className="h-4 w-4 rounded border-[var(--border-color)] bg-[var(--bg-primary)] text-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/50"
                                />
                                <span>Habilitar lightbox al hacer click (solo si no tiene enlace)</span>
                            </label>
                        </div>

                        <div className="space-y-3 rounded-[1.4rem] border border-[var(--border-color)] bg-[var(--bg-elevated)]/65 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Items</p>
                                    <h4 className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Contenido editable del grid</h4>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => openPicker(null)}
                                    className="rounded-full border border-fuchsia-500/40 bg-fuchsia-500/10 px-3 py-1.5 text-xs font-medium text-fuchsia-200 transition-colors hover:bg-fuchsia-500/20"
                                >
                                    + Anadir item
                                </button>
                            </div>

                            {images.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-primary)]/40 px-4 py-6 text-center text-sm text-[var(--text-muted)]">
                                    Sube al menos una imagen para empezar a maquetar la galeria.
                                </div>
                            ) : images.map((image, index) => (
                                <article key={`${image.src}-meta-${index}`} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)]/60 p-3">
                                    <div className="flex flex-wrap items-start gap-3">
                                        <img src={image.src} alt={image.alt || ''} className="h-20 w-20 rounded-xl border border-[var(--border-color)] object-cover" />
                                        <div className="min-w-0 flex-1 space-y-2">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Item {index + 1}</p>
                                                    <p className="max-w-[280px] truncate text-sm font-medium text-[var(--text-primary)]">{image.caption || image.alt || image.src}</p>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <button type="button" onClick={() => setGridAttributes({ images: moveImageGridItem(images, index, index - 1) })} disabled={index === 0} className="rounded-lg border border-[var(--border-color)] px-2 py-1 text-xs text-[var(--text-muted)] disabled:cursor-not-allowed disabled:opacity-40">←</button>
                                                    <button type="button" onClick={() => setGridAttributes({ images: moveImageGridItem(images, index, index + 1) })} disabled={index === images.length - 1} className="rounded-lg border border-[var(--border-color)] px-2 py-1 text-xs text-[var(--text-muted)] disabled:cursor-not-allowed disabled:opacity-40">→</button>
                                                    <button type="button" onClick={() => openPicker(index)} className="rounded-lg border border-[var(--border-color)] px-2 py-1 text-xs text-[var(--text-muted)]">Reemplazar</button>
                                                    <button type="button" onClick={() => removeImage(index)} className="rounded-lg border border-red-500/40 bg-red-500/10 px-2 py-1 text-xs text-red-200">Eliminar</button>
                                                </div>
                                            </div>

                                            <div className="grid gap-2 md:grid-cols-2">
                                                <input
                                                    type="text"
                                                    value={image.alt || ''}
                                                    onChange={(event) => updateImageItem(index, { alt: event.target.value })}
                                                    placeholder={`Alt imagen ${index + 1}`}
                                                    className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
                                                />
                                                <input
                                                    type="text"
                                                    value={image.caption || ''}
                                                    onChange={(event) => updateImageItem(index, { caption: event.target.value })}
                                                    placeholder={`Caption imagen ${index + 1}`}
                                                    className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
                                                />
                                            </div>

                                            <div className="grid gap-2 md:grid-cols-2">
                                                <ImageGridSelectField
                                                    label="Tamano del item"
                                                    value={image.size || 'standard'}
                                                    options={IMAGE_GRID_SELECT_OPTIONS.itemSize}
                                                    onChange={(event) => updateImageItem(index, { size: event.target.value })}
                                                />
                                                <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/55 px-3 py-2 text-xs leading-5 text-[var(--text-secondary)]">
                                                    {config.layoutStyle === 'mosaic'
                                                        ? 'Activo en mosaico: ancho y hero expanden columnas cuando el bloque lo permite.'
                                                        : 'Guardado para despues: cambia el bloque a mosaico para aplicar variaciones visuales.'}
                                                </div>
                                            </div>

                                            <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_160px]">
                                                <input
                                                    type="url"
                                                    value={image.href || ''}
                                                    onChange={(event) => updateImageItem(index, { href: normalizeContentLinkHref(event.target.value) })}
                                                    placeholder="Enlace opcional del item"
                                                    className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
                                                />
                                                <label className="flex items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/70 px-3 py-2 text-xs text-[var(--text-secondary)]">
                                                    <input
                                                        type="checkbox"
                                                        checked={Boolean(image.openInNewTab)}
                                                        disabled={!image.href}
                                                        onChange={(event) => updateImageItem(index, { openInNewTab: event.target.checked })}
                                                    />
                                                    Nueva pestaña
                                                </label>
                                            </div>

                                            <div>
                                                <input
                                                    type="text"
                                                    value={(image.tags || []).join(', ')}
                                                    onChange={(event) => updateImageItem(index, { tags: event.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                                                    placeholder="Tags separados por comas (ej: naturaleza, paisaje)"
                                                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
                                                />
                                                <p className="mt-1.5 text-[10px] leading-4 text-[var(--text-muted)]">Los tags permiten filtrar la galería desde la vista pública</p>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
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
            columns: {
                default: 2,
                parseHTML: el => parseInt(el.getAttribute('data-columns') || el.getAttribute('data-cols')) || 2,
                renderHTML: attrs => ({ 'data-columns': attrs.columns }),
            },
            mobileColumns: {
                default: 1,
                parseHTML: el => parseInt(el.getAttribute('data-mobile-columns')) || 1,
                renderHTML: attrs => ({ 'data-mobile-columns': attrs.mobileColumns }),
            },
            gap: {
                default: 'normal',
                parseHTML: el => el.getAttribute('data-gap') || 'normal',
                renderHTML: attrs => ({ 'data-gap': attrs.gap }),
            },
            aspectRatio: {
                default: 'landscape',
                parseHTML: el => el.getAttribute('data-aspect') || 'landscape',
                renderHTML: attrs => ({ 'data-aspect': attrs.aspectRatio }),
            },
            captionMode: {
                default: 'below',
                parseHTML: el => el.getAttribute('data-caption-mode') || 'below',
                renderHTML: attrs => ({ 'data-caption-mode': attrs.captionMode }),
            },
            cornerStyle: {
                default: 'rounded',
                parseHTML: el => el.getAttribute('data-corner-style') || 'rounded',
                renderHTML: attrs => ({ 'data-corner-style': attrs.cornerStyle }),
            },
            width: {
                default: 'wide',
                parseHTML: el => el.getAttribute('data-width') || 'wide',
                renderHTML: attrs => ({ 'data-width': attrs.width }),
            },
            imageFit: {
                default: 'cover',
                parseHTML: el => el.getAttribute('data-image-fit') || 'cover',
                renderHTML: attrs => ({ 'data-image-fit': attrs.imageFit }),
            },
            layoutStyle: {
                default: 'uniform',
                parseHTML: el => el.getAttribute('data-layout') || 'uniform',
                renderHTML: attrs => ({ 'data-layout': attrs.layoutStyle }),
            },
            hoverEffect: {
                default: 'none',
                parseHTML: el => el.getAttribute('data-hover-effect') || 'none',
                renderHTML: attrs => ({ 'data-hover-effect': attrs.hoverEffect }),
            },
            enableLightbox: {
                default: false,
                parseHTML: el => el.getAttribute('data-enable-lightbox') === 'true',
                renderHTML: attrs => ({ 'data-enable-lightbox': attrs.enableLightbox ? 'true' : 'false' }),
            },
            loadingMode: {
                default: 'lazy',
                parseHTML: el => el.getAttribute('data-loading-mode') || 'lazy',
                renderHTML: attrs => ({ 'data-loading-mode': attrs.loadingMode }),
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
        const config = normalizeImageGridConfig(node.attrs);
        const images = normalizeImageGridItems(node.attrs.images);
        const widthStyle = config.width === 'content'
            ? 'width:100%;max-width:768px'
            : config.width === 'full'
                ? 'width:100%;max-width:none'
                : 'width:100%;max-width:1100px';
        const aspectStyle = config.aspectRatio === 'square'
            ? 'aspect-ratio:1 / 1'
            : config.aspectRatio === 'portrait'
                ? 'aspect-ratio:3 / 4'
                : config.aspectRatio === 'auto'
                    ? 'min-height:180px'
                    : 'aspect-ratio:4 / 3';
        const objectFit = config.imageFit === 'contain' ? 'contain' : 'cover';
        const gap = config.gap === 'tight' ? '8px' : config.gap === 'loose' ? '20px' : '14px';
        const radius = config.cornerStyle === 'soft' ? '14px' : config.cornerStyle === 'pill' ? '28px' : '22px';
        const gridStyle = `display:grid;grid-template-columns:repeat(${config.columns},minmax(0,1fr));gap:${gap};margin:1.5em 0;${widthStyle}`;
        const children = images.map(image => ['figure', { style: `border-radius:${radius};overflow:hidden;background:rgba(15,23,42,0.08);margin:0;border:1px solid rgba(148,163,184,0.18)` },
            image.href
                ? ['a', mergeAttributes(resolveContentLinkAttributes({ href: image.href, target: image.openInNewTab ? '_blank' : '_self', rel: image.openInNewTab ? 'noopener noreferrer' : '' }), { style: 'display:block;text-decoration:none;color:inherit' }), ['img', { src: image.src, alt: image.alt || '', style: `width:100%;height:100%;object-fit:${objectFit};${aspectStyle}`, loading: 'lazy' }]]
                : ['img', { src: image.src, alt: image.alt || '', style: `width:100%;height:100%;object-fit:${objectFit};${aspectStyle}`, loading: 'lazy' }],
            config.captionMode !== 'hidden' && (image.caption || image.alt)
                ? ['figcaption', { style: `padding:8px 10px;font-size:12px;line-height:1.5;${config.captionMode === 'overlay' ? 'background:linear-gradient(180deg,rgba(15,23,42,0),rgba(15,23,42,0.88));color:#fff;margin-top:-52px;position:relative' : 'color:var(--text-muted,#94a3b8);border-top:1px solid rgba(148,163,184,0.18)'}` }, image.caption || image.alt]
                : null,
        ].filter(Boolean));
        return ['div', mergeAttributes(getRichBlockHtmlAttributes(HTMLAttributes, node.attrs.textAlign, {
            'data-block': 'image-grid',
            'data-version': '3',
            'data-image-grid': '',
            'data-columns': config.columns,
            'data-mobile-columns': config.mobileColumns,
            'data-gap': config.gap,
            'data-aspect': config.aspectRatio,
            'data-caption-mode': config.captionMode,
            'data-corner-style': config.cornerStyle,
            'data-width': config.width,
            'data-image-fit': config.imageFit,
            'data-layout': config.layoutStyle,
            'data-hover-effect': config.hoverEffect,
            'data-enable-lightbox': config.enableLightbox ? 'true' : 'false',
            'data-loading-mode': config.loadingMode,
            'data-images': JSON.stringify(images),
            style: gridStyle,
        })), ...children];
    },
    addNodeView() { return ReactNodeViewRenderer(ImageGridView); },
    addCommands() {
        return {
            insertImageGrid: (cols = 2) => ({ commands }) => commands.insertContent({
                type: this.name,
                attrs: { columns: cols, layoutStyle: 'uniform', images: [] },
            }),
        };
    },
});

// ─── Video Gallery Extension ──────────────────────────────────────────────────

const VIDEO_GALLERY_SELECT_OPTIONS = {
    layout: [
        { value: 'grid', label: 'Cuadrícula' },
        { value: 'list', label: 'Lista' },
        { value: 'carousel', label: 'Carrusel' },
    ],
    columns: [
        { value: '1', label: '1 columna' },
        { value: '2', label: '2 columnas' },
        { value: '3', label: '3 columnas' },
        { value: '4', label: '4 columnas' },
    ],
    aspectRatio: [
        { value: '16/9', label: '16:9 (YouTube)' },
        { value: '4/3', label: '4:3 (Clásico)' },
        { value: '21/9', label: '21:9 (Cinemático)' },
        { value: 'auto', label: 'Automático' },
    ],
    provider: [
        { value: 'youtube', label: 'YouTube' },
        { value: 'vimeo', label: 'Vimeo' },
        { value: 'local', label: 'Video local' },
    ],
};

function VideoGallerySelectField({ label, value, options, onChange }) {
    return (
        <label className="grid gap-1.5 text-xs text-[var(--text-muted)]">
            <span className="text-[10px] uppercase tracking-[0.24em]">{label}</span>
            <select
                value={value}
                onChange={onChange}
                className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
        </label>
    );
}

function VideoGalleryView({ node, updateAttributes, selected, deleteNode }) {
    useAuth(); // Auth context needed for form behavior
    const videos = normalizeVideoGalleryItems(node.attrs.videos || []);
    const config = normalizeVideoGalleryConfig(node.attrs);
    const [isAddingVideo, setIsAddingVideo] = useState(false);
    const [newVideoUrl, setNewVideoUrl] = useState('');
    const [newVideoTitle, setNewVideoTitle] = useState('');
    const [newVideoProvider, setNewVideoProvider] = useState('youtube');

    function setGalleryAttributes(updates) {
        updateAttributes({ ...node.attrs, ...updates });
    }

    function updateVideoItem(index, updates) {
        const next = [...videos];
        next[index] = { ...next[index], ...updates };
        setGalleryAttributes({ videos: next });
    }

    function addVideo() {
        if (!newVideoUrl.trim()) return;
        
        const newVideo = {
            src: newVideoUrl,
            title: newVideoTitle,
            provider: newVideoProvider,
        };
        
        setGalleryAttributes({ videos: [...videos, newVideo] });
        setNewVideoUrl('');
        setNewVideoTitle('');
        setIsAddingVideo(false);
    }

    function removeVideo(index) {
        const next = videos.filter((_, i) => i !== index);
        setGalleryAttributes({ videos: next });
    }

    function moveVideo(fromIndex, toIndex) {
        if (toIndex < 0 || toIndex >= videos.length || fromIndex === toIndex) return;
        const next = [...videos];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        setGalleryAttributes({ videos: next });
    }

    return (
        <RichBlockFrame
            alignment={node.attrs.textAlign}
            selected={selected}
            onRemove={deleteNode}
            wrapperClassName="my-6"
            frameClassName="w-full"
        >
            <div className={joinClassNames(selected ? 'rounded-[1.75rem] ring-2 ring-fuchsia-500 ring-offset-2 ring-offset-transparent' : '', 'space-y-4')} contentEditable={false}>
                <div className="rounded-[1.6rem] border border-[var(--border-color)] bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(15,23,42,0.72))] p-4 shadow-[0_22px_70px_rgba(15,23,42,0.18)]">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Video Gallery</p>
                            <h3 className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Galería multimedia</h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-muted)]">
                            <span className="rounded-full border border-[var(--border-color)] bg-[var(--bg-primary)]/65 px-3 py-1">{videos.length} videos</span>
                            <span className="rounded-full border border-[var(--border-color)] bg-[var(--bg-primary)]/65 px-3 py-1">{config.layout}</span>
                        </div>
                    </div>

                    {videos.length > 0 ? (
                        <div className={joinClassNames('grid gap-4', getVideoGalleryColumnsClass(config.columns))}>
                            {videos.map((video, index) => (
                                <div
                                    key={`${video.src}-${index}`}
                                    className="group relative overflow-hidden rounded-xl border border-white/10 bg-[var(--bg-elevated)]/80"
                                >
                                    <div className={joinClassNames('relative bg-black', getVideoGalleryAspectClass(config.aspectRatio))}>
                                        {video.thumbnail && (
                                            <img
                                                src={video.thumbnail}
                                                alt={video.title || 'Video'}
                                                className="h-full w-full object-cover"
                                            />
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600/90">
                                                <svg className="ml-1 h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {selected && (
                                        <div className="absolute right-2 top-2 flex gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => moveVideo(index, index - 1)}
                                                disabled={index === 0}
                                                className="rounded-lg border border-[var(--border-color)] bg-black/60 px-2 py-1 text-xs text-white backdrop-blur disabled:opacity-40"
                                            >
                                                ←
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => moveVideo(index, index + 1)}
                                                disabled={index === videos.length - 1}
                                                className="rounded-lg border border-[var(--border-color)] bg-black/60 px-2 py-1 text-xs text-white backdrop-blur disabled:opacity-40"
                                            >
                                                →
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeVideo(index)}
                                                className="rounded-lg border border-red-500/40 bg-red-500/20 px-2 py-1 text-xs text-red-200 backdrop-blur"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    )}

                                    {config.showTitles && video.title && (
                                        <div className="border-t border-white/10 bg-black/40 px-3 py-2 text-xs text-white backdrop-blur">
                                            {video.title}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-primary)]/40 px-6 py-12 text-center text-sm text-[var(--text-muted)]">
                            Añade videos desde el panel lateral
                        </div>
                    )}
                </div>

                {selected && (
                    <div className="grid gap-4 lg:grid-cols-2">
                        <div className="space-y-3 rounded-[1.4rem] border border-[var(--border-color)] bg-[var(--bg-elevated)]/65 p-4">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Layout</p>
                                <h4 className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Opciones de visualización</h4>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <VideoGallerySelectField
                                    label="Diseño"
                                    value={config.layout}
                                    options={VIDEO_GALLERY_SELECT_OPTIONS.layout}
                                    onChange={(e) => setGalleryAttributes({ layout: e.target.value })}
                                />
                                <VideoGallerySelectField
                                    label="Columnas"
                                    value={String(config.columns)}
                                    options={VIDEO_GALLERY_SELECT_OPTIONS.columns}
                                    onChange={(e) => setGalleryAttributes({ columns: Number(e.target.value) })}
                                />
                                <VideoGallerySelectField
                                    label="Relación aspecto"
                                    value={config.aspectRatio}
                                    options={VIDEO_GALLERY_SELECT_OPTIONS.aspectRatio}
                                    onChange={(e) => setGalleryAttributes({ aspectRatio: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/70 px-3 py-2.5 text-sm text-[var(--text-secondary)]">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(config.showTitles)}
                                        onChange={(e) => setGalleryAttributes({ showTitles: e.target.checked })}
                                        className="h-4 w-4"
                                    />
                                    <span>Mostrar títulos</span>
                                </label>
                                <label className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/70 px-3 py-2.5 text-sm text-[var(--text-secondary)]">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(config.showDurations)}
                                        onChange={(e) => setGalleryAttributes({ showDurations: e.target.checked })}
                                        className="h-4 w-4"
                                    />
                                    <span>Mostrar duraciones</span>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-3 rounded-[1.4rem] border border-[var(--border-color)] bg-[var(--bg-elevated)]/65 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Videos</p>
                                    <h4 className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Gestión de contenido</h4>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsAddingVideo(!isAddingVideo)}
                                    className="rounded-full border border-fuchsia-500/40 bg-fuchsia-500/10 px-3 py-1.5 text-xs font-medium text-fuchsia-200 transition-colors hover:bg-fuchsia-500/20"
                                >
                                    + Añadir video
                                </button>
                            </div>

                            {isAddingVideo && (
                                <div className="space-y-2 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)]/60 p-3">
                                    <VideoGallerySelectField
                                        label="Proveedor"
                                        value={newVideoProvider}
                                        options={VIDEO_GALLERY_SELECT_OPTIONS.provider}
                                        onChange={(e) => setNewVideoProvider(e.target.value)}
                                    />
                                    <input
                                        type="url"
                                        value={newVideoUrl}
                                        onChange={(e) => setNewVideoUrl(e.target.value)}
                                        placeholder="URL del video (ej: https://youtube.com/watch?v=...)"
                                        className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
                                    />
                                    <input
                                        type="text"
                                        value={newVideoTitle}
                                        onChange={(e) => setNewVideoTitle(e.target.value)}
                                        placeholder="Título del video (opcional)"
                                        className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={addVideo}
                                            className="flex-1 rounded-lg border border-fuchsia-500/40 bg-fuchsia-500/10 px-3 py-2 text-xs text-fuchsia-200 hover:bg-fuchsia-500/20"
                                        >
                                            Añadir
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsAddingVideo(false);
                                                setNewVideoUrl('');
                                                setNewVideoTitle('');
                                            }}
                                            className="flex-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]/60 px-3 py-2 text-xs text-[var(--text-muted)]"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}

                            {videos.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-primary)]/40 px-4 py-6 text-center text-sm text-[var(--text-muted)]">
                                    Haz click en "Añadir video" para empezar
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {videos.map((video, index) => (
                                        <div key={`${video.src}-edit-${index}`} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/60 p-3">
                                            <div className="mb-2 flex items-start justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Video {index + 1}</p>
                                                    <p className="truncate text-sm font-medium text-[var(--text-primary)]">{video.title || video.src}</p>
                                                </div>
                                            </div>
                                            <input
                                                type="text"
                                                value={video.title || ''}
                                                onChange={(e) => updateVideoItem(index, { title: e.target.value })}
                                                placeholder="Título del video"
                                                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </RichBlockFrame>
    );
}

export const VideoGalleryExtension = Node.create({
    name: 'videoGallery',
    group: 'block',
    atom: true,
    defining: true,
    addAttributes() {
        return {
            layout: {
                default: 'grid',
                parseHTML: el => el.getAttribute('data-layout') || 'grid',
                renderHTML: attrs => ({ 'data-layout': attrs.layout }),
            },
            columns: {
                default: 2,
                parseHTML: el => parseInt(el.getAttribute('data-columns')) || 2,
                renderHTML: attrs => ({ 'data-columns': attrs.columns }),
            },
            aspectRatio: {
                default: '16/9',
                parseHTML: el => el.getAttribute('data-aspect-ratio') || '16/9',
                renderHTML: attrs => ({ 'data-aspect-ratio': attrs.aspectRatio }),
            },
            showTitles: {
                default: true,
                parseHTML: el => el.getAttribute('data-show-titles') !== 'false',
                renderHTML: attrs => ({ 'data-show-titles': attrs.showTitles ? 'true' : 'false' }),
            },
            showDurations: {
                default: false,
                parseHTML: el => el.getAttribute('data-show-durations') === 'true',
                renderHTML: attrs => ({ 'data-show-durations': attrs.showDurations ? 'true' : 'false' }),
            },
            videos: {
                default: [],
                parseHTML: el => {
                    try { return normalizeVideoGalleryItems(JSON.parse(el.getAttribute('data-videos') || '[]')); }
                    catch { return []; }
                },
                renderHTML: attrs => ({ 'data-videos': JSON.stringify(normalizeVideoGalleryItems(attrs.videos)) }),
            },
            textAlign: createRichBlockTextAlignAttribute(),
        };
    },
    parseHTML() { return [{ tag: 'div[data-video-gallery]' }, { tag: 'div[data-block="video-gallery"]' }]; },
    renderHTML({ node, HTMLAttributes }) {
        const config = normalizeVideoGalleryConfig(node.attrs);
        const videos = normalizeVideoGalleryItems(node.attrs.videos);
        
        return ['div', mergeAttributes(getRichBlockHtmlAttributes(HTMLAttributes, node.attrs.textAlign, {
            'data-block': 'video-gallery',
            'data-video-gallery': '',
            'data-layout': config.layout,
            'data-columns': config.columns,
            'data-aspect-ratio': config.aspectRatio,
            'data-show-titles': config.showTitles ? 'true' : 'false',
            'data-show-durations': config.showDurations ? 'true' : 'false',
            'data-videos': JSON.stringify(videos),
        }))];
    },
    addNodeView() { return ReactNodeViewRenderer(VideoGalleryView); },
    addCommands() {
        return {
            insertVideoGallery: () => ({ commands }) => commands.insertContent({
                type: this.name,
                attrs: { layout: 'grid', columns: 2, videos: [] },
            }),
        };
    },
});

// ─── GIF Extension ────────────────────────────────────────────────────────────

function GifView({ node, updateAttributes, selected, deleteNode }) {
    const { isAuthenticated } = useAuth();
    const fileRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const [showGifPicker, setShowGifPicker] = useState(false);

    const src = node.attrs.src || '';
    const alt = node.attrs.alt || '';
    const caption = node.attrs.caption || '';
    const width = node.attrs.width || 400;
    const autoplay = node.attrs.autoplay !== false;

    async function handleFileChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        const validation = validateImageFile(file);
        if (!validation.isValid) {
            alert(validation.error);
            return;
        }

        if (!file.type.includes('gif')) {
            alert('Solo se permiten archivos GIF');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            const result = await cmsApi.uploadImage(formData);
            updateAttributes({ src: result.url, alt: alt || 'GIF animado' });
        } catch (err) {
            console.error(err);
            alert('Error al subir el GIF');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    }

    function openFilePicker() {
        if (!isAuthenticated) return;
        fileRef.current?.click();
    }

    function handleGifSelect(gifUrl, gifTitle) {
        updateAttributes({ src: gifUrl, alt: gifTitle || 'GIF animado' });
        setShowGifPicker(false);
    }

    return (
        <RichBlockFrame
            alignment={node.attrs.textAlign}
            selected={selected}
            onRemove={deleteNode}
            wrapperClassName="my-4"
            frameClassName="inline-block"
        >
            <div
                className={joinClassNames('group relative rounded-xl overflow-hidden', selected ? 'ring-2 ring-fuchsia-500' : '')}
                style={{ maxWidth: `${width}px` }}
                onMouseEnter={() => setShowControls(true)}
                onMouseLeave={() => setShowControls(false)}
            >
                {src ? (
                    <img
                        src={src}
                        alt={alt}
                        className="block w-full rounded-xl"
                        style={{ imageRendering: autoplay ? 'auto' : 'pixelated' }}
                    />
                ) : (
                    <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-surface)]/50 p-8">
                        <svg className="h-16 w-16 text-[var(--text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="m21 15-5-5L5 21" />
                        </svg>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowGifPicker(true)}
                                className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 transition-colors hover:bg-cyan-500/20"
                            >
                                🎬 Buscar GIF
                            </button>
                            <button
                                type="button"
                                onClick={openFilePicker}
                                disabled={uploading}
                                className="rounded-lg border border-fuchsia-500/40 bg-fuchsia-500/10 px-4 py-2 text-sm font-medium text-fuchsia-200 transition-colors hover:bg-fuchsia-500/20 disabled:opacity-50"
                            >
                                {uploading ? 'Subiendo...' : '📁 Subir GIF'}
                            </button>
                        </div>
                    </div>
                )}

                {src && (selected || showControls) && (
                    <div className="absolute right-2 top-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                            type="button"
                            onClick={openFilePicker}
                            className="rounded-lg border border-[var(--border-color)] bg-black/70 px-2 py-1 text-xs text-white backdrop-blur"
                        >
                            Cambiar
                        </button>
                    </div>
                )}

                <input
                    ref={fileRef}
                    type="file"
                    accept="image/gif"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>

            {selected && src && (
                <div className="mt-3 space-y-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)]/65 p-3" onMouseDown={e => e.stopPropagation()}>
                    {/* Alineación */}
                    <div onMouseDown={e => e.stopPropagation()}>
                        <span className="mb-1 block text-xs text-[var(--text-muted)]">Alineación</span>
                        <div className="flex gap-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]/60 p-1">
                            <button
                                type="button"
                                onClick={() => updateAttributes({ textAlign: 'left' })}
                                className={`flex-1 rounded px-2 py-1 text-xs ${(node.attrs.textAlign === 'left' || !node.attrs.textAlign) ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                            >
                                ← Izquierda
                            </button>
                            <button
                                type="button"
                                onClick={() => updateAttributes({ textAlign: 'center' })}
                                className={`flex-1 rounded px-2 py-1 text-xs ${node.attrs.textAlign === 'center' ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                            >
                                Centro
                            </button>
                            <button
                                type="button"
                                onClick={() => updateAttributes({ textAlign: 'right' })}
                                className={`flex-1 rounded px-2 py-1 text-xs ${node.attrs.textAlign === 'right' ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                            >
                                Derecha →
                            </button>
                        </div>
                    </div>
                    <input
                        type="text"
                        value={alt}
                        onChange={(e) => updateAttributes({ alt: e.target.value })}
                        placeholder="Texto alternativo del GIF"
                        className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
                    />
                    <input
                        type="text"
                        value={caption}
                        onChange={(e) => updateAttributes({ caption: e.target.value })}
                        placeholder="Caption (opcional)"
                        className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
                    />
                    <div className="flex items-end gap-2" onMouseDown={e => e.stopPropagation()}>
                        <label className="flex-1" onMouseDown={e => e.stopPropagation()}>
                            <span className="mb-1 block text-xs text-[var(--text-muted)]">Ancho (px)</span>
                            <div className="flex items-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newWidth = Math.max(100, width - 50);
                                        updateAttributes({ width: newWidth });
                                    }}
                                    className="flex h-9 w-8 items-center justify-center rounded-l-lg border border-r-0 border-[var(--border-color)] bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]"
                                >
                                    −
                                </button>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={width}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        if (val === '') {
                                            updateAttributes({ width: 400 });
                                        } else {
                                            const num = parseInt(val, 10);
                                            if (!isNaN(num)) {
                                                const clamped = Math.max(100, Math.min(800, num));
                                                updateAttributes({ width: clamped });
                                            }
                                        }
                                    }}
                                    onMouseDown={e => e.stopPropagation()}
                                    className="w-16 rounded-none border-y border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-2 py-2 text-center text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newWidth = Math.min(800, width + 50);
                                        updateAttributes({ width: newWidth });
                                    }}
                                    className="flex h-9 w-8 items-center justify-center rounded-r-lg border border-l-0 border-[var(--border-color)] bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]"
                                >
                                    +
                                </button>
                            </div>
                        </label>
                        <label className="flex items-end gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]/70 px-3 py-2" onMouseDown={e => e.stopPropagation()}>
                            <input
                                type="checkbox"
                                checked={autoplay}
                                onChange={(e) => updateAttributes({ autoplay: e.target.checked })}
                                className="h-4 w-4"
                            />
                            <span className="text-sm text-[var(--text-secondary)]">Autoplay</span>
                        </label>
                    </div>
                </div>
            )}

            {caption && (
                <p className="mt-2 text-center text-sm italic text-[var(--text-muted)]">{caption}</p>
            )}

            {showGifPicker && (
                <GifPicker
                    onSelect={handleGifSelect}
                    onClose={() => setShowGifPicker(false)}
                />
            )}
        </RichBlockFrame>
    );
}

export const GifExtension = Node.create({
    name: 'gif',
    group: 'block',
    atom: true,
    defining: true,
    addAttributes() {
        return {
            src: {
                default: null,
                parseHTML: el => el.querySelector('img')?.getAttribute('src') || null,
                renderHTML: attrs => attrs.src,
            },
            alt: {
                default: '',
                parseHTML: el => el.querySelector('img')?.getAttribute('alt') || '',
                renderHTML: attrs => attrs.alt,
            },
            caption: {
                default: '',
                parseHTML: el => el.querySelector('figcaption')?.textContent || '',
                renderHTML: attrs => attrs.caption,
            },
            width: {
                default: 400,
                parseHTML: el => parseInt(el.getAttribute('data-width')) || 400,
                renderHTML: attrs => attrs.width,
            },
            autoplay: {
                default: true,
                parseHTML: el => el.getAttribute('data-autoplay') !== 'false',
                renderHTML: attrs => attrs.autoplay,
            },
            textAlign: createRichBlockTextAlignAttribute(),
        };
    },
    parseHTML() { return [{ tag: 'figure[data-gif]' }, { tag: 'div[data-block="gif"]' }]; },
    renderHTML({ node, HTMLAttributes }) {
        const { src, alt, caption, width, autoplay } = node.attrs;
        
        if (!src) return ['div', mergeAttributes(getRichBlockHtmlAttributes(HTMLAttributes, node.attrs.textAlign, { 'data-block': 'gif' }))];
        
        // Obtener alineación del atributo
        const alignment = node.attrs.textAlign || 'center';
        const marginMap = {
            left: '1em 0',
            center: '1em auto',
            right: '1em 0 1em auto',
        };
        
        const figureAttrs = mergeAttributes(getRichBlockHtmlAttributes(HTMLAttributes, node.attrs.textAlign, {
            'data-block': 'gif',
            'data-gif': '',
            'data-width': width,
            'data-autoplay': autoplay ? 'true' : 'false',
            style: `max-width:${width}px;margin:${marginMap[alignment] || '1em auto'};`,
        }));
        
        const children = [
            ['img', { src, alt: alt || '', style: `width:100%;border-radius:12px;${autoplay ? '' : 'image-rendering:pixelated;'}` }],
        ];
        
        if (caption) {
            children.push(['figcaption', { style: 'text-align:center;font-size:0.875rem;font-style:italic;color:var(--text-muted,#94a3b8);margin-top:0.5rem;' }, caption]);
        }
        
        return ['figure', figureAttrs, ...children];
    },
    addNodeView() { return ReactNodeViewRenderer(GifView); },
    addCommands() {
        return {
            insertGif: () => ({ commands }) => commands.insertContent({
                type: this.name,
                attrs: { src: null, alt: '', caption: '', width: 400, autoplay: true },
            }),
        };
    },
});

// ─── Export new extensions ────────────────────────────────────────────────────
export { QuoteCardExtension, StatsCounterExtension, ProgressBarsExtension, TimelineExtension, CountdownTimerExtension, ComparisonSliderExtension, SpotifyEmbedExtension, SocialShareExtension, TabsExtension, ToggleExtension, QuizExtension, PollExtension };
