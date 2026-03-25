import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock framer-motion para evitar animaciones en tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

import ProjectCard from './ProjectCard';

const baseProject = {
  id: 'test-project',
  title: 'Mi Proyecto Test',
  description: 'Descripción del proyecto de prueba',
  tech: ['React', 'Node.js', 'TailwindCSS'],
  image: '/test-image.jpg',
  github: 'https://github.com/example/repo',
  demo: 'https://example.com',
};

describe('ProjectCard', () => {
  it('renderiza el título del proyecto', () => {
    render(<ProjectCard project={baseProject} />);
    expect(screen.getByText('Mi Proyecto Test')).toBeInTheDocument();
  });

  it('renderiza la descripción del proyecto', () => {
    render(<ProjectCard project={baseProject} />);
    expect(screen.getByText('Descripción del proyecto de prueba')).toBeInTheDocument();
  });

  it('renderiza todas las tecnologías como tags', () => {
    render(<ProjectCard project={baseProject} />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getByText('TailwindCSS')).toBeInTheDocument();
  });

  it('renderiza el enlace de GitHub cuando está presente', () => {
    render(<ProjectCard project={baseProject} />);
    const githubLink = screen.getByRole('link', { name: /código/i });
    expect(githubLink).toHaveAttribute('href', 'https://github.com/example/repo');
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renderiza el enlace de demo cuando está presente', () => {
    render(<ProjectCard project={baseProject} />);
    const demoLink = screen.getByRole('link', { name: /live demo/i });
    expect(demoLink).toHaveAttribute('href', 'https://example.com');
    expect(demoLink).toHaveAttribute('target', '_blank');
  });

  it('no renderiza el enlace de GitHub cuando no está presente', () => {
    const projectWithoutGithub = { ...baseProject, github: null };
    render(<ProjectCard project={projectWithoutGithub} />);
    expect(screen.queryByRole('link', { name: /código/i })).not.toBeInTheDocument();
  });

  it('no renderiza el enlace de demo cuando no está presente', () => {
    const projectWithoutDemo = { ...baseProject, demo: null };
    render(<ProjectCard project={projectWithoutDemo} />);
    expect(screen.queryByRole('link', { name: /live demo/i })).not.toBeInTheDocument();
  });

  it('renderiza la imagen del proyecto con el atributo alt correcto', () => {
    render(<ProjectCard project={baseProject} />);
    const img = screen.getByAltText('Mi Proyecto Test');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/test-image.jpg');
  });

  it('usa imagen de fallback cuando no hay imagen', () => {
    const projectWithoutImage = { ...baseProject, image: null };
    render(<ProjectCard project={projectWithoutImage} />);
    const img = screen.getByAltText('Mi Proyecto Test');
    expect(img.src).toContain('placehold.co');
  });

  it('aplica clases compactas cuando compact=true', () => {
    const { container } = render(<ProjectCard project={baseProject} compact={true} />);
    // El modo compact usa clases h-40 para la imagen
    const imageContainer = container.querySelector('.h-40');
    expect(imageContainer).toBeInTheDocument();
  });

  it('aplica clases normales cuando compact=false (default)', () => {
    const { container } = render(<ProjectCard project={baseProject} />);
    // El modo normal usa clases h-48 para la imagen
    const imageContainer = container.querySelector('.h-48');
    expect(imageContainer).toBeInTheDocument();
  });
});
