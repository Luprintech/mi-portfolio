import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { cmsApi } from '../../lib/cmsApi';

export default function BitacoraMiPerfil() {
    const { token, username, role, isAdmin } = useAuth();

    const [current, setCurrent]   = useState('');
    const [next, setNext]         = useState('');
    const [confirm, setConfirm]   = useState('');
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState('');
    const [success, setSuccess]   = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (next !== confirm) {
            setError('Las contraseñas nuevas no coinciden');
            return;
        }
        if (next.length < 8) {
            setError('La nueva contraseña debe tener al menos 8 caracteres');
            return;
        }

        setLoading(true);
        try {
            await cmsApi.changeMyPassword(token, current, next);
            setSuccess(true);
            setCurrent('');
            setNext('');
            setConfirm('');
        } catch (err) {
            setError(err.message || 'Error al cambiar la contraseña');
        } finally {
            setLoading(false);
        }
    }

    const inputClass = "w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-secondary)] focus:ring-1 focus:ring-[var(--accent-secondary)] transition-all";

    return (
        <div className="p-4 md:p-8 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Mi perfil</h1>
            <p className="text-sm text-[var(--text-secondary)] mb-8">
                Información de tu cuenta y cambio de contraseña.
            </p>

            {/* Tarjeta de info */}
            <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 mb-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-fuchsia-600 to-cyan-500 flex items-center justify-center shrink-0">
                    <span className="text-white text-xl font-bold uppercase">
                        {username ? username.slice(0, 1) : '?'}
                    </span>
                </div>
                <div>
                    <p className="text-base font-bold text-[var(--text-primary)]">{username}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase tracking-wide mt-1 ${
                        isAdmin
                            ? 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30'
                            : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                    }`}>
                        {role}
                    </span>
                </div>
            </div>

            {/* Formulario de contraseña */}
            <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6">
                <h2 className="text-base font-bold text-[var(--text-primary)] mb-5 flex items-center gap-2">
                    <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Cambiar contraseña
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                            Contraseña actual
                        </label>
                        <input
                            type="password"
                            value={current}
                            onChange={e => setCurrent(e.target.value)}
                            className={inputClass}
                            placeholder="Tu contraseña actual"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                            Nueva contraseña
                        </label>
                        <input
                            type="password"
                            value={next}
                            onChange={e => setNext(e.target.value)}
                            className={inputClass}
                            placeholder="Mínimo 8 caracteres"
                            minLength={8}
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                            Confirmar nueva contraseña
                        </label>
                        <input
                            type="password"
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                            className={inputClass}
                            placeholder="Repite la nueva contraseña"
                            minLength={8}
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                            {error}
                        </p>
                    )}

                    {success && (
                        <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                            ✓ Contraseña actualizada correctamente
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-cyan-600 text-white text-sm font-bold transition-all hover:from-fuchsia-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Guardando…' : 'Cambiar contraseña'}
                    </button>
                </form>
            </div>
        </div>
    );
}
