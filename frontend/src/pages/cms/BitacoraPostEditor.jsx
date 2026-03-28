import { lazy, Suspense, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cmsApi } from '../../lib/cmsApi';
import { IMAGE_INPUT_ACCEPT, IMAGE_UPLOAD_LABEL, validateImageFile } from '../../lib/mediaUploadPolicy';
import { createPostContentPayload, inferPostContentFields, looksLikeHtmlContent } from '../../lib/postContentSource';
import { extractHeadings } from '../../components/blog/markdownComponents';
import TemplatePicker from '../../components/cms/editor/TemplatePicker';
import EditorialChecklist from '../../components/cms/editor/EditorialChecklist';
import CollapsibleSection from '../../components/cms/editor/CollapsibleSection';
import { X } from 'lucide-react';

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
    featured: false,
    showToc: true,
    status: 'draft',
};

const DRAFTS_STORAGE_KEY = 'cms_post_drafts_v2';
const AUTOSAVE_MS = 30_000;
const TITLE_MAX = 160;
const EXCERPT_MAX = 320;

// Strip HTML tags for word count
function stripHtml(html) {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function countWords(text) {
    const clean = stripHtml(text);
    if (!clean) return 0;
    return clean.split(/\s+/).filter(Boolean).length;
}

function getDraftIdentity({ isEdit, editSlug, form }) {
    if (isEdit && editSlug) return `edit:${editSlug}`;

    const candidate = slugify(form.slug || form.title || 'untitled');
    return `new:${candidate || 'untitled'}`;
}

function readDraftMap() {
    try {
        const parsed = JSON.parse(localStorage.getItem(DRAFTS_STORAGE_KEY) || '{}');
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

function writeDraftMap(nextDrafts) {
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(nextDrafts));
}

function saveDraftSnapshot(identity, form) {
    const drafts = readDraftMap();
    drafts[identity] = {
        ...form,
        savedAt: new Date().toISOString(),
    };
    writeDraftMap(drafts);
}

function removeDraftSnapshot(identity) {
    const drafts = readDraftMap();
    delete drafts[identity];
    writeDraftMap(drafts);
}

function getDraftSnapshot(identity) {
    return readDraftMap()[identity] || null;
}

function getLatestNewDraft() {
    return Object.entries(readDraftMap())
        .filter(([identity, draft]) => identity.startsWith('new:') && draft?.savedAt)
        .map(([, draft]) => draft)
        .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))[0] || null;
}

function formatRevisionLabel(revision) {
    if (revision.source === 'autosave') return 'Autoguardado';
    if (revision.source === 'publish') return 'Publicado';
    if (revision.source === 'restore') return 'Restauracion';
    return 'Guardado manual';
}

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

// Pastel tag colors cycling through a fixed palette
const TAG_COLORS = [
    'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/20',
    'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
    'bg-violet-500/15 text-violet-400 border-violet-500/20',
    'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    'bg-amber-500/15 text-amber-400 border-amber-500/20',
    'bg-rose-500/15 text-rose-400 border-rose-500/20',
];

function TagChips({ tagsString, onChange }) {
    const tags = useMemo(
        () => tagsString.split(',').map(t => t.trim()).filter(Boolean),
        [tagsString]
    );

    function removeTag(index) {
        const next = tags.filter((_, i) => i !== index);
        onChange(next.join(', '));
    }

    if (tags.length === 0) return null;

    return (
        <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.map((tag, i) => (
                <span
                    key={`${tag}-${i}`}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${TAG_COLORS[i % TAG_COLORS.length]}`}
                >
                    {tag}
                    <button
                        type="button"
                        onClick={() => removeTag(i)}
                        aria-label={`Eliminar tag ${tag}`}
                        className="flex h-3.5 w-3.5 items-center justify-center rounded-full opacity-60 hover:opacity-100 transition-opacity"
                    >
                        <X className="h-2.5 w-2.5" />
                    </button>
                </span>
            ))}
        </div>
    );
}

export default function BitacoraPostEditor() {
    const { token }  = useAuth();
    const navigate   = useNavigate();
    const { slug: editSlug } = useParams();
    const isEdit = !!editSlug;

    const [form,       setForm]       = useState(EMPTY_FORM);
    const [initialForm, setInitialForm] = useState(EMPTY_FORM); // for dirty detection
    const [loading,    setLoading]    = useState(isEdit);
    const [saving,     setSaving]     = useState(false);
    const [error,      setError]      = useState('');
    const [slugManual, setSlugManual] = useState(false);
    const [draftSaved, setDraftSaved] = useState(false);
    const [toast,      setToast]      = useState(null); // { message, type: 'success'|'error' }
    const [fullscreen, setFullscreen] = useState(false);
    const [availableDraft, setAvailableDraft] = useState(null);
    const [revision, setRevision] = useState(0);
    const [revisions, setRevisions] = useState([]);
    const [loadingRevisions, setLoadingRevisions] = useState(false);
    const [autosaveState, setAutosaveState] = useState('idle');
    const [coverUploading, setCoverUploading] = useState(false);
    const [coverUploadError, setCoverUploadError] = useState('');
    const [coverUploadSuccess, setCoverUploadSuccess] = useState('');
    const [contentFormat, setContentFormat] = useState('html');
    const [activeTemplateKey, setActiveTemplateKey] = useState('');
    const autosaveTimer = useRef(null);
    const toastTimer = useRef(null);
    const coverFileInputRef = useRef(null);
    const lastAutosavedPayload = useRef('');

    const draftIdentity = useMemo(
        () => getDraftIdentity({ isEdit, editSlug, form }),
        [editSlug, form, isEdit]
    );

    // Dirty state: form differs from initial
    const isDirty = useMemo(() => {
        return JSON.stringify(form) !== JSON.stringify(initialForm);
    }, [form, initialForm]);

    // Word count for content
    const wordCount = useMemo(() => countWords(form.content), [form.content]);
    const readingMinutes = Math.max(1, Math.ceil(wordCount / 200));

    // Live heading preview for TOC feedback
    const liveHeadings = useMemo(() => extractHeadings(form.content), [form.content]);

    function showToast(message, type = 'success') {
        clearTimeout(toastTimer.current);
        setToast({ message, type });
        toastTimer.current = setTimeout(() => setToast(null), 4000);
    }

    const loadRevisions = useCallback(async (slug) => {
        if (!token || !slug) return;

        setLoadingRevisions(true);
        try {
            const items = await cmsApi.getPostRevisions(token, slug);
            setRevisions(Array.isArray(items) ? items : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingRevisions(false);
        }
    }, [token]);

    // ── Cargar post si es edición ─────────────────────────────────────────────
    useEffect(() => {
        if (!isEdit) {
            setForm(EMPTY_FORM);
            setInitialForm(EMPTY_FORM);
            setContentFormat('html');
            setActiveTemplateKey('');
            setRevision(0);
            setRevisions([]);
            setAvailableDraft(getLatestNewDraft());
            return;
        }
        cmsApi.getPost(token, editSlug)
            .then(post => {
                const resolved = inferPostContentFields(post);
                const loaded = {
                    title:   post.title,
                    slug:    post.slug,
                    date:    post.date,
                    excerpt: post.excerpt || '',
                    tags:    Array.isArray(post.tags) ? post.tags.join(', ') : post.tags || '',
                    content: resolved.sourceContent || '',
                    seoTitle: post.seoTitle || '',
                    seoDescription: post.seoDescription || '',
                    ogImage: post.ogImage || '',
                    canonicalUrl: post.canonicalUrl || '',
                    noindex: post.noindex || false,
                    featured: post.featured || false,
                    showToc: post.showToc !== false,
                    status: post.status || 'published',
                };
                const localDraft = getDraftSnapshot(`edit:${post.slug}`);
                setForm(loaded);
                setInitialForm(loaded);
                setAvailableDraft(localDraft && (localDraft.title || localDraft.content) ? localDraft : null);
                setContentFormat(resolved.format);
                setActiveTemplateKey('');
                setRevision(Number(post.revision) || 0);
                lastAutosavedPayload.current = JSON.stringify(loaded);
                setSlugManual(true);
                loadRevisions(post.slug);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [isEdit, editSlug, token, loadRevisions]);

    const buildContentPayload = useCallback(() => {
        return createPostContentPayload(form.content, contentFormat);
    }, [contentFormat, form.content]);

    // ── Autoguardado por post (local + remoto si edita un post existente) ───
    useEffect(() => {
        if (!token || !form.title.trim() || !isDirty) return;

        clearTimeout(autosaveTimer.current);
        autosaveTimer.current = setTimeout(() => {
            try {
                saveDraftSnapshot(draftIdentity, form);
                setDraftSaved(true);
                setTimeout(() => setDraftSaved(false), 2500);
            } catch {
                setDraftSaved(false);
            }

            if (!isEdit || !editSlug) {
                setAutosaveState('local');
                return;
            }

            const contentPayload = buildContentPayload();
            const payload = {
                ...form,
                ...contentPayload,
                revision,
                tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
            };

            const serializedPayload = JSON.stringify(payload);
            if (serializedPayload === lastAutosavedPayload.current) {
                setAutosaveState('synced');
                return;
            }

            setAutosaveState('saving');
            cmsApi.autosavePost(token, editSlug, payload)
                .then(savedPost => {
                    setRevision(Number(savedPost.revision) || revision);
                    setInitialForm(form);
                    lastAutosavedPayload.current = serializedPayload;
                    setAutosaveState('synced');
                    loadRevisions(editSlug);
                })
                .catch(err => {
                    setAutosaveState('error');
                    if (err.status === 409) {
                        setError(err.message);
                    }
                });
        }, AUTOSAVE_MS);
        return () => clearTimeout(autosaveTimer.current);
    }, [buildContentPayload, draftIdentity, editSlug, form, isDirty, isEdit, loadRevisions, revision, token]);

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
        return (e) => {
            const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
            setForm(f => ({ ...f, [field]: value }));
        };
    }

    function handleSlugChange(e) {
        setSlugManual(true);
        setForm(f => ({ ...f, slug: e.target.value }));
    }

    function handleContentChange(html) {
        if (looksLikeHtmlContent(html)) {
            setContentFormat('html');
        }
        setForm(f => ({ ...f, content: html }));
    }

    function handleApplyTemplate(template) {
        if (!template) return;

        const hasExistingContent = Boolean(form.content.trim());
        if (hasExistingContent) {
            const confirmed = window.confirm('Este template va a reemplazar el contenido actual del editor.');
            if (!confirmed) return;
        }

        setActiveTemplateKey(template.key);
        setContentFormat('html');
        setForm(current => ({
            ...current,
            content: template.content,
        }));
        showToast(`Template "${template.label}" cargado en el editor.`);
    }

    function handleTagsChange(newTagsString) {
        setForm(f => ({ ...f, tags: newTagsString }));
    }

    function handleOgImageChange(e) {
        setCoverUploadError('');
        setCoverUploadSuccess('');
        setForm(f => ({ ...f, ogImage: e.target.value }));
    }

    function clearCoverSelection() {
        setForm(f => ({ ...f, ogImage: '' }));
        setCoverUploadSuccess('');
        setCoverUploadError('');
    }

    async function handleOgImageUpload(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        setCoverUploadError('');
        setCoverUploadSuccess('');
        setCoverUploading(true);

        try {
            const validationError = validateImageFile(file);
            if (validationError) throw new Error(validationError);

            const { url } = await cmsApi.uploadImage(token, file);
            if (!url) throw new Error('La API no devolvio una URL de imagen valida.');

            setForm(f => ({ ...f, ogImage: url }));
            setCoverUploadSuccess('Imagen subida y asignada como portada del post.');
            showToast('Portada subida correctamente');
        } catch (err) {
            setCoverUploadError(err.message || 'No se pudo subir la imagen de portada.');
        } finally {
            setCoverUploading(false);
            e.target.value = '';
        }
    }

    // ── Vista previa en nueva pestaña
    function handlePreview() {
        try {
            const contentPayload = buildContentPayload();
            sessionStorage.setItem('cms_preview', JSON.stringify({
                ...form,
                ...contentPayload,
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
            ...buildContentPayload(),
            revision,
            tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
            status: statusOverride || form.status || 'draft',
        };

        try {
            if (isEdit) {
                const updated = await cmsApi.updatePost(token, editSlug, payload);
                setRevision(Number(updated.revision) || revision);
                setInitialForm({ ...form, status: payload.status });
                lastAutosavedPayload.current = JSON.stringify(payload);
                removeDraftSnapshot(draftIdentity);
                await loadRevisions(editSlug);
            } else {
                const created = await cmsApi.createPost(token, payload);
                removeDraftSnapshot(draftIdentity);

                if (statusOverride === 'draft') {
                    showToast('Post guardado en borradores');
                    navigate(`/bitacora/posts/editar/${created.slug}`, { replace: true });
                    return;
                }
            }
            if (statusOverride === 'draft') {
                setForm(f => ({ ...f, status: 'draft' }));
                setInitialForm({ ...form, status: 'draft' });
                setAutosaveState('synced');
                showToast('Borrador guardado correctamente');
                return;
            }
            if (statusOverride === 'published') {
                showToast(isEdit ? 'Post actualizado y publicado' : 'Post publicado correctamente');
            }
            navigate('/bitacora/posts');
        } catch (err) {
            if (err.status === 409) {
                setError(err.message || 'Este post fue modificado en otra sesion. Recargalo antes de volver a guardar.');
            } else {
                setError(err.message);
            }
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

    async function handleRestoreRevision(revisionItem) {
        if (!isEdit || !editSlug || !revisionItem) return;

        setSaving(true);
        setError('');
        try {
            const restored = await cmsApi.restorePostRevision(token, editSlug, revisionItem.id, revision);
            const resolved = inferPostContentFields(restored);
            const restoredForm = {
                title: restored.title,
                slug: restored.slug,
                date: restored.date,
                excerpt: restored.excerpt || '',
                tags: Array.isArray(restored.tags) ? restored.tags.join(', ') : restored.tags || '',
                content: resolved.sourceContent || '',
                seoTitle: restored.seoTitle || '',
                seoDescription: restored.seoDescription || '',
                ogImage: restored.ogImage || '',
                canonicalUrl: restored.canonicalUrl || '',
                noindex: restored.noindex || false,
                featured: restored.featured || false,
                showToc: restored.showToc !== false,
                status: restored.status || 'draft',
            };

            setForm(restoredForm);
            setInitialForm(restoredForm);
            setContentFormat(resolved.format);
            const nextRevision = Number(restored.revision) || revision;
            setRevision(nextRevision);
            lastAutosavedPayload.current = JSON.stringify({
                ...restoredForm,
                ...createPostContentPayload(restoredForm.content, resolved.format),
                revision: nextRevision,
                tags: restoredForm.tags.split(',').map(t => t.trim()).filter(Boolean),
            });
            removeDraftSnapshot(`edit:${editSlug}`);
            showToast('Revision restaurada correctamente');
            await loadRevisions(editSlug);
        } catch (err) {
            setError(err.message || 'No se pudo restaurar la revision seleccionada.');
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
                <div className="w-8 h-8 border-2 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin" />
            </div>
        );
    }

    const titleLen = form.title.length;
    const excerptLen = form.excerpt.length;

    return (
        <div className={`min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-3 md:p-6 transition-colors duration-300 ${fullscreen ? 'overflow-hidden' : ''}`}>

            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 max-w-7xl mx-auto">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">{isEdit ? 'Editar post' : 'Nuevo post'}</h1>
                    {isEdit && <p className="text-sm text-[var(--text-muted)] mt-0.5">/{editSlug}</p>}
                    {!isEdit && draftSaved && !availableDraft && (
                        <p className="text-xs text-cyan-400/80 mt-0.5 animate-pulse">Borrador guardado localmente</p>
                    )}
                    {!isEdit && availableDraft && (
                        <button
                            type="button"
                            onClick={() => {
                                const draftForm = { ...availableDraft };
                                delete draftForm.savedAt;
                                setForm(draftForm);
                                setInitialForm(draftForm);
                                setAvailableDraft(null);
                            }}
                            className="text-xs text-fuchsia-400 mt-1 hover:text-fuchsia-300 underline"
                        >
                            Recuperar borrador anterior
                        </button>
                    )}
                    {isEdit && availableDraft && (
                        <button
                            type="button"
                            onClick={() => {
                                const draftForm = { ...availableDraft };
                                delete draftForm.savedAt;
                                setForm(draftForm);
                                setAvailableDraft(null);
                                showToast('Se recupero el borrador local de este post.');
                            }}
                            className="text-xs text-fuchsia-400 mt-1 hover:text-fuchsia-300 underline"
                        >
                            Recuperar borrador local de esta entrada
                        </button>
                    )}
                    {isEdit && (
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                            Revision {revision || 0} · {autosaveState === 'saving' ? 'autoguardando...' : autosaveState === 'synced' ? 'autoguardado sincronizado' : autosaveState === 'local' ? 'borrador local listo' : autosaveState === 'error' ? 'autoguardado con error' : 'sin cambios pendientes'}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end">
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
                        {/* Dirty indicator */}
                        {isDirty && !saving && (
                            <span
                                className="h-2 w-2 rounded-full bg-orange-400 shrink-0"
                                title="Hay cambios sin guardar"
                                aria-label="Cambios sin guardar"
                            />
                        )}
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
                <CollapsibleSection title="Metadatos" icon="📋" defaultOpen={true}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Título */}
                        <div className="lg:col-span-2">
                            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5" htmlFor="post-title">Título *</label>
                            <input
                                id="post-title"
                                type="text"
                                value={form.title}
                                onChange={handleTitleChange}
                                required
                                placeholder="Título del post…"
                                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-fuchsia-500/60 focus:ring-1 focus:ring-fuchsia-500/40 transition-all text-sm shadow-sm"
                            />
                            {/* Title character counter */}
                            <p className={`mt-1.5 text-right text-[10px] font-medium ${titleLen > TITLE_MAX ? 'text-red-500' : 'text-[var(--text-muted)]'}`}>
                                {titleLen}/{TITLE_MAX}
                                {titleLen > TITLE_MAX && <span className="ml-1">— demasiado largo</span>}
                            </p>
                        </div>

                        {/* Slug */}
                        <div>
                            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5" htmlFor="post-slug">
                                Slug * <span className="text-[var(--text-muted)] opacity-70">(URL)</span>
                            </label>
                            <input
                                id="post-slug"
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
                            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5" htmlFor="post-date">Fecha de publicación</label>
                            <input
                                id="post-date"
                                type="date"
                                value={form.date}
                                onChange={handleChange('date')}
                                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-fuchsia-500/60 focus:ring-1 focus:ring-fuchsia-500/40 transition-all text-sm shadow-sm"
                            />
                        </div>

                        {/* Tags */}
                        <div className="lg:col-span-2">
                            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5" htmlFor="post-tags">
                                Tags <span className="text-[var(--text-muted)] opacity-70">(separados por coma)</span>
                            </label>
                            <input
                                id="post-tags"
                                type="text"
                                value={form.tags}
                                onChange={handleChange('tags')}
                                placeholder="React, Node.js, Docker"
                                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-fuchsia-500/60 focus:ring-1 focus:ring-fuchsia-500/40 transition-all text-sm shadow-sm"
                            />
                            {/* Visual tag chips */}
                            <TagChips tagsString={form.tags} onChange={handleTagsChange} />
                        </div>

                        {/* Excerpt */}
                        <div className="lg:col-span-2">
                            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5" htmlFor="post-excerpt">Resumen / excerpt</label>
                            <textarea
                                id="post-excerpt"
                                value={form.excerpt}
                                onChange={handleChange('excerpt')}
                                rows={2}
                                placeholder="Breve descripción que aparece en el listado del blog…"
                                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-fuchsia-500/60 focus:ring-1 focus:ring-fuchsia-500/40 transition-all text-sm resize-none shadow-sm"
                            />
                            {/* Excerpt character counter */}
                            <p className={`mt-1.5 text-right text-[10px] font-medium ${excerptLen > EXCERPT_MAX ? 'text-red-500' : 'text-[var(--text-muted)]'}`}>
                                {excerptLen}/{EXCERPT_MAX}
                                {excerptLen > EXCERPT_MAX && <span className="ml-1">— demasiado largo</span>}
                            </p>
                        </div>

                        <div className="lg:col-span-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Portada</p>
                            <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
                                Elige aqui de forma explicita la portada del post. Aunque el contenido incluya imagenes, la portada del blog se toma de este campo y se guarda en <code>ogImage</code>.
                            </p>

                            <label className="mt-3 block text-xs font-medium text-[var(--text-secondary)]">URL de portada</label>
                            <input
                                type="text"
                                value={form.ogImage}
                                onChange={handleOgImageChange}
                                placeholder="/images/tu-portada.webp o URL completa"
                                className="mt-1.5 w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-fuchsia-500/60 focus:ring-1 focus:ring-fuchsia-500/40 text-sm shadow-sm"
                            />

                            <input
                                ref={coverFileInputRef}
                                type="file"
                                accept={IMAGE_INPUT_ACCEPT}
                                onChange={handleOgImageUpload}
                                className="sr-only"
                            />

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => coverFileInputRef.current?.click()}
                                    disabled={coverUploading}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border-default)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-fuchsia-500/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {coverUploading ? (
                                        <>
                                            <div className="w-3.5 h-3.5 border-2 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin" />
                                            Subiendo portada...
                                        </>
                                    ) : (
                                        'Subir portada desde mi ordenador'
                                    )}
                                </button>

                                {form.ogImage && (
                                    <button
                                        type="button"
                                        onClick={clearCoverSelection}
                                        className="inline-flex items-center px-3 py-1.5 rounded-lg border border-red-500/30 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-all"
                                    >
                                        Quitar portada
                                    </button>
                                )}
                            </div>

                            <p className="mt-1 text-[10px] text-[var(--text-muted)]">{IMAGE_UPLOAD_LABEL}</p>

                            {coverUploadError && (
                                <p className="mt-1.5 text-xs text-red-400">{coverUploadError}</p>
                            )}

                            {coverUploadSuccess && (
                                <p className="mt-1.5 text-xs text-emerald-400">{coverUploadSuccess}</p>
                            )}

                            {form.ogImage && (
                                <div className="mt-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] p-3">
                                    <p className="mb-1 text-[10px] uppercase tracking-wide text-[var(--text-muted)]">Vista previa de portada seleccionada</p>
                                    <div className="overflow-hidden rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] aspect-[16/9] min-h-[12rem]">
                                        <img
                                            src={form.ogImage}
                                            alt="Vista previa de portada del post"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-2 mt-1">
                            <label className="flex items-center gap-3 cursor-pointer group w-fit">
                                <div className={`relative h-5 w-10 rounded-full transition-colors ${form.featured ? 'bg-fuchsia-500' : 'bg-[var(--text-secondary)] opacity-50'}`}>
                                    <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${form.featured ? 'translate-x-5' : ''}`} />
                                    <input
                                        type="checkbox"
                                        checked={form.featured}
                                        onChange={handleChange('featured')}
                                        className="sr-only"
                                    />
                                </div>
                                <span className="text-sm font-medium text-[var(--text-primary)] transition-colors group-hover:text-fuchsia-500">
                                    Marcar como artículo destacado
                                </span>
                            </label>
                            <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
                                El blog mostrará este post en la zona destacada de la portada. Si activas esta opción en otro artículo, sustituirá al actual.
                            </p>
                        </div>

                        <div className="lg:col-span-2 mt-4">
                            <label className="flex items-center gap-3 cursor-pointer group w-fit">
                                <div className={`relative h-5 w-10 rounded-full transition-colors ${form.showToc ? 'bg-cyan-500' : 'bg-[var(--text-secondary)] opacity-50'}`}>
                                    <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${form.showToc ? 'translate-x-5' : ''}`} />
                                    <input
                                        type="checkbox"
                                        checked={form.showToc}
                                        onChange={handleChange('showToc')}
                                        className="sr-only"
                                    />
                                </div>
                                <span className="text-sm font-medium text-[var(--text-primary)] transition-colors group-hover:text-cyan-500">
                                    Mostrar tabla de contenidos (TOC)
                                </span>
                            </label>
                            <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
                                Muestra un índice fijo a la derecha con los títulos del post para navegación rápida. Se genera automáticamente desde los títulos H2 y H3.
                            </p>

                            {/* Live heading preview — always visible as author feedback */}
                            <div className="mt-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-3">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">Títulos detectados en el contenido</p>
                                {liveHeadings.length === 0 ? (
                                    <p className="text-xs text-[var(--text-muted)] italic">No se han detectado títulos H1–H3 en el contenido todavía.</p>
                                ) : (
                                    <ol className="space-y-1">
                                        {liveHeadings.map((heading, i) => (
                                            <li
                                                key={`${heading.id}-${i}`}
                                                className="flex items-baseline gap-2 text-xs text-[var(--text-secondary)]"
                                                style={{ paddingLeft: `${(heading.level - 1) * 0.75}rem` }}
                                            >
                                                <span className="shrink-0 rounded px-1 py-0.5 bg-[var(--bg-surface)] text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                                                    H{heading.level}
                                                </span>
                                                <span className="truncate">{heading.text}</span>
                                            </li>
                                        ))}
                                    </ol>
                                )}
                                {liveHeadings.length > 0 && liveHeadings.length < 3 && (
                                    <p className="mt-2 text-[10px] text-amber-400/80">
                                        El TOC se mostrará cuando haya al menos 3 títulos ({liveHeadings.length}/3 detectados).
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </CollapsibleSection>

                {/* ── Editor rico ───────────────────────────────────────────── */}
                <div>
                    <div className="flex items-baseline justify-between mb-2">
                        <label className="text-xs font-medium text-[var(--text-secondary)]">Contenido *</label>
                        {wordCount > 0 && (
                            <span className="text-[10px] text-[var(--text-muted)]">
                                ~{wordCount.toLocaleString('es-ES')} palabras · {readingMinutes} min de lectura
                            </span>
                        )}
                    </div>
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

                {/* ── Templates Editoriales ───────────────────────────────────── */}
                <CollapsibleSection title="Templates Editoriales" icon="📄" defaultOpen={false}>
                    <TemplatePicker activeTemplateKey={activeTemplateKey} onApplyTemplate={handleApplyTemplate} />
                </CollapsibleSection>

                {/* ── Checklist Editorial ──────────────────────────────────────── */}
                <CollapsibleSection title="Checklist Editorial" icon="✅" badge={wordCount > 0 ? `${Math.min(100, Math.round((wordCount / 1500) * 100))}%` : '0%'} badgeColor="emerald" defaultOpen={false}>
                    <EditorialChecklist form={form} wordCount={wordCount} />
                </CollapsibleSection>

                {/* ── Revisiones ─────────────────────────────────────────────── */}
                {isEdit && (
                    <CollapsibleSection title="Revisiones" icon="📜" badge={revisions.length} badgeColor="violet" defaultOpen={false}>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs text-[var(--text-muted)]">Cada guardado y autoguardado crea un snapshot por post para restaurar rapido si algo sale mal.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => loadRevisions(editSlug)}
                                    className="rounded-lg border border-[var(--border-default)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                >
                                    Recargar
                                </button>
                            </div>

                            {loadingRevisions ? (
                                <p className="text-xs text-[var(--text-muted)]">Cargando revisiones...</p>
                            ) : revisions.length === 0 ? (
                                <p className="text-xs text-[var(--text-muted)]">Todavia no hay revisiones persistidas para este post.</p>
                            ) : (
                                <div className="grid gap-2">
                                    {revisions.map(item => (
                                    <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-3">
                                        <div>
                                            <p className="text-sm font-medium text-[var(--text-primary)]">Revision {item.revision} · {formatRevisionLabel(item)}</p>
                                            <p className="mt-1 text-xs text-[var(--text-muted)]">{new Date(item.createdAt).toLocaleString('es-ES')}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRestoreRevision(item)}
                                            disabled={saving || item.revision === revision}
                                            className="rounded-lg border border-fuchsia-500/30 px-3 py-1.5 text-xs font-semibold text-fuchsia-400 hover:bg-fuchsia-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Restaurar
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CollapsibleSection>
                )}

                {/* ── SEO Profesional ───────────────────────────────────────── */}
                <CollapsibleSection title="SEO Profesional" icon="🔍" badge={(form.seoTitle || form.title).length > 0 || (form.seoDescription || form.excerpt).length > 0 ? '✓' : null} badgeColor="cyan" defaultOpen={false}>
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
                </CollapsibleSection>
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
