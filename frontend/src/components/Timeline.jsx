import { motion as Motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Bot, Cpu, Globe, GraduationCap, ShieldCheck } from "lucide-react";

const TIMELINE_ICONS = [Cpu, GraduationCap, Globe, Bot, ShieldCheck];
const TIMELINE_LINE =
  "linear-gradient(180deg, transparent 0%, rgba(34,211,238,0.28) 10%, rgba(232,121,249,0.24) 50%, rgba(34,211,238,0.28) 90%, transparent 100%)";
const timelineListVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.16,
      delayChildren: 0.1,
    },
  },
};
const timelineItemVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.48,
      ease: "easeOut",
    },
  },
};
const timelineDotVariants = {
  hidden: { opacity: 0, scale: 0.72 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.34,
      ease: "easeOut",
    },
  },
};

export default function Timeline() {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.resolvedLanguage || i18n.language || 'es';

  const events = [
    { year: "2005", title: t("timeline.e1_title"), desc: t("timeline.e1_desc") },
    { year: "2014", title: t("timeline.e2_title"), desc: t("timeline.e2_desc") },
    { year: "2026", title: t("timeline.e3_title"), desc: t("timeline.e3_desc") },
    { year: "2026", title: t("timeline.e4_title"), desc: t("timeline.e4_desc") },
    { year: "2026", title: t("timeline.e5_title"), desc: t("timeline.e5_desc") },
  ];

  return (
    <div key={currentLanguage} className="relative z-10 mx-auto flex w-full max-w-[1040px] flex-col justify-center">
      <Motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-6 text-center text-2xl font-bold bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent md:mb-8 md:text-3xl lg:text-[2rem]"
      >
        {t("timeline.title_main")}
      </Motion.h2>

      <div className="relative">
        <div
          className="pointer-events-none absolute bottom-2 left-5 top-2 w-px md:left-1/2 md:-translate-x-1/2"
          style={{ background: TIMELINE_LINE }}
        />

        <Motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.55 }}
          variants={timelineListVariants}
          className="flex flex-col gap-3 md:gap-2.5"
        >
          {events.map((event, index) => {
            const Icon = TIMELINE_ICONS[index];
            const isLeft = index % 2 === 0;

            return (
              <Motion.div
                key={`${event.year}-${event.title}`}
                variants={timelineItemVariants}
                className="relative grid grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-3 md:grid-cols-[minmax(0,1fr)_3.5rem_minmax(0,1fr)] md:gap-4"
              >
                <Motion.div
                  variants={timelineDotVariants}
                  className="relative z-10 col-start-1 row-start-1 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--accent-secondary)]/30 bg-[color-mix(in_srgb,var(--bg-elevated)_88%,transparent)] text-[var(--accent-secondary)] shadow-[0_0_18px_rgba(34,211,238,0.14)] md:col-start-2 md:h-11 md:w-11 md:justify-self-center"
                >
                  <div className="absolute inset-1 rounded-full bg-[var(--accent-secondary-dim)]" />
                  <Icon size={18} strokeWidth={2} className="relative z-10 md:h-5 md:w-5" />
                </Motion.div>

                <Motion.article
                  variants={{
                    hidden: { opacity: 0, x: isLeft ? -30 : 30, y: 12 },
                    visible: {
                      opacity: 1,
                      x: 0,
                      y: 0,
                      transition: {
                        duration: 0.5,
                        ease: "easeOut",
                      },
                    },
                  }}
                  whileHover={{
                    scale: 1.018,
                    boxShadow: "0 0 24px 4px rgba(34,211,238,0.18), 0 0 8px 1px rgba(139,92,246,0.14)",
                    borderColor: "rgba(34,211,238,0.38)",
                    transition: { duration: 0.22, ease: "easeOut" },
                  }}
                  className={`col-start-2 row-start-1 flex flex-col rounded-[1.25rem] border border-[var(--border-color)] bg-[color-mix(in_srgb,var(--bg-surface)_92%,transparent)] p-3 shadow-[var(--shadow-sm)] backdrop-blur-md md:max-w-[420px] md:p-3.5 ${
                    isLeft
                      ? "md:col-start-1 md:justify-self-end md:text-right"
                      : "md:col-start-3 md:justify-self-start"
                  }`}
                >
                  <div className={`mb-2 flex items-center gap-2 ${isLeft ? "md:flex-row-reverse" : ""}`}>
                    <span className="inline-flex rounded-full border border-[var(--accent-secondary)]/25 bg-[var(--accent-secondary-dim)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-secondary)]">
                      {event.year}
                    </span>
                    <h3 className="text-[13px] font-semibold leading-snug text-[var(--text-primary)] md:text-sm">
                      {event.title}
                    </h3>
                  </div>

                  <p className="text-[12px] leading-[1.42] text-[var(--text-secondary)] md:text-[12.5px]">
                    {event.desc}
                  </p>
                </Motion.article>
              </Motion.div>
            );
          })}
        </Motion.div>
      </div>
    </div>
  );
}
