import useSWR from 'swr';

/**
 * Obtiene y cachea los proyectos públicos usando SWR.
 *
 * SWR gestiona automáticamente loading, error, revalidación y deduplicación.
 * La configuración global (fetcher, deduping, retry) vive en src/lib/swrConfig.js.
 */
export function useProjects() {
    const { data, error, isLoading } = useSWR('/api/projects');

    const projects = Array.isArray(data) ? data : [];

    return {
        projects,
        featuredProjects: projects.filter((p) => p.featured).slice(0, 2),
        codeProjects:     projects.filter((p) => !p.category || p.category === 'code'),
        cmsProjects:      projects.filter((p) => p.category === 'cms'),
        loading: isLoading,
        error: error?.message ?? null,
    };
}
