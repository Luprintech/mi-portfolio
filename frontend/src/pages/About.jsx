import { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import Tilt from "react-parallax-tilt";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Rocket, Calendar, Layers, GraduationCap } from "lucide-react";
import { FaBolt, FaPlug, FaDesktop, FaRobot, FaSyncAlt } from "react-icons/fa";
import { MdSearch, MdSchool, MdAutorenew } from "react-icons/md";
import { BsBroadcast } from "react-icons/bs";
import mifoto from "../assets/pc.jpg";
import Timeline from "../components/Timeline.jsx";
import TechSkills from "../components/TechSkills.jsx";

/* ─── CONSTANTES ─── */
const TABS = ["tab_tech", "tab_story", "tab_diff"];

const BADGE_KEYS = [
  { key: "badge_fullstack", color: "cyan"    },
  { key: "badge_self",      color: "violet"  },
  { key: "badge_infra",     color: "fuchsia" },
  { key: "badge_ai",        color: "emerald" },
];

const BADGE_STYLES = {
  cyan:    "bg-[var(--accent-secondary-dim)] text-[var(--accent-secondary)] border-[var(--accent-secondary)]/30",
  fuchsia: "bg-[var(--accent-primary-dim)]   text-[var(--accent-primary)]   border-[var(--accent-primary)]/30",
  violet:  "bg-violet-500/10                 text-violet-400                border-violet-500/20",
  emerald: "bg-emerald-500/10               text-emerald-400               border-emerald-500/20",
};

const STATS_CONFIG = [
  { Icon: Rocket,       iconColor: "text-[var(--accent-primary)]",   valKey: "stat1_value", labelKey: "stat1_label" },
  { Icon: Calendar,     iconColor: "text-[var(--accent-secondary)]", valKey: "stat2_value", labelKey: "stat2_label" },
  { Icon: Layers,       iconColor: "text-[var(--accent-primary)]",   valKey: "stat3_value", labelKey: "stat3_label" },
  { Icon: GraduationCap,iconColor: "text-[var(--accent-secondary)]", valKey: "stat4_value", labelKey: "stat4_label" },
];

const DIFF_ITEMS = [
  { Icon: MdSearch,    iconColor: "text-[var(--accent-primary)]",   key: "diff_detail"      },
  { Icon: BsBroadcast, iconColor: "text-[var(--accent-secondary)]", key: "diff_selflearner" },
  { Icon: MdSchool,    iconColor: "text-[var(--accent-primary)]",   key: "diff_pedagogy"    },
  { Icon: FaRobot,     iconColor: "text-[var(--accent-secondary)]", key: "diff_ai"          },
  { Icon: MdAutorenew, iconColor: "text-[var(--accent-primary)]",   key: "diff_n8n"         },
];

const TECH_KEYS = ["tech_1", "tech_2", "tech_3", "tech_4", "tech_5"];
const TECH_ICONS = [FaBolt, FaPlug, FaDesktop, FaRobot, FaSyncAlt];
const TECH_ICON_COLORS = [
  "text-[var(--accent-primary)]",
  "text-[var(--accent-secondary)]",
  "text-[var(--accent-primary)]",
  "text-[var(--accent-secondary)]",
  "text-[var(--accent-primary)]",
];

/* ─── COMPONENT ─── */
export default function SobreMi() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  // Acordeón mobile: null = todos cerrados, número = el abierto
  const [openAccordion, setOpenAccordion] = useState(null);

  return (
    <main
      className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] relative overflow-hidden"
      id="sobre-mi"
    >
      {/* Ruido ambiental */}
      <div className="absolute inset-0 bg-noise opacity-[0.02] mix-blend-overlay pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-violet-900/10 via-transparent to-transparent pointer-events-none z-0" />

      <div className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 pt-32 pb-24 space-y-20">

        {/* ══════════════════════════════════════════
            BLOQUE 1 — HERO PERSONAL
        ══════════════════════════════════════════ */}
        <section aria-label="Presentación personal">
          <Motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col md:flex-row items-center md:items-start gap-10"
          >
            {/* Foto */}
            <div className="shrink-0 flex justify-center md:justify-start">
              <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} scale={1.03} transitionSpeed={2000}>
                <div className="p-[3px] bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400 rounded-full shadow-[0_0_30px_rgba(168,85,247,0.35)] ring-2 ring-[var(--accent-primary)]/40">
                  <img
                    src={mifoto}
                    alt="Guadalupe Cano"
                    className="w-36 h-36 md:w-44 md:h-44 rounded-full object-cover bg-[var(--bg-surface)]"
                  />
                </div>
              </Tilt>
            </div>

            {/* Texto */}
            <div className="flex-1 space-y-5 text-left">
              <h1 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-cyan-400">
                {t("about.tagline")}
              </h1>

              <p className="text-[var(--text-secondary)] text-base md:text-lg leading-relaxed max-w-xl text-justify">
                {t("about.summary")}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 pt-1" role="list" aria-label="Especialidades">
                {BADGE_KEYS.map(({ key, color }) => (
                  <span
                    key={key}
                    role="listitem"
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${BADGE_STYLES[color]}`}
                  >
                    {t(`about.${key}`)}
                  </span>
                ))}
              </div>
            </div>
          </Motion.div>
        </section>

        {/* ══════════════════════════════════════════
            BLOQUE 2 — STATS VISUALES
        ══════════════════════════════════════════ */}
        <section aria-label="Estadísticas">
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {STATS_CONFIG.map(({ Icon, iconColor, valKey, labelKey }, i) => (
              <Motion.div
                key={valKey}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-5 flex flex-col items-center text-center gap-2 shadow-[var(--card-shadow)] hover:shadow-[var(--card-hover-shadow)] hover:-translate-y-1 transition-all duration-300"
              >
                <Icon size={36} className={`${iconColor}`} aria-hidden="true" />
                <span className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-400 leading-none">
                  {t(`about.${valKey}`)}
                </span>
                <span className="text-xs text-[var(--text-muted)] font-medium leading-tight">
                  {t(`about.${labelKey}`)}
                </span>
              </Motion.div>
            ))}
          </Motion.div>
        </section>

        {/* ══════════════════════════════════════════
            BLOQUE 3 — TABS / ACORDEÓN
        ══════════════════════════════════════════ */}
        <section aria-label="Secciones de perfil">
          <Motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* ─── TABS desktop (md+) ─── */}
            <div className="hidden md:block">
              {/* Tab selector */}
              <div
                className="flex gap-1 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-1 mb-6"
                role="tablist"
                aria-label="Secciones de perfil"
              >
                {TABS.map((tabKey, i) => (
                  <button
                    key={tabKey}
                    role="tab"
                    id={`tab-${i}`}
                    aria-selected={activeTab === i}
                    aria-controls={`tabpanel-${i}`}
                    onClick={() => setActiveTab(i)}
                    className={`
                      relative flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-250 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-secondary)]
                      ${activeTab === i
                        ? "text-[var(--text-primary)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                      }
                    `}
                  >
                    {activeTab === i && (
                      <Motion.span
                        layoutId="tab-indicator"
                        className="absolute inset-0 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-lg shadow-[var(--shadow-sm)]"
                        style={{ zIndex: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{t(`about.${tabKey}`)}</span>
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div
                id={`tabpanel-${activeTab}`}
                role="tabpanel"
                aria-labelledby={`tab-${activeTab}`}
                className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-8 min-h-[260px] shadow-[var(--card-shadow)]"
              >
                <AnimatePresence mode="wait">
                  <Motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <TabContent index={activeTab} t={t} />
                  </Motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* ─── ACORDEÓN mobile (< md) ─── */}
            <div className="flex flex-col gap-3 md:hidden">
              {TABS.map((tabKey, i) => (
                <div
                  key={tabKey}
                  className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-[var(--card-shadow)]"
                >
                  <button
                    onClick={() => setOpenAccordion(openAccordion === i ? null : i)}
                    aria-expanded={openAccordion === i}
                    className="w-full flex items-center justify-between px-5 py-4 font-semibold text-left text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-secondary)]"
                  >
                    <span>{t(`about.${tabKey}`)}</span>
                    <Motion.span
                      animate={{ rotate: openAccordion === i ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-[var(--text-muted)] shrink-0"
                      aria-hidden="true"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </Motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {openAccordion === i && (
                      <Motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 border-t border-[var(--border-subtle)]">
                          <div className="pt-4">
                            <TabContent index={i} t={t} />
                          </div>
                        </div>
                      </Motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </Motion.div>
        </section>

        {/* ══════════════════════════════════════════
            BLOQUE 3.5 — HABILIDADES TÉCNICAS
        ══════════════════════════════════════════ */}
        <section aria-label="Habilidades técnicas">
          <TechSkills />
        </section>



        {/* ══════════════════════════════════════════
            BLOQUE 4 — TIMELINE
        ══════════════════════════════════════════ */}
        <section aria-label="Evolución profesional">
          <Timeline />
        </section>

        {/* ══════════════════════════════════════════
            BLOQUE 6 — CTA FINAL
        ══════════════════════════════════════════ */}
        <section aria-label="Llamada a la acción">
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-8 md:p-12 text-center shadow-[var(--card-shadow)] relative overflow-hidden"
          >
            {/* Glow decorativo */}
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400" />

            <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-3 relative z-10">
              {t("about.cta_title")}
            </h2>
            <p className="text-[var(--text-secondary)] mb-8 max-w-lg mx-auto relative z-10">
              {t("about.cta_desc")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Link
                to="/contacto"
                className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                {t("about.cta_contact")}
              </Link>
              <Link
                to="/portfolio"
                className="px-8 py-3 rounded-xl font-semibold text-[var(--accent-secondary)] border border-[var(--accent-secondary)]/50 bg-[var(--bg-elevated)] hover:bg-[var(--accent-secondary-dim)] transition-all duration-300 hover:-translate-y-1"
              >
                {t("about.cta_projects")}
              </Link>
            </div>
          </Motion.div>
        </section>
      </div>
    </main>
  );
}

/* ─────────────────────────────────────────────
   TabContent — renders the correct content
   for each tab index (0, 1, 2)
───────────────────────────────────────────── */
function TabContent({ index, t }) {
  if (index === 0) return <TechProfile t={t} />;
  if (index === 1) return <MyStory t={t} />;
  return <WhatDiffers t={t} />;
}

function TechProfile({ t }) {
  return (
    <div>
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-5 flex items-center gap-2">
        <span className="w-1 h-5 bg-gradient-to-b from-fuchsia-500 to-cyan-400 rounded-full" aria-hidden="true" />
        {t("about.tech_title")}
      </h3>
      <ul className="space-y-3">
        {TECH_KEYS.map((key, i) => {
          const Icon = TECH_ICONS[i];
          return (
            <li key={key} className="flex items-start gap-3">
              <Icon
                size={20}
                className={`${TECH_ICON_COLORS[i]} mt-0.5 shrink-0`}
                aria-hidden="true"
              />
              <span className="text-[var(--text-secondary)] text-sm leading-relaxed">
                {t(`about.${key}`)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MyStory({ t }) {
  return (
    <div className="space-y-4">
      {["story_p1", "story_p2", "story_p3", "story_p4", "story_p5", "story_p6", "story_p7"].map((key) => (
        <p key={key} className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed text-justify">
          {t(`about.${key}`)}
        </p>
      ))}
    </div>
  );
}

function WhatDiffers({ t }) {
  return (
    <ul className="space-y-4">
      {DIFF_ITEMS.map((item) => {
        const DiffIcon = item.Icon;
        return (
          <li key={item.key} className="flex items-start gap-4">
            <span
              className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
              aria-hidden="true"
            >
              <DiffIcon size={20} className={item.iconColor} />
            </span>
            <span className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed pt-1 text-justify">
              {t(`about.${item.key}`)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
