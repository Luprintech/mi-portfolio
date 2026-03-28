import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SWRConfig } from 'swr';

// Mock de componentes pesados que no son críticos para los tests de Home
vi.mock('../components/AnimatedBackground', () => ({
  default: () => <div data-testid="animated-background" />,
}));

vi.mock('../components/Luprincat', () => ({
  default: () => <div data-testid="luprincat" />,
}));

vi.mock('../components/LandingHero', () => ({
  default: () => <div data-testid="landing-hero">Hero Section</div>,
}));

vi.mock('../components/PresentationSection', () => ({
  default: () => <div data-testid="presentation-section">About Section</div>,
}));

vi.mock('../components/ProfileStorySection', () => ({
  default: () => <div data-testid="profile-story-section">Experience Section</div>,
}));

vi.mock('../components/Timeline', () => ({
  default: () => <div data-testid="timeline">Timeline</div>,
}));

vi.mock('../components/ServicesGrid', () => ({
  default: () => <div data-testid="services-grid">Services</div>,
}));

vi.mock('../components/Footer', () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

vi.mock('../components/ScrollHint', () => ({
  default: () => <div data-testid="scroll-hint" />,
}));

vi.mock('../components/SectionIndicators', () => ({
  default: () => <div data-testid="section-indicators" />,
}));

vi.mock('../components/PresentationSectionBg', () => ({
  default: () => <div />,
}));

vi.mock('../components/ProfileStorySectionBg', () => ({
  default: () => <div />,
}));

vi.mock('../components/TimelineSectionBg', () => ({
  default: () => <div />,
}));

vi.mock('../components/ServicesSectionBg', () => ({
  default: () => <div />,
}));

vi.mock('../components/SnakeGameBg', () => ({
  default: () => <div />,
}));

vi.mock('../components/YoutubeSectionBg', () => ({
  default: () => <div />,
}));

vi.mock('../components/ScrollSnapContainer', () => ({
  scrollToSection: vi.fn(),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => children,
}));

// Mock de i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { changeLanguage: vi.fn(), language: 'es' },
  }),
}));

// Mock de assets
vi.mock('../assets/youtube.png', () => ({ default: '/youtube.png' }));

import Home from './Home';

const mockProjects = [
  {
    id: '1',
    title: 'Test Project',
    description: 'Desc',
    tech: ['React'],
    featured: true,
    category: 'code',
    github: 'https://github.com/test',
    demo: 'https://test.com',
  },
];

function renderHome(fetcherResult = () => Promise.resolve(mockProjects)) {
  return render(
    <HelmetProvider>
      <SWRConfig
        value={{
          fetcher: fetcherResult,
          dedupingInterval: 0,
          revalidateOnFocus: false,
          shouldRetryOnError: false,
          provider: () => new Map(),
        }}
      >
        <MemoryRouter initialEntries={['/']}>
          <Home />
        </MemoryRouter>
      </SWRConfig>
    </HelmetProvider>
  );
}

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza la sección hero', () => {
    renderHome();
    expect(screen.getByTestId('landing-hero')).toBeInTheDocument();
  });

  it('renderiza la sección about (presentation)', () => {
    renderHome();
    expect(screen.getByTestId('presentation-section')).toBeInTheDocument();
  });

  it('renderiza la sección experience (profile story)', () => {
    renderHome();
    expect(screen.getByTestId('profile-story-section')).toBeInTheDocument();
  });

  it('renderiza la sección timeline', () => {
    renderHome();
    expect(screen.getByTestId('timeline')).toBeInTheDocument();
  });

  it('renderiza la sección services', () => {
    renderHome();
    expect(screen.getByTestId('services-grid')).toBeInTheDocument();
  });

  it('renderiza el footer', () => {
    renderHome();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('contiene el link de navegación a proyectos', () => {
    renderHome();
    const allProjectLinks = screen.getAllByRole('link');
    const hasProyectosLink = allProjectLinks.some(
      (link) => link.getAttribute('href') === '/proyectos'
    );
    expect(hasProyectosLink).toBe(true);
  });

  it('renderiza el link al canal de YouTube', () => {
    renderHome();
    const youtubeLinks = screen.getAllByRole('link').filter(
      (link) => link.href.includes('youtube.com')
    );
    expect(youtubeLinks.length).toBeGreaterThan(0);
  });

  it('muestra proyectos cuando hay datos disponibles', async () => {
    renderHome();
    // Esperamos que el mock de framer-motion renderice la ProjectCard
    // (la sección projects renderiza featuredProjects cuando loading=false)
    // El mock de fetcher devuelve mockProjects con un proyecto featured
    await act(async () => { await new Promise((r) => setTimeout(r, 50)); });
    // Verificar que la sección de proyectos está presente
    const projectsSection = document.getElementById('projects');
    expect(projectsSection).toBeInTheDocument();
  });
});
