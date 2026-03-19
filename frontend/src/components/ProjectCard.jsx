import { motion } from 'framer-motion';

const ProjectCard = ({ project, index = 0, compact = false }) => {
  const imageClassName = compact
    ? "relative h-40 w-full overflow-hidden bg-[var(--bg-surface)] sm:h-44 lg:h-48"
    : "relative h-48 w-full overflow-hidden bg-[var(--bg-surface)] sm:h-52 lg:h-56";

  const contentClassName = compact
    ? "relative z-10 flex flex-grow flex-col p-4 sm:p-5"
    : "relative z-10 flex flex-grow flex-col p-5 sm:p-6";

  const titleClassName = compact
    ? "mb-2 text-lg font-bold tracking-tight text-[var(--text-primary)] sm:text-xl"
    : "mb-2 text-xl font-bold tracking-tight text-[var(--text-primary)] sm:text-[1.35rem]";

  const descriptionClassName = compact
    ? "mb-4 flex-grow text-left text-sm leading-relaxed text-[var(--text-secondary)]"
    : "mb-5 flex-grow text-left text-sm leading-relaxed text-[var(--text-secondary)]";

  const tagsWrapperClassName = compact ? "mb-5 flex flex-wrap gap-1.5" : "mb-6 flex flex-wrap gap-2";

  const tagClassName = compact
    ? "rounded-full border border-[var(--accent-secondary)]/20 bg-[var(--accent-secondary-dim)] px-2 py-0.5 text-[10px] font-medium text-[var(--accent-secondary)] sm:px-2.5"
    : "rounded-full border border-[var(--accent-secondary)]/20 bg-[var(--accent-secondary-dim)] px-2.5 py-1 text-[11px] font-medium text-[var(--accent-secondary)] sm:px-3";

  const buttonGroupClassName = compact ? "mt-auto flex flex-wrap gap-2" : "mt-auto flex flex-wrap gap-2.5";

  const secondaryButtonClassName = compact
    ? "flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] px-3.5 py-2 text-xs font-medium text-[var(--text-primary)] transition-colors duration-300 hover:bg-[var(--bg-secondary)] sm:text-sm"
    : "flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors duration-300 hover:bg-[var(--bg-secondary)]";

  const primaryButtonClassName = compact
    ? "flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-3.5 py-2 text-xs font-medium text-white shadow-[0_0_15px_rgba(124,58,237,0.3)] transition-all duration-300 hover:from-violet-500 hover:to-cyan-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] sm:text-sm"
    : "flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-4 py-2.5 text-sm font-medium text-white shadow-[0_0_15px_rgba(124,58,237,0.3)] transition-all duration-300 hover:from-violet-500 hover:to-cyan-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-50px" }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-elevated)] shadow-[var(--card-shadow)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--accent-violet)] hover:shadow-[var(--card-hover-shadow)] backdrop-blur-md"
    >
      {/* Contenedor de Imagen 16:9 */}
      <div className={imageClassName}>
        <img
          src={project.image || "https://placehold.co/1280x720/1e293b/ffffff?text=Image+Not+Found"}
          alt={project.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => { e.target.src = "https://placehold.co/1280x720/1e293b/ffffff?text=Image+Not+Found" }}
        />
        {/* Overlay degradado: funde la imagen con el fondo de la card */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to top, var(--bg-elevated), color-mix(in srgb, var(--bg-elevated) 15%, transparent), transparent)' }}
        />
      </div>

      {/* Contenido */}
      <div className={contentClassName}>
        <h3 className={titleClassName}>
          {project.title}
        </h3>

        <p className={descriptionClassName}>
          {project.description}
        </p>

        {/* Tech Tags */}
        <div className={tagsWrapperClassName}>
          {project.tech.map((t, i) => (
            <span
              key={i}
              className={tagClassName}
            >
              {t}
            </span>
          ))}
        </div>

        {/* Botones */}
        <div className={buttonGroupClassName}>
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className={secondaryButtonClassName}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
              Código
            </a>
          )}

          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className={primaryButtonClassName}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Live Demo
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
