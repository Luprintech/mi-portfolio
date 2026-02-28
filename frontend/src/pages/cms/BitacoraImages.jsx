import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { cmsApi } from '../../lib/cmsApi';

export default function BitacoraImages() {
    const { token }    = useAuth();
    const [images,   setImages]   = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [copied,   setCopied]   = useState(null);
    const [error,    setError]    = useState('');
    const fileInput = useRef(null);

    async function load() {
        setLoading(true);
        try {
            setImages(await cmsApi.getImages(token));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, [token]);

    async function handleUpload(e) {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        setUploading(true);
        setError('');
        try {
            for (const file of files) {
                const result = await cmsApi.uploadImage(token, file);
                setImages(prev => [result, ...prev]);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
            if (fileInput.current) fileInput.current.value = '';
        }
    }

    async function handleDelete(filename) {
        if (!confirm(`¿Eliminar "${filename}"?`)) return;
        setDeleting(filename);
        try {
            await cmsApi.deleteImage(token, filename);
            setImages(prev => prev.filter(img => img.filename !== filename));
        } catch (err) {
            alert(`Error: ${err.message}`);
        } finally {
            setDeleting(null);
        }
    }

    function handleCopy(url) {
        // URL de la imagen desde el frontend (para usar en markdown)
        navigator.clipboard.writeText(url).then(() => {
            setCopied(url);
            setTimeout(() => setCopied(null), 2000);
        });
    }

    // Drag & drop
    function handleDrop(e) {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        if (!files.length) return;
        const dt = new DataTransfer();
        files.forEach(f => dt.items.add(f));
        fileInput.current.files = dt.files;
        handleUpload({ target: { files: dt.files } });
    }

    return (
        <div className="p-8 max-w-5xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Imágenes</h1>
                    <p className="text-sm text-gray-500">{images.length} imágenes subidas</p>
                </div>
                <button
                    onClick={() => fileInput.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-cyan-500 text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {uploading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Subiendo…
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Subir imágenes
                        </>
                    )}
                </button>
                <input
                    ref={fileInput}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleUpload}
                />
            </div>

            {error && (
                <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Zona de drop */}
            <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                className="mb-6 border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-fuchsia-500/30 transition-colors cursor-pointer"
                onClick={() => fileInput.current?.click()}
            >
                <svg className="w-8 h-8 text-gray-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-500">Arrastra imágenes aquí o <span className="text-fuchsia-400">haz clic para seleccionar</span></p>
                <p className="text-xs text-gray-600 mt-1">JPG, PNG, WebP, GIF, SVG — máx. 5 MB por imagen</p>
            </div>

            {/* Info de uso */}
            <p className="text-xs text-gray-600 mb-4">
                Copia la URL y úsala en Markdown: <code className="text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">![alt](/posts/images/nombre.jpg)</code>
            </p>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin" />
                </div>
            ) : images.length === 0 ? (
                <p className="text-center text-gray-600 text-sm py-12">No hay imágenes todavía.</p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map(img => (
                        <div
                            key={img.filename}
                            className="group relative rounded-2xl overflow-hidden bg-white/3 border border-white/5 aspect-square"
                        >
                            <img
                                src={img.url}
                                alt={img.filename}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                                <p className="text-xs text-gray-300 text-center break-all leading-tight line-clamp-2">
                                    {img.filename}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleCopy(img.url)}
                                        className={`p-2 rounded-lg transition-all text-xs font-medium flex items-center gap-1.5 ${
                                            copied === img.url
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-white/10 text-white hover:bg-white/20'
                                        }`}
                                        title="Copiar URL"
                                    >
                                        {copied === img.url ? (
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        )}
                                        {copied === img.url ? 'Copiado' : 'URL'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(img.filename)}
                                        disabled={deleting === img.filename}
                                        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                                        title="Eliminar"
                                    >
                                        {deleting === img.filename ? (
                                            <div className="w-3.5 h-3.5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                                        ) : (
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
