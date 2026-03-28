import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

/**
 * ServicesGrid — flip cards
 *
 * Frente: icono + título
 * Reverso: descripción completa con fondo de color de la card
 *
 * Interacción:
 *   - Desktop: hover voltea la card
 *   - Mobile:  tap voltea, segundo tap vuelve
 */

const CARD_COLORS = {
  fuchsia: {
    icon:    "text-fuchsia-400",
    glow:    "rgba(232,121,249,0.25)",
    back:    "from-fuchsia-900/80 to-fuchsia-800/60",
    border:  "border-fuchsia-500/30",
    accent:  "#e879f9",
  },
  purple: {
    icon:    "text-purple-400",
    glow:    "rgba(168,85,247,0.25)",
    back:    "from-purple-900/80 to-violet-800/60",
    border:  "border-purple-500/30",
    accent:  "#a855f7",
  },
  cyan: {
    icon:    "text-cyan-400",
    glow:    "rgba(34,211,238,0.25)",
    back:    "from-cyan-900/80 to-sky-800/60",
    border:  "border-cyan-500/30",
    accent:  "#22d3ee",
  },
  emerald: {
    icon:    "text-emerald-400",
    glow:    "rgba(52,211,153,0.25)",
    back:    "from-emerald-900/80 to-teal-800/60",
    border:  "border-emerald-500/30",
    accent:  "#34d399",
  },
  blue: {
    icon:    "text-blue-400",
    glow:    "rgba(96,165,250,0.25)",
    back:    "from-blue-900/80 to-indigo-800/60",
    border:  "border-blue-500/30",
    accent:  "#60a5fa",
  },
  amber: {
    icon:    "text-amber-400",
    glow:    "rgba(251,191,36,0.22)",
    back:    "from-amber-900/80 to-orange-900/60",
    border:  "border-amber-500/30",
    accent:  "#fbbf24",
  },
};

// Mapeado del color del servicio (extraído del iconColor) al token de CARD_COLORS
function resolveColor(iconColor = "") {
  if (iconColor.includes("fuchsia")) return "fuchsia";
  if (iconColor.includes("purple") || iconColor.includes("violet")) return "purple";
  if (iconColor.includes("cyan"))    return "cyan";
  if (iconColor.includes("emerald")) return "emerald";
  if (iconColor.includes("blue"))    return "blue";
  if (iconColor.includes("amber"))   return "amber";
  return "fuchsia";
}

function FlipCard({ service, index }) {
  const { t } = useTranslation();
  const [flipped, setFlipped] = useState(false);
  const frontRef = useRef(null);
  const backRef  = useRef(null);
  const [height, setHeight] = useState(160);
  const Icon  = service.icon;
  const color = CARD_COLORS[resolveColor(service.iconColor)];

  // Calcula la altura mínima necesaria para que tanto frente como reverso quepan
  useEffect(() => {
    const frontH = frontRef.current?.scrollHeight ?? 0;
    const backH  = backRef.current?.scrollHeight  ?? 0;
    setHeight(Math.max(frontH, backH, 160));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group w-full cursor-pointer select-none [perspective:1000px]"
      style={{ height }}
      onClick={() => setFlipped(f => !f)}
      role="button"
      aria-pressed={flipped}
      tabIndex={0}
      onKeyDown={e => (e.key === "Enter" || e.key === " ") && setFlipped(f => !f)}
    >
      {/* Contenedor que rota — tap en mobile, hover en desktop */}
      <div
        className={`relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]
          ${flipped ? "[transform:rotateY(180deg)]" : ""}
          md:group-hover:[transform:rotateY(180deg)]
        `}
      >
        {/* ── FRENTE ─────────────────────────────────────────── */}
        <div
          ref={frontRef}
          className={`absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl border bg-[var(--bg-surface)] p-4 [backface-visibility:hidden] transition-shadow duration-300 ${color.border}`}
          style={{ boxShadow: `0 4px 24px ${color.glow}` }}
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-30"
            style={{ background: `radial-gradient(ellipse 70% 60% at 50% 40%, ${color.glow}, transparent)` }}
          />
          <div className={`relative z-10 ${color.icon}`}>
            <Icon size={36} />
          </div>
          <h3 className="relative z-10 text-center text-sm font-bold leading-tight text-[var(--text-primary)] md:text-base">
            {t(service.title)}
          </h3>
          <span
            className="absolute bottom-2 right-3 text-[9px] font-medium uppercase tracking-wider opacity-40 md:hidden"
            style={{ color: color.accent }}
          >
            Toca para ver más
          </span>
        </div>

        {/* ── REVERSO ────────────────────────────────────────── */}
        <div
          ref={backRef}
          className={`absolute inset-0 flex flex-col items-start justify-center rounded-2xl border bg-gradient-to-br p-4 [backface-visibility:hidden] [transform:rotateY(180deg)] ${color.back} ${color.border}`}
        >
          <div
            className="pointer-events-none absolute right-3 top-3 opacity-15"
            style={{ color: color.accent }}
          >
            <Icon size={40} />
          </div>
          <h4
            className="mb-2 text-[10px] font-bold uppercase tracking-wider"
            style={{ color: color.accent }}
          >
            {t(service.title)}
          </h4>
          <p className="relative z-10 text-[11px] leading-relaxed text-white/85">
            {t(service.description)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function ServicesGrid({ services }) {
  const { t } = useTranslation();

  return (
    <div className="flex w-full flex-col items-center">
      {/* Título */}
      <div className="mb-8 text-center md:mb-10">
        <h2 className="bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-[1.65rem] font-extrabold text-transparent md:text-[2.05rem]">
          {t("services.section_title")}
        </h2>
        <p className="mt-2 text-sm text-[var(--text-muted)] md:text-base">
          {t("services.section_hint")}
        </p>
      </div>

      {/* Grid: 1 col mobile → 2 col tablet → 3 col desktop, última card centrada si es 5 */}
      <div className="grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, index) => (
          <div key={service.id}>
            <FlipCard service={service} index={index} />
          </div>
        ))}
      </div>
    </div>
  );
}
