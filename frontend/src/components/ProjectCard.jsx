import { motion } from "framer-motion";
import { FaExternalLinkAlt, FaGithub, FaGlobe } from "react-icons/fa";
import { useTranslation } from "react-i18next";

/**
 * Componente profesional para mostrar tarjetas de proyectos web
 * Diseñado según principios de jerarquía visual y ritmo
 * @param {Object} project - Proyecto a mostrar
 * @param {number} index - Índice para animación escalonada
 */
export default function ProjectCard({ project, index = 0 }) {
  const { t } = useTranslation();
  const hasMultipleLinks = Array.isArray(project.links);
  
  const getIcon = (type) => {
    switch (type) {
      case "github":
        return <FaGithub className="text-sm" />;
      case "web":
        return <FaGlobe className="text-sm" />;
      default:
        return <FaExternalLinkAlt className="text-sm" />;
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.15,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -4 }}
      className={`group relative border rounded-2xl overflow-hidden shadow-xl backdrop-blur-md transition-all duration-500 flex flex-col min-h-[580px] h-full ${
        index % 2 === 0
          ? "bg-[#0b1220]/80 border-white/5 hover:shadow-[15px_0_30px_-15px_rgba(124,58,237,0.3)]"
          : "bg-[#111827]/80 border-white/10 hover:shadow-[-15px_0_30px_-15px_rgba(6,182,212,0.3)]"
      }`}
    >
      {/* Imagen */}
      <div className="relative h-[280px] bg-[#0f172a] overflow-hidden flex-shrink-0">
        <img
          src={project.imagen}
          alt={`Preview of project ${t(project.titulo)}`}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {/* Overlay gradient al hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Contenido */}
      <div className="flex flex-col flex-grow p-8">
        <div className="flex-grow">
          {/* Título */}
          <h3 className="text-2xl font-bold text-white mb-3 leading-tight group-hover:text-fuchsia-300 transition-colors duration-300">
            {t(project.titulo)}
          </h3>
          
          <p className="text-base text-gray-300 leading-relaxed mb-6">
            {t(project.shortDescription) || t(project.descripcion)}
          </p>
        </div>

        {/* Footer (siempre al fondo) */}
        <div className="mt-auto space-y-6">
          {/* Tech Stack - máximo 5 badges + contador */}
          <div className="flex flex-wrap gap-2">
            {project.tech.slice(0, 5).map((tech, i) => (
              <span
                key={i}
                className="inline-flex items-center px-3 py-1.5 bg-fuchsia-500/10 text-fuchsia-300 text-[13px] font-medium rounded-lg border border-fuchsia-500/20 hover:bg-fuchsia-500/20 transition-colors"
              >
                {tech}
              </span>
            ))}
            {project.tech.length > 5 && (
              <span className="inline-flex items-center px-3 py-1.5 bg-slate-800 text-gray-400 text-[13px] font-medium rounded-lg border border-slate-700">
                +{project.tech.length - 5}
              </span>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            {hasMultipleLinks ? (
              project.links.map((linkObj, idx) => (
                <a
                  key={idx}
                  href={linkObj.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    linkObj.type === "github"
                      ? "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600"
                      : "bg-gradient-to-r from-fuchsia-500 to-cyan-500 hover:from-fuchsia-400 hover:to-cyan-400 text-white shadow-lg shadow-fuchsia-500/25 hover:shadow-fuchsia-500/40"
                  }`}
                >
                  {t(linkObj.labelKey)}
                  {getIcon(linkObj.type)}
                </a>
              ))
            ) : (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-fuchsia-500 to-cyan-500 hover:from-fuchsia-400 hover:to-cyan-400 text-white font-semibold text-sm rounded-xl shadow-lg shadow-fuchsia-500/25 hover:shadow-fuchsia-500/40 transition-all duration-300"
              >
                {t('projects.view_app')} <FaExternalLinkAlt />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
