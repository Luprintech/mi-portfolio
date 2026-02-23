import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Admin() {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    // Project form
    const [formData, setFormData] = useState({
        titulo_es: '',
        titulo_en: '',
        descripcion_es: '',
        descripcion_en: '',
        shortDescription_es: '',
        shortDescription_en: '',
        tech: '',
        links: JSON.stringify([
            { url: "", labelKey: "projects.view_app", type: "web" },
            { url: "", labelKey: "projects.view_code", type: "github" }
        ], null, 2),
        featured: false
    });
    
    const [imagen, setImagen] = useState(null);
    const [status, setStatus] = useState('idle');

    const handleLogin = (e) => {
        e.preventDefault();
        // Solo como capa muy básica de UX de front, la seguridad real está en el backend
        if (password) setIsAuthenticated(true);
    };

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleFileChange = (e) => {
        setImagen(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');
        
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (imagen) data.append('imagen', imagen);
        data.append('password', password); // Enviar password en cada petición form-data

        try {
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
            const res = await fetch(`${API_URL}/api/admin/projects`, {
                method: 'POST',
                body: data
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error);
            
            setStatus('success');
            setTimeout(() => setStatus('idle'), 3000);
            
            // Wipe solo la info temporal
            setImagen(null);
            setFormData(prev => ({ ...prev, titulo_es: '', titulo_en: '' })); // Reset parcial para guiar UX
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 text-white grid-pattern">
                <motion.form 
                    initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    onSubmit={handleLogin} 
                    className="bg-[#111827] border border-slate-700 p-8 rounded-2xl w-full max-w-sm shadow-2xl"
                >
                    <h2 className="text-2xl font-bold mb-6 text-cyan-400">Terminal de Control</h2>
                    <input
                        type="password"
                        placeholder="Clave de administrador"
                        name="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white mb-6 focus:border-fuchsia-500 outline-none"
                    />
                    <button type="submit" className="w-full bg-fuchsia-500 hover:bg-fuchsia-400 p-3 rounded-lg font-bold transition">Conectar Sistema</button>
                </motion.form>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] pt-32 pb-20 px-4 text-gray-200 selection:bg-cyan-500/30">
            <div className="max-w-4xl mx-auto bg-[#111827] p-8 md:p-12 rounded-3xl border border-slate-700/50 shadow-2xl relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-fuchsia-500 to-cyan-500" />
                <h1 className="text-3xl font-bold mb-2 text-white">Subida Automática de Proyectos</h1>
                <p className="text-slate-400 mb-8">Esta acción escribirá directamente en la base de datos JSON del backend y guardará la imagen estática sin necesidad de compilar.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-700/50 pb-6">
                        <div>
                            <label className="block text-sm font-semibold text-cyan-400 mb-2">Título (ES)</label>
                            <input required type="text" name="titulo_es" value={formData.titulo_es} onChange={handleChange} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-fuchsia-400 mb-2">Title (EN)</label>
                            <input required type="text" name="titulo_en" value={formData.titulo_en} onChange={handleChange} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-fuchsia-500 outline-none" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-700/50 pb-6">
                        <div>
                            <label className="block text-sm text-cyan-400 mb-2">Descripción Larga (ES)</label>
                            <textarea required rows="4" name="descripcion_es" value={formData.descripcion_es} onChange={handleChange} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none resize-none" />
                        </div>
                        <div>
                            <label className="block text-sm text-fuchsia-400 mb-2">Long Description (EN)</label>
                            <textarea required rows="4" name="descripcion_en" value={formData.descripcion_en} onChange={handleChange} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-fuchsia-500 outline-none resize-none" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-700/50 pb-6">
                        <div>
                            <label className="block text-sm text-cyan-400 mb-2">Short Desc (ES - opcional)</label>
                            <input type="text" name="shortDescription_es" value={formData.shortDescription_es} onChange={handleChange} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm text-fuchsia-400 mb-2">Short Desc (EN - opcional)</label>
                            <input type="text" name="shortDescription_en" value={formData.shortDescription_en} onChange={handleChange} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-fuchsia-500 outline-none" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-slate-300 mb-2">Tecnologías (separadas por coma)</label>
                            <input required type="text" placeholder="Ej: React, Laravel, Docker" name="tech" value={formData.tech} onChange={handleChange} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-300 mb-2">Imagen Portada (JPG, PNG)</label>
                            <input required type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-fuchsia-500/20 file:text-fuchsia-400 hover:file:bg-fuchsia-500/30" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-slate-300 mb-2">Array de Links (Formato JSON Estricto)</label>
                        <textarea required rows="4" name="links" value={formData.links} onChange={handleChange} className="font-mono text-sm w-full bg-[#0b1220] border border-slate-600 rounded-lg p-4 text-cyan-300 focus:border-cyan-500 outline-none resize-none" />
                    </div>

                    <div className="flex items-center gap-3">
                        <input type="checkbox" id="featured" name="featured" checked={formData.featured} onChange={handleChange} className="w-5 h-5 accent-fuchsia-500" />
                        <label htmlFor="featured" className="text-slate-300 font-medium cursor-pointer">Marcar como Proyecto Destacado (Aparecerá en el Home)</label>
                    </div>

                    <button disabled={status === 'submitting'} type="submit" className="w-full bg-gradient-to-r from-red-600 to-fuchsia-600 hover:from-red-500 hover:to-fuchsia-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-fuchsia-500/20 hover:shadow-cyan-400/20 transition-all text-lg mt-8">
                        {status === 'submitting' ? 'Subiendo Proyecto a Producción...' : 'Inyectar Proyecto Inmediatamente'}
                    </button>

                    {status === 'success' && <p className="text-green-400 text-center font-bold mt-4 p-4 bg-green-900/20 rounded-lg border border-green-500/50">¡PROYECTO SUBIDO Y CONECTADO CON ÉXITO!</p>}
                    {status === 'error' && <p className="text-red-400 text-center font-bold mt-4">Fallo de seguridad o error. Verifica la terminal Node.</p>}
                </form>
            </div>
        </div>
    );
}
