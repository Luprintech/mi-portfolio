import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cmsApi } from '../../lib/cmsApi';

function slugify(str) {
    return str
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

const EMPTY_FORM = {
    title:   '',
    slug:    '',
    date:    new Date().toISOString().split('T')[0],
    excerpt: '',
    tags:    '',
    content: '',
};

const DRAFT_KEY = 'cms_post_draft';
const AUTOSAVE_MS = 30_000;

export default function BitacoraPostEditor() {
    const { token }  = useAuth();
    const navigate   = useNavigate();
    const { slug: editSlug } = useParams();
    const isEdit = !!editSlug;

    const [form,       setForm]       = useState(EMPTY_FORM);
    const [loading,    setLoading]    = useState(isEdit);
    const [saving,     setSaving]     = useState(false);
    const [error,      setError]      = useState('');
    const [slugManual, setSlugManual] = useState(false);
    const [draftSaved, setDraftSaved] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const autosaveTimer = useRef(null);

    // ── Cargar post si es edición ─────────────────────────────────────────────
    useEffect(() => {
        if (!isEdit) {
            // Recuperar borrador guardado en localStorage
            try {
                const draft = localStorage.getItem(DRAFT_KEY);
                if (draft) setForm(JSON.parse(draft));
            } catch {}
            return;
        }
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

    // ── Autoguardado en localStorage (solo posts nuevos) ─────────────────────
    useEffect(() => {
        if (isEdit) return;
        clearTimeout(autosaveTimer.current);
        autosaveTimer.current = setTimeout(() => {
            try {
                localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
                setDraftSaved(true);
                setTimeout(() => setDraftSaved(false), 2500);
            } catch {}
        }, AUTOSAVE_MS);
        return () => clearTimeout(autosaveTimer.current);
    }, [form, isEdit]);

    // ── Auto-slug ─────────────────────────────────────────────────────────────
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

    function handleContentChange(html) {
        setForm(f => ({ ...f, content: html }));
    }

    // ── Vista previa en nueva pestaña ─────────────────────────────────────────
    function handlePreview() {
        try {
            sessionStorage.setItem('cms_preview', JSON.stringify({
                ...form,
                tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
            }));
        } catch {}
        window.open('/blog/preview', '_blank');
    }

    // ── Publicar / Actualizar ─────────────────────────────────────────────────
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
                localStorage.removeItem(DRAFT_KEY);
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
        <div className={`min-h-screen bg-[#0a0a0f] p-6 ${fullscreen ? 'overflow-hidden' : ''}`}>

            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-6 max-w-7xl mx-auto">
                <div>
                    <h1 className="text-2xl font-bold text-white">{isEdit ? 'Editar post' : 'Nuevo post'}</h1>
                    {isEdit && <p className="text-sm text-gray-500 mt-0.5">/{editSlug}</p>}
                    {!isEdit && draftSaved && (
                        <p className="text-xs text-cyan-400 mt-0.5 animate-pulse">Borrador guardado</p>
                    )}
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                    <button
                        type="button"
                        onClick={handlePreview}
                        className="px-4 py-2 rounded-xl text-sm font-medium border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all flex items-center gap-1.5"
                    >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        Vista previa
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
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-cyan-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        {saving ? 'Guardando…' : isEdit ? 'Actualizar' : 'Publicar'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="max-w-7xl mx-auto mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                </div>
            )}

            <form id="post-form" onSubmit={handleSubmit} className="max-w-7xl mx-auto space-y-5">

                {/* ── Metadatos ─────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/8">
                    <p className="lg:col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-widest">Metadatos</p>

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
                            placeholder="Breve descripción que aparece en el listado del blog…"
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-fuchsia-500/60 focus:ring-1 focus:ring-fuchsia-500/40 transition-all text-sm resize-none"
                        />
                    </div>
                </div>

                {/* ── Editor rico ───────────────────────────────────────────── */}
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">Contenido *</label>
                    <RichEditor
                        value={form.content}
                        onChange={handleContentChange}
                        token={token}
                        fullscreen={fullscreen}
                        onToggleFullscreen={() => setFullscreen(f => !f)}
                    />
                </div>
            </form>
        </div>
    );
}
