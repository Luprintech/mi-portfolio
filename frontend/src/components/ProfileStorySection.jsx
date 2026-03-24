import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Zap, BookOpen } from "lucide-react";

const TABS = [
  { id: "story", labelKey: "about.tab_story" },
  { id: "diff", labelKey: "about.tab_diff" },
];

const STORY_BLOCKS = [
  {
    titleKey: "story_block_1_title",
    bodyKeys: ["story_short_1"],
  },
  {
    titleKey: "story_block_2_title",
    bodyKeys: ["story_short_2"],
  },
  {
    titleKey: "story_block_3_title",
    bodyKeys: ["story_short_3"],
  },
];

const DIFF_POINTS = [
  { titleKey: "diff_detail_title", bodyKey: "diff_detail", fallback: "Atencion al detalle", Icon: Eye, color: "text-cyan-400" },
  { titleKey: "diff_selflearner_title", bodyKey: "diff_selflearner", fallback: "Aprendizaje autonomo", Icon: Zap, color: "text-violet-400" },
  { titleKey: "diff_pedagogy_title", bodyKey: "diff_pedagogy", fallback: "Vision pedagogica", Icon: BookOpen, color: "text-pink-400" },
];

const panelVariants = {
  enter: { opacity: 0, y: 12 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

function StoryPanel({ t }) {
  return (
    <motion.div
      initial="enter"
      animate="center"
      variants={{
        enter: { opacity: 0, y: 18 },
        center: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.45,
            ease: "easeOut",
            staggerChildren: 0.08,
          },
        },
      }}
      className="flex h-full flex-col gap-3.5"
    >
      <style>{`
        @keyframes shimmerText {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
      <motion.div
        variants={panelVariants}
        className="relative flex flex-1 flex-col justify-center overflow-hidden rounded-[24px] border border-[var(--border-color)] bg-[linear-gradient(135deg,rgba(232,121,249,0.08),rgba(34,211,238,0.05))] p-2 md:p-5 shadow-[var(--shadow-sm)]"
      >
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.16),transparent_70%)] blur-2xl" />
        <span className="inline-flex self-center rounded-full border border-[var(--accent-primary)]/25 bg-[var(--accent-primary-dim)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary)]">
          {t("about.story_intro_label")}
        </span>
        <h3 className="mt-2.5 w-full text-xl font-semibold leading-tight text-[var(--text-primary)] md:text-[1.6rem]">
          {t("about.story_lead")}
        </h3>
        <p className="mt-2.5 w-full text-[13px] leading-[1.5] text-[var(--text-secondary)] text-justify md:text-sm">
          {t("about.story_intro")}
        </p>
      </motion.div>

      <div className="grid gap-2 md:grid-cols-3">
        {STORY_BLOCKS.map(({ titleKey, bodyKeys }) => (
          <motion.article
            key={titleKey}
            variants={panelVariants}
            className="rounded-[22px] border border-[var(--border-color)] bg-[var(--bg-surface)]/90 p-3.5 shadow-[var(--shadow-sm)] backdrop-blur-sm md:p-4"
          >
            <h4 className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-secondary)] md:text-xs">
              {t(`about.${titleKey}`)}
            </h4>
            <div className="mt-2 space-y-1.5 text-[13px] leading-[1.5] text-[var(--text-secondary)] text-justify md:text-[13px]">
              {bodyKeys.map((key) => (
                <p key={key}>{t(`about.${key}`)}</p>
              ))}
            </div>
          </motion.article>
        ))}
      </div>

      <motion.blockquote
        variants={panelVariants}
        className="rounded-[24px] border border-[var(--accent-secondary)]/20 bg-[color-mix(in_srgb,var(--bg-elevated)_84%,transparent)] px-5 py-2.5 text-center text-[15px] font-medium leading-[1.4] text-[var(--text-primary)] shadow-[var(--shadow-md)] md:px-6 md:py-3 md:text-base"
      >
        <span 
          className="inline-block bg-clip-text text-transparent"
          style={{
            backgroundImage: "linear-gradient(110deg, #e879f9 0%, #22d3ee 40%, rgba(255,255,255,0.8) 50%, #22d3ee 60%, #e879f9 100%)",
            backgroundSize: "200% auto",
            animation: "shimmerText 3s linear infinite"
          }}
        >
          {t("about.story_p7")}
        </span>
      </motion.blockquote>
    </motion.div>
  );
}

function DiffPanel({ t }) {
  const [hasRevealed, setHasRevealed] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef}>
      <div className="mb-5 text-center md:mb-6">
        <h3 className="text-xl font-bold text-[var(--text-primary)] md:text-2xl md:text-[var(--accent-secondary)]">
          {t("about.diff_panel_title")}
        </h3>
        <p className="mt-2 text-sm text-[var(--text-secondary)] md:text-base">
          {t("about.diff_panel_subtitle")}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {DIFF_POINTS.map(({ titleKey, bodyKey, fallback, Icon, color }, index) => (
          <div
            key={bodyKey}
            className={`transition-all duration-700 ease-out ${
              hasRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: `${index * 150}ms` }}
          >
            <div
              className={`flex h-full flex-col items-center rounded-2xl border border-[var(--accent-secondary)]/20 bg-[var(--bg-surface)] p-5 text-center transition-all duration-300 ease-out hover:-translate-y-[6px] hover:scale-[1.02] hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(34,211,238,0.3),0_0_15px_rgba(232,121,249,0.3)] md:p-6`}
            >
              <div className={`mb-3 flex items-center justify-center ${color}`}>
                <Icon className="h-8 w-8" strokeWidth={1.8} />
              </div>
              <h3 className="mb-2 text-lg font-bold text-[var(--text-primary)]">
                {t(`about.${titleKey}`, fallback)}
              </h3>
              <p className="text-sm leading-snug text-[var(--text-secondary)] md:text-[15px] md:leading-relaxed">
                {t(`about.${bodyKey}`)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProfileStorySection({ id, className = "" }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("story");

  return (
    <div id={id} className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className}`.trim()}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-fuchsia-900/10 via-transparent to-transparent" />

      <div className="profile-story-shell relative z-10 flex h-full w-full max-w-[1000px] flex-col py-6 md:py-8">
        <div className="mb-2.5 flex w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-1 shadow-[var(--shadow-sm)] md:mb-3">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative min-w-0 flex-1 basis-1/2 overflow-hidden rounded-xl px-3 py-2.5 text-xs font-medium transition-colors duration-200 xs:px-4 xs:text-sm md:px-6 md:py-3 md:text-base
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-secondary)]
                  ${isActive
                    ? "text-[var(--text-primary)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                  }
                `}
              >
                {isActive && (
                  <motion.span
                    layoutId="profile-tab-bg"
                    className="absolute inset-0 rounded-lg border border-[var(--accent-secondary)]/40 bg-[var(--accent-secondary-dim)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 block overflow-hidden text-ellipsis whitespace-nowrap">{t(tab.labelKey)}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-1 min-h-0 flex-col w-full rounded-[28px] border border-[var(--border-color)] bg-[var(--bg-surface)] p-3 shadow-[var(--shadow-sm)] md:p-4 lg:p-[1.125rem]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              className="flex flex-1 min-h-0 flex-col w-full"
              variants={panelVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {activeTab === "story" && <StoryPanel t={t} />}
              {activeTab === "diff" && <DiffPanel t={t} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
