export const MERMAID_TEMPLATES = {
    flowchart: `flowchart LR\n  A[Inicio] --> B{Condicion}\n  B -- Si --> C[Proceso A]\n  B -- No --> D[Proceso B]\n  C --> E[Fin]\n  D --> E`,
    mindmap: `mindmap\n  root((Idea principal))\n    Rama 1\n      Subnodo 1\n      Subnodo 2\n    Rama 2\n      Subnodo 3\n    Rama 3`,
    sequence: `sequenceDiagram\n  actor Usuario\n  participant App\n  participant API\n  Usuario->>App: Accion\n  App->>API: Request\n  API-->>App: Respuesta\n  App-->>Usuario: Resultado`,
    graph: `graph TD\n  A[Concepto central] --> B[Idea 1]\n  A --> C[Idea 2]\n  A --> D[Idea 3]\n  B --> E[Detalle]\n  C --> F[Detalle]`,
};

export const MERMAID_TEMPLATE_OPTIONS = [
    { key: 'flowchart', action: 'mermaid-flowchart', icon: '->', label: 'Diagrama de flujo', shortLabel: 'Flujo' },
    { key: 'mindmap', action: 'mermaid-mindmap', icon: 'MM', label: 'Mapa mental', shortLabel: 'Mental' },
    { key: 'sequence', action: 'mermaid-sequence', icon: '<>', label: 'Secuencia', shortLabel: 'Secuencia' },
    { key: 'graph', action: 'mermaid-graph', icon: 'OO', label: 'Mapa conceptual', shortLabel: 'Conceptual' },
];

export const MERMAID_THEMES = [
    { label: 'Dark', value: 'dark' },
    { label: 'Default', value: 'default' },
    { label: 'Forest', value: 'forest' },
    { label: 'Neutral', value: 'neutral' },
];

export const MERMAID_BG_COLORS = [
    { label: 'Slate', value: '#0f172a' },
    { label: 'Negro', value: '#000000' },
    { label: 'Grafito', value: '#1e1e2e' },
    { label: 'Oceano', value: '#0c1222' },
    { label: 'Blanco', value: '#ffffff' },
    { label: 'Crema', value: '#fefce8' },
];

export const MERMAID_SIZE_OPTIONS = [
    { value: 'compact', label: 'Compacto', maxWidth: '32rem' },
    { value: 'standard', label: 'Estandar', maxWidth: '44rem' },
    { value: 'wide', label: 'Ancho', maxWidth: '60rem' },
    { value: 'full', label: 'Completo', maxWidth: '100%' },
];

export const MERMAID_PADDING_OPTIONS = [
    { value: 'sm', label: 'Ajustado', padding: '16px' },
    { value: 'md', label: 'Normal', padding: '24px' },
    { value: 'lg', label: 'Amplio', padding: '32px' },
];

export function getMermaidTemplateByAction(action) {
    const option = MERMAID_TEMPLATE_OPTIONS.find(item => item.action === action);
    return option ? MERMAID_TEMPLATES[option.key] : null;
}

export function isMermaidInsertAction(action) {
    return Boolean(getMermaidTemplateByAction(action));
}
