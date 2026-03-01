import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../../context/AuthContext';
import { cmsApi } from '../../lib/cmsApi';
import { slugify } from '../../utils/slugify';

const EMPTY_FORM = {
    title:   '',
    slug:    '',
    date:    new Date().toISOString().split('T')[0],
    excerpt: '',
    tags:    '',
    content: '',
};

export default function BitacoraPostEditor() {
    const { token }  = useAuth();
    const navigate   = useNavigate();
    const { slug: editSlug } = useParams();
    const isEdit = !!editSlug;

    const [form,    setForm]    = useState(EMPTY_FORM);
    const [preview, setPreview] = useState(false);
    const [loading, setLoading] = useState(isEdit);
    const [saving,  setSaving]  = useState(false);
    const [error,   setError]   = useState('');
    const [slugManual, setSlugManual] = useState(false);

    // Cargar post si es edición
    useEffect(() => {
        if (!isEdit) return;
        cmsApi.getPost(token, editSlug)
            .then(post => {
                setForm({
                    title:   post.title,
                    slug:    post.slug,
                    date:    post.date,
                    excerpt: post.excerpt || '',
                    tags:    Array.isArray(post.tags) ? post.tags.join(', ') : post.tags || '',
                    content: post.content || '',
                });
                setSlugManual(true);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [isEdit, editSlug, token]);

    // Auto-slug al escribir el título (solo si no se ha editado manualmente)
    const handleTitleChange = useCallback((e) => {
        const title = e.target.value;
        setForm(f => ({
            ...f,
            title,
            ...(!slugManual && { slug: slugify(title) }),
        }));
    }, [slugManual]);

    function handleChange(field) {
        return (e) => setForm(f => ({ ...f, [field]: e.target.value }));
    }

    function handleSlugChange(e) {
        setSlugManual(true);
        setForm(f => ({ ...f, slug: e.target.value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSaving(true);

        const payload = {
            ...form,
            tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        };

        try {
            if (isEdit) {
                await cmsApi.updatePost(token, editSlug, payload);
            } else {
                await cmsApi.createPost(token, payload);
            }
            navigate('/bitacora/posts');
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0a0a0f]">
                <div className="w-8 h-8 border-2 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 max-w-7xl mx-auto">
                <div>
                    <h1 className="text-2xl font-bold text-white">{isEdit ? 'Editar post' : 'Nuevo post'}</h1>
                    {isEdit && <p className="text-sm text-gray-500 mt-0.5">/{editSlug}</p>}
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setPreview(p => !p)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                            preview
                                ? 'bg-white/10 border-white/20 text-white'
                                : 'bg-transparent border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                        }`}
                    >
                        {preview ? 'Editar' : 'Vista previa'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/bitacora/posts')}
                        className="px-4 py-2 rounded-xl text-sm font-medium border border-white/10 text-gray-400 hover:text-white transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="post-form"
                        disabled={saving}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-cyan-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {saving ? 'Guardando…' : isEdit ? 'Actualizar' : 'Publicar'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="max-w-7xl mx-auto mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                </div>
            )}

            <form id="post-form" onSubmit={handleSubmit} className="max-w-7xl mx-auto">
                {/* Metadatos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                    {/* Título */}
                    <div className="lg:col-span-2">
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Título *</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={handleTitleChange}
                            required
                            placeholder="Título del post…"
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-fuchsia-500/60 focus:ring-1 focus:ring-fuchsia-500/40 transition-all text-sm"
                        />
                    </div>

                    {/* Slug */}
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">
                            Slug * <span className="text-gray-600">(URL)</span>
                        </label>
                        <input
                            type="text"
                            value={form.slug}
                            onChange={handleSlugChange}
                            required
                            placeholder="mi-primer-post"
                            disabled={isEdit}
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-fuchsia-500/60 focus:ring-1 focus:ring-fuchsia-500/40 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed font-mono"
                        />
                    </div>

                    {/* Fecha */}
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Fecha de publicación</label>
                        <input
                            type="date"
                            value={form.date}
                            onChange={handleChange('date')}
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-fuchsia-500/60 focus:ring-1 focus:ring-fuchsia-500/40 transition-all text-sm"
                        />
                    </div>

                    {/* Tags */}
                    <div className="lg:col-span-2">
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">
                            Tags <span className="text-gray-600">(separados por coma)</span>
                        </label>
                        <input
                            type="text"
                            value={form.tags}
                            onChange={handleChange('tags')}
                            placeholder="React, Node.js, Docker"
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-fuchsia-500/60 focus:ring-1 focus:ring-fuchsia-500/40 transition-all text-sm"
                        />
                    </div>

                    {/* Excerpt */}
                    <div className="lg:col-span-2">
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Resumen / excerpt</label>
                        <textarea
                            value={form.excerpt}
                            onChange={handleChange('excerpt')}
                            rows={2}
                            placeholder="Breve descripción del post que aparece en el listado…"
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-fuchsia-500/60 focus:ring-1 focus:ring-fuchsia-500/40 transition-all text-sm resize-none"
                        />
                    </div>
                </div>

                {/* Editor / Preview */}
                {preview ? (
                    <div className="rounded-2xl border border-white/10 bg-white/3 p-8 prose prose-invert prose-sm max-w-none">
                        {form.content ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {form.content}
                            </ReactMarkdown>
                        ) : (
                            <p className="text-gray-600 italic">El contenido aparecerá aquí…</p>
                        )}
                    </div>
                ) : (
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">
                            Contenido (Markdown) *
                        </label>
                        <textarea
                            value={form.content}
                            onChange={handleChange('content')}
                            required
                            rows={28}
                            placeholder="# Título&#10;&#10;Escribe el contenido en Markdown…"
                            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-fuchsia-500/60 focus:ring-1 focus:ring-fuchsia-500/40 transition-all text-sm font-mono resize-y"
                        />
                    </div>
                )}
            </form>
        </div>
    );
}
