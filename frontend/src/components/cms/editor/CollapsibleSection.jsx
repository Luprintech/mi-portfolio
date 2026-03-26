// ─── CollapsibleSection — Sección expansible/colapsable para el editor de posts ───
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export default function CollapsibleSection({ 
    title, 
    children, 
    defaultOpen = true, 
    icon = null,
    badge = null,
    badgeColor = 'fuchsia'
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const colorClasses = {
        fuchsia: 'text-fuchsia-400 bg-fuchsia-500/15 border-fuchsia-500/30',
        emerald: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
        amber: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
        cyan: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
        violet: 'text-violet-400 bg-violet-500/15 border-violet-500/30',
    };

    const colors = colorClasses[badgeColor] || colorClasses.fuchsia;

    return (
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden">
            {/* Header clickeable */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-[var(--bg-elevated)]/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    {icon && <span className="text-lg">{icon}</span>}
                    <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                        {title}
                    </p>
                    {badge !== null && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium border ${colors}`}>
                            {badge}
                        </span>
                    )}
                </div>
                {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
                ) : (
                    <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
                )}
            </button>

            {/* Contenido colapsable */}
            <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="p-5 pt-0">
                    {children}
                </div>
            </div>
        </div>
    );
}