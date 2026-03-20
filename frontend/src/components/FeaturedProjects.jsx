import React from 'react';
import ProjectCard from './ProjectCard';
import { Link } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';

const FeaturedProjects = () => {
  const { featuredProjects, loading } = useProjects();

  return (
    <section className="relative py-10 md:py-20 bg-gradient-to-b from-[#f8fafc] via-[var(--bg-secondary)] to-[var(--bg-secondary)] overflow-hidden" id="featured-projects">
      {/* Halos de luz de fondo, sin partículas */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-fuchsia-300/40 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[380px] h-[380px] rounded-full bg-cyan-300/40 blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[180px] rounded-full bg-violet-300/30 blur-[90px]" />
      </div>
      <div className="relative z-10 container mx-auto px-2 md:px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-end mb-6 md:mb-12">
          <div className="max-w-xl mb-4 md:mb-0">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] mb-4">
              Proyectos Destacados
            </h2>
            <p className="text-[var(--text-secondary)]">
              Échale un vistazo a una selección de mis trabajos favoritos y más complejos donde he aplicado diversas tecnologías.
            </p>
          </div>
          <div className="mt-3 md:mt-0">
            <Link
              to="/proyectos"
              className="group flex gap-2 items-center px-6 py-3 font-medium text-[var(--accent-secondary)] bg-[var(--accent-secondary-dim)] rounded-lg hover:bg-[var(--bg-elevated)] border border-[var(--border-color)] transition-colors"
            >
              Ver todos los proyectos
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-[var(--text-muted)]">Cargando proyectos...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
            {featuredProjects.map((project, idx) => (
              <ProjectCard key={project.id || idx} project={project} index={idx} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProjects;
