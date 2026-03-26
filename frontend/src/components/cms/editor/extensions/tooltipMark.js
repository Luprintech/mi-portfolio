// ─── TooltipMark — extensión TipTap Mark para tooltips contextuales ───────────
import { Mark, mergeAttributes } from '@tiptap/core';

export const TooltipMark = Mark.create({
    name: 'tooltip',
    
    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },
    
    addAttributes() {
        return {
            text: {
                default: '',
                parseHTML: el => el.getAttribute('data-tooltip') || '',
                renderHTML: attrs => {
                    if (!attrs.text) return {};
                    return { 'data-tooltip': attrs.text };
                },
            },
            position: {
                default: 'top',
                parseHTML: el => el.getAttribute('data-tooltip-position') || 'top',
                renderHTML: attrs => ({
                    'data-tooltip-position': attrs.position || 'top',
                }),
            },
            theme: {
                default: 'dark',
                parseHTML: el => el.getAttribute('data-tooltip-theme') || 'dark',
                renderHTML: attrs => ({
                    'data-tooltip-theme': attrs.theme || 'dark',
                }),
            },
        };
    },
    
    parseHTML() {
        return [
            {
                tag: 'span[data-tooltip]',
            },
        ];
    },
    
    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
    },
    
    addCommands() {
        return {
            setTooltip: (attributes) => ({ commands }) => {
                return commands.setMark(this.name, attributes);
            },
            unsetTooltip: () => ({ commands }) => {
                return commands.unsetMark(this.name);
            },
            toggleTooltip: (attributes) => ({ commands }) => {
                return commands.toggleMark(this.name, attributes);
            },
        };
    },
});
