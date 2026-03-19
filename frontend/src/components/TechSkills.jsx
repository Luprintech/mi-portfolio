import { motion as Motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import { SiLaravel, SiPhp, SiNodedotjs, SiJavascript, SiReact, SiTailwindcss, SiVite, SiMysql, SiPostgresql, SiRedis, SiDocker, SiNginx, SiLinux, SiGit, SiWordpress } from "react-icons/si";

/* ─── SKILLS DATA ─── */
const SKILLS_DATA = [
  {
    titleKey: "skills.backend_title",
    descKey: "skills.backend_desc",
    icon: SiPhp,
    iconColor: "text-indigo-400",
    skills: [
      { name: "PHP", level: 85, years: "5+" },
      { name: "Laravel", level: 80, years: "4+" },
      { name: "REST APIs", level: 80, years: "4+" },
      { name: "Node.js", level: 60, years: "2+" },
    ],
  },
  {
    titleKey: "skills.frontend_title",
    descKey: "skills.frontend_desc",
    icon: SiReact,
    iconColor: "text-cyan-400",
    skills: [
      { name: "JavaScript", level: 85, years: "5+" },
      { name: "React", level: 70, years: "3+" },
      { name: "Tailwind", level: 75, years: "3+" },
      { name: "Vite", level: 70, years: "2+" },
    ],
  },
  {
    titleKey: "skills.database_title",
    descKey: "skills.database_desc",
    icon: SiMysql,
    iconColor: "text-emerald-400",
    skills: [
      { name: "MySQL", level: 85, years: "5+" },
      { name: "PostgreSQL", level: 70, years: "2+" },
      { name: "Redis", level: 60, years: "1+" },
    ],
  },
  {
    titleKey: "skills.devops_title",
    descKey: "skills.devops_desc",
    icon: SiDocker,
    iconColor: "text-sky-400",
    skills: [
      { name: "Docker", level: 80, years: "4+" },
      { name: "Nginx", level: 75, years: "3+" },
      { name: "Linux", level: 85, years: "6+" },
      { name: "Git", level: 80, years: "5+" },
    ],
  },
  {
    titleKey: "skills.ai_title",
    descKey: "skills.ai_desc",
    icon: Sparkles,
    iconColor: "text-violet-400",
    isAI: true,
    skills: [
      { name: "LLMs / APIs de IA", level: 75, years: "2+" },
      { name: "Modelos locales / ComfyUI", level: 75, years: "2+" },
      { name: "n8n automatización", level: 85, years: "3+" },
      { name: "IA en producción", level: 80, years: "3+" },
    ],
  },
  {
    titleKey: "skills.cms_title",
    descKey: "skills.cms_desc",
    icon: SiWordpress,
    iconColor: "text-blue-400",
    skills: [
      { name: "WordPress", level: 85, years: "5+" },
      { name: "Divi Builder", level: 80, years: "4+" },
      { name: "Landing Pages", level: 85, years: "5+" },
      { name: "Webs a medida", level: 80, years: "4+" },
    ],
  },
];

/* ─── SKILL CARD COMPONENT ─── */
function SkillCard({ titleKey, descKey, icon: Icon, iconColor, skills, index, isAI = false }) {
  const { t, i18n } = useTranslation();

  // Valores para IA con soporte multiidioma
  const aiTitles = { es: "IA & Automatización", en: "AI & Automation" };
  const aiDescs = { 
    es: "Integración de inteligencia artificial y automatización de procesos en producción",
    en: "Integration of AI models and automation workflows in production environments"
  };
  
  const title = isAI ? aiTitles[i18n.language] || aiTitles.es : t(titleKey);
  const desc = isAI ? aiDescs[i18n.language] || aiDescs.es : t(descKey);

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[color-mix(in_srgb,var(--bg-elevated)_86%,transparent)] px-4 py-3 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Glow decorativo */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-current/10 via-transparent to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform" />

      {/* Contenido */}
      <div className="relative z-10 space-y-3">
        {/* Header con ícono y título */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex-1">
            <h3 className="mb-1 text-base font-semibold text-[var(--text-primary)]">
              {title}
            </h3>
            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              {desc}
            </p>
          </div>
          <div className={`rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2 ${iconColor}`}>
            <Icon size={20} />
          </div>
        </div>

        {/* Skills list con barras de progreso */}
        <div className="space-y-2">
          {skills.map((skill, idx) => (
            <Motion.div
              key={skill.name}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 + idx * 0.05 }}
              className="space-y-0.5"
            >
              {/* Nombre */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {skill.name}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  {skill.years}
                </span>
              </div>

              {/* Barra de progreso */}
              <div className="relative h-1 overflow-hidden rounded-full bg-[var(--bg-surface)]">
                <Motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${skill.level}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 + idx * 0.05 }}
                  className="h-full rounded-full bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                />
              </div>
            </Motion.div>
          ))}
        </div>
      </div>
    </Motion.div>
  );
}

/* ─── MAIN COMPONENT ─── */
export default function TechSkills({ id, className = "" }) {
  const { t } = useTranslation();

  return (
    <Motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      id={id}
      className={`flex w-full flex-col items-center gap-4 ${className}`.trim()}
      aria-label={t("skills.title")}
    >
      {/* Header */}
      <div className="mb-1 w-full text-center">
        <h2 className="bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-3xl font-extrabold text-transparent md:text-4xl">
          {t("skills.title")}
        </h2>
        <p className="mx-auto max-w-2xl text-sm text-[var(--text-muted)] md:text-base">
          {t("skills.description")}
        </p>
      </div>

      {/* Grid - 3x3 perfectamente equilibrado */}
      <div className="grid w-full grid-cols-1 justify-items-center gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SKILLS_DATA.map((skillGroup, index) => (
          <SkillCard key={skillGroup.titleKey} {...skillGroup} index={index} />
        ))}
      </div>
    </Motion.div>
  );
}
