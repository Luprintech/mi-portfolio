import { getMermaidTemplateByAction } from './diagramConfig';

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
    { title: 'Galeria de videos', icon: 'VID', desc: 'Galeria de YouTube/Vimeo', category: 'Media', action: 'videoGallery', toolbar: 'overflow' },
    { title: 'GIF animado', icon: 'GIF', desc: 'Imagen GIF con controles', category: 'Media', action: 'gif', toolbar: 'overflow' },
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
    { title: 'Cita destacada', icon: '💬', desc: 'Quote card profesional', category: 'Avanzado', action: 'quoteCard', toolbar: 'overflow' },
    { title: 'Estadisticas', icon: '📊', desc: 'Contador de metricas', category: 'Avanzado', action: 'statsCounter', toolbar: 'overflow' },
    { title: 'Barras de progreso', icon: '📈', desc: 'Barras de habilidades', category: 'Avanzado', action: 'progressBars', toolbar: 'overflow' },
    { title: 'Linea de tiempo', icon: '⏳', desc: 'Timeline de eventos', category: 'Avanzado', action: 'timeline', toolbar: 'overflow' },
    { title: 'Cuenta regresiva', icon: '⏱️', desc: 'Countdown timer para eventos', category: 'Avanzado', action: 'countdownTimer', toolbar: 'overflow' },
    { title: 'Comparador antes/despues', icon: '⇆', desc: 'Slider de comparacion', category: 'Media', action: 'comparisonSlider', toolbar: 'overflow' },
    { title: 'Spotify', icon: '🎵', desc: 'Embed de Spotify', category: 'Media', action: 'spotifyEmbed', toolbar: 'overflow' },
    { title: 'Diagrama flujo', icon: 'FLOW', desc: 'Mermaid flowchart', category: 'Diagramas', action: 'mermaid-flowchart', toolbar: 'overflow' },
    { title: 'Mapa mental', icon: 'MIND', desc: 'Mermaid mindmap', category: 'Diagramas', action: 'mermaid-mindmap', toolbar: 'overflow' },
    { title: 'Secuencia', icon: 'SEQ', desc: 'Mermaid sequence', category: 'Diagramas', action: 'mermaid-sequence', toolbar: 'overflow' },
    { title: 'Mapa conceptual', icon: 'GRAPH', desc: 'Mermaid graph', category: 'Diagramas', action: 'mermaid-graph', toolbar: 'overflow' },
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
    return runInsertMenuEditorActionWithOptions(editor, action);
}

export function runInsertMenuEditorActionWithOptions(editor, action, options = {}) {
    if (!editor) return false;

    const mermaidTemplate = getMermaidTemplateByAction(action);
    const range = options.range || null;
    let chain = editor.chain().focus();

    if (range) {
        chain = chain.deleteRange(range);
    }

    const actions = {
        h1: currentChain => currentChain.setHeading({ level: 1 }),
        h2: currentChain => currentChain.setHeading({ level: 2 }),
        h3: currentChain => currentChain.setHeading({ level: 3 }),
        bulletList: currentChain => currentChain.toggleBulletList(),
        orderedList: currentChain => currentChain.toggleOrderedList(),
        blockquote: currentChain => currentChain.setBlockquote(),
        hr: currentChain => currentChain.setHorizontalRule(),
        codeBlock: currentChain => currentChain.setCodeBlock(),
        code: currentChain => currentChain.toggleCode(),
        terminal: currentChain => currentChain.setCodeBlock().updateAttributes('codeBlock', { language: 'bash', variant: 'terminal', filename: 'terminal', title: 'Comandos' }),
        table: currentChain => currentChain.insertTable({ rows: 3, cols: 3, withHeaderRow: true }),
        'callout-tip': currentChain => currentChain.insertCallout('tip'),
        'callout-warning': currentChain => currentChain.insertCallout('warning'),
        'callout-info': currentChain => currentChain.insertCallout('info'),
        'callout-note': currentChain => currentChain.insertCallout('note'),
        accordion: currentChain => currentChain.insertAccordion(),
        contentButton: currentChain => currentChain.insertContentButton(),
        quoteCard: currentChain => currentChain.insertQuoteCard(),
        statsCounter: currentChain => currentChain.insertStatsCounter(),
        progressBars: currentChain => currentChain.insertProgressBars(),
        timeline: currentChain => currentChain.insertTimeline(),
        countdownTimer: currentChain => currentChain.insertCountdownTimer(),
        comparisonSlider: currentChain => currentChain.insertComparisonSlider(),
        spotifyEmbed: currentChain => currentChain.insertSpotifyEmbed(),
        imageGrid: currentChain => currentChain.insertImageGrid(2),
        videoGallery: currentChain => currentChain.insertVideoGallery(),
        gif: currentChain => currentChain.insertGif(),
        ...(mermaidTemplate ? {
            [action]: currentChain => currentChain.insertMermaid(mermaidTemplate),
        } : {}),
    };

    const command = actions[action];
    if (!command) return false;
    command(chain);
    return chain.run();
}
