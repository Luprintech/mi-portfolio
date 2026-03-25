import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { useProjects } from './useProjects';

// Wrapper con SWR en modo sin caché para tests completamente aislados.
// provider: () => new Map() crea una caché nueva por cada wrapper instance.
function createWrapper(fetcherFn) {
  return function Wrapper({ children }) {
    return (
      <SWRConfig
        value={{
          fetcher: fetcherFn,
          dedupingInterval: 0,
          revalidateOnFocus: false,
          shouldRetryOnError: false,
          provider: () => new Map(),
        }}
      >
        {children}
      </SWRConfig>
    );
  };
}

const mockProjects = [
  {
    id: 'project-1',
    title: 'Proyecto 1',
    description: 'Descripción 1',
    tech: ['React'],
    featured: true,
    category: 'code',
  },
  {
    id: 'project-2',
    title: 'Proyecto 2',
    description: 'Descripción 2',
    tech: ['Node.js'],
    featured: false,
    category: 'code',
  },
  {
    id: 'project-3',
    title: 'CMS Proyecto',
    description: 'CMS descripción',
    tech: ['React', 'Express'],
    featured: true,
    category: 'cms',
  },
];

describe('useProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devuelve loading=true inicialmente', () => {
    const fetcher = vi.fn(() => new Promise(() => {})); // nunca resuelve
    const wrapper = createWrapper(fetcher);

    const { result } = renderHook(() => useProjects(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.projects).toEqual([]);
  });

  it('devuelve los proyectos correctamente cuando la petición tiene éxito', async () => {
    const fetcher = vi.fn().mockResolvedValue(mockProjects);
    const wrapper = createWrapper(fetcher);

    const { result } = renderHook(() => useProjects(), { wrapper });

    await act(async () => { await new Promise((r) => setTimeout(r, 50)); });

    expect(result.current.loading).toBe(false);
    expect(result.current.projects).toHaveLength(3);
    expect(result.current.error).toBeNull();
  });

  it('filtra correctamente los proyectos destacados (featured)', async () => {
    const fetcher = vi.fn().mockResolvedValue(mockProjects);
    const wrapper = createWrapper(fetcher);

    const { result } = renderHook(() => useProjects(), { wrapper });

    await act(async () => { await new Promise((r) => setTimeout(r, 50)); });

    expect(result.current.featuredProjects).toHaveLength(2);
    expect(result.current.featuredProjects.every((p) => p.featured)).toBe(true);
    expect(result.current.featuredProjects.length).toBeLessThanOrEqual(2);
  });

  it('filtra correctamente los proyectos de código (codeProjects)', async () => {
    const fetcher = vi.fn().mockResolvedValue(mockProjects);
    const wrapper = createWrapper(fetcher);

    const { result } = renderHook(() => useProjects(), { wrapper });

    await act(async () => { await new Promise((r) => setTimeout(r, 50)); });

    expect(result.current.codeProjects).toHaveLength(2);
    expect(result.current.codeProjects.every((p) => !p.category || p.category === 'code')).toBe(true);
  });

  it('filtra correctamente los proyectos CMS (cmsProjects)', async () => {
    const fetcher = vi.fn().mockResolvedValue(mockProjects);
    const wrapper = createWrapper(fetcher);

    const { result } = renderHook(() => useProjects(), { wrapper });

    await act(async () => { await new Promise((r) => setTimeout(r, 50)); });

    expect(result.current.cmsProjects).toHaveLength(1);
    expect(result.current.cmsProjects[0].category).toBe('cms');
  });

  it('devuelve error cuando la petición falla', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('Network error'));
    const wrapper = createWrapper(fetcher);

    const { result } = renderHook(() => useProjects(), { wrapper });

    await act(async () => { await new Promise((r) => setTimeout(r, 100)); });

    expect(result.current.error).toBe('Network error');
    expect(result.current.projects).toEqual([]);
  });

  it('devuelve arrays vacíos cuando la API devuelve un valor no-array', async () => {
    const fetcher = vi.fn().mockResolvedValue(null);
    const wrapper = createWrapper(fetcher);

    const { result } = renderHook(() => useProjects(), { wrapper });

    await act(async () => { await new Promise((r) => setTimeout(r, 50)); });

    expect(result.current.projects).toEqual([]);
    expect(result.current.featuredProjects).toEqual([]);
  });
});
