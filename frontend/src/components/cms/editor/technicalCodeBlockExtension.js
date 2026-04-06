import { mergeAttributes } from '@tiptap/core';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';

const TERMINAL_CODE_LANGUAGES = new Set(['bash', 'shell', 'sh', 'zsh', 'powershell', 'ps1', 'cmd']);

function getCodeLanguageFromElement(element) {
    if (!element) return '';

    const explicitLanguage = element.getAttribute('data-language') || '';
    if (explicitLanguage) return explicitLanguage;

    const codeElement = element.tagName?.toLowerCase() === 'code' ? element : element.querySelector('code');
    const className = codeElement?.getAttribute('class') || element.getAttribute('class') || '';
    const languageClass = className.split(/\s+/).find(token => token.startsWith('language-'));
    return languageClass ? languageClass.replace('language-', '') : '';
}

function normalizeCodeVariant(variant, language) {
    if (variant === 'terminal' || variant === 'plain') return variant;
    return TERMINAL_CODE_LANGUAGES.has(String(language || '').toLowerCase()) ? 'terminal' : 'plain';
}

export function createTechnicalCodeBlockExtension(lowlight) {
    return CodeBlockLowlight.extend({
        // Permitir marcas inline (Color, TextStyle, etc.) dentro del bloque de código.
        // CodeBlockLowlight hereda de CodeBlock cuyo content por defecto es 'text*',
        // lo que impide aplicar marcas. Cambiamos a 'inline*' para habilitarlas.
        content: 'inline*',
        // CodeBlock también bloquea marks con `marks: ''`.
        // Permitimos cualquier mark inline para que Color/TextStyle se serialicen y persistan.
        marks: '_',

        addAttributes() {
            return {
                ...this.parent?.(),
                language: {
                    default: 'javascript',
                    parseHTML: element => getCodeLanguageFromElement(element) || 'javascript',
                    renderHTML: attributes => ({ 'data-language': attributes.language || 'javascript' }),
                },
                filename: {
                    default: '',
                    parseHTML: element => element.getAttribute('data-filename') || '',
                    renderHTML: attributes => attributes.filename ? { 'data-filename': attributes.filename } : {},
                },
                title: {
                    default: '',
                    parseHTML: element => element.getAttribute('data-title') || '',
                    renderHTML: attributes => attributes.title ? { 'data-title': attributes.title } : {},
                },
                variant: {
                    default: 'plain',
                    parseHTML: element => normalizeCodeVariant(element.getAttribute('data-variant'), getCodeLanguageFromElement(element)),
                    renderHTML: attributes => ({ 'data-variant': normalizeCodeVariant(attributes.variant, attributes.language) }),
                },
            };
        },
        renderHTML({ node, HTMLAttributes }) {
            const language = node.attrs.language || this.options.defaultLanguage || 'plaintext';
            const variant = normalizeCodeVariant(node.attrs.variant, language);

            return [
                'pre',
                mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
                    'data-block': 'code',
                    'data-version': '1',
                    'data-language': language,
                    'data-variant': variant,
                    ...(node.attrs.filename ? { 'data-filename': node.attrs.filename } : {}),
                    ...(node.attrs.title ? { 'data-title': node.attrs.title } : {}),
                }),
                [
                    'code',
                    {
                        class: language ? `${this.options.languageClassPrefix || 'language-'}${language}` : null,
                    },
                    0,
                ],
            ];
        },
    }).configure({
        lowlight,
        defaultLanguage: 'javascript',
    });
}
