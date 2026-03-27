import { useEditor, EditorContent, ReactNodeViewRenderer, NodeViewContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { TextStyleKit } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import { Node, mergeAttributes } from '@tiptap/core';

// ─── Custom TableCell / TableHeader con atributos de color ────────────────────
const CustomTableCell = TableCell.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            backgroundColor: {
                default: null,
                parseHTML: el => el.style.backgroundColor || el.getAttribute('data-bg') || null,
                renderHTML: attrs => {
                    const style = [];
                    if (attrs.backgroundColor) style.push(`background-color: ${attrs.backgroundColor}`);
                    if (attrs.borderColor) style.push(`border-color: ${attrs.borderColor}`);
                    return {
                        ...(style.length ? { style: style.join(';') } : {}),
                        ...(attrs.backgroundColor ? { 'data-bg': attrs.backgroundColor } : {}),
                    };
                },
            },
            borderColor: {
                default: null,
                parseHTML: el => el.style.borderColor || el.getAttribute('data-border-color') || null,
                renderHTML: attrs => {
                    const style = [];
                    if (attrs.backgroundColor) style.push(`background-color: ${attrs.backgroundColor}`);
                    if (attrs.borderColor) style.push(`border-color: ${attrs.borderColor}`);
                    return {
                        ...(style.length ? { style: style.join(';') } : {}),
                        ...(attrs.borderColor ? { 'data-border-color': attrs.borderColor } : {}),
                    };
                },
            },
        };
    },
});

const CustomTableHeader = TableHeader.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            backgroundColor: {
                default: null,
                parseHTML: el => el.style.backgroundColor || el.getAttribute('data-bg') || null,
                renderHTML: attrs => {
                    const style = [];
                    if (attrs.backgroundColor) style.push(`background-color: ${attrs.backgroundColor}`);
                    if (attrs.borderColor) style.push(`border-color: ${attrs.borderColor}`);
                    return {
                        ...(style.length ? { style: style.join(';') } : {}),
                        ...(attrs.backgroundColor ? { 'data-bg': attrs.backgroundColor } : {}),
                    };
                },
            },
            borderColor: {
                default: null,
                parseHTML: el => el.style.borderColor || el.getAttribute('data-border-color') || null,
                renderHTML: attrs => {
                    const style = [];
                    if (attrs.backgroundColor) style.push(`background-color: ${attrs.backgroundColor}`);
                    if (attrs.borderColor) style.push(`border-color: ${attrs.borderColor}`);
                    return {
                        ...(style.length ? { style: style.join(';') } : {}),
                        ...(attrs.borderColor ? { 'data-border-color': attrs.borderColor } : {}),
                    };
                },
            },
        };
    },
});
import { common, createLowlight } from 'lowlight';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import 'highlight.js/styles/github-dark.css';
import mermaid from 'mermaid';
import { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import { LineHeight, AccordionExtension, ContentButtonExtension, DocumentAttachmentExtension, ImageGridExtension, VideoGalleryExtension, GifExtension, QuoteCardExtension, StatsCounterExtension, TimelineExtension, ComparisonSliderExtension, CountdownTimerExtension, SpotifyEmbedExtension, ProgressBarsExtension, SocialShareExtension, TabsExtension, ToggleExtension, QuizExtension, PollExtension } from './editor/extensions';
import RichBlockFrame from './editor/RichBlockFrame';
import { TooltipMark } from './editor/extensions/tooltipMark';
import BubbleMenuTooltip from './editor/BubbleMenuTooltip';
import {
    canUseJustifyAlignment,
    createRichBlockTextAlignAttribute,
    getRichBlockHtmlAttributes,
    isRichBlockNodeActive,
} from './editor/blockAlignment';
import { createTechnicalCodeBlockExtension } from './editor/technicalCodeBlockExtension';
import EmojiPicker from './editor/EmojiPicker';
import SlashMenu from './editor/SlashMenu';
import {
    filterInsertMenuItems,
    groupInsertMenuItems,
    INSERT_MENU_CATEGORY_STYLES,
    PLUS_MENU_ITEMS,
    PINNED_TOOLS,
    savePinnedTools,
    runInsertMenuEditorAction,
} from './editor/insertMenuConfig';
import {
    MERMAID_BG_COLORS,
    MERMAID_PADDING_OPTIONS,
    MERMAID_SIZE_OPTIONS,
    MERMAID_TEMPLATE_OPTIONS,
    MERMAID_TEMPLATES,
    MERMAID_THEMES,
} from './editor/diagramConfig';
import {
    AUDIO_INPUT_ACCEPT,
    DOCUMENT_INPUT_ACCEPT,
    DOCUMENT_UPLOAD_LABEL,
    IMAGE_INPUT_ACCEPT,
    validateAudioFile,
    validateDocumentFile,
    validateImageFile,
} from '../../lib/mediaUploadPolicy';
import { cmsApi } from '../../lib/cmsApi';
import HtmlContentRenderer from '../blog/renderers/HtmlContentRenderer';

const lowlight = createLowlight(common);

mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });

// ─── ResizableImage — nodo React con handles de resize ────────────────────────
function ResizableImageView({ node, updateAttributes, selected, deleteNode }) {
    const containerRef = useRef(null);
    const [resizing, setResizing]   = useState(false);
    const startData = useRef(null);

    const width  = node.attrs.width  || 'auto';
    const height = node.attrs.height || 'auto';

    function startResize(e, corner) {
        e.preventDefault();
        e.stopPropagation();
        const img = containerRef.current?.querySelector('img');
        if (!img) return;
        const rect = img.getBoundingClientRect();
        startData.current = {
            corner,
            startX: e.clientX,
            startY: e.clientY,
            startW: rect.width,
            startH: rect.height,
            ratio:  rect.width / rect.height,
        };
        setResizing(true);

        function onMove(ev) {
            const { corner, startX, startY, startW, startH, ratio } = startData.current;
            let dx = ev.clientX - startX;
            let dy = ev.clientY - startY;

            let newW, newH;
            if (corner === 'br') {
                newW = Math.max(80, startW + dx);
                newH = Math.max(40, startH + dy);
            } else if (corner === 'bl') {
                newW = Math.max(80, startW - dx);
                newH = Math.max(40, startH + dy);
            } else if (corner === 'tr') {
                newW = Math.max(80, startW + dx);
                newH = Math.max(40, startH - dy);
            } else {
                newW = Math.max(80, startW - dx);
                newH = Math.max(40, startH - dy);
            }
            // Mantener proporción con Shift
            if (ev.shiftKey) newH = Math.round(newW / ratio);

            updateAttributes({ width: Math.round(newW), height: Math.round(newH) });
        }

        function onUp() {
            setResizing(false);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup',   onUp);
        }

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup',   onUp);
    }

    const handleStyle = 'absolute w-3 h-3 bg-fuchsia-500 border-2 border-white rounded-full z-10 cursor-nwse-resize';

    return (
        <RichBlockFrame
            alignment={node.attrs.textAlign}
            selected={selected}
            onRemove={deleteNode}
            wrapperClassName="my-4"
            dragHandle
            frameClassName="inline-block"
        >
            <div
                ref={containerRef}
                className={`relative inline-block group ${selected ? 'ring-2 ring-fuchsia-500 ring-offset-2 ring-offset-transparent' : ''}`}
                style={{ cursor: resizing ? 'nwse-resize' : 'default' }}
            >
                <img
                    src={node.attrs.src}
                    alt={node.attrs.alt || ''}
                    title={node.attrs.title || ''}
                    style={{
                        width:  width  !== 'auto' ? `${width}px`  : 'auto',
                        height: height !== 'auto' ? `${height}px` : 'auto',
                        maxWidth: '100%',
                        display: 'block',
                    }}
                    className="rounded-2xl shadow-2xl"
                    draggable={false}
                />
                {/* Handles de resize — visibles al seleccionar o hacer hover */}
                <div className={`${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                    <div className={`${handleStyle} top-[-6px] left-[-6px]  cursor-nwse-resize`} onMouseDown={e => startResize(e, 'tl')} />
                    <div className={`${handleStyle} top-[-6px] right-[-6px] cursor-nesw-resize`} onMouseDown={e => startResize(e, 'tr')} />
                    <div className={`${handleStyle} bottom-[-6px] left-[-6px]  cursor-nesw-resize`} onMouseDown={e => startResize(e, 'bl')} />
                    <div className={`${handleStyle} bottom-[-6px] right-[-6px] cursor-nwse-resize`} onMouseDown={e => startResize(e, 'br')} />
                </div>
                {node.attrs.alt && (
                    <p className="text-xs text-center text-gray-500 mt-2 italic">{node.attrs.alt}</p>
                )}
            </div>
        </RichBlockFrame>
    );
}

// ─── ResizableYoutube — nodo React con handles de resize ─────────────────────
function ResizableYoutubeView({ node, updateAttributes, selected, deleteNode }) {
    const containerRef = useRef(null);
    const startData = useRef(null);

    const width  = node.attrs.width  || 640;
    const height = node.attrs.height || 360;

    function startResize(e) {
        e.preventDefault();
        e.stopPropagation();
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        startData.current = {
            startX: e.clientX,
            startW: rect.width,
            startH: rect.height,
            ratio:  rect.width / rect.height,
        };
        function onMove(ev) {
            const { startX, startW, ratio } = startData.current;
            const newW = Math.max(200, startW + (ev.clientX - startX));
            const newH = Math.round(newW / ratio);
            updateAttributes({ width: Math.round(newW), height: newH });
        }
        function onUp() {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup',   onUp);
        }
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup',   onUp);
    }

    // Construir URL de embed
    const src = node.attrs.src || '';
    let embedUrl = src;
    try {
        const u = new URL(src);
        if (u.hostname.includes('youtube')) {
            const id = u.searchParams.get('v') || u.pathname.replace('/', '');
            embedUrl = `https://www.youtube-nocookie.com/embed/${id}`;
        } else if (u.hostname.includes('youtu.be')) {
            embedUrl = `https://www.youtube-nocookie.com/embed${u.pathname}`;
        }
    } catch {
        embedUrl = src;
    }

    return (
        <RichBlockFrame
            alignment={node.attrs.textAlign}
            selected={selected}
            onRemove={deleteNode}
            wrapperClassName="my-4"
            dragHandle
            frameClassName="inline-block"
        >
            <div
                ref={containerRef}
                className={`relative group rounded-xl overflow-hidden ${selected ? 'ring-2 ring-fuchsia-500' : ''}`}
                style={{ width: `${width}px`, maxWidth: '100%' }}
            >
                <iframe
                    src={embedUrl}
                    style={{ width: '100%', height: `${height}px` }}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="block rounded-xl"
                />
                {/* Handle derecho-inferior */}
                <div
                    className={`absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize bg-fuchsia-500/80 rounded-tl-lg flex items-center justify-center
                        ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
                    onMouseDown={startResize}
                    style={{ zIndex: 10 }}
                >
                    <svg className="w-3 h-3 text-white" viewBox="0 0 8 8" fill="currentColor">
                        <path d="M0 8L8 0v2L2 8H0zm4 0L8 4v2L6 8H4zm2 0h2v-2L8 6v2z"/>
                    </svg>
                </div>
            </div>
        </RichBlockFrame>
    );
}

// ─── Extensión Image con NodeView React ───────────────────────────────────────
const ResizableImageExtension = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            width:  { default: null },
            height: { default: null },
            textAlign: createRichBlockTextAlignAttribute(),
        };
    },
    renderHTML({ HTMLAttributes }) {
        return ['img', mergeAttributes(getRichBlockHtmlAttributes(HTMLAttributes, HTMLAttributes.textAlign))];
    },
    addNodeView() {
        return ReactNodeViewRenderer(ResizableImageView);
    },
});

// ─── Extensión Youtube con NodeView React ─────────────────────────────────────
const ResizableYoutubeExtension = Youtube.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            textAlign: createRichBlockTextAlignAttribute(),
        };
    },
    addNodeView() {
        return ReactNodeViewRenderer(ResizableYoutubeView);
    },
});

// ─── Extensión Audio ──────────────────────────────────────────────────────────
const AudioNode = Node.create({
    name: 'audio',
    group: 'block',
    atom: true,
    addAttributes() {
        return {
            src:   { default: null },
            title: { default: null },
            textAlign: createRichBlockTextAlignAttribute(),
        };
    },
    parseHTML() { return [{ tag: 'audio' }]; },
    renderHTML({ node, HTMLAttributes }) {
        return ['audio', mergeAttributes(getRichBlockHtmlAttributes(HTMLAttributes, node.attrs.textAlign, { controls: true, class: 'w-full my-4 rounded-lg' }))];
    },
    addNodeView() {
        return ReactNodeViewRenderer(AudioView);
    },
    addCommands() {
        return {
            insertAudio: attrs => ({ commands }) =>
                commands.insertContent({ type: this.name, attrs }),
        };
    },
});

function AudioView({ node, selected, deleteNode }) {
    return (
        <RichBlockFrame
            alignment={node.attrs.textAlign}
            selected={selected}
            onRemove={deleteNode}
            wrapperClassName="my-4"
            frameClassName="w-full"
        >
            <div className={`${selected ? 'rounded-xl ring-2 ring-fuchsia-500 ring-offset-2 ring-offset-transparent' : ''}`}>
                <audio controls className="w-full rounded-lg" src={node.attrs.src || ''} />
                {node.attrs.title ? (
                    <p className="mt-1 text-center text-sm italic text-gray-500">{node.attrs.title}</p>
                ) : null}
            </div>
        </RichBlockFrame>
    );
}

// ─── Callout — TIP / NOTE / WARNING / INFO ────────────────────────────────────
const CALLOUT_CONFIG = {
    tip:     { icon: '💡', label: 'TIP',     border: '#22c55e', bg: 'rgba(34,197,94,0.08)'  },
    note:    { icon: 'ℹ️',  label: 'NOTE',    border: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
    warning: { icon: '⚠️', label: 'WARNING', border: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
    info:    { icon: '📌', label: 'INFO',    border: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
};

function CalloutView({ node, updateAttributes, selected, deleteNode }) {
    const cfg = CALLOUT_CONFIG[node.attrs.type] || CALLOUT_CONFIG.tip;
    return (
        <RichBlockFrame
            alignment={node.attrs.textAlign}
            selected={selected}
            onRemove={deleteNode}
            frameClassName="w-full"
        >
            <div style={{
                borderLeft: `4px solid ${cfg.border}`,
                background: cfg.bg,
                borderRadius: '0 8px 8px 0',
                padding: '10px 16px',
                margin: '16px 0',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span>{cfg.icon}</span>
                    <select
                        value={node.attrs.type}
                        onChange={e => updateAttributes({ type: e.target.value })}
                        style={{
                            background: 'transparent', border: 'none', fontWeight: 700,
                            color: cfg.border, fontSize: 11, cursor: 'pointer', letterSpacing: '0.05em',
                        }}
                    >
                        {Object.entries(CALLOUT_CONFIG).map(([k, v]) => (
                            <option key={k} value={k} style={{ background: '#1a1a2e', color: '#e2e8f0' }}>{v.label}</option>
                        ))}
                    </select>
                </div>
                <NodeViewContent style={{ margin: 0 }} />
            </div>
        </RichBlockFrame>
    );
}

const CalloutExtension = Node.create({
    name: 'callout',
    group: 'block',
    content: 'block+',
    defining: true,
    addAttributes() {
        return {
            type: {
                default: 'tip',
                parseHTML: el => el.getAttribute('data-callout-type') || 'tip',
                renderHTML: attrs => ({ 'data-callout-type': attrs.type }),
            },
            textAlign: createRichBlockTextAlignAttribute(),
        };
    },
    parseHTML() { return [{ tag: 'div[data-callout]' }]; },
    renderHTML({ node, HTMLAttributes }) {
        return ['div', mergeAttributes(getRichBlockHtmlAttributes(HTMLAttributes, node.attrs.textAlign, { 'data-callout': '' })), 0];
    },
    addNodeView() {
        return ReactNodeViewRenderer(CalloutView);
    },
    addCommands() {
        return {
            insertCallout: (type = 'tip') => ({ commands }) =>
                commands.insertContent({
                    type: this.name,
                    attrs: { type },
                    content: [{ type: 'paragraph' }],
                }),
        };
    },
});

let mermaidCounter = 0;

function MermaidView({ node, updateAttributes, selected, deleteNode }) {
    const [editing, setEditing]     = useState(false);
    const [settings, setSettings]   = useState(false);
    const [localCode, setLocalCode] = useState(node.attrs.code || '');
    const [svg, setSvg]             = useState('');
    const [error, setError]         = useState('');
    const idRef = useRef(`mermaid-${++mermaidCounter}`);

    const theme = node.attrs.theme || 'dark';
    const bgColor = node.attrs.bgColor || '#0f172a';
    const borderColor = node.attrs.borderColor || '';
    const title = node.attrs.title || '';
    const caption = node.attrs.caption || '';
    const size = node.attrs.size || 'standard';
    const padding = node.attrs.padding || 'md';
    const sizeConfig = MERMAID_SIZE_OPTIONS.find(option => option.value === size) || MERMAID_SIZE_OPTIONS[1];
    const paddingConfig = MERMAID_PADDING_OPTIONS.find(option => option.value === padding) || MERMAID_PADDING_OPTIONS[1];

    useEffect(() => {
        renderDiagram(node.attrs.code || '', node.attrs.theme || 'dark');
    }, [node.attrs.code, node.attrs.theme]);

    async function renderDiagram(code, themeVal) {
        if (!code.trim()) return;
        try {
            mermaid.initialize({ startOnLoad: false, theme: themeVal || 'dark', securityLevel: 'loose' });
            idRef.current = `mermaid-${++mermaidCounter}`;
            const { svg: result } = await mermaid.render(idRef.current, code);
            setSvg(result);
            setError('');
        } catch {
            setError('Error de sintaxis en el diagrama');
            setSvg('');
        }
    }

    function saveCode() {
        updateAttributes({ code: localCode });
        setEditing(false);
    }

    function insertTemplate(key) {
        const tpl = MERMAID_TEMPLATES[key];
        if (tpl) {
            setLocalCode(tpl);
            updateAttributes({ code: tpl });
        }
    }

    return (
        <RichBlockFrame
            alignment={node.attrs.textAlign}
            selected={selected}
            onRemove={deleteNode}
            wrapperClassName="my-4"
            frameClassName="w-full"
        >
            <div className={`mx-auto border rounded-xl overflow-hidden ${selected ? 'ring-2 ring-fuchsia-500 ring-offset-2 ring-offset-transparent' : ''}`}
                 contentEditable={false}
                 style={{ borderColor: borderColor || 'var(--border-color)', width: '100%', maxWidth: sizeConfig.maxWidth }}>

                {/* Header bar */}
                <div className="flex items-center justify-between px-4 py-2" style={{ background: bgColor, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-fuchsia-400 font-mono font-semibold tracking-wide">DIAGRAM</span>
                        {title && <span className="text-xs text-[var(--text-muted)] ml-1">— {title}</span>}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button type="button"
                            onMouseDown={e => { e.preventDefault(); e.stopPropagation(); setSettings(v => !v); setEditing(false); }}
                            className={`text-[11px] px-2.5 py-1 rounded-md cursor-pointer transition-all ${settings ? 'bg-fuchsia-500/20 text-fuchsia-400' : 'bg-white/5 border border-white/10 text-[#94a3b8] hover:text-white'}`}>
                            ⚙ Personalizar
                        </button>
                        <button type="button"
                            onMouseDown={e => { e.preventDefault(); e.stopPropagation(); setLocalCode(node.attrs.code); setEditing(v => !v); setSettings(false); }}
                            className={`text-[11px] px-2.5 py-1 rounded-md cursor-pointer transition-all ${editing ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 border border-white/10 text-[#94a3b8] hover:text-white'}`}>
                            {editing ? '✕ Cerrar' : '✏ Editar'}
                        </button>
                    </div>
                </div>

                {/* Settings panel */}
                {settings && (
                    <div className="p-4 space-y-3 border-b border-white/8" style={{ background: bgColor }}
                         contentEditable={false}
                         onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>

                        {/* Title */}
                        <div>
                            <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1">Título del diagrama</label>
                            <input
                                value={title}
                                onChange={e => updateAttributes({ title: e.target.value })}
                                placeholder="Ej: Arquitectura del sistema"
                                className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500/60"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1">Caption</label>
                            <input
                                value={caption}
                                onChange={e => updateAttributes({ caption: e.target.value })}
                                placeholder="Texto de apoyo o contexto breve"
                                className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500/60"
                            />
                        </div>

                        {/* Theme */}
                        <div>
                            <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1.5">Tema Mermaid</label>
                            <div className="flex gap-1.5 flex-wrap">
                                {MERMAID_THEMES.map(t => (
                                    <button key={t.value} type="button"
                                        onClick={() => updateAttributes({ theme: t.value })}
                                        className={`px-3 py-1 rounded-lg text-xs capitalize transition-colors ${
                                            theme === t.value
                                                ? 'bg-fuchsia-500 text-white'
                                                : 'bg-white/5 border border-white/10 text-[var(--text-secondary)]'
                                        }`}>{t.label}</button>
                                ))}
                            </div>
                        </div>

                        {/* Background color */}
                        <div>
                            <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1.5">Color de fondo</label>
                            <div className="flex gap-1.5 items-center flex-wrap">
                                {MERMAID_BG_COLORS.map(c => (
                                    <button key={c.value} type="button" title={c.label}
                                        onClick={() => updateAttributes({ bgColor: c.value })}
                                        className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                                            bgColor === c.value ? 'ring-2 ring-fuchsia-400 ring-offset-1 ring-offset-transparent scale-110' : 'border-white/20'
                                        }`} style={{ background: c.value }} />
                                ))}
                                <div className="mx-0.5 w-px h-6 bg-white/10" />
                                <label className="relative cursor-pointer" title="Color personalizado">
                                    <input type="color" value={bgColor}
                                        onChange={e => updateAttributes({ bgColor: e.target.value })}
                                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                                    <span className="flex items-center justify-center w-7 h-7 rounded-full border-2 border-dashed border-white/20 text-[var(--text-muted)] text-xs hover:border-fuchsia-500/50">
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.7-.8 1.7-1.7 0-.4-.2-.8-.4-1.1-.2-.3-.4-.6-.4-1 0-.9.8-1.7 1.7-1.7H16c3.3 0 6-2.7 6-6 0-5.5-4.5-9.5-10-9.5z"/><circle cx="7.5" cy="11.5" r="1.5"/><circle cx="10.5" cy="7.5" r="1.5"/><circle cx="16.5" cy="11.5" r="1.5"/><circle cx="13.5" cy="7.5" r="1.5"/></svg>
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Border color */}
                        <div className="flex items-center gap-3">
                            <label className="text-[10px] text-[var(--text-muted)]">Borde:</label>
                            <input type="color" value={borderColor || '#334155'}
                                onChange={e => updateAttributes({ borderColor: e.target.value })}
                                className="w-6 h-6 rounded cursor-pointer border border-white/10" />
                            <span className="text-[10px] text-[var(--text-muted)] font-mono">{borderColor || 'default'}</span>
                            {borderColor && (
                                <button type="button" onClick={() => updateAttributes({ borderColor: '' })}
                                    className="text-[10px] text-[var(--text-muted)] hover:text-red-400 underline">Reset</button>
                            )}
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1">Tamano del bloque</label>
                                <select
                                    value={size}
                                    onChange={e => updateAttributes({ size: e.target.value })}
                                    className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500/60"
                                >
                                    {MERMAID_SIZE_OPTIONS.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1">Espaciado interno</label>
                                <select
                                    value={padding}
                                    onChange={e => updateAttributes({ padding: e.target.value })}
                                    className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500/60"
                                >
                                    {MERMAID_PADDING_OPTIONS.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Quick templates */}
                        <div>
                            <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1.5">Plantillas rápidas</label>
                            <div className="flex gap-1.5 flex-wrap">
                                {MERMAID_TEMPLATE_OPTIONS.map(t => (
                                    <button key={t.key} type="button"
                                        onClick={() => insertTemplate(t.key)}
                                        className="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-[var(--text-secondary)] hover:border-fuchsia-500/50 hover:text-fuchsia-400 transition-all flex items-center gap-1.5">
                                        <span>{t.icon}</span> {t.shortLabel}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Code editor */}
                {editing && (
                    <div style={{ background: '#0d1117' }} contentEditable={false}>
                        <textarea
                            value={localCode}
                            onChange={e => setLocalCode(e.target.value)}
                            rows={8}
                            style={{ width: '100%', padding: '14px 16px', background: 'transparent', border: 'none', outline: 'none', color: '#cdd6f4', fontFamily: "'Fira Code', monospace", fontSize: 13, lineHeight: 1.65, resize: 'vertical', boxSizing: 'border-box' }}
                        />
                        <div style={{ padding: '8px 12px', display: 'flex', gap: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <button type="button" onClick={saveCode}
                                style={{ padding: '4px 18px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                                Aplicar
                            </button>
                            <button type="button" onClick={() => setEditing(false)}
                                style={{ padding: '4px 12px', background: 'transparent', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                {/* Diagram render */}
                <div style={{ padding: paddingConfig.padding, background: bgColor, display: 'flex', justifyContent: 'center', minHeight: 80 }}>
                    {error
                        ? <p style={{ color: '#f87171', fontSize: 13, fontFamily: 'monospace' }}>{error}</p>
                        : svg
                            ? <div dangerouslySetInnerHTML={{ __html: svg }} style={{ maxWidth: '100%' }} />
                            : <p style={{ color: '#475569', fontSize: 12 }}>Cargando diagrama…</p>
                    }
                </div>
                {caption ? (
                    <div className="border-t border-white/8 px-4 py-3 text-sm text-[var(--text-muted)]" style={{ background: bgColor }}>
                        {caption}
                    </div>
                ) : null}
            </div>
        </RichBlockFrame>
    );
}

const MermaidNode = Node.create({
    name: 'mermaid',
    group: 'block',
    atom: true,
    addAttributes() {
        return {
            code: {
                default: MERMAID_TEMPLATES.flowchart,
                parseHTML: el => el.getAttribute('data-mermaid-code') || '',
                renderHTML: attrs => ({ 'data-mermaid-code': attrs.code }),
            },
            theme: {
                default: 'dark',
                parseHTML: el => el.getAttribute('data-mermaid-theme') || 'dark',
                renderHTML: attrs => ({ 'data-mermaid-theme': attrs.theme }),
            },
            bgColor: {
                default: '#0f172a',
                parseHTML: el => el.getAttribute('data-mermaid-bg') || '#0f172a',
                renderHTML: attrs => ({ 'data-mermaid-bg': attrs.bgColor }),
            },
            borderColor: {
                default: '',
                parseHTML: el => el.getAttribute('data-mermaid-border') || '',
                renderHTML: attrs => attrs.borderColor ? { 'data-mermaid-border': attrs.borderColor } : {},
            },
            title: {
                default: '',
                parseHTML: el => el.getAttribute('data-mermaid-title') || '',
                renderHTML: attrs => attrs.title ? { 'data-mermaid-title': attrs.title } : {},
            },
            caption: {
                default: '',
                parseHTML: el => el.getAttribute('data-mermaid-caption') || '',
                renderHTML: attrs => attrs.caption ? { 'data-mermaid-caption': attrs.caption } : {},
            },
            size: {
                default: 'standard',
                parseHTML: el => el.getAttribute('data-mermaid-size') || 'standard',
                renderHTML: attrs => ({ 'data-mermaid-size': attrs.size || 'standard' }),
            },
            padding: {
                default: 'md',
                parseHTML: el => el.getAttribute('data-mermaid-padding') || 'md',
                renderHTML: attrs => ({ 'data-mermaid-padding': attrs.padding || 'md' }),
            },
            textAlign: createRichBlockTextAlignAttribute(),
        };
    },
    parseHTML() { return [{ tag: 'div[data-mermaid-code]' }]; },
    renderHTML({ node, HTMLAttributes }) {
        return ['div', mergeAttributes(getRichBlockHtmlAttributes(HTMLAttributes, node.attrs.textAlign, { class: 'mermaid-block' })), 0];
    },
    addNodeView() { return ReactNodeViewRenderer(MermaidView); },
    addCommands() {
        return {
            insertMermaid: (code) => ({ commands }) =>
                commands.insertContent({ type: this.name, attrs: { code } }),
        };
    },
});

// ─── Paletas ──────────────────────────────────────────────────────────────────
const TEXT_COLORS = [
    '#ffffff','#e2e8f0','#94a3b8','#64748b',
    '#fde68a','#6ee7b7','#93c5fd','#f9a8d4',
    '#c4b5fd','#fb923c','#f87171','#34d399',
    '#38bdf8','#a78bfa','#e879f9','#10b981',
    '#0ea5e9','#8b5cf6','#ec4899','#f59e0b',
];
const HIGHLIGHT_COLORS = [
    '#fef08a80','#bbf7d080','#bae6fd80','#e9d5ff80',
    '#fecaca80','#fed7aa80','#fde68a80','#d1fae580',
];

// ─── Toolbar helpers ──────────────────────────────────────────────────────────
function ToolBtn({ onClick, active, disabled, title, children }) {
    return (
        <button
            type="button"
            onMouseDown={e => { e.preventDefault(); onClick(); }}
            disabled={disabled}
            title={title}
            aria-label={title}
            aria-pressed={active ? 'true' : 'false'}
            className={`flex items-center justify-center w-8 h-8 shrink-0 rounded-lg text-sm transition-all
                ${active
                    ? 'bg-fuchsia-500/20 text-fuchsia-400 ring-1 ring-fuchsia-500/50'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/10'}
                ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            {children}
        </button>
    );
}
function Divider() {
    return <div className="w-px h-6 bg-[var(--border-color)] mx-0.5 self-center shrink-0" />;
}

// ─── Upload helpers ───────────────────────────────────────────────────────────
function getUploadErrorMessage(error, fallbackMessage) {
    return error?.details?.message || error?.message || fallbackMessage;
}

async function uploadAudioFile(file, token) {
    const uploaded = await cmsApi.uploadAudio(token, file);
    return uploaded.url;
}

const FONT_SIZES = ['12px','14px','16px','18px','20px','24px','28px','32px','36px','48px'];
const LINE_HEIGHTS = ['1', '1.2', '1.5', '1.8', '2'];
const FONT_FAMILIES = [
    { label: 'Por defecto', value: null },
    { label: 'Inter', value: 'Inter, sans-serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Monospace', value: 'monospace' },
];
const CODE_LANGUAGES = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'bash', label: 'Bash / Terminal' },
    { value: 'json', label: 'JSON' },
    { value: 'python', label: 'Python' },
    { value: 'sql', label: 'SQL' },
    { value: 'yaml', label: 'YAML' },
    { value: 'docker', label: 'Dockerfile' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'xml', label: 'XML' },
    { value: 'java', label: 'Java' },
    { value: 'c', label: 'C' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
];

const CODE_VARIANTS = [
    { value: 'plain', label: 'Snippet' },
    { value: 'terminal', label: 'Terminal' },
];

// ─── RichEditor ───────────────────────────────────────────────────────────────
export default function RichEditor({ value, onChange, token, fullscreen, onToggleFullscreen }) {
    const fileInputRef  = useRef(null);
    const audioInputRef = useRef(null);
    const docInputRef   = useRef(null);

    const [showLinkMenu,    setShowLinkMenu]    = useState(false);
    const [linkUrl,         setLinkUrl]         = useState('');
    const [showYoutubeMenu, setShowYoutubeMenu] = useState(false);
    const [youtubeUrl,      setYoutubeUrl]      = useState('');
    const [showAudioMenu,   setShowAudioMenu]   = useState(false);
    const [audioUrl,        setAudioUrl]        = useState('');
    const [showColorPick,   setShowColorPick]   = useState(false);
    const [showHighPick,    setShowHighPick]    = useState(false);
    const [showCalloutMenu, setShowCalloutMenu] = useState(false);
    const [showMermaidMenu, setShowMermaidMenu] = useState(false);
    const [showTableColors, setShowTableColors] = useState(false);
    const [uploading,       setUploading]       = useState(false);
    const [fontSize,        setFontSize]        = useState('16px');
    const [lineHeight,      setLineHeight]      = useState('1.8');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showInsertMenu,  setShowInsertMenu]  = useState(false);
    const [insertMenuQuery, setInsertMenuQuery] = useState('');
    const [markdownMode,    setMarkdownMode]    = useState(false);
    const [markdownSource,  setMarkdownSource]  = useState('');
    const [uploadError,     setUploadError]     = useState('');
    const [codeBlockMeta,   setCodeBlockMeta]   = useState({ filename: '', title: '' });
    const [showPreview,     setShowPreview]     = useState(false);

    // Slash commands
    const [slashMenu, setSlashMenu] = useState({ open: false, query: '', coords: { top: 0, left: 0 } });

    // Herramientas fijadas por el usuario
    const [pinnedTools, setPinnedTools] = useState(PINNED_TOOLS);

    // Función para añadir herramienta a la barra de herramientas
    const handlePinTool = (tool) => {
        if (!pinnedTools.find(t => t.action === tool.action)) {
            const newPinned = [...pinnedTools, tool];
            setPinnedTools(newPinned);
            savePinnedTools(newPinned);
        }
    };

    // Función para quitar herramienta de la barra de herramientas
    const handleUnpinTool = (action) => {
        const newPinned = pinnedTools.filter(t => t.action !== action);
        setPinnedTools(newPinned);
        savePinnedTools(newPinned);
    };

    // Cerrar popups al hacer clic fuera
    useEffect(() => {
        function close() {
            setShowLinkMenu(false);
            setShowYoutubeMenu(false);
            setShowAudioMenu(false);
            setShowColorPick(false);
            setShowHighPick(false);
            setShowCalloutMenu(false);
            setShowMermaidMenu(false);
            setShowEmojiPicker(false);
            setShowInsertMenu(false);
            setInsertMenuQuery('');
            setShowTableColors(false);
        }
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ codeBlock: false }),
            createTechnicalCodeBlockExtension(lowlight),
            Underline,
            TextStyleKit,
            FontFamily.configure({ types: ['textStyle'] }),
            Highlight.configure({ multicolor: true }),
            TooltipMark,
            TextAlign.configure({ types: ['heading', 'paragraph', 'image', 'youtube', 'audio', 'callout', 'mermaid', 'accordion', 'contentButton', 'documentAttachment', 'imageGrid'] }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
            }),
            ResizableImageExtension.configure({ allowBase64: false }),
            ResizableYoutubeExtension,
            AudioNode,
            Table.configure({ resizable: true }),
            TableRow,
            CustomTableHeader,
            CustomTableCell,
            CalloutExtension,
            MermaidNode,
            Superscript,
            Subscript,
            LineHeight,
            AccordionExtension,
            ContentButtonExtension,
            DocumentAttachmentExtension,
            ImageGridExtension,
            VideoGalleryExtension,
            GifExtension,
            QuoteCardExtension,
            StatsCounterExtension,
            TimelineExtension,
            ComparisonSliderExtension,
            CountdownTimerExtension,
            ProgressBarsExtension,
            SpotifyEmbedExtension,
            SocialShareExtension,
            TabsExtension,
            ToggleExtension,
            QuizExtension,
            PollExtension,
            Placeholder.configure({
                showOnlyCurrent: false,
                placeholder: ({ node }) => {
                    if (node.type.name === 'heading') return 'Título…';
                    if (node.type.name === 'paragraph') return 'Escribe aquí… Usa "/" para insertar bloques';
                    return '';
                },
            }),
            CharacterCount,
        ],
        content: value || '',
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());

            // Slash command detection
            try {
                const { $from } = editor.state.selection;
                const textBefore = $from.parent.textBetween(0, $from.parentOffset);
                const slashMatch = textBefore.match(/\/(\w*)$/);
                if (slashMatch && $from.parent.type.name === 'paragraph') {
                    const coords = editor.view.coordsAtPos(editor.state.selection.from);
                    setSlashMenu({ open: true, query: slashMatch[1], coords: { top: coords.bottom + 8, left: coords.left } });
                } else if (slashMenu.open) {
                    setSlashMenu(m => ({ ...m, open: false }));
                }
            } catch {
                setSlashMenu(m => ({ ...m, open: false }));
            }
        },
        editorProps: {
            attributes: { class: 'outline-none min-h-[400px] text-gray-200 leading-relaxed' },
            transformPastedHTML(html) {
                // Limpiar tablas pegadas de Word/Google Docs/sitios externos
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Remover atributos problemáticos que rompen el schema de TipTap
                doc.querySelectorAll('table, tbody, thead, tr, td, th, colgroup, col').forEach(el => {
                    el.removeAttribute('class');
                    el.removeAttribute('width');
                    el.removeAttribute('height');
                    el.removeAttribute('style');
                    el.removeAttribute('data-sheets-value');
                    el.removeAttribute('data-sheets-formula');
                    // Mantener colspan/rowspan que son estructurales
                });
                
                // Eliminar colgroup completo (TipTap no lo usa)
                doc.querySelectorAll('colgroup').forEach(el => el.remove());
                
                return doc.body.innerHTML;
            },
            handleDrop(_view, event, _slice, moved) {
                if (!moved && event.dataTransfer?.files?.length) {
                    const file = event.dataTransfer.files[0];
                    if (file.type.startsWith('image/')) {
                        event.preventDefault();
                        handleImageFile(file);
                        return true;
                    }
                }
                return false;
            },
            handlePaste(_view, event) {
                const items = event.clipboardData?.items;
                if (items) {
                    for (const item of items) {
                        if (item.type.startsWith('image/')) {
                            event.preventDefault();
                            handleImageFile(item.getAsFile());
                            return true;
                        }
                    }
                }
                return false;
            },
        },
    });

    // Sincronizar value externo
    useEffect(() => {
        if (!editor) return;
        if (value !== undefined && value !== editor.getHTML()) {
            editor.commands.setContent(value || '', false);
        }
    }, [value, editor]);

    // Sincronizar selector de tamaño
    useEffect(() => {
        if (!editor) return;
        const update = () => {
            const attrs = editor.getAttributes('textStyle');
            setFontSize(attrs.fontSize || '16px');
            // Sync line-height
            const blockAttrs = editor.getAttributes('paragraph');
            const headingAttrs = editor.getAttributes('heading');
            setLineHeight(blockAttrs.lineHeight || headingAttrs.lineHeight || '1.8');
            if (editor.isActive('codeBlock')) {
                const codeAttrs = editor.getAttributes('codeBlock');
                setCodeBlockMeta({
                    filename: codeAttrs.filename || '',
                    title: codeAttrs.title || '',
                });
            }
        };
        editor.on('selectionUpdate', update);
        editor.on('transaction',     update);
        return () => { editor.off('selectionUpdate', update); editor.off('transaction', update); };
    }, [editor]);

    // Cerrar preview con ESC
    useEffect(() => {
        if (!showPreview) return;
        const onKey = (e) => { if (e.key === 'Escape') setShowPreview(false); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [showPreview]);

    const handleImageFile = useCallback(async (file) => {
        if (!file || !token) return;
        const validationError = validateImageFile(file);
        if (validationError) {
            setUploadError(validationError);
            return;
        }
        setUploading(true);
        setUploadError('');
        try {
            const uploaded = await cmsApi.uploadImage(token, file);
            const url = uploaded.url;
            editor?.chain().focus().setImage({ src: url, alt: file.name.replace(/\.[^.]+$/, '') }).run();
        } catch (err) {
            setUploadError(getUploadErrorMessage(err, 'No se ha podido subir la imagen.'));
            console.error(err);
        }
        finally { setUploading(false); }
    }, [editor, token]);

    const handleImageInputChange = useCallback(async (e) => {
        const file = e.target.files?.[0];
        if (file) await handleImageFile(file);
        e.target.value = '';
    }, [handleImageFile]);

    function applyLink() {
        if (!linkUrl) editor?.chain().focus().unsetLink().run();
        else editor?.chain().focus().setLink({ href: linkUrl }).run();
        setShowLinkMenu(false);
        setLinkUrl('');
    }

    function applyYoutube() {
        if (youtubeUrl) editor?.commands.setYoutubeVideo({ src: youtubeUrl });
        setShowYoutubeMenu(false);
        setYoutubeUrl('');
    }

    function applyAudio() {
        if (audioUrl) editor?.commands.insertAudio({ src: audioUrl });
        setShowAudioMenu(false);
        setAudioUrl('');
    }

    async function handleAudioFile(e) {
        const file = e.target.files?.[0];
        if (!file || !token) return;
        const validationError = validateAudioFile(file);
        if (validationError) {
            setUploadError(validationError);
            e.target.value = '';
            return;
        }
        setUploading(true);
        setUploadError('');
        try {
            const url = await uploadAudioFile(file, token);
            editor?.commands.insertAudio({ src: url, title: file.name });
        } catch (err) {
            setUploadError(getUploadErrorMessage(err, 'No se ha podido subir el audio.'));
            console.error(err);
        }
        finally { setUploading(false); e.target.value = ''; }
    }

    function getActiveBlock() {
        if (!editor) return 'p';
        if (editor.isActive('heading', { level: 1 })) return 'h1';
        if (editor.isActive('heading', { level: 2 })) return 'h2';
        if (editor.isActive('heading', { level: 3 })) return 'h3';
        if (editor.isActive('heading', { level: 4 })) return 'h4';
        if (editor.isActive('blockquote')) return 'blockquote';
        if (editor.isActive('codeBlock'))  return 'codeBlock';
        return 'p';
    }

    function setBlock(v) {
        if (!editor) return;
        const map = { p: () => editor.chain().focus().setParagraph().run(),
            h1: () => editor.chain().focus().setHeading({ level: 1 }).run(),
            h2: () => editor.chain().focus().setHeading({ level: 2 }).run(),
            h3: () => editor.chain().focus().setHeading({ level: 3 }).run(),
            h4: () => editor.chain().focus().setHeading({ level: 4 }).run(),
            blockquote: () => editor.chain().focus().setBlockquote().run(),
            codeBlock:  () => editor.chain().focus().setCodeBlock().run(),
        };
        map[v]?.();
    }

    // Document upload
    async function handleDocumentUpload(e) {
        const file = e.target.files?.[0];
        if (!file || !token) return;
        const validationError = validateDocumentFile(file);
        if (validationError) {
            setUploadError(validationError);
            e.target.value = '';
            return;
        }
        setUploading(true);
        setUploadError('');
        try {
            const data = await cmsApi.uploadDocument(token, file);
            editor?.commands.insertDocument({
                src: data.url,
                filename: data.filename,
                fileType: data.fileType,
                fileSize: data.fileSize,
            });
        } catch (err) {
            setUploadError(getUploadErrorMessage(err, 'No se ha podido subir el documento.'));
            console.error(err);
        }
        finally { setUploading(false); e.target.value = ''; }
    }

    // Markdown mode toggle
    function toggleMarkdownMode() {
        if (!editor) return;
        if (!markdownMode) {
            setMarkdownSource(editor.getHTML());
            setMarkdownMode(true);
        } else {
            editor.commands.setContent(markdownSource, false);
            onChange(markdownSource);
            setMarkdownMode(false);
        }
    }

    // Slash menu action handler (for actions needing UI)
    function handleSlashAction(action) {
        if (action === 'image') setTimeout(() => fileInputRef.current?.click(), 0);
        else if (action === 'youtube') setShowYoutubeMenu(true);
        else if (action === 'audio') setShowAudioMenu(true);
        else if (action === 'document') setTimeout(() => docInputRef.current?.click(), 0);
        else if (action === 'emoji') setShowEmojiPicker(true);
    }

    function handleInsertAction(action) {
        if (!runInsertMenuEditorAction(editor, action)) {
            handleSlashAction(action);
        }
        setShowInsertMenu(false);
    }

    function updateCodeBlockMetadata(patch) {
        setCodeBlockMeta(prev => ({ ...prev, ...patch }));
        editor.commands.updateAttributes('codeBlock', patch);
    }

    if (!editor) return null;

    const wordCount = editor.storage.characterCount?.words?.() ?? 0;
    const charCount = editor.storage.characterCount?.characters?.() ?? 0;
    const readMin   = Math.max(1, Math.ceil(wordCount / 200));
    
    // Keyboard hint contextual
    const contextHint = useMemo(() => {
        if (!editor) return '';
        if (editor.isActive('table')) 
            return 'Tab: siguiente celda · Shift+Tab: anterior · Ctrl+Shift+X: eliminar tabla';
        if (editor.isActive('codeBlock')) 
            return 'Shift+Enter: salir del bloque de código';
        if (editor.isActive('link'))
            return 'Ctrl+K: editar enlace · Ctrl+Shift+K: quitar enlace';
        if (editor.isActive('bold') || editor.isActive('italic'))
            return 'Ctrl+B: negrita · Ctrl+I: cursiva · Ctrl+U: subrayado';
        return 'Ctrl+B: negrita · Ctrl+K: enlace · "/" para insertar bloques';
    }, [editor?.state]);
    const richBlockAlignmentActive = isRichBlockNodeActive(editor);
    const justifyEnabled = canUseJustifyAlignment(editor);
    const plusMenuItems = filterInsertMenuItems(PLUS_MENU_ITEMS, insertMenuQuery);
    const plusMenuGroups = groupInsertMenuItems(plusMenuItems);

    return (
        <div className={`flex flex-col rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)]
            ${fullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}>

            {/* ── TOOLBAR ─────────────────────────────────────────────────── */}
            <div className="relative z-20 flex flex-wrap items-center gap-1 px-3 py-2 border-b border-[var(--border-color)] bg-[var(--bg-surface)] rounded-t-2xl sticky top-0">

                {/* Deshacer / Rehacer */}
                <ToolBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Deshacer (Ctrl+Z)">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6"/><path d="M3 13C3 8 7.5 4 13 4s9 4 9 9-4 9-9 9c-2.5 0-4.8-1-6.4-2.6"/></svg>
                </ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Rehacer (Ctrl+Y)">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6"/><path d="M21 13c0-5-4.5-9-10-9S2 8 2 13s4 9 9 9c2.5 0 4.8-1 6.4-2.6"/></svg>
                </ToolBtn>

                <Divider />

                {/* Bloque */}
                <select title="Tipo de bloque"
                    className="h-8 px-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] text-xs focus:outline-none focus:border-fuchsia-500/60 cursor-pointer shrink-0"
                    value={getActiveBlock()} onChange={e => setBlock(e.target.value)}>
                    <option value="p">Párrafo</option>
                    <option value="h1">Título 1</option>
                    <option value="h2">Título 2</option>
                    <option value="h3">Título 3</option>
                    <option value="h4">Título 4</option>
                    <option value="blockquote">Cita</option>
                    <option value="codeBlock">Código</option>
                </select>

                {/* Tamaño fuente */}
                <select title="Tamaño"
                    className="h-8 px-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] text-xs focus:outline-none focus:border-fuchsia-500/60 cursor-pointer w-[70px] shrink-0"
                    value={fontSize}
                    onChange={e => { setFontSize(e.target.value); editor.chain().focus().setFontSize(e.target.value).run(); }}>
                    {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                {/* Interlineado */}
                <select title="Interlineado"
                    className="h-8 px-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] text-xs focus:outline-none focus:border-fuchsia-500/60 cursor-pointer w-[54px] shrink-0"
                    value={lineHeight}
                    onChange={e => { setLineHeight(e.target.value); editor.chain().focus().setLineHeight(e.target.value).run(); }}>
                    {LINE_HEIGHTS.map(lh => <option key={lh} value={lh}>×{lh}</option>)}
                </select>

                <Divider />

                {/* Inline */}
                <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()}    active={editor.isActive('bold')}      title="Negrita (Ctrl+B)"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()}  active={editor.isActive('italic')}    title="Cursiva (Ctrl+I)"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Subrayado (Ctrl+U)"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()}  active={editor.isActive('strike')}    title="Tachado"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="12" x2="20" y2="12"/><path d="M17.5 5.5C17 4 15.5 3 14 3H10C7.8 3 6 4.8 6 7c0 1.5.8 2.8 2 3.5"/><path d="M16.5 14.5C17 16 16 18 14 19c-1 .5-2 .5-3 .5-2 0-3.5-1-4.5-2.5"/></svg></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().toggleCode().run()}    active={editor.isActive('code')}      title="Código inline"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} title="Superíndice (x²)"><span className="text-xs font-bold leading-none">x<sup>2</sup></span></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().toggleSubscript().run()}   active={editor.isActive('subscript')}   title="Subíndice (H₂O)"><span className="text-xs font-bold leading-none">x<sub>2</sub></span></ToolBtn>

                <Divider />

                {/* Color de texto — popup sobre el toolbar */}
                <div className="relative" onMouseDown={e => e.stopPropagation()}>
                    <ToolBtn onClick={() => { setShowColorPick(p => !p); setShowHighPick(false); }} title="Color de texto">
                        <div className="flex flex-col items-center gap-0.5">
                            <span className="text-xs font-bold leading-none">A</span>
                            <div className="w-4 h-1 rounded-full" style={{ background: editor.getAttributes('textStyle').color || '#e2e8f0' }} />
                        </div>
                    </ToolBtn>
                    {showColorPick && (
                        <div className="absolute top-10 left-0 z-50 p-3 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl shadow-2xl w-48"
                            onMouseDown={e => e.stopPropagation()}>
                            <button type="button" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-2 w-full text-left px-1"
                                onClick={() => { editor.chain().focus().unsetColor().run(); setShowColorPick(false); }}>
                                Quitar color
                            </button>
                            <div className="grid grid-cols-5 gap-1.5 mb-2">
                                {TEXT_COLORS.map(c => (
                                    <button key={c} type="button" title={c}
                                        className="w-6 h-6 rounded-md border-2 border-transparent hover:border-white/50 hover:scale-110 transition-all"
                                        style={{ background: c }}
                                        onClick={() => { editor.chain().focus().setColor(c).run(); setShowColorPick(false); }}
                                    />
                                ))}
                            </div>
                            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                                <input type="color"
                                    value={editor.getAttributes('textStyle').color || '#ffffff'}
                                    onChange={e => editor.chain().focus().setColor(e.target.value).run()}
                                    className="w-6 h-6 p-0 border-0 rounded cursor-pointer bg-transparent"
                                />
                                <span className="text-xs text-gray-400">Color personalizado</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Resaltado */}
                <div className="relative" onMouseDown={e => e.stopPropagation()}>
                    <ToolBtn onClick={() => { setShowHighPick(p => !p); setShowColorPick(false); }} active={editor.isActive('highlight')} title="Color de fondo">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                    </ToolBtn>
                    {showHighPick && (
                        <div className="absolute top-10 left-0 z-50 p-3 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl shadow-2xl w-44"
                            onMouseDown={e => e.stopPropagation()}>
                            <button type="button" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-2 w-full text-left px-1"
                                onClick={() => { editor.chain().focus().unsetHighlight().run(); setShowHighPick(false); }}>
                                Quitar fondo
                            </button>
                            <div className="grid grid-cols-4 gap-1.5 mb-2">
                                {HIGHLIGHT_COLORS.map(c => (
                                    <button key={c} type="button" title={c}
                                        className="w-6 h-6 rounded-md border-2 border-transparent hover:border-white/50 hover:scale-110 transition-all"
                                        style={{ background: c }}
                                        onClick={() => { editor.chain().focus().toggleHighlight({ color: c }).run(); setShowHighPick(false); }}
                                    />
                                ))}
                            </div>
                            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                                <input type="color"
                                    defaultValue="#fef08a"
                                    onChange={e => editor.chain().focus().toggleHighlight({ color: `${e.target.value}80` }).run()}
                                    className="w-6 h-6 p-0 border-0 rounded cursor-pointer bg-transparent"
                                />
                                <span className="text-xs text-gray-400">Color personalizado</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Selector de familia tipográfica */}
                <div className="relative" onMouseDown={e => e.stopPropagation()}>
                    <select
                        value={editor.getAttributes('textStyle').fontFamily || ''}
                        onChange={e => {
                            const val = e.target.value;
                            if (!val) editor.chain().focus().unsetFontFamily().run();
                            else editor.chain().focus().setFontFamily(val).run();
                        }}
                        className="text-xs h-8 px-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] 
                                   text-[var(--text-secondary)] hover:border-fuchsia-500/50 cursor-pointer outline-none
                                   focus:border-fuchsia-500/60 w-[110px] shrink-0"
                        title="Familia tipográfica"
                    >
                        {FONT_FAMILIES.map(f => (
                            <option key={f.label} value={f.value || ''}>{f.label}</option>
                        ))}
                    </select>
                </div>

                <Divider />

                {/* Alineación */}
                <ToolBtn onClick={() => editor.chain().focus().setTextAlign('left').run()}    active={editor.isActive({ textAlign: 'left' })}    title="Izquierda"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().setTextAlign('center').run()}  active={editor.isActive({ textAlign: 'center' })}  title="Centrar"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().setTextAlign('right').run()}   active={editor.isActive({ textAlign: 'right' })}   title="Derecha"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={!richBlockAlignmentActive && editor.isActive({ textAlign: 'justify' })} disabled={!justifyEnabled} title={justifyEnabled ? 'Justificar' : 'Justificar solo para párrafos y títulos'}><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></ToolBtn>

                <Divider />

                {/* Listas */}
                <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()}  active={editor.isActive('bulletList')}  title="Lista viñetas"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3.5" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="3.5" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="3.5" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Lista numerada"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><text x="1" y="8" fontSize="7" fill="currentColor" stroke="none">1.</text><text x="1" y="14" fontSize="7" fill="currentColor" stroke="none">2.</text><text x="1" y="20" fontSize="7" fill="currentColor" stroke="none">3.</text></svg></ToolBtn>

                <Divider />

                {/* Enlace */}
                <div className="relative" onMouseDown={e => e.stopPropagation()}>
                    <ToolBtn onClick={() => { setShowLinkMenu(p => !p); setLinkUrl(editor.getAttributes('link').href || ''); setShowYoutubeMenu(false); setShowAudioMenu(false); }} active={editor.isActive('link')} title="Enlace">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    </ToolBtn>
                    {showLinkMenu && (
                        <div className="absolute top-10 left-0 z-50 p-3 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl shadow-2xl flex gap-2 w-72"
                            onMouseDown={e => e.stopPropagation()}>
                            <input type="url" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyLink()}
                                placeholder="https://…"
                                className="flex-1 px-3 py-1.5 text-sm bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-fuchsia-500/60"
                                autoFocus />
                            <button type="button" onClick={applyLink} className="px-3 py-1.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-sm rounded-lg">OK</button>
                            {editor.isActive('link') && <button type="button" onClick={() => { editor.chain().focus().unsetLink().run(); setShowLinkMenu(false); }} className="px-2 py-1.5 text-red-400 text-sm">✕</button>}
                        </div>
                    )}
                </div>

                {/* Imagen */}
                <ToolBtn onClick={() => fileInputRef.current?.click()} disabled={uploading} title="Subir imagen (o arrastra y suelta)">
                    {uploading ? <div className="w-4 h-4 border-2 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin" /> : <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>}
                </ToolBtn>
                <input ref={fileInputRef} type="file" accept={IMAGE_INPUT_ACCEPT} className="hidden" onChange={handleImageInputChange} />

                {/* YouTube */}
                <div className="relative" onMouseDown={e => e.stopPropagation()}>
                    <ToolBtn onClick={() => { setShowYoutubeMenu(p => !p); setShowLinkMenu(false); setShowAudioMenu(false); }} title="Vídeo YouTube">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23 7s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.5 2.8 12 2.8 12 2.8s-4.5 0-6.8.1c-.6.1-1.9.1-3 1.3C1.3 5 1 7 1 7S.7 9.1.7 11.2v1.9c0 2.1.3 4.2.3 4.2s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.5 21.4 12 21.5 12 21.5s4.5 0 6.8-.2c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.3-2.1.3-4.2v-1.9C23.3 9.1 23 7 23 7z" opacity=".85"/><polygon points="9.5,15.5 15.5,12 9.5,8.5" fill="white"/></svg>
                    </ToolBtn>
                    {showYoutubeMenu && (
                        <div className="absolute top-10 left-0 z-50 p-3 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl shadow-2xl flex gap-2 w-80"
                            onMouseDown={e => e.stopPropagation()}>
                            <input type="url" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyYoutube()}
                                placeholder="https://youtube.com/watch?v=…"
                                className="flex-1 px-3 py-1.5 text-sm bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-fuchsia-500/60"
                                autoFocus />
                            <button type="button" onClick={applyYoutube} className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg">Insertar</button>
                        </div>
                    )}
                </div>

                {/* Audio */}
                <div className="relative" onMouseDown={e => e.stopPropagation()}>
                    <ToolBtn onClick={() => { setShowAudioMenu(p => !p); setShowLinkMenu(false); setShowYoutubeMenu(false); }} title="Insertar audio">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
                    </ToolBtn>
                    {showAudioMenu && (
                        <div className="absolute top-10 left-0 z-50 p-3 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl shadow-2xl w-80 space-y-2"
                            onMouseDown={e => e.stopPropagation()}>
                            <div className="flex gap-2">
                                <input type="url" value={audioUrl} onChange={e => setAudioUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyAudio()}
                                    placeholder="https://…/audio.mp3"
                                    className="flex-1 px-3 py-1.5 text-sm bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-fuchsia-500/60"
                                    autoFocus />
                                <button type="button" onClick={applyAudio} className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm rounded-lg">OK</button>
                            </div>
                            <button type="button" onClick={() => audioInputRef.current?.click()}
                                className="w-full py-1.5 text-sm border border-dashed border-[var(--border-color)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] transition-colors">
                                Subir archivo de audio
                            </button>
                            <input ref={audioInputRef} type="file" accept={AUDIO_INPUT_ACCEPT} className="hidden" onChange={handleAudioFile} />
                        </div>
                    )}
                </div>

                {/* Tabla */}
                <ToolBtn onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Insertar tabla">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
                </ToolBtn>

                {/* Callout */}
                <div className="relative" onMouseDown={e => e.stopPropagation()}>
                    <ToolBtn
                        onClick={() => setShowCalloutMenu(p => !p)}
                        active={editor.isActive('callout')}
                        title="Insertar callout (TIP / NOTE / WARNING / INFO)"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                    </ToolBtn>
                    {showCalloutMenu && (
                        <div
                            className="absolute top-10 left-0 z-50 p-2 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl shadow-2xl flex flex-col gap-1 w-36"
                            onMouseDown={e => e.stopPropagation()}
                        >
                            {Object.entries(CALLOUT_CONFIG).map(([k, v]) => (
                                <button
                                    key={k} type="button"
                                    onClick={() => { editor.chain().focus().insertCallout(k).run(); setShowCalloutMenu(false); }}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-sm text-[var(--text-secondary)] text-left"
                                >
                                    <span>{v.icon}</span>
                                    <span style={{ color: v.border, fontWeight: 700, fontSize: 11 }}>{v.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Mermaid / Diagrama */}
                <div className="relative" onMouseDown={e => e.stopPropagation()}>
                    <ToolBtn onClick={() => setShowMermaidMenu(p => !p)} title="Insertar diagrama (flowchart, mapa mental, secuencia)">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="5" height="4" rx="1"/><rect x="16" y="3" width="5" height="4" rx="1"/>
                            <rect x="9" y="17" width="6" height="4" rx="1"/>
                            <line x1="5.5" y1="7" x2="5.5" y2="10"/><line x1="18.5" y1="7" x2="18.5" y2="10"/>
                            <line x1="5.5" y1="10" x2="18.5" y2="10"/><line x1="12" y1="10" x2="12" y2="17"/>
                        </svg>
                    </ToolBtn>
                    {showMermaidMenu && (
                        <div className="absolute top-10 left-0 z-50 p-2 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl shadow-2xl flex flex-col gap-1 w-48" onMouseDown={e => e.stopPropagation()}>
                            {[
                                ...MERMAID_TEMPLATE_OPTIONS,
                            ].map(({ key, icon, label }) => (
                                <button key={key} type="button"
                                    onClick={() => { editor.chain().focus().insertMermaid(MERMAID_TEMPLATES[key]).run(); setShowMermaidMenu(false); }}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-sm text-[var(--text-secondary)] text-left"
                                >
                                    <span className="text-fuchsia-400 w-4 text-center">{icon}</span>
                                    <span>{label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <Divider />

                <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Línea horizontal"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Limpiar formato"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7l4-4 10 10-4 4L4 7z"/><path d="M14 6l4 4"/><line x1="2" y1="22" x2="22" y2="22"/></svg></ToolBtn>

                <Divider />

                <Divider />

                {/* Herramientas fijadas por el usuario */}
                {pinnedTools.length > 0 && (
                    <>
                        {pinnedTools.map(tool => {
                            const toolItem = PLUS_MENU_ITEMS.find(item => item.action === tool.action) || INSERT_MENU_ITEMS.find(item => item.action === tool.action);
                            if (!toolItem) return null;
                            return (
                                <div key={tool.action} className="relative group" onMouseDown={e => e.stopPropagation()}>
                                    <ToolBtn 
                                        onClick={() => handleInsertAction(tool.action)} 
                                        title={`${toolItem.title} (fijado)`}
                                    >
                                        <span className="text-[10px] font-semibold">{toolItem.icon}</span>
                                    </ToolBtn>
                                    <button
                                        type="button"
                                        onClick={() => handleUnpinTool(tool.action)}
                                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                        title="Quitar de barra"
                                    >
                                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                    </button>
                                </div>
                            );
                        })}
                        <Divider />
                    </>
                )}

                {/* Emoji */}
                <div className="relative" onMouseDown={e => e.stopPropagation()}>
                    <ToolBtn onClick={() => setShowEmojiPicker(p => !p)} title="Insertar emoji">
                        <span className="text-sm">😀</span>
                    </ToolBtn>
                    {showEmojiPicker && (
                        <EmojiPicker
                            onSelect={emoji => editor?.chain().focus().insertContent(emoji).run()}
                            onClose={() => setShowEmojiPicker(false)}
                        />
                    )}
                </div>

                {/* Insertar bloque especial */}
                <div className="relative" onMouseDown={e => e.stopPropagation()}>
                    <ToolBtn onClick={() => {
                        setShowInsertMenu(prev => {
                            const next = !prev;
                            if (!next) setInsertMenuQuery('');
                            return next;
                        });
                    }} title="Insertar bloque especial (+)">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    </ToolBtn>
                    {showInsertMenu && (
                        <div className="absolute top-10 left-0 z-50 flex max-h-[min(78vh,36rem)] w-[min(26rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-elevated)] shadow-2xl"
                             onMouseDown={e => e.stopPropagation()}>
                            <div className="border-b border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 pt-3 pb-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-semibold text-[var(--text-primary)]">Herramientas extra</p>
                                        <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">Todo lo que no esta visible en la toolbar principal.</p>
                                    </div>
                                    <span className="rounded-full border border-[var(--border-color)] bg-[var(--bg-surface)] px-2 py-1 text-[10px] font-medium text-[var(--text-muted)]">
                                        {plusMenuItems.length}/{PLUS_MENU_ITEMS.length}
                                    </span>
                                </div>
                                <div className="mt-3">
                                    <input
                                        type="search"
                                        value={insertMenuQuery}
                                        onChange={event => setInsertMenuQuery(event.target.value)}
                                        placeholder="Buscar CTA, documento, acordeon..."
                                        className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-fuchsia-500/60"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1 overflow-y-auto p-1.5 pr-1">
                                {plusMenuItems.length === 0 && (
                                    <div className="rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-surface)]/70 px-4 py-5 text-center">
                                        <p className="text-sm font-medium text-[var(--text-primary)]">No encontramos herramientas</p>
                                        <p className="mt-1 text-xs text-[var(--text-muted)]">Proba con CTA, documento, acordeon o diagrama.</p>
                                    </div>
                                )}
                                {Object.entries(plusMenuGroups).map(([category, items]) => {
                                    const categoryStyle = INSERT_MENU_CATEGORY_STYLES[category] || INSERT_MENU_CATEGORY_STYLES.Extra;
                                    return (
                                        <div key={category} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)]/55 py-2">
                                            <div className="flex items-center justify-between gap-2 px-3 pb-1.5">
                                                <p className={`text-[10px] font-bold uppercase tracking-wider ${categoryStyle.color}`}>{category}</p>
                                                <span className="text-[10px] text-[var(--text-muted)]">{items.length}</span>
                                            </div>
                                            {items.map(item => {
                                                const isPinned = pinnedTools.some(t => t.action === item.action);
                                                return (
                                                <button
                                                    key={item.action}
                                                    type="button"
                                                    onClick={() => handleInsertAction(item.action)}
                                                    className="group mx-1 flex w-[calc(100%-0.5rem)] items-start gap-2 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-fuchsia-500/10"
                                                >
                                                    <span className={`mt-0.5 flex items-center justify-center w-8 h-8 rounded-lg shrink-0 text-[11px] font-semibold ${categoryStyle.bg} ${categoryStyle.color}`}>
                                                        {item.icon}
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium text-[var(--text-primary)] group-hover:text-fuchsia-400 transition-colors">{item.title}</p>
                                                        <p className="text-[11px] text-[var(--text-muted)] leading-tight mt-0.5">{item.desc}</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            isPinned ? handleUnpinTool(item.action) : handlePinTool(item);
                                                        }}
                                                        className={`shrink-0 p-1 rounded-md transition-colors ${isPinned ? 'text-fuchsia-400 bg-fuchsia-500/20' : 'text-[var(--text-muted)] hover:text-fuchsia-400 hover:bg-fuchsia-500/10'}`}
                                                        title={isPinned ? 'Quitar de barra de herramientas' : 'Fijar en barra de herramientas'}
                                                    >
                                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill={isPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                                                            <path d="M12 2L9.5 9.5 2 12l6.5 2.5L12 22l2.5-7.5L22 12l-6.5-2.5L12 2z"/>
                                                        </svg>
                                                    </button>
                                                </button>
                                            )})}
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="border-t border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-2 text-[10px] text-[var(--text-muted)]">
                                Tip: tambien podes escribir <span className="font-semibold text-[var(--text-primary)]">/</span> dentro del editor para abrir estas mismas herramientas.
                            </div>
                        </div>
                    )}
                </div>

                {/* Markdown / Source toggle */}
                <ToolBtn onClick={toggleMarkdownMode} active={markdownMode} title={markdownMode ? 'Modo visual' : 'Modo código fuente'}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>
                </ToolBtn>

                {/* Preview y pantalla completa */}
                <div className="ml-auto flex items-center gap-1">
                    <ToolBtn onClick={() => setShowPreview(true)} title="Vista previa (Ctrl+P)">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </ToolBtn>
                    <ToolBtn onClick={onToggleFullscreen} title={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}>
                        {fullscreen
                            ? <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
                            : <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>}
                    </ToolBtn>
                </div>
            </div>

            {/* ── TOOLBAR CONTEXTUAL DE CODE BLOCK ───────────────────────── */}
            {editor.isActive('codeBlock') && (
                <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 border-b border-[var(--border-color)] bg-[var(--bg-elevated)] text-xs">
                    <span className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider mr-1">Codigo:</span>
                    <select
                        className="h-7 px-2 rounded bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] text-xs focus:outline-none focus:border-fuchsia-500/60 cursor-pointer"
                        value={editor.getAttributes('codeBlock').language || 'javascript'}
                        onChange={e => editor.chain().focus().updateAttributes('codeBlock', { language: e.target.value }).run()}
                    >
                        {CODE_LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                    <select
                        className="h-7 px-2 rounded bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] text-xs focus:outline-none focus:border-fuchsia-500/60 cursor-pointer"
                        value={editor.getAttributes('codeBlock').variant || 'plain'}
                        onChange={e => editor.chain().focus().updateAttributes('codeBlock', { variant: e.target.value }).run()}
                    >
                        {CODE_VARIANTS.map(variant => <option key={variant.value} value={variant.value}>{variant.label}</option>)}
                    </select>
                    <input
                        type="text"
                        value={codeBlockMeta.filename}
                        onChange={e => updateCodeBlockMetadata({ filename: e.target.value })}
                        placeholder="archivo.ext"
                        className="h-7 min-w-[120px] rounded border border-[var(--border-color)] bg-[var(--bg-primary)] px-2 text-xs text-[var(--text-secondary)] outline-none focus:border-fuchsia-500/60"
                    />
                    <input
                        type="text"
                        value={codeBlockMeta.title}
                        onChange={e => updateCodeBlockMetadata({ title: e.target.value })}
                        placeholder="Titulo opcional"
                        className="h-7 min-w-[160px] rounded border border-[var(--border-color)] bg-[var(--bg-primary)] px-2 text-xs text-[var(--text-secondary)] outline-none focus:border-fuchsia-500/60"
                    />
                    <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleCodeBlock().run(); }}
                        className="px-2 py-1 rounded hover:bg-red-500/10 text-red-400 transition-colors ml-auto">Quitar bloque</button>
                </div>
            )}

            {/* ── TOOLBAR CONTEXTUAL DE TABLA (ahora BubbleMenu flotante) ──────────────────────────────── */}

            {uploadError && (
                <div className="mx-4 mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                    {uploadError}
                </div>
            )}

            {!uploadError && uploading && (
                <div className="mx-4 mt-3 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-300">
                    Subiendo archivo al CMS...
                </div>
            )}

            {/* ── ÁREA DE EDICIÓN ──────────────────────────────────────────── */}
            <div
                className={`flex-1 overflow-y-auto bg-[var(--bg-primary)] focus-within:outline-none ${markdownMode ? 'hidden' : ''}`}
                style={{ minHeight: fullscreen ? 'calc(100vh - 120px)' : '420px' }}
            >
                {/* Columna central tipo Medium */}
                <div className={`
                    mx-auto px-6 py-10
                    prose prose-invert max-w-none
                    [&_.tiptap]:outline-none
                    [&_.tiptap]:max-w-full [&_.tiptap]:mx-auto [&_.tiptap]:px-4
                    [&_.tiptap]:text-[17px] [&_.tiptap]:leading-[1.8] [&_.tiptap]:text-[var(--text-primary)]
                    [&_.tiptap_h1]:text-[2.1em] [&_.tiptap_h1]:font-extrabold [&_.tiptap_h1]:leading-tight [&_.tiptap_h1]:mt-10 [&_.tiptap_h1]:mb-4 [&_.tiptap_h1]:text-[var(--text-primary)]
                    [&_.tiptap_h2]:text-[1.55em] [&_.tiptap_h2]:font-bold [&_.tiptap_h2]:leading-snug [&_.tiptap_h2]:mt-9 [&_.tiptap_h2]:mb-3 [&_.tiptap_h2]:text-[var(--text-primary)]
                    [&_.tiptap_h3]:text-[1.25em] [&_.tiptap_h3]:font-semibold [&_.tiptap_h3]:mt-7 [&_.tiptap_h3]:mb-2 [&_.tiptap_h3]:text-[var(--text-primary)]
                    [&_.tiptap_h4]:text-[1.05em] [&_.tiptap_h4]:font-semibold [&_.tiptap_h4]:mt-6 [&_.tiptap_h4]:mb-2 [&_.tiptap_h4]:text-[var(--text-secondary)]
                    [&_.tiptap_p]:mb-5 [&_.tiptap_p]:text-[var(--text-secondary)]
                    [&_.tiptap_blockquote]:border-l-[3px] [&_.tiptap_blockquote]:border-fuchsia-500 [&_.tiptap_blockquote]:pl-5 [&_.tiptap_blockquote]:my-6 [&_.tiptap_blockquote]:italic [&_.tiptap_blockquote]:text-[var(--text-muted)] [&_.tiptap_blockquote]:text-[1.05em]
                    [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-6 [&_.tiptap_ul]:mb-5 [&_.tiptap_ul]:space-y-1
                    [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-6 [&_.tiptap_ol]:mb-5 [&_.tiptap_ol]:space-y-1
                    [&_.tiptap_li]:text-[var(--text-secondary)]
                    [&_.tiptap_code]:text-cyan-500 [&_.tiptap_code]:bg-[var(--bg-elevated)] [&_.tiptap_code]:px-[5px] [&_.tiptap_code]:py-[2px] [&_.tiptap_code]:rounded [&_.tiptap_code]:text-[0.87em] [&_.tiptap_code]:font-mono
                    [&_.tiptap_pre]:my-6 [&_.tiptap_pre]:rounded-xl [&_.tiptap_pre]:overflow-x-auto [&_.tiptap_pre]:text-[0.88em] [&_.tiptap_pre]:leading-relaxed [&_.tiptap_pre]:p-0
                    [&_.tiptap_pre_code]:bg-transparent [&_.tiptap_pre_code]:p-0
                    [&_.tiptap_hr]:border-[var(--border-color)] [&_.tiptap_hr]:my-10
                    [&_.tiptap_a]:text-fuchsia-500 [&_.tiptap_a]:underline [&_.tiptap_a:hover]:text-fuchsia-400
                    [&_.tiptap_img]:rounded-xl [&_.tiptap_img]:shadow-2xl [&_.tiptap_img]:my-4
                    [&_.tiptap_.tableWrapper]:my-6 [&_.tiptap_.tableWrapper]:overflow-x-auto
                    [&_.tiptap_table]:w-full [&_.tiptap_table]:border-collapse [&_.tiptap_table]:my-6
                    [&_.tiptap_td]:border [&_.tiptap_td]:border-[var(--border-color)] [&_.tiptap_td]:p-3 [&_.tiptap_td]:text-[var(--text-secondary)]
                    [&_.tiptap_th]:border [&_.tiptap_th]:border-[var(--border-color)] [&_.tiptap_th]:p-3 [&_.tiptap_th]:bg-[var(--bg-elevated)] [&_.tiptap_th]:font-semibold [&_.tiptap_th]:text-[var(--text-primary)]
                    [&_.tiptap_.column-resize-handle]:w-1 [&_.tiptap_.column-resize-handle]:bg-fuchsia-500/70
                    [&_.tiptap_.selectedCell]:relative [&_.tiptap_.selectedCell]:after:absolute [&_.tiptap_.selectedCell]:after:inset-0 [&_.tiptap_.selectedCell]:after:pointer-events-none [&_.tiptap_.selectedCell]:after:ring-2 [&_.tiptap_.selectedCell]:after:ring-fuchsia-500/35
                    [&_.resize-cursor]:cursor-col-resize
                    [&_.tiptap_p.is-editor-empty:first-child::before]:text-[var(--text-muted)]
                    [&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
                    [&_.tiptap_p.is-editor-empty:first-child::before]:float-left
                     [&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none
                `}>
                    <EditorContent editor={editor} />
                    <BubbleMenuTooltip editor={editor} />
                    
                    {/* BubbleMenu de tabla flotante */}
                    {editor && (
                        <BubbleMenu
                            editor={editor}
                            shouldShow={({ editor }) => editor.isActive('table')}
                            options={{
                                placement: 'top',
                                offset: [0, 12],
                            }}
                            className="flex flex-wrap items-center justify-center gap-1 px-3 py-1.5 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl shadow-2xl text-xs z-50"
                        >
                            <span className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider mr-1">Tabla:</span>
                            <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().addRowBefore().run(); }}
                                className="px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)] transition-colors" title="Añadir fila arriba">↑ Fila</button>
                            <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().addRowAfter().run(); }}
                                className="px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)] transition-colors" title="Añadir fila abajo">↓ Fila</button>
                            <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().deleteRow().run(); }}
                                className="px-2 py-1 rounded hover:bg-red-500/10 text-red-400 transition-colors" title="Eliminar fila">✕ Fila</button>
                            <div className="w-px h-4 bg-[var(--border-color)] mx-0.5 self-center" />
                            <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().addColumnBefore().run(); }}
                                className="px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)] transition-colors" title="Añadir columna izquierda">← Col</button>
                            <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().addColumnAfter().run(); }}
                                className="px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)] transition-colors" title="Añadir columna derecha">→ Col</button>
                            <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().deleteColumn().run(); }}
                                className="px-2 py-1 rounded hover:bg-red-500/10 text-red-400 transition-colors" title="Eliminar columna">✕ Col</button>
                            <div className="w-px h-4 bg-[var(--border-color)] mx-0.5 self-center" />
                            <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleHeaderRow().run(); }}
                                className="px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)] transition-colors">Cabecera</button>
                            <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().mergeCells().run(); }}
                                className="px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)] transition-colors" title="Combinar celdas">Combinar</button>
                            <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().splitCell().run(); }}
                                className="px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)] transition-colors" title="Dividir celda">Dividir</button>
                            <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().setCellAttribute('backgroundColor', null).setCellAttribute('borderColor', null).run(); }}
                                className="px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)] transition-colors" title="Limpiar estilos de celda">Limpiar celda</button>
                            <div className="w-px h-4 bg-[var(--border-color)] mx-0.5 self-center" />
                            {/* Color picker */}
                            <div className="relative">
                                <button type="button" onClick={() => setShowTableColors(v => !v)}
                                    className="px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)] transition-colors flex items-center gap-1" title="Color de celda">
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                                    Color
                                </button>
                                {showTableColors && (
                                    <div className="absolute top-full left-0 mt-1 p-3 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl shadow-xl z-50 w-56" onMouseDown={e => e.preventDefault()}>
                                        <p className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider mb-2">Fondo de celda</p>
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {[
                                                null,
                                                '#fecaca', '#fed7aa', '#fef08a', '#bbf7d0', '#a5f3fc', '#bfdbfe', '#ddd6fe', '#fbcfe8',
                                                '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0891b2', '#2563eb', '#7c3aed', '#db2777',
                                                '#1e1e2e', '#2a2a3a', '#3a3a4a', '#f8fafc', '#f1f5f9', '#e2e8f0',
                                            ].map((color, i) => (
                                                <button key={i} type="button"
                                                    onMouseDown={e => { e.preventDefault(); editor.chain().focus().setCellAttribute('backgroundColor', color).run(); setShowTableColors(false); }}
                                                    className={`w-6 h-6 rounded border transition-transform hover:scale-110 ${!color ? 'border-dashed border-[var(--border-color)]' : 'border-transparent'}`}
                                                    style={{ background: color || 'transparent' }}
                                                    title={color || 'Sin color'}
                                                >
                                                    {!color && <span className="text-[9px] text-[var(--text-muted)]">✕</span>}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider mb-2">Borde de celda</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {[
                                                null, '#e5e7eb', '#d4d4d8',
                                                '#dc2626', '#ea580c', '#16a34a', '#2563eb', '#7c3aed', '#db2777',
                                                '#fecaca', '#bfdbfe', '#ddd6fe',
                                            ].map((color, i) => (
                                                <button key={i} type="button"
                                                    onMouseDown={e => { e.preventDefault(); editor.chain().focus().setCellAttribute('borderColor', color).run(); setShowTableColors(false); }}
                                                    className={`w-6 h-6 rounded border-2 transition-transform hover:scale-110 ${!color ? 'border-dashed border-[var(--border-color)]' : ''}`}
                                                    style={{ borderColor: color || undefined, background: 'transparent' }}
                                                    title={color || 'Por defecto'}
                                                >
                                                    {!color && <span className="text-[9px] text-[var(--text-muted)]">✕</span>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().deleteTable().run(); }}
                                className="px-2 py-1 rounded hover:bg-red-500/10 text-red-400 transition-colors ml-auto">Eliminar tabla</button>
                        </BubbleMenu>
                    )}
                </div>
            </div>

            {/* ── MODO MARKDOWN/SOURCE ──────────────────────────────── */}
            {markdownMode && (
                <div className="flex-1 bg-[var(--bg-primary)]" style={{ minHeight: fullscreen ? 'calc(100vh - 120px)' : '420px' }}>
                    <textarea
                        aria-label="Editor HTML source"
                        data-testid="cms-html-source"
                        value={markdownSource}
                        onChange={e => {
                            const nextValue = e.target.value;
                            setMarkdownSource(nextValue);
                            onChange(nextValue);
                        }}
                        className="w-full h-full min-h-[420px] p-6 bg-transparent text-[var(--text-secondary)] font-mono text-sm leading-relaxed outline-none resize-none"
                        placeholder="Edita el código fuente HTML aquí…"
                        spellCheck={false}
                    />
                </div>
            )}

            {/* ── PREVIEW MODAL ────────────────────────────────────── */}
            {showPreview && (
                <div 
                    className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm overflow-y-auto"
                    onClick={() => setShowPreview(false)}
                >
                    <div 
                        className="relative max-w-3xl mx-auto my-12 px-8 py-10 
                                   bg-[var(--bg-primary)] rounded-2xl shadow-2xl border border-[var(--border-color)]"
                        onClick={e => e.stopPropagation()}
                    >
                        <button 
                            onClick={() => setShowPreview(false)}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg
                                       text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]
                                       transition-colors"
                            title="Cerrar (ESC)"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12"/>
                            </svg>
                        </button>
                        <div className="prose prose-invert max-w-none">
                            <HtmlContentRenderer content={editor?.getHTML() || ''} />
                        </div>
                    </div>
                </div>
            )}

            {/* ── SLASH MENU ───────────────────────────────────────── */}
            {slashMenu.open && (
                <SlashMenu
                    editor={editor}
                    coords={slashMenu.coords}
                    query={slashMenu.query}
                    onClose={() => setSlashMenu(m => ({ ...m, open: false }))}
                    onAction={handleSlashAction}
                />
            )}

            {/* Hidden inputs */}
            <input ref={docInputRef} type="file" accept={DOCUMENT_INPUT_ACCEPT} className="hidden" onChange={handleDocumentUpload} />

            {/* ── STATUS BAR ───────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--border-color)] bg-[var(--bg-surface)] text-xs text-[var(--text-muted)] rounded-b-2xl">
                <div className="flex items-center gap-3">
                    <span>{wordCount} palabras · {charCount} caracteres</span>
                    <span>~{readMin} min de lectura</span>
                </div>
                <div className="flex items-center gap-2">
                    {markdownMode && <span className="text-cyan-400 font-medium">HTML Source</span>}
                    <span className="text-[var(--text-muted)] opacity-60">Docs: {DOCUMENT_UPLOAD_LABEL}</span>
                    <span className="text-[var(--text-muted)] opacity-60 transition-opacity">{contextHint}</span>
                </div>
            </div>
        </div>
    );
}
