import { lazy, Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cmsApi } from '../../lib/cmsApi';

const RichEditor = lazy(() => import('../../components/cms/RichEditor'));

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
    seoTitle: '',
    seoDescription: '',
    ogImage: '',
    canonicalUrl: '',
    noindex: false,
    status: 'draft',
};

const DRAFT_KEY = 'cms_post_draft';
const AUTOSAVE_MS = 30_000;

function EditorLoader() {
    return (
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6">
            <div className="mb-4 flex gap-2">
                <div className="h-8 w-8 rounded-lg bg-[var(--bg-elevated)] animate-pulse" />
                <div className="h-8 w-8 rounded-lg bg-[var(--bg-elevated)] animate-pulse" />
                <div className="h-8 w-8 rounded-lg bg-[var(--bg-elevated)] animate-pulse" />
            </div>
            <div className="h-72 rounded-xl bg-[var(--bg-elevated)] animate-pulse" />
        </div>
    );
}

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
    const [toast,      setToast]      = useState(null); // { message, type: 'success'|'error' }
    const [fullscreen, setFullscreen] = useState(false);
    const [availableDraft, setAvailableDraft] = useState(null);
    const autosaveTimer = useRef(null);
    const toastTimer = useRef(null);

    function showToast(message, type = 'success') {
        clearTimeout(toastTimer.current);
        setToast({ message, type });
        toastTimer.current = setTimeout(() => setToast(null), 4000);
    }

    // ── Cargar post si es edición ─────────────────────────────────────────────
    useEffect(() => {
        if (!isEdit) {
            setForm(EMPTY_FORM);
            try {
                const draft = localStorage.getItem(DRAFT_KEY);
                if (draft) {
                    const parsed = JSON.parse(draft);
                    // Solo sugerir si el borrador tiene algo de contenido
                    if (parsed.title || parsed.content) {
                        setAvailableDraft(parsed);
                    }
                }
            } catch {
                setAvailableDraft(null);
            }
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
                    seoTitle: post.seoTitle || '',
                    seoDescription: post.seoDescription || '',
                    ogImage: post.ogImage || '',
                    canonicalUrl: post.canonicalUrl || '',
                    noindex: post.noindex || false,
                    status: post.status || 'published',
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
            } catch {
                setDraftSaved(false);
            }
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

    // ── Vista previa en nueva pestaña
    function handlePreview() {
        try {
            sessionStorage.setItem('cms_preview', JSON.stringify({
                ...form,
                tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
            }));
        } catch {
            setError('No se ha podido preparar la vista previa en este navegador.');
        }
        window.open('/blog/preview', '_blank');
    }

    // ── Publicar / Actualizar ─────────────────────────────────────────────────
    async function handleSubmit(e, statusOverride) {
        if (e) e.preventDefault();
        setError('');
        setSaving(true);

        const payload = {
            ...form,
            tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
            status: statusOverride || form.status || 'draft',
        };

        try {
            if (isEdit) {
                await cmsApi.updatePost(token, editSlug, payload);
            } else {
                const created = await cmsApi.createPost(token, payload);
                localStorage.removeItem(DRAFT_KEY);

                // Si es borrador, redirigir a modo edición para que los
                // siguientes guardados usen PUT en vez de POST
                if (statusOverride === 'draft') {
                    showToast('Post guardado en borradores');
                    navigate(`/bitacora/posts/editar/${created.slug}`, { replace: true });
                    return;
                }
            }
            if (statusOverride === 'draft') {
                setForm(f => ({ ...f, status: 'draft' }));
                showToast('Borrador guardado correctamente');
                return;                             // stay on edit page
            }
            if (statusOverride === 'published') {
                showToast(isEdit ? 'Post actualizado y publicado' : 'Post publicado correctamente');
            }
            navigate('/bitacora/posts');
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleSaveDraft() {
        await handleSubmit(null, 'draft');
    }

    async function handlePublish(e) {
        await handleSubmit(e, 'published');
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
                <div className="w-8 h-8 border-2 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-6 transition-colors duration-300 ${fullscreen ? 'overflow-hidden' : ''}`}>

            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-6 max-w-7xl mx-auto">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">{isEdit ? 'Editar post' : 'Nuevo post'}</h1>
                    {isEdit && <p className="text-sm text-[var(--text-muted)] mt-0.5">/{editSlug}</p>}
                    {!isEdit && draftSaved && !availableDraft && (
                        <p className="text-xs text-cyan-400/80 mt-0.5 animate-pulse">Borrador guardado localmente</p>
                    )}
                    {!isEdit && availableDraft && (
                        <button
                            type="button"
                            onClick={() => {
                                setForm(availableDraft);
                                setAvailableDraft(null);
                            }}
                            className="text-xs text-fuchsia-400 mt-1 hover:text-fuchsia-300 underline"
                        >
                            Recuperar borrador anterior
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                    <button
                        type="button"
                        onClick={handlePreview}
                        className="px-4 py-2 rounded-xl text-sm font-medium border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-color)] transition-all flex items-center gap-1.5"
                    >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        Vista previa
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/bitacora/posts')}
                        className="px-4 py-2 rounded-xl text-sm font-medium border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleSaveDraft}
                        disabled={saving}
                        className="px-4 py-2 rounded-xl text-sm font-medium border border-amber-500/50 text-amber-400 hover:bg-amber-500/10 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving && <div className="w-3.5 h-3.5 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />}
                        Guardar borrador
                    </button>
                    <button
                        type="button"
                        onClick={handlePublish}
                        disabled={saving}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-cyan-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 shadow-md"
                    >
                        {saving && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        {saving ? 'Guardando…' : isEdit ? (form.status === 'draft' ? 'Publicar' : 'Actualizar') : 'Publicar'}
                    </button>
                    {isEdit && form.status === 'published' && (
                        <button
                            type="button"
                            onClick={() => handleSubmit(null, 'draft')}
                            disabled={saving}
                            className="px-3 py-2 rounded-xl text-xs font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                        >
                            Despublicar
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="max-w-7xl mx-auto mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                    {error}
                </div>
            )}

            <form id="post-form" onSubmit={e => handleSubmit(e, 'draft')} className="max-w-7xl mx-auto space-y-5">

                {/* ── Metadatos ─────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)]">
                    <p className="lg:col-span-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest">Metadatos</p>

                    {/* Título */}
                    <div className="lg:col-span-2">
                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Título *</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={handleTitleChange}
                            required
                            placeholder="Título del post…"
                            className="w-full px-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-fuchsia-500/60 focus:ring-1 focus:ring-fuchsia-500/40 transition-all text-sm shadow-sm"
                        />
                    </div>

                    {/* Slug */}
                    <div>
                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                            Slug * <span className="text-[var(--text-muted)] opacity-70">(URL)</span>
                        </label>
                        <input
                            type="text"
                            value={form.slug}
                            onChange={handleSlugChange}
                            required
                            placeholder="mi-primer-post"
                            disabled={isEdit}
                            className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-fuchsia-500/60 focus:ring-1 focus:ring-fuchsia-500/40 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed font-mono shadow-sm"
                        />
                    </div>

                    {/* Fecha */}
                    <div>
                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Fecha de publicación</label>
                        <input
                            type="date"
                            value={form.date}
                            onChange={handleChange('date')}
                            className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-fuchsia-500/60 focus:ring-1 focus:ring-fuchsia-500/40 transition-all text-sm shadow-sm"
                        />
                    </div>

                    {/* Tags */}
                    <div className="lg:col-span-2">
                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                            Tags <span className="text-[var(--text-muted)] opacity-70">(separados por coma)</span>
                        </label>
                        <input
                            type="text"
                            value={form.tags}
                            onChange={handleChange('tags')}
                            placeholder="React, Node.js, Docker"
                            className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-fuchsia-500/60 focus:ring-1 focus:ring-fuchsia-500/40 transition-all text-sm shadow-sm"
                        />
                    </div>

                    {/* Excerpt */}
                    <div className="lg:col-span-2">
                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Resumen / excerpt</label>
                        <textarea
                            value={form.excerpt}
                            onChange={handleChange('excerpt')}
                            rows={2}
                            placeholder="Breve descripción que aparece en el listado del blog…"
                            className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-fuchsia-500/60 focus:ring-1 focus:ring-fuchsia-500/40 transition-all text-sm resize-none shadow-sm"
                        />
                    </div>
                </div>

                {/* ── Editor rico ───────────────────────────────────────────── */}
                <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">Contenido *</label>
                    <Suspense fallback={<EditorLoader />}>
                        <RichEditor
                            value={form.content}
                            onChange={handleContentChange}
                            token={token}
                            fullscreen={fullscreen}
                            onToggleFullscreen={() => setFullscreen(f => !f)}
                        />
                    </Suspense>
                </div>

                {/* ── SEO Profesional ───────────────────────────────────────── */}
                <div className="space-y-4 p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)]">
                    <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest">SEO Profesional</p>
                    
                    {/* Google Preview */}
                    <div className="p-4 bg-[var(--bg-primary)] rounded-xl mb-6 font-sans max-w-2xl border border-[var(--border-default)]">
                        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 font-semibold">Previsualización de Google</p>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-[10px] text-[var(--text-secondary)] font-bold overflow-hidden">
                                {form.ogImage ? <img src={form.ogImage} alt="og" className="w-full h-full object-cover"/> : 'W'}
                            </div>
                            <span className="text-[#202124] text-sm truncate max-w-[200px]">tusitio.com</span>
                            <span className="text-[#5f6368] text-sm">› blog › {form.slug || 'mi-post'}</span>
                        </div>
                        <h3 className="text-[#1a0dab] text-[20px] leading-[1.3] font-normal hover:underline cursor-pointer truncate">
                            {form.seoTitle || form.title || 'Título de tu artículo'}
                        </h3>
                        <p className="text-[#4d5156] text-[14px] leading-[1.58] mt-1 line-clamp-2">
                            {form.seoDescription || form.excerpt || 'Así es como se verá la descripción de este post cuando los usuarios lo busquen en Google. Si es muy larga se cortará con puntos suspensivos...'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-xs font-medium text-[var(--text-secondary)]">Meta Title</label>
                                <span className={`text-[10px] ${(form.seoTitle || form.title).length > 60 ? 'text-red-500 font-bold' : 'text-emerald-500'}`}>
                                    {(form.seoTitle || form.title).length}/60
                                </span>
                            </div>
                            <input
                                type="text"
                                value={form.seoTitle}
                                onChange={handleChange('seoTitle')}
                                placeholder="Dejar vacío para usar el título principal"
                                className={`w-full px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border ${
                                    (form.seoTitle || form.title).length > 60 ? 'border-red-500/50 focus:border-red-500/80' : 'border-[var(--border-default)] focus:border-fuchsia-500/60'
                                } text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-fuchsia-500/40 text-sm shadow-sm`}
                            />
                        </div>
                        
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-xs font-medium text-[var(--text-secondary)]">Meta Description</label>
                                <span className={`text-[10px] ${(form.seoDescription || form.excerpt).length > 160 ? 'text-red-500 font-bold' : ((form.seoDescription || form.excerpt).length < 50 && (form.seoDescription || form.excerpt).length > 0) ? 'text-yellow-500' : 'text-emerald-500'}`}>
                                    {(form.seoDescription || form.excerpt).length}/160
                                </span>
                            </div>
                            <input
                                type="text"
                                value={form.seoDescription}
                                onChange={handleChange('seoDescription')}
                                placeholder="Dejar vacío para usar el resumen"
                                className={`w-full px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border ${
                                    (form.seoDescription || form.excerpt).length > 160 ? 'border-red-500/50 focus:border-red-500/80' : 'border-[var(--border-default)] focus:border-fuchsia-500/60'
                                } text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-fuchsia-500/40 text-sm shadow-sm`}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Imagen Social (Open Graph / Twitter Card)</label>
                            <input
                                type="text"
                                value={form.ogImage}
                                onChange={handleChange('ogImage')}
                                placeholder="URL de la imagen destacada (/images/...)"
                                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-fuchsia-500/60 focus:ring-1 focus:ring-fuchsia-500/40 text-sm shadow-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Canonical URL</label>
                            <input
                                type="text"
                                value={form.canonicalUrl}
                                onChange={handleChange('canonicalUrl')}
                                placeholder="Dejar vacío si es el contenido original"
                                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-fuchsia-500/60 focus:ring-1 focus:ring-fuchsia-500/40 text-sm shadow-sm"
                            />
                        </div>

                        <div className="lg:col-span-2 flex items-center gap-2 mt-2 p-3 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-default)] shadow-sm">
                            <input
                                type="checkbox"
                                id="noindex"
                                checked={form.noindex}
                                onChange={e => setForm(f => ({ ...f, noindex: e.target.checked }))}
                                className="w-4 h-4 rounded bg-[var(--bg-primary)] border-[var(--border-default)] text-fuchsia-500 focus:ring-fuchsia-500/40 cursor-pointer"
                            />
                            <div className="flex flex-col">
                                <label htmlFor="noindex" className="text-sm font-medium text-[var(--text-primary)] cursor-pointer">
                                    No indexar (noindex)
                                </label>
                                <span className="text-xs text-[var(--text-muted)]">Impide que Google y otros buscadores muestren este post en sus resultados.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            {/* ── Toast notification ───────────────────────────────────── */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 animate-[slideUp_0.3s_ease-out]">
                    <div className={`flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-sm text-sm font-medium border ${
                        toast.type === 'error'
                            ? 'bg-red-500/90 border-red-400/30 text-white'
                            : 'bg-emerald-500/90 border-emerald-400/30 text-white'
                    }`}>
                        {toast.type === 'error' ? (
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>
                            </svg>
                        ) : (
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path d="M5 13l4 4L19 7"/>
                            </svg>
                        )}
                        {toast.message}
                    </div>
                </div>
            )}
        </div>
    );
}
