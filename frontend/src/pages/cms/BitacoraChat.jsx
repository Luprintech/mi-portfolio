import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { cmsApi } from '../../lib/cmsApi';

const OUTCOME_META = {
    gemini:               { label: 'Gemini',         color: 'var(--accent-secondary)',  bg: 'rgba(34,211,238,0.12)' },
    faq:                  { label: 'FAQ',             color: 'var(--accent-primary)',    bg: 'rgba(232,121,249,0.12)' },
    cache:                { label: 'Caché',           color: '#10b981',                  bg: 'rgba(16,185,129,0.12)' },
    spam:                 { label: 'Spam',            color: '#f97316',                  bg: 'rgba(249,115,22,0.12)' },
    gemini_unavailable:   { label: 'No disponible',  color: '#f59e0b',                  bg: 'rgba(245,158,11,0.12)' },
    gemini_quota_exceeded:{ label: 'Cuota agotada',  color: '#ef4444',                  bg: 'rgba(239,68,68,0.12)' },
    error:                { label: 'Error',           color: '#ef4444',                  bg: 'rgba(239,68,68,0.12)' },
};

function OutcomeBadge({ outcome }) {
    const meta = OUTCOME_META[outcome] ?? { label: outcome, color: 'var(--text-muted)', bg: 'rgba(148,163,184,0.12)' };
    return (
        <span
            className="inline-block rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold"
            style={{ color: meta.color, background: meta.bg }}
        >
            {meta.label}
        </span>
    );
}

function StatCard({ label, value, color }) {
    return (
        <div
            className="rounded-2xl border bg-[var(--bg-surface)] p-5"
            style={{ borderColor: `${color}33` }}
        >
            <p className="text-3xl font-bold" style={{ color }}>{value}</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{label}</p>
        </div>
    );
}

function BarChart({ byOutcome, total }) {
    if (!byOutcome || total === 0) return (
        <p className="text-sm text-[var(--text-muted)] py-4">Sin datos todavía.</p>
    );

    return (
        <div className="space-y-3">
            {Object.entries(byOutcome)
                .sort((a, b) => b[1] - a[1])
                .map(([outcome, count]) => {
                    const meta = OUTCOME_META[outcome] ?? { label: outcome, color: 'var(--text-muted)' };
                    const pct = Math.round((count / total) * 100);
                    return (
                        <div key={outcome}>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-medium" style={{ color: meta.color }}>{meta.label}</span>
                                <span className="text-[var(--text-muted)]">{count} ({pct}%)</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-[var(--bg-elevated)]">
                                <div
                                    className="h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${pct}%`, background: meta.color }}
                                />
                            </div>
                        </div>
                    );
                })}
        </div>
    );
}

function formatTs(ts) {
    if (!ts) return '—';
    const d = new Date(ts);
    return d.toLocaleString('es-ES', {
        day: '2-digit', month: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
}

function maskIp(ip) {
    if (!ip || ip === 'unknown') return '—';
    // Oculta el último octeto de IPv4 / último segmento de IPv6
    const v4 = ip.match(/^(\d+\.\d+\.\d+)\.\d+$/);
    if (v4) return `${v4[1]}.***`;
    const v6 = ip.lastIndexOf(':');
    if (v6 !== -1) return `${ip.slice(0, v6)}:****`;
    return ip;
}

export default function BitacoraChat() {
    const { token } = useAuth();
    const [stats, setStats]     = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');

    const fetchStats = useCallback(async () => {
        try {
            const data = await cmsApi.getChatStats(token);
            setStats(data);
            setError('');
        } catch (err) {
            setError(err.message || 'No se pudieron cargar las estadísticas.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchStats();
        // Refresca automáticamente cada 30 segundos
        const interval = setInterval(fetchStats, 30_000);
        return () => clearInterval(interval);
    }, [fetchStats]);

    return (
        <div className="p-8 max-w-5xl">
            <div className="flex items-start justify-between mb-1">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Chat IA</h1>
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                        Estadísticas de uso desde el último inicio del servidor
                    </p>
                </div>
                <button
                    onClick={fetchStats}
                    className="shrink-0 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                    Actualizar
                </button>
            </div>

            {/* Aviso de persistencia */}
            <div className="mt-4 mb-6 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-300 leading-relaxed">
                Los datos se almacenan en memoria. Se reinician cuando el servidor se reinicia.
                Máximo 1.000 eventos almacenados (FIFO).
            </div>

            {error && (
                <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            {loading && (
                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <div className="w-4 h-4 border-2 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin" />
                    Cargando estadísticas...
                </div>
            )}

            {!loading && stats && (
                <>
                    {/* KPIs */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <StatCard label="Total interacciones" value={stats.total}      color="var(--accent-secondary)" />
                        <StatCard label="IPs únicas"          value={stats.uniqueIps}  color="var(--accent-primary)" />
                        <StatCard label="Llamadas a Gemini"   value={stats.byOutcome?.gemini ?? 0} color="#10b981" />
                        <StatCard label="Bloqueadas (spam)"   value={stats.byOutcome?.spam ?? 0}   color="#f97316" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        {/* Distribución por outcome */}
                        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
                            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Distribución por tipo</h2>
                            <BarChart byOutcome={stats.byOutcome} total={stats.total} />
                        </div>

                        {/* Info adicional */}
                        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 flex flex-col gap-4">
                            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Detalles</h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-[var(--text-muted)]">Primer evento registrado</span>
                                    <span className="text-[var(--text-secondary)] text-xs">{formatTs(stats.serverUpSince)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[var(--text-muted)]">Respuestas de caché</span>
                                    <span className="text-[var(--text-secondary)]">{stats.byOutcome?.cache ?? 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[var(--text-muted)]">Respondido por FAQ</span>
                                    <span className="text-[var(--text-secondary)]">{stats.byOutcome?.faq ?? 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[var(--text-muted)]">Cuota Gemini agotada</span>
                                    <span className="text-[var(--text-secondary)]">{stats.byOutcome?.gemini_quota_exceeded ?? 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[var(--text-muted)]">Errores internos</span>
                                    <span className="text-[var(--text-secondary)]">{stats.byOutcome?.error ?? 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabla de últimos eventos */}
                    <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden">
                        <div className="px-5 py-4 border-b border-[var(--border-default)]">
                            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Últimas interacciones</h2>
                        </div>
                        {stats.recentEvents?.length === 0 ? (
                            <p className="px-5 py-4 text-sm text-[var(--text-muted)]">Sin interacciones todavía.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-[var(--border-default)] text-[var(--text-muted)] text-xs">
                                            <th className="px-5 py-3 text-left font-medium">Fecha</th>
                                            <th className="px-5 py-3 text-left font-medium">IP</th>
                                            <th className="px-5 py-3 text-left font-medium">Tipo</th>
                                            <th className="px-5 py-3 text-right font-medium">Long. msg</th>
                                            <th className="px-5 py-3 text-right font-medium">Turnos</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recentEvents.map((ev, i) => (
                                            <tr
                                                key={i}
                                                className="border-b border-[var(--border-default)] last:border-0 hover:bg-[var(--bg-elevated)] transition-colors"
                                            >
                                                <td className="px-5 py-3 text-[var(--text-secondary)] text-xs whitespace-nowrap">{formatTs(ev.ts)}</td>
                                                <td className="px-5 py-3 font-mono text-xs text-[var(--text-muted)]">{maskIp(ev.ip)}</td>
                                                <td className="px-5 py-3"><OutcomeBadge outcome={ev.outcome} /></td>
                                                <td className="px-5 py-3 text-right text-[var(--text-muted)] tabular-nums">{ev.messageLength}</td>
                                                <td className="px-5 py-3 text-right text-[var(--text-muted)] tabular-nums">{ev.historyLength}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
