import { motion as Motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import ProjectCard from "../../components/ProjectCard";
import { useProjects } from "../../hooks/useProjects";

export default function PortfolioDesarrolloWeb() {
  const { t } = useTranslation();
  const { projects, loading } = useProjects();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] py-28 px-6 md:px-16 relative overflow-x-hidden selection:bg-violet-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/10 via-[var(--bg-primary)] to-[var(--bg-primary)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-noise opacity-[0.02] mix-blend-overlay pointer-events-none z-0" />

      {/* CABECERA */}
      <Motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-6xl mx-auto text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-cyan-400">
          {t('portfolio.web_title')}
        </h1>
        <p className="text-[var(--text-muted)] text-lg max-w-3xl mx-auto leading-relaxed">
          {t('portfolio.web_desc')}
        </p>
      </Motion.div>

      {/* GRID DE PROYECTOS */}
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto relative z-10"
      >
        {loading ? (
          <p className="text-[var(--text-muted)] text-center col-span-2">Cargando proyectos...</p>
        ) : (
          projects.map((proyecto, index) => (
            <ProjectCard key={proyecto.id} project={proyecto} index={index} />
          ))
        )}
      </Motion.div>

      {!loading && projects.length === 0 && (
        <div className="text-center text-[var(--text-muted)] mt-20">
          <p className="text-xl">{t('portfolio.web_empty')}</p>
        </div>
      )}
    </div>
  );
}
