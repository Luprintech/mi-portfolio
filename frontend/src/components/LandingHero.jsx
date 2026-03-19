import { motion, useReducedMotion } from "framer-motion";
import { Download, Github, Linkedin, Youtube } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Typewriter } from "react-simple-typewriter";
import portraitImage from "../assets/mifoto-optimized.jpg";

/**
 * LandingHero — Full-width hero with typewriter title
 *
 * Centered layout with animated gradient title cycling through roles.
 * Background: Animated gradient blobs.
 *
 * Fully responsive, accessibility: respects prefers-reduced-motion
 */
export default function LandingHero({ id, className = "" }) {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();

  const roles = t("landing.roles", { returnObjects: true });

  return (
    <div id={id} className={`hero-section relative flex h-full w-full items-center justify-center overflow-hidden ${className}`.trim()}>
      <div className="relative z-10 mx-auto grid h-full w-full max-w-5xl items-center gap-8 py-6 md:gap-10 md:py-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.82fr)] lg:gap-12">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, x: -24 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative flex flex-col items-start text-left"
        >
          <div className="mb-5 min-h-[2.8rem] text-xl font-bold text-[var(--hero-typewriter-color)] drop-shadow-[0_4px_18px_rgba(255,255,255,0.12)] xs:text-2xl md:min-h-[3.6rem] md:text-3xl">
            <Typewriter
              words={roles}
              loop={true}
              cursor
              cursorStyle="|"
              typeSpeed={70}
              deleteSpeed={50}
              delaySpeed={2000}
            />
          </div>

          <h1 className="max-w-lg bg-gradient-to-r from-fuchsia-400 via-violet-300 to-cyan-300 bg-clip-text text-4xl font-black leading-[0.98] text-transparent xs:text-5xl md:text-6xl lg:text-[4.5rem]">
            {t("hero.greeting")}
          </h1>

          <p className="mt-7 text-[0.98rem] leading-8 text-[var(--text-secondary)] md:text-[1.06rem]">
            {t("hero.description")}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3 md:mt-9">
            <a
              href="/CV_Guadalupe_Cano.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-500 px-5 py-2.5 font-semibold text-white shadow-[0_18px_45px_rgba(168,85,247,0.24)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(34,211,238,0.24)]"
            >
              <Download className="h-4 w-4" />
              {t("hero.cv")}
            </a>

            {[
              { href: "https://www.linkedin.com/in/guadalupe-cano-moyano/", label: "LinkedIn", Icon: Linkedin },
              { href: "https://github.com/Luprintech", label: "GitHub", Icon: Github },
              { href: "https://www.youtube.com/@Luprintech", label: "YouTube", Icon: Youtube },
            ].map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-color)] bg-[color-mix(in_srgb,var(--bg-elevated)_72%,transparent)] text-[var(--text-primary)] shadow-[var(--shadow-sm)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent-secondary)]/40 hover:bg-[var(--accent-secondary-dim)] hover:text-[var(--accent-secondary)]"
              >
                <Icon className="h-4.5 w-4.5" />
              </a>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, x: 24, scale: 0.96 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: shouldReduceMotion ? 0 : 0.08 }}
          className="relative mx-auto flex w-full max-w-[260px] justify-center sm:max-w-[300px] lg:max-w-[360px]"
        >
          <motion.div
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    y: [0, -10, 0],
                    rotate: [0, 1.1, 0],
                  }
            }
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-full"
          >
            <div className="pointer-events-none absolute -inset-8 rounded-[3rem] bg-[radial-gradient(circle,_rgba(34,211,238,0.16),_transparent_58%)] blur-3xl" />
            <div className="pointer-events-none absolute -left-6 top-8 h-20 w-20 rounded-full border border-white/10 bg-fuchsia-400/18 blur-2xl" />
            <div className="pointer-events-none absolute -right-5 bottom-12 h-24 w-24 rounded-full border border-white/10 bg-cyan-400/14 blur-2xl" />
            <div className="pointer-events-none absolute inset-x-8 top-0 h-14 rounded-full bg-white/10 blur-2xl" />

            <div className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,rgba(232,121,249,0.72)_0%,rgba(168,85,247,0.46)_28%,rgba(34,211,238,0.38)_68%,rgba(255,255,255,0.22)_100%)] p-[2px] shadow-[0_28px_72px_rgba(2,6,23,0.34)]">
              <div className="absolute inset-0 rounded-[2rem] bg-[conic-gradient(from_180deg_at_50%_50%,rgba(255,255,255,0.18),rgba(34,211,238,0.12),rgba(232,121,249,0.16),rgba(255,255,255,0.18))] opacity-70" />
              <div className="relative overflow-hidden rounded-[calc(2rem-2px)] border border-[var(--border-color)] bg-[color-mix(in_srgb,var(--bg-elevated)_78%,transparent)] p-2.5 backdrop-blur-2xl">
                <div
                  className="absolute inset-0 opacity-80"
                  style={{
                    background:
                      "linear-gradient(140deg, color-mix(in srgb, white 12%, transparent), transparent 38%, color-mix(in srgb, var(--accent-secondary) 10%, transparent) 100%)",
                  }}
                />
                <div className="relative overflow-hidden rounded-[1.45rem] border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--bg-surface)_86%,transparent)]">
                <div
                  className="absolute inset-x-0 top-0 h-20"
                  style={{ background: "linear-gradient(180deg, color-mix(in srgb, white 20%, transparent), transparent)" }}
                />
                <img
                  src={portraitImage}
                  alt="Retrato de Guadalupe Cano"
                  className="h-[280px] w-full object-cover object-center sm:h-[330px] lg:h-[410px]"
                  loading="eager"
                  fetchPriority="high"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--bg-overlay) 14%, transparent) 52%, color-mix(in srgb, var(--bg-overlay) 88%, transparent) 100%)",
                  }}
                />
                <div className="absolute inset-x-4 bottom-4 rounded-[1.15rem] border border-[var(--border-color)] bg-[color-mix(in_srgb,var(--bg-elevated)_74%,transparent)] px-3.5 py-3 shadow-[var(--shadow-md)] backdrop-blur-xl">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-cyan-300">
                    {t("hero.photo_badge")}
                  </p>
                  <p className="mt-1.5 text-xs leading-5 text-[var(--text-primary)] opacity-90 sm:text-sm">
                    {t("hero.subtitle")}
                  </p>
                </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
