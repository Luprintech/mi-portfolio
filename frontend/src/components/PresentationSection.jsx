import { useTranslation } from "react-i18next";
import { motion as Motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import miFoto from "../assets/pc-optimized.jpg";
import TerminalWidget from "./TerminalWidget";

const BADGE_KEYS = [
  { key: "badge_fullstack", color: "cyan" },
  { key: "badge_self", color: "violet" },
  { key: "badge_ai", color: "emerald" },
  { key: "badge_security", color: "amber" },
  { key: "badge_wordpress", color: "blue" },
];

const BADGE_STYLES = {
  cyan:   "bg-[var(--accent-secondary-dim)] text-[var(--accent-secondary)] border-[var(--accent-secondary)]/30",
  fuchsia:"bg-[var(--accent-primary-dim)] text-[var(--accent-primary)] border-[var(--accent-primary)]/30",
  violet: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  emerald:"bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  amber:  "bg-amber-500/10 text-amber-400 border-amber-500/20",
  blue:   "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

/**
 * PresentationSection — content only, no background layers.
 * Background is rendered by PresentationSectionBg as a sibling of
 * SectionViewport in Home.jsx (same pattern as the hero section).
 */
export default function PresentationSection({ id, className = "" }) {
  const { t } = useTranslation();

  return (
    <div id={id} className={`relative z-10 flex h-full w-full items-center ${className}`.trim()}>
        <div className="mx-auto flex h-full w-full max-w-5xl flex-col justify-center gap-5 py-4 md:gap-6 md:py-6">

        {/* ── Top block: photo + text ─────────────────────────────── */}
        <Motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center gap-10 md:flex-row md:items-center"
        >
          <div className="shrink-0 flex justify-center md:justify-start">
            <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} scale={1.03} transitionSpeed={2000}>
              <div className="rounded-full bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400 p-[3px] shadow-[0_0_30px_rgba(168,85,247,0.35)] ring-2 ring-[var(--accent-primary)]/40">
                <img
                  src={miFoto}
                  alt={t("about.photo_alt")}
                  width="176"
                  height="176"
                  loading="lazy"
                  decoding="async"
                  className="h-36 w-36 rounded-full bg-[var(--bg-surface)] object-cover md:h-44 md:w-44"
                />
              </div>
            </Tilt>
          </div>

          <div className="flex-1 space-y-5 text-left">
            <h2 className="typo-title bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-3xl font-extrabold leading-tight tracking-tight text-transparent md:text-4xl">
              {t("about.tagline")}
            </h2>

            <p className="typo-body text-base leading-relaxed text-[var(--text-secondary)] md:text-lg text-justify">
              {t("about.summary")}
            </p>

            <div className="flex flex-wrap gap-2 pt-1" role="list" aria-label={t("about.tagline")}>
              {BADGE_KEYS.map(({ key, color }) => (
                <span
                  key={key}
                  role="listitem"
                  className={`typo-label rounded-full border px-3 py-1 text-sm font-medium ${BADGE_STYLES[color]}`}
                >
                  {t(`about.${key}`)}
                </span>
              ))}
            </div>
          </div>
        </Motion.div>

        {/* ── Terminal interactiva ─────────────────────────────── */}
        <TerminalWidget />

      </div>
    </div>
  );
}
