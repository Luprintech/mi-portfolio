// ─── ComparisonSlider — Interactive before/after image comparison ────────────
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { useState, useRef } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { validateImageFile } from '../../../../lib/mediaUploadPolicy';
import RichBlockFrame from '../RichBlockFrame';
import {
    createRichBlockTextAlignAttribute,
    getRichBlockHtmlAttributes,
} from '../blockAlignment';

function ComparisonSliderView({ node, updateAttributes, selected, deleteNode }) {
    const { token } = useAuth();
    const [uploading, setUploading] = useState({ before: false, after: false });
    const beforeInputRef = useRef(null);
    const afterInputRef = useRef(null);

    async function handleImageUpload(type) {
        const inputRef = type === 'before' ? beforeInputRef : afterInputRef;
        const file = inputRef.current?.files?.[0];
        if (!file || !token) return;

        // Validate image file
        const validation = validateImageFile(file);
        if (!validation.isValid) {
            alert(validation.error);
            inputRef.current.value = '';
            return;
        }

        setUploading(prev => ({ ...prev, [type]: true }));

        try {
            const fd = new FormData();
            fd.append('image', file);

            const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/bitacora/upload-image`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            });

            if (!res.ok) throw new Error('Error uploading image');

            const data = await res.json();
            const imageUrl = data.url;

            updateAttributes({
                [`${type}Image`]: imageUrl,
            });
        } catch (err) {
            console.error('Image upload failed:', err);
            alert('Error al subir la imagen');
        } finally {
            setUploading(prev => ({ ...prev, [type]: false }));
            inputRef.current.value = '';
        }
    }

    const hasImages = node.attrs.beforeImage && node.attrs.afterImage;

    return (
        <RichBlockFrame
            alignment={node.attrs.textAlign}
            selected={selected}
            onRemove={deleteNode}
            dragHandle
            frameClassName="w-full"
        >
            <div className="my-4" contentEditable={false}>
                {/* Editor UI */}
                {selected && (
                    <div className="mb-4 space-y-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-elevated)] p-4">
                        {/* Image Upload Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Before Image */}
                            <div>
                                <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                                    Imagen ANTES
                                </label>
                                {node.attrs.beforeImage ? (
                                    <div className="relative">
                                        <img
                                            src={node.attrs.beforeImage}
                                            alt="Before"
                                            className="h-24 w-full rounded-lg object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => updateAttributes({ beforeImage: '' })}
                                            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow transition-colors hover:bg-red-600"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => beforeInputRef.current?.click()}
                                        disabled={uploading.before}
                                        className="flex h-24 w-full items-center justify-center rounded-lg border border-dashed border-[var(--border-color)] text-xs text-[var(--text-muted)] transition-colors hover:border-fuchsia-500/50 hover:text-fuchsia-400 disabled:opacity-50"
                                    >
                                        {uploading.before ? (
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-fuchsia-500/30 border-t-fuchsia-500" />
                                        ) : (
                                            '+ Subir imagen'
                                        )}
                                    </button>
                                )}
                                <input
                                    ref={beforeInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={() => handleImageUpload('before')}
                                />
                            </div>

                            {/* After Image */}
                            <div>
                                <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                                    Imagen DESPUÉS
                                </label>
                                {node.attrs.afterImage ? (
                                    <div className="relative">
                                        <img
                                            src={node.attrs.afterImage}
                                            alt="After"
                                            className="h-24 w-full rounded-lg object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => updateAttributes({ afterImage: '' })}
                                            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow transition-colors hover:bg-red-600"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => afterInputRef.current?.click()}
                                        disabled={uploading.after}
                                        className="flex h-24 w-full items-center justify-center rounded-lg border border-dashed border-[var(--border-color)] text-xs text-[var(--text-muted)] transition-colors hover:border-fuchsia-500/50 hover:text-fuchsia-400 disabled:opacity-50"
                                    >
                                        {uploading.after ? (
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-fuchsia-500/30 border-t-fuchsia-500" />
                                        ) : (
                                            '+ Subir imagen'
                                        )}
                                    </button>
                                )}
                                <input
                                    ref={afterInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={() => handleImageUpload('after')}
                                />
                            </div>
                        </div>

                        {/* Labels */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1 block text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                                    Etiqueta ANTES
                                </label>
                                <input
                                    type="text"
                                    value={node.attrs.beforeLabel}
                                    onChange={e => updateAttributes({ beforeLabel: e.target.value })}
                                    placeholder="Antes"
                                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-1.5 text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500/60"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                                    Etiqueta DESPUÉS
                                </label>
                                <input
                                    type="text"
                                    value={node.attrs.afterLabel}
                                    onChange={e => updateAttributes({ afterLabel: e.target.value })}
                                    placeholder="Después"
                                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-1.5 text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500/60"
                                />
                            </div>
                        </div>

                        {/* Initial Position Slider */}
                        <div>
                            <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                                Posición inicial del deslizador: {node.attrs.initialPosition}%
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="1"
                                value={node.attrs.initialPosition}
                                onChange={e => updateAttributes({ initialPosition: Number(e.target.value) })}
                                className="h-2 w-full accent-fuchsia-500"
                            />
                        </div>

                        {/* Alignment */}
                        <div>
                            <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                                Alineación
                            </label>
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
                                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                            (node.attrs.textAlign || 'left') === option.key
                                                ? 'bg-fuchsia-500 text-white'
                                                : 'border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Preview (static side-by-side in editor) */}
                {hasImages ? (
                    <div className="overflow-hidden rounded-xl border border-[var(--border-color)]">
                        <div className="grid grid-cols-2 gap-px bg-[var(--border-color)]">
                            <div className="relative aspect-video">
                                <img
                                    src={node.attrs.beforeImage}
                                    alt={node.attrs.beforeLabel || 'Before'}
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white">
                                    {node.attrs.beforeLabel || 'Antes'}
                                </div>
                            </div>
                            <div className="relative aspect-video">
                                <img
                                    src={node.attrs.afterImage}
                                    alt={node.attrs.afterLabel || 'After'}
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute right-2 top-2 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white">
                                    {node.attrs.afterLabel || 'Después'}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--bg-surface)]/30 text-sm text-[var(--text-muted)]">
                        Sube las imágenes de antes y después para previsualizar
                    </div>
                )}
            </div>
        </RichBlockFrame>
    );
}

export const ComparisonSliderExtension = Node.create({
    name: 'comparisonSliderBlock',
    group: 'block',
    atom: true,
    draggable: true,

    addAttributes() {
        return {
            beforeImage: {
                default: '',
                parseHTML: el => el.getAttribute('data-before-image') || '',
                renderHTML: attrs => attrs.beforeImage ? { 'data-before-image': attrs.beforeImage } : {},
            },
            afterImage: {
                default: '',
                parseHTML: el => el.getAttribute('data-after-image') || '',
                renderHTML: attrs => attrs.afterImage ? { 'data-after-image': attrs.afterImage } : {},
            },
            beforeLabel: {
                default: 'Antes',
                parseHTML: el => el.getAttribute('data-before-label') || 'Antes',
                renderHTML: attrs => ({ 'data-before-label': attrs.beforeLabel || 'Antes' }),
            },
            afterLabel: {
                default: 'Después',
                parseHTML: el => el.getAttribute('data-after-label') || 'Después',
                renderHTML: attrs => ({ 'data-after-label': attrs.afterLabel || 'Después' }),
            },
            initialPosition: {
                default: 50,
                parseHTML: el => {
                    const value = Number(el.getAttribute('data-initial-position'));
                    return Number.isFinite(value) && value >= 0 && value <= 100 ? value : 50;
                },
                renderHTML: attrs => ({ 'data-initial-position': String(attrs.initialPosition || 50) }),
            },
            textAlign: createRichBlockTextAlignAttribute(),
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-comparison-slider]' }];
    },

    renderHTML({ node, HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(
                getRichBlockHtmlAttributes(HTMLAttributes, node.attrs.textAlign, {
                    'data-comparison-slider': '',
                    'data-before-image': node.attrs.beforeImage || '',
                    'data-after-image': node.attrs.afterImage || '',
                    'data-before-label': node.attrs.beforeLabel || 'Antes',
                    'data-after-label': node.attrs.afterLabel || 'Después',
                    'data-initial-position': String(node.attrs.initialPosition || 50),
                })
            ),
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(ComparisonSliderView);
    },

    addCommands() {
        return {
            insertComparisonSlider: (attrs = {}) => ({ commands }) =>
                commands.insertContent({
                    type: this.name,
                    attrs: {
                        beforeImage: '',
                        afterImage: '',
                        beforeLabel: 'Antes',
                        afterLabel: 'Después',
                        initialPosition: 50,
                        ...attrs,
                    },
                }),
        };
    },
});
