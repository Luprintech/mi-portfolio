import React from 'react';
import ProjectCard from './ProjectCard';
import { useProjects } from '../hooks/useProjects';

const Projects = () => {
  const { projects, loading } = useProjects();

  return (
    <section className="py-20 bg-[var(--bg-secondary)]" id="projects">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 mb-4">
            Mis Proyectos
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Una colección de trabajos recientes que demuestran mi experiencia en desarrollo web, bots y backend.
          </p>
        </div>

        {loading ? (
          <p className="text-center text-[var(--text-muted)]">Cargando proyectos...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, idx) => (
              <ProjectCard key={project.id || idx} project={project} index={idx} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Projects;
