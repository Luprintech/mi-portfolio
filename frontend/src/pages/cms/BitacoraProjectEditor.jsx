import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cmsApi } from '../../lib/cmsApi';
import { slugify } from '../../utils/slugify';

const EMPTY = {
    id:          '',
    title:       '',
    description: '',
    tech:        '',
    github:      '',
    demo:        '',
    image:       '',
    featured:    false,
};

export default function BitacoraProjectEditor() {
    const { token }    = useAuth();
    const navigate     = useNavigate();
    const { id: editId } = useParams();
    const isEdit = !!editId;

    const [form,    setForm]    = useState(EMPTY);
    const [loading, setLoading] = useState(isEdit);
    const [saving,  setSaving]  = useState(false);
    const [error,   setError]   = useState('');
    const [idManual, setIdManual] = useState(false);

    useEffect(() => {
        if (!isEdit) return;
        cmsApi.getProjects(token)
            .then(projects => {
                const project = projects.find(p => p.id === editId);
                if (!project) throw new Error('Proyecto no encontrado');
                setForm({
                    ...project,
                    tech: Array.isArray(project.tech) ? project.tech.join(', ') : project.tech || '',
                    featured: project.featured ?? false,
                });
                setIdManual(true);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [isEdit, editId, token]);

    function handleTitleChange(e) {
        const title = e.target.value;
        setForm(f => ({
            ...f,
            title,
            ...(!idManual && { id: slugify(title) }),
        }));
    }

    function handleChange(field) {
        return (e) => {
            const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
            setForm(f => ({ ...f, [field]: val }));
        };
    }

    function handleIdChange(e) {
        setIdManual(true);
        setForm(f => ({ ...f, id: e.target.value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSaving(true);

        const payload = {
            ...form,
            tech: form.tech.split(',').map(t => t.trim()).filter(Boolean),
        };

        try {
            if (isEdit) {
                await cmsApi.updateProject(token, editId, payload);
            } else {
                await cmsApi.createProject(token, payload);
            }
            navigate('/bitacora/proyectos');
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
                <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            </div>
        );
    }

    const inputClass = "w-full px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-fuchsia-500/60 focus:ring-1 focus:ring-fuchsia-500/40 transition-all text-sm";

    return (
        <div className="p-8 max-w-2xl bg-[var(--bg-primary)] min-h-screen w-full text-[var(--text-primary)]">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">{isEdit ? 'Editar proyecto' : 'Nuevo proyecto'}</h1>
                    {isEdit && <p className="text-sm text-[var(--text-secondary)] mt-0.5">ID: {editId}</p>}
                </div>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/bitacora/proyectos')}
                        className="px-4 py-2 rounded-xl text-sm border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="project-form"
                        disabled={saving}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-cyan-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {saving ? 'Guardando…' : isEdit ? 'Actualizar' : 'Crear'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                    {error}
                </div>
            )}

            <form id="project-form" onSubmit={handleSubmit} className="space-y-5 bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-default)]">
                <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Título *</label>
                    <input type="text" value={form.title} onChange={handleTitleChange} required placeholder="Mi proyecto" className={inputClass} />
                </div>

                <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                        ID / slug *
                        <span className="text-[var(--text-muted)] font-normal ml-1">(usado como identificador único)</span>
                    </label>
                    <input
                        type="text"
                        value={form.id}
                        onChange={handleIdChange}
                        required
                        disabled={isEdit}
                        placeholder="mi-proyecto"
                        className={`${inputClass} font-mono disabled:opacity-40 disabled:cursor-not-allowed`}
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Descripción</label>
                    <textarea
                        value={form.description}
                        onChange={handleChange('description')}
                        rows={3}
                        placeholder="Descripción breve del proyecto…"
                        className={`${inputClass} resize-none`}
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                        Tecnologías <span className="text-[var(--text-muted)] font-normal">(separadas por coma)</span>
                    </label>
                    <input type="text" value={form.tech} onChange={handleChange('tech')} placeholder="React, Node.js, Docker" className={inputClass} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">GitHub URL</label>
                        <input type="url" value={form.github} onChange={handleChange('github')} placeholder="https://github.com/…" className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Demo URL</label>
                        <input type="url" value={form.demo} onChange={handleChange('demo')} placeholder="https://…" className={inputClass} />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Imagen (URL o ruta)</label>
                    <input type="text" value={form.image} onChange={handleChange('image')} placeholder="/images/proyecto.jpg" className={inputClass} />
                    {form.image && (
                        <div className="mt-2 rounded-xl overflow-hidden h-32 bg-[var(--bg-elevated)] border border-[var(--border-default)]">
                            <img src={form.image} alt="preview" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                        </div>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-[var(--border-default)]">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`relative w-10 h-5 rounded-full transition-colors ${form.featured ? 'bg-fuchsia-500' : 'bg-[var(--text-secondary)] opacity-50'}`}>
                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.featured ? 'translate-x-5' : ''}`} />
                            <input type="checkbox" checked={form.featured} onChange={handleChange('featured')} className="sr-only" />
                        </div>
                        <span className="text-sm text-[var(--text-primary)] group-hover:text-fuchsia-500 transition-colors font-medium">Mostrar como proyecto destacado</span>
                    </label>
                </div>
            </form>
        </div>
    );
}
