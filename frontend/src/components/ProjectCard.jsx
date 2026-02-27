import React from 'react';
import { motion } from 'framer-motion';

const ProjectCard = ({ project, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-50px" }}
      className="group relative flex flex-col h-full bg-[var(--bg-elevated)] backdrop-blur-md rounded-2xl overflow-hidden border border-[var(--border-color)] shadow-[var(--card-shadow)] hover:shadow-[var(--card-hover-shadow)] hover:border-[var(--accent-violet)] transition-all duration-300 hover:-translate-y-2"
    >
      {/* Contenedor de Imagen 16:9 */}
      <div className="relative w-full aspect-video overflow-hidden bg-[var(--bg-surface)]">
        <img
          src={project.image || "https://placehold.co/1280x720/1e293b/ffffff?text=Image+Not+Found"}
          alt={project.title}
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
      <div className="flex flex-col flex-grow p-6 sm:p-8 relative z-10">
        <h3 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] mb-3">
          {project.title}
        </h3>

        <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6 flex-grow text-justify">
          {project.description}
        </p>

        {/* Tech Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {project.tech.map((t, i) => (
            <span
              key={i}
              className="px-3 py-1 text-xs font-medium text-[var(--accent-secondary)] bg-[var(--accent-secondary-dim)] border border-[var(--accent-secondary)]/20 rounded-full"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Botones */}
        <div className="flex flex-wrap gap-3 mt-auto">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl transition-colors duration-300"
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
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
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
