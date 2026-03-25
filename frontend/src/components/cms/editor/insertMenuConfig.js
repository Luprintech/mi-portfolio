export const INSERT_MENU_ITEMS = [
    { title: 'Titulo 1', icon: 'H1', desc: 'Titulo principal', category: 'Bloques', action: 'h1', toolbar: 'primary' },
    { title: 'Titulo 2', icon: 'H2', desc: 'Subtitulo', category: 'Bloques', action: 'h2', toolbar: 'primary' },
    { title: 'Titulo 3', icon: 'H3', desc: 'Seccion', category: 'Bloques', action: 'h3', toolbar: 'primary' },
    { title: 'Lista vinetas', icon: '•', desc: 'Lista no ordenada', category: 'Bloques', action: 'bulletList', toolbar: 'primary' },
    { title: 'Lista numerada', icon: '#', desc: 'Lista ordenada', category: 'Bloques', action: 'orderedList', toolbar: 'primary' },
    { title: 'Cita', icon: '"', desc: 'Blockquote', category: 'Bloques', action: 'blockquote', toolbar: 'primary' },
    { title: 'Separador', icon: '-', desc: 'Linea horizontal', category: 'Bloques', action: 'hr', toolbar: 'primary' },
    { title: 'Bloque de codigo', icon: '</>', desc: 'Codigo con syntax highlight', category: 'Codigo', action: 'codeBlock', toolbar: 'primary' },
    { title: 'Codigo inline', icon: '`c`', desc: 'Codigo dentro del texto', category: 'Codigo', action: 'code', toolbar: 'primary' },
    { title: 'Terminal', icon: '$_', desc: 'Bloque de comandos', category: 'Codigo', action: 'terminal', toolbar: 'overflow' },
    { title: 'Imagen', icon: 'IMG', desc: 'Subir una imagen', category: 'Media', action: 'image', toolbar: 'primary' },
    { title: 'Grid de imagenes', icon: '[]', desc: 'Varias imagenes en grid', category: 'Media', action: 'imageGrid', toolbar: 'overflow' },
    { title: 'YouTube', icon: 'YT', desc: 'Video de YouTube', category: 'Media', action: 'youtube', toolbar: 'primary' },
    { title: 'Audio', icon: 'AU', desc: 'Archivo de audio', category: 'Media', action: 'audio', toolbar: 'primary' },
    { title: 'PDF / Documento', icon: 'DOC', desc: 'Adjuntar PDF, ZIP o DOCX', category: 'Media', action: 'document', toolbar: 'overflow' },
    { title: 'Tabla', icon: '[]', desc: 'Tabla 3x3', category: 'Avanzado', action: 'table', toolbar: 'primary' },
    { title: 'Callout - Tip', icon: 'TIP', desc: 'Consejo destacado', category: 'Avanzado', action: 'callout-tip', toolbar: 'overflow' },
    { title: 'Callout - Warning', icon: 'WARN', desc: 'Advertencia', category: 'Avanzado', action: 'callout-warning', toolbar: 'overflow' },
    { title: 'Callout - Info', icon: 'INFO', desc: 'Nota informativa', category: 'Avanzado', action: 'callout-info', toolbar: 'overflow' },
    { title: 'Callout - Note', icon: 'NOTE', desc: 'Nota general', category: 'Avanzado', action: 'callout-note', toolbar: 'overflow' },
    { title: 'Acordeon', icon: 'ACC', desc: 'Bloque colapsable', category: 'Avanzado', action: 'accordion', toolbar: 'overflow' },
    { title: 'Boton CTA', icon: 'CTA', desc: 'Boton con enlace', category: 'Avanzado', action: 'contentButton', toolbar: 'overflow' },
    { title: 'Diagrama flujo', icon: 'FLOW', desc: 'Mermaid flowchart', category: 'Diagramas', action: 'mermaid-flowchart', toolbar: 'overflow' },
    { title: 'Mapa mental', icon: 'MIND', desc: 'Mermaid mindmap', category: 'Diagramas', action: 'mermaid-mindmap', toolbar: 'overflow' },
    { title: 'Secuencia', icon: 'SEQ', desc: 'Mermaid sequence', category: 'Diagramas', action: 'mermaid-sequence', toolbar: 'overflow' },
    { title: 'Emoji', icon: ':)', desc: 'Insertar emoji', category: 'Extra', action: 'emoji', toolbar: 'primary' },
];

export const PLUS_MENU_ITEMS = INSERT_MENU_ITEMS.filter(item => item.toolbar !== 'primary');

export const INSERT_MENU_CATEGORY_STYLES = {
    Bloques: { color: 'text-violet-400', bg: 'bg-violet-500/15' },
    Codigo: { color: 'text-cyan-400', bg: 'bg-cyan-500/15' },
    Media: { color: 'text-amber-400', bg: 'bg-amber-500/15' },
    Avanzado: { color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
    Diagramas: { color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/15' },
    Extra: { color: 'text-orange-400', bg: 'bg-orange-500/15' },
};

export function filterInsertMenuItems(items, query = '') {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return items;

    return items.filter(item => [item.title, item.desc, item.category].some(value => value.toLowerCase().includes(normalizedQuery)));
}

export function groupInsertMenuItems(items) {
    return items.reduce((groups, item) => {
        const key = item.category;
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
        return groups;
    }, {});
}

export function runInsertMenuEditorAction(editor, action) {
    if (!editor) return false;

    const actions = {
        h1: () => editor.chain().focus().setHeading({ level: 1 }).run(),
        h2: () => editor.chain().focus().setHeading({ level: 2 }).run(),
        h3: () => editor.chain().focus().setHeading({ level: 3 }).run(),
        bulletList: () => editor.chain().focus().toggleBulletList().run(),
        orderedList: () => editor.chain().focus().toggleOrderedList().run(),
        blockquote: () => editor.chain().focus().setBlockquote().run(),
        hr: () => editor.chain().focus().setHorizontalRule().run(),
        codeBlock: () => editor.chain().focus().setCodeBlock().run(),
        code: () => editor.chain().focus().toggleCode().run(),
        terminal: () => editor.chain().focus().setCodeBlock().updateAttributes('codeBlock', { language: 'bash', variant: 'terminal', filename: 'terminal', title: 'Comandos' }).run(),
        table: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
        'callout-tip': () => editor.chain().focus().insertCallout('tip').run(),
        'callout-warning': () => editor.chain().focus().insertCallout('warning').run(),
        'callout-info': () => editor.chain().focus().insertCallout('info').run(),
        'callout-note': () => editor.chain().focus().insertCallout('note').run(),
        accordion: () => editor.chain().focus().insertAccordion().run(),
        contentButton: () => editor.chain().focus().insertContentButton().run(),
        imageGrid: () => editor.chain().focus().insertImageGrid(2).run(),
    };

    const command = actions[action];
    if (!command) return false;
    command();
    return true;
}
