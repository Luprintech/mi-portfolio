import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { cmsApi } from '../../lib/cmsApi';

const CV_URL = '/CV_Guadalupe_Cano.pdf';

export default function BitacoraCV() {
    const { token } = useAuth();
    const [uploading, setUploading]     = useState(false);
    const [message, setMessage]         = useState('');
    const [isError, setIsError]         = useState(false);
    const [cvUrl, setCvUrl]             = useState(CV_URL);
    const [previewKey, setPreviewKey]   = useState(0); // fuerza recarga del iframe

    async function handleUpload(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setMessage('');
        setIsError(false);
        try {
            await cmsApi.uploadCv(token, file);
            // Fuerza al iframe a recargar añadiendo un cache-bust solo en el cliente
            const busted = `${CV_URL}?v=${Date.now()}`;
            setCvUrl(busted);
            setPreviewKey(k => k + 1);
            setMessage('CV actualizado correctamente.');
        } catch (err) {
            setIsError(true);
            setMessage(err.message || 'No se pudo actualizar el CV.');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    }

    return (
        <div className="p-8 max-w-5xl">
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">CV público</h1>
            <p className="text-sm text-[var(--text-secondary)] mb-8">
                Gestiona el PDF que se descarga desde la home y el chatbot.
            </p>

            {/* Acción de subida */}
            <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 mb-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">Reemplazar CV</p>
                        <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                            Solo se aceptan archivos PDF. El fichero anterior se sobreescribe.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <a
                            href={cvUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Abrir PDF
                        </a>

                        <label className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition-opacity ${uploading ? 'opacity-60 pointer-events-none bg-slate-500' : 'bg-gradient-to-r from-cyan-600 to-fuchsia-600 hover:opacity-90'}`}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <input
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                onChange={handleUpload}
                                disabled={uploading}
                            />
                            {uploading ? 'Subiendo...' : 'Subir nuevo CV'}
                        </label>
                    </div>
                </div>

                {message && (
                    <p className={`mt-4 text-sm ${isError ? 'text-red-400' : 'text-emerald-400'}`}>
                        {message}
                    </p>
                )}
            </div>

            {/* Previsualización del PDF actual */}
            <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-default)]">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">Vista previa del CV actual</p>
                    <span className="text-xs text-[var(--text-muted)]">CV_Guadalupe_Cano.pdf</span>
                </div>
                <iframe
                    key={previewKey}
                    src={cvUrl}
                    title="Vista previa del CV"
                    className="w-full border-0"
                    style={{ height: '80vh', minHeight: '600px' }}
                />
            </div>
        </div>
    );
}
