import React from 'react';
import ProjectCard from './ProjectCard';
import { Link } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';

const FeaturedProjects = () => {
  const { featuredProjects, loading } = useProjects();

  return (
    <section className="py-20 bg-[var(--bg-secondary)]" id="featured-projects">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] mb-4">
              Proyectos Destacados
            </h2>
            <p className="text-[var(--text-secondary)]">
              Échale un vistazo a una selección de mis trabajos favoritos y más complejos donde he aplicado diversas tecnologías.
            </p>
          </div>
          <div className="mt-6 md:mt-0">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
