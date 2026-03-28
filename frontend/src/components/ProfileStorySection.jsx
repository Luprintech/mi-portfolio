import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Eye, Zap, BookOpen } from "lucide-react";

// ─── Datos ────────────────────────────────────────────────────────────────────

const STORY_STEPS = [
  { year: "2011", color: "from-fuchsia-500 to-violet-500", titleKey: "story_block_1_title", bodyKey: "story_short_1" },
  { year: "2015", color: "from-violet-500 to-cyan-500",    titleKey: "story_block_2_title", bodyKey: "story_short_2" },
  { year: "Hoy",  color: "from-cyan-400  to-emerald-400",  titleKey: "story_block_3_title", bodyKey: "story_short_3" },
];

const DIFF_POINTS = [
  { n: "01", Icon: Eye,      color: "text-cyan-400",    glow: "rgba(34,211,238,0.15)",   titleKey: "diff_detail_title",     bodyKey: "diff_detail"      },
  { n: "02", Icon: Zap,      color: "text-violet-400",  glow: "rgba(139,92,246,0.15)",   titleKey: "diff_selflearner_title", bodyKey: "diff_selflearner" },
  { n: "03", Icon: BookOpen, color: "text-fuchsia-400", glow: "rgba(232,121,249,0.15)",  titleKey: "diff_pedagogy_title",   bodyKey: "diff_pedagogy"    },
];

// ─── Animaciones ──────────────────────────────────────────────────────────────

const fadeUp = {
  hidden:  { opacity: 0, y: 22 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: "easeOut", delay: i * 0.1 },
  }),
};

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ProfileStorySection({ id, className = "" }) {
  const { t } = useTranslation();

  return (
    <div
      id={id}
      className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className}`.trim()}
    >
      {/* Fondo ambiental */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_20%_50%,rgba(232,121,249,0.07),transparent_65%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_80%_55%,rgba(34,211,238,0.07),transparent_65%)]" />

        <div className="relative z-10 mx-auto flex h-full w-full max-w-[1060px] flex-col justify-center gap-6 py-6 md:gap-10">

        {/* ── Frase apertura ───────────────────────────────────────── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center"
        >
          <style>{`
            @keyframes shimmerText {
              0%   { background-position: 200% center; }
              100% { background-position: -200% center; }
            }
          `}</style>
          <p
            className="mx-auto max-w-2xl text-lg font-semibold leading-snug md:text-xl lg:text-2xl"
            style={{
              backgroundImage: "linear-gradient(110deg,#e879f9 0%,#22d3ee 38%,rgba(255,255,255,0.9) 50%,#22d3ee 62%,#e879f9 100%)",
              backgroundSize: "200% auto",
              animation: "shimmerText 4s linear infinite",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            "{t("about.story_p7")}"
          </p>
        </motion.div>

        {/* ── Dos columnas ─────────────────────────────────────────── */}
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">

          {/* ── Columna izquierda: Mi historia (timeline) ─────────── */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
          >
            {/* Cabecera */}
            <div className="mb-5">
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--accent-primary)]">
                {t("about.story_intro_label")}
              </span>
              <h2 className="mt-1.5 text-xl font-extrabold leading-tight text-[var(--text-primary)] md:text-2xl">
                {t("about.story_lead")}
              </h2>
            </div>

            {/* Timeline */}
            <div className="relative flex flex-col gap-0">
              {/* Línea vertical */}
              <div className="absolute left-[17px] top-4 bottom-4 w-px bg-gradient-to-b from-fuchsia-500/40 via-violet-500/30 to-amber-400/20" />

              {STORY_STEPS.map(({ year, color, titleKey, bodyKey, upcoming }, i) => (
                <motion.div
                  key={titleKey}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i + 1}
                  className="relative flex gap-4 pb-5 last:pb-0"
                >
                  {/* Nodo */}
                  <div className="relative z-10 shrink-0">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${color} ${upcoming ? "opacity-60 ring-2 ring-dashed ring-amber-400/50" : "shadow-[0_0_10px_rgba(139,92,246,0.25)]"}`}>
                      <span className="text-[9px] font-black text-white leading-none">{year}</span>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className={`flex-1 pt-1.5 ${upcoming ? "opacity-70" : ""}`}>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">
                        {t(`about.${titleKey}`)}
                      </h3>
                      {upcoming && (
                        <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-400">
                          {t("about.story_upcoming")}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)] text-justify">
                      {t(`about.${bodyKey}`)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── Columna derecha: Qué me diferencia (numerado) ──────── */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={1}
          >
            {/* Cabecera */}
            <div className="mb-7">
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--accent-secondary)]">
                {t("about.tab_diff")}
              </span>
              <h2 className="mt-2 text-2xl font-extrabold leading-tight text-[var(--text-primary)] md:text-3xl">
                {t("about.diff_panel_title")}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)] md:text-base">
                {t("about.diff_panel_subtitle")}
              </p>
            </div>

            {/* Bloques numerados */}
            <div className="flex flex-col gap-4">
              {DIFF_POINTS.map(({ n, Icon, color, glow, titleKey, bodyKey }, i) => (
                <motion.div
                  key={titleKey}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i + 2}
                  className="group relative flex gap-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--border-color)]/80"
                  style={{
                    "--glow": glow,
                  }}
                >
                  {/* Halo en hover */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ boxShadow: `inset 0 0 0 1px ${glow}, 0 0 24px ${glow}` }}
                  />

                  {/* Número + icono */}
                  <div className="shrink-0 flex flex-col items-center gap-1 pt-0.5">
                    <span className="text-2xl font-black leading-none text-[var(--border-color)] group-hover:text-[var(--text-muted)] transition-colors md:text-3xl">
                      {n}
                    </span>
                    <Icon className={`h-5 w-5 ${color}`} strokeWidth={1.8} />
                  </div>

                  {/* Texto */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-base font-bold ${color} md:text-lg`}>
                      {t(`about.${titleKey}`)}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)]">
                      {t(`about.${bodyKey}`)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
