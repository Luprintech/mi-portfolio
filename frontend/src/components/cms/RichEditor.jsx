import { useEditor, EditorContent, ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { TextStyleKit } from '@tiptap/extension-text-style';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import { Node, mergeAttributes } from '@tiptap/core';
import { useCallback, useRef, useEffect, useState } from 'react';

// ─── ResizableImage — nodo React con handles de resize ────────────────────────
function ResizableImageView({ node, updateAttributes, selected }) {
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
        <NodeViewWrapper className="inline-block relative my-4 mx-auto block" data-drag-handle>
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
        </NodeViewWrapper>
    );
}

// ─── ResizableYoutube — nodo React con handles de resize ─────────────────────
function ResizableYoutubeView({ node, updateAttributes, selected }) {
    const containerRef = useRef(null);
    const [resizing, setResizing] = useState(false);
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
        setResizing(true);

        function onMove(ev) {
            const { startX, startW, startH, ratio } = startData.current;
            const newW = Math.max(200, startW + (ev.clientX - startX));
            const newH = Math.round(newW / ratio);
            updateAttributes({ width: Math.round(newW), height: newH });
        }
        function onUp() {
            setResizing(false);
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
    } catch {}

    return (
        <NodeViewWrapper className="my-4 block" data-drag-handle>
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
        </NodeViewWrapper>
    );
}

// ─── Extensión Image con NodeView React ───────────────────────────────────────
const ResizableImageExtension = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            width:  { default: null },
            height: { default: null },
        };
    },
    addNodeView() {
        return ReactNodeViewRenderer(ResizableImageView);
    },
});

// ─── Extensión Youtube con NodeView React ─────────────────────────────────────
const ResizableYoutubeExtension = Youtube.extend({
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
        };
    },
    parseHTML() { return [{ tag: 'audio' }]; },
    renderHTML({ HTMLAttributes }) {
        return ['audio', mergeAttributes({ controls: true, class: 'w-full my-4 rounded-lg' }, HTMLAttributes)];
    },
    addNodeView() {
        return ({ node }) => {
            const dom = document.createElement('div');
            dom.className = 'my-4';
            const audio = document.createElement('audio');
            audio.controls = true;
            audio.className = 'w-full rounded-lg';
            audio.src = node.attrs.src || '';
            dom.appendChild(audio);
            if (node.attrs.title) {
                const cap = document.createElement('p');
                cap.className = 'text-sm text-center text-gray-500 mt-1 italic';
                cap.textContent = node.attrs.title;
                dom.appendChild(cap);
            }
            return { dom };
        };
    },
    addCommands() {
        return {
            insertAudio: attrs => ({ commands }) =>
                commands.insertContent({ type: this.name, attrs }),
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
            className={`flex items-center justify-center w-8 h-8 shrink-0 rounded-lg text-sm transition-all
                ${active
                    ? 'bg-fuchsia-500/30 text-fuchsia-300 ring-1 ring-fuchsia-500/50'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'}
                ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            {children}
        </button>
    );
}
function Divider() {
    return <div className="w-px h-6 bg-white/10 mx-0.5 self-center shrink-0" />;
}

// ─── Upload helpers ───────────────────────────────────────────────────────────
async function uploadFile(file, token) {
    const fd = new FormData();
    fd.append('image', file);
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bitacora/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
    });
    if (!res.ok) throw new Error('Error al subir fichero');
    return (await res.json()).url;
}

const FONT_SIZES = ['12px','14px','16px','18px','20px','24px','28px','32px','36px','48px'];

// ─── RichEditor ───────────────────────────────────────────────────────────────
export default function RichEditor({ value, onChange, token, fullscreen, onToggleFullscreen }) {
    const fileInputRef  = useRef(null);
    const audioInputRef = useRef(null);

    const [showLinkMenu,    setShowLinkMenu]    = useState(false);
    const [linkUrl,         setLinkUrl]         = useState('');
    const [showYoutubeMenu, setShowYoutubeMenu] = useState(false);
    const [youtubeUrl,      setYoutubeUrl]      = useState('');
    const [showAudioMenu,   setShowAudioMenu]   = useState(false);
    const [audioUrl,        setAudioUrl]        = useState('');
    const [showColorPick,   setShowColorPick]   = useState(false);
    const [showHighPick,    setShowHighPick]    = useState(false);
    const [uploading,       setUploading]       = useState(false);
    const [fontSize,        setFontSize]        = useState('16px');

    // Cerrar popups al hacer clic fuera
    useEffect(() => {
        function close() {
            setShowLinkMenu(false);
            setShowYoutubeMenu(false);
            setShowAudioMenu(false);
            setShowColorPick(false);
            setShowHighPick(false);
        }
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextStyleKit,
            Highlight.configure({ multicolor: true }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
            }),
            ResizableImageExtension.configure({ allowBase64: false }),
            ResizableYoutubeExtension,
            AudioNode,
            Table.configure({ resizable: false }),
            TableRow,
            TableHeader,
            TableCell,
            Placeholder.configure({ placeholder: 'Escribe aquí el contenido del post…' }),
            CharacterCount,
        ],
        content: value || '',
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
        editorProps: {
            attributes: { class: 'outline-none min-h-[400px] text-gray-200 leading-relaxed' },
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
        };
        editor.on('selectionUpdate', update);
        editor.on('transaction',     update);
        return () => { editor.off('selectionUpdate', update); editor.off('transaction', update); };
    }, [editor]);

    const handleImageFile = useCallback(async (file) => {
        if (!file || !token) return;
        setUploading(true);
        try {
            const url = await uploadFile(file, token);
            editor?.chain().focus().setImage({ src: url, alt: file.name.replace(/\.[^.]+$/, '') }).run();
        } catch (err) { console.error(err); }
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
        setUploading(true);
        try {
            const url = await uploadFile(file, token);
            editor?.commands.insertAudio({ src: url, title: file.name });
        } catch (err) { console.error(err); }
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

    if (!editor) return null;

    const wordCount = editor.storage.characterCount?.words?.() ?? 0;
    const charCount = editor.storage.characterCount?.characters?.() ?? 0;
    const readMin   = Math.max(1, Math.ceil(wordCount / 200));

    return (
        <div className={`flex flex-col rounded-2xl border border-white/10 bg-[#0d0d14]
            ${fullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}>

            {/* ── TOOLBAR ─────────────────────────────────────────────────── */}
            <div className="relative z-20 flex flex-wrap items-center gap-1 px-3 py-2 border-b border-white/10 bg-[#0d0d14] rounded-t-2xl">

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
                    className="h-8 px-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-xs focus:outline-none focus:border-fuchsia-500/60 cursor-pointer shrink-0"
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
                    className="h-8 px-1 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-xs focus:outline-none focus:border-fuchsia-500/60 cursor-pointer w-[70px] shrink-0"
                    value={fontSize}
                    onChange={e => { setFontSize(e.target.value); editor.chain().focus().setFontSize(e.target.value).run(); }}>
                    {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <Divider />

                {/* Inline */}
                <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()}    active={editor.isActive('bold')}      title="Negrita (Ctrl+B)"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()}  active={editor.isActive('italic')}    title="Cursiva (Ctrl+I)"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Subrayado (Ctrl+U)"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()}  active={editor.isActive('strike')}    title="Tachado"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="12" x2="20" y2="12"/><path d="M17.5 5.5C17 4 15.5 3 14 3H10C7.8 3 6 4.8 6 7c0 1.5.8 2.8 2 3.5"/><path d="M16.5 14.5C17 16 16 18 14 19c-1 .5-2 .5-3 .5-2 0-3.5-1-4.5-2.5"/></svg></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().toggleCode().run()}    active={editor.isActive('code')}      title="Código inline"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></ToolBtn>

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
                        <div className="absolute top-10 left-0 z-50 p-3 bg-[#1a1a2e] border border-white/20 rounded-xl shadow-2xl w-44"
                            onMouseDown={e => e.stopPropagation()}>
                            <button type="button" className="text-xs text-gray-400 hover:text-white mb-2 w-full text-left px-1"
                                onClick={() => { editor.chain().focus().unsetColor().run(); setShowColorPick(false); }}>
                                Quitar color
                            </button>
                            <div className="grid grid-cols-5 gap-1.5">
                                {TEXT_COLORS.map(c => (
                                    <button key={c} type="button" title={c}
                                        className="w-6 h-6 rounded-md border-2 border-transparent hover:border-white/50 hover:scale-110 transition-all"
                                        style={{ background: c }}
                                        onClick={() => { editor.chain().focus().setColor(c).run(); setShowColorPick(false); }}
                                    />
                                ))}
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
                        <div className="absolute top-10 left-0 z-50 p-3 bg-[#1a1a2e] border border-white/20 rounded-xl shadow-2xl w-36"
                            onMouseDown={e => e.stopPropagation()}>
                            <button type="button" className="text-xs text-gray-400 hover:text-white mb-2 w-full text-left px-1"
                                onClick={() => { editor.chain().focus().unsetHighlight().run(); setShowHighPick(false); }}>
                                Quitar
                            </button>
                            <div className="grid grid-cols-4 gap-1.5">
                                {HIGHLIGHT_COLORS.map(c => (
                                    <button key={c} type="button" title={c}
                                        className="w-6 h-6 rounded-md border-2 border-transparent hover:border-white/50 hover:scale-110 transition-all"
                                        style={{ background: c }}
                                        onClick={() => { editor.chain().focus().toggleHighlight({ color: c }).run(); setShowHighPick(false); }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <Divider />

                {/* Alineación */}
                <ToolBtn onClick={() => editor.chain().focus().setTextAlign('left').run()}    active={editor.isActive({ textAlign: 'left' })}    title="Izquierda"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().setTextAlign('center').run()}  active={editor.isActive({ textAlign: 'center' })}  title="Centrar"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().setTextAlign('right').run()}   active={editor.isActive({ textAlign: 'right' })}   title="Derecha"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justificar"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></ToolBtn>

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
                        <div className="absolute top-10 left-0 z-50 p-3 bg-[#1a1a2e] border border-white/20 rounded-xl shadow-2xl flex gap-2 w-72"
                            onMouseDown={e => e.stopPropagation()}>
                            <input type="url" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyLink()}
                                placeholder="https://…"
                                className="flex-1 px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-fuchsia-500/60"
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
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageInputChange} />

                {/* YouTube */}
                <div className="relative" onMouseDown={e => e.stopPropagation()}>
                    <ToolBtn onClick={() => { setShowYoutubeMenu(p => !p); setShowLinkMenu(false); setShowAudioMenu(false); }} title="Vídeo YouTube">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23 7s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.5 2.8 12 2.8 12 2.8s-4.5 0-6.8.1c-.6.1-1.9.1-3 1.3C1.3 5 1 7 1 7S.7 9.1.7 11.2v1.9c0 2.1.3 4.2.3 4.2s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.5 21.4 12 21.5 12 21.5s4.5 0 6.8-.2c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.3-2.1.3-4.2v-1.9C23.3 9.1 23 7 23 7z" opacity=".85"/><polygon points="9.5,15.5 15.5,12 9.5,8.5" fill="white"/></svg>
                    </ToolBtn>
                    {showYoutubeMenu && (
                        <div className="absolute top-10 left-0 z-50 p-3 bg-[#1a1a2e] border border-white/20 rounded-xl shadow-2xl flex gap-2 w-80"
                            onMouseDown={e => e.stopPropagation()}>
                            <input type="url" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyYoutube()}
                                placeholder="https://youtube.com/watch?v=…"
                                className="flex-1 px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-fuchsia-500/60"
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
                        <div className="absolute top-10 left-0 z-50 p-3 bg-[#1a1a2e] border border-white/20 rounded-xl shadow-2xl w-80 space-y-2"
                            onMouseDown={e => e.stopPropagation()}>
                            <div className="flex gap-2">
                                <input type="url" value={audioUrl} onChange={e => setAudioUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyAudio()}
                                    placeholder="https://…/audio.mp3"
                                    className="flex-1 px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-fuchsia-500/60"
                                    autoFocus />
                                <button type="button" onClick={applyAudio} className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm rounded-lg">OK</button>
                            </div>
                            <button type="button" onClick={() => audioInputRef.current?.click()}
                                className="w-full py-1.5 text-sm border border-dashed border-white/20 rounded-lg text-gray-400 hover:text-white hover:border-white/40 transition-colors">
                                Subir archivo de audio
                            </button>
                            <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" onChange={handleAudioFile} />
                        </div>
                    )}
                </div>

                {/* Tabla */}
                <ToolBtn onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Insertar tabla">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
                </ToolBtn>

                <Divider />

                <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Línea horizontal"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Limpiar formato"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7l4-4 10 10-4 4L4 7z"/><path d="M14 6l4 4"/><line x1="2" y1="22" x2="22" y2="22"/></svg></ToolBtn>

                {/* Pantalla completa */}
                <div className="ml-auto">
                    <ToolBtn onClick={onToggleFullscreen} title={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}>
                        {fullscreen
                            ? <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
                            : <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>}
                    </ToolBtn>
                </div>
            </div>

            {/* ── ÁREA DE EDICIÓN ──────────────────────────────────────────── */}
            <div
                className="flex-1 overflow-y-auto px-8 py-6 prose prose-invert prose-sm max-w-none
                    prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                    prose-a:text-fuchsia-400 prose-code:text-cyan-300 prose-code:bg-white/5
                    prose-pre:bg-[#0a0a12] prose-blockquote:border-fuchsia-500
                    prose-img:rounded-2xl prose-table:border-collapse focus-within:outline-none
                    [&_.tiptap]:outline-none
                    [&_.tiptap_p.is-editor-empty:first-child::before]:text-gray-600
                    [&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
                    [&_.tiptap_p.is-editor-empty:first-child::before]:float-left
                    [&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none
                    [&_.tiptap_table]:w-full [&_.tiptap_table]:border-collapse
                    [&_.tiptap_td]:border [&_.tiptap_td]:border-white/10 [&_.tiptap_td]:p-2
                    [&_.tiptap_th]:border [&_.tiptap_th]:border-white/10 [&_.tiptap_th]:p-2 [&_.tiptap_th]:bg-white/5"
                style={{ minHeight: fullscreen ? 'calc(100vh - 120px)' : '420px' }}
            >
                <EditorContent editor={editor} />
            </div>

            {/* ── STATUS BAR ───────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 bg-white/[0.02] text-xs text-gray-600 rounded-b-2xl">
                <span>{wordCount} palabras · {charCount} caracteres</span>
                <span>~{readMin} min de lectura</span>
            </div>
        </div>
    );
}
