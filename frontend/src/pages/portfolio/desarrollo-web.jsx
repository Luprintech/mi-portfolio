import { motion as Motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FaCode, FaWordpress } from "react-icons/fa";
import ProjectCard from "../../components/ProjectCard";
import { useProjects } from "../../hooks/useProjects";

export default function PortfolioDesarrolloWeb() {
  const { t } = useTranslation();
  const { codeProjects, cmsProjects, loading } = useProjects();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] py-28 px-6 md:px-16 relative overflow-x-hidden selection:bg-violet-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/10 via-[var(--bg-primary)] to-[var(--bg-primary)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-noise opacity-[0.02] mix-blend-overlay pointer-events-none z-0" />

      {/* CABECERA */}
      <Motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-6xl mx-auto text-center mb-20"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-cyan-400">
          {t('portfolio.web_title')}
        </h1>
        <p className="text-[var(--text-muted)] text-lg max-w-3xl mx-auto leading-relaxed">
          {t('portfolio.web_desc')}
        </p>
      </Motion.div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-20">

        {/* ── SECCIÓN 1: FULL STACK & CÓDIGO ── */}
        <section>
          <Motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-10"
          >
            <div className="p-2.5 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400">
              <FaCode size={20} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
                {t('portfolio.web_code_title')}
              </h2>
              <p className="text-sm text-[var(--text-muted)] mt-0.5">
                {t('portfolio.web_code_desc')}
              </p>
            </div>
          </Motion.div>

          {loading ? (
            <p className="text-[var(--text-muted)]">Cargando proyectos...</p>
          ) : codeProjects.length === 0 ? (
            <p className="text-[var(--text-muted)]">{t('portfolio.web_empty')}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {codeProjects.map((proyecto, index) => (
                <ProjectCard key={proyecto.id} project={proyecto} index={index} />
              ))}
            </div>
          )}
        </section>

        {/* Separador */}
        <div className="border-t border-[var(--border-subtle)]" />

        {/* ── SECCIÓN 2: WORDPRESS & CMS ── */}
        <section>
          <Motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-10"
          >
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <FaWordpress size={20} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
                {t('portfolio.web_cms_title')}
              </h2>
              <p className="text-sm text-[var(--text-muted)] mt-0.5">
                {t('portfolio.web_cms_desc')}
              </p>
            </div>
          </Motion.div>

          {loading ? (
            <p className="text-[var(--text-muted)]">Cargando proyectos...</p>
          ) : cmsProjects.length === 0 ? (
            <p className="text-[var(--text-muted)]">{t('portfolio.web_cms_empty')}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {cmsProjects.map((proyecto, index) => (
                <ProjectCard key={proyecto.id} project={proyecto} index={index} />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
