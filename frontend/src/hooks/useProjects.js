import { useState, useEffect } from 'react';

export function useProjects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        const fetchProjects = async () => {
            try {
                const res = await fetch('/projects.json', { signal: controller.signal });
                if (!res.ok) throw new Error(`Error ${res.status} cargando proyectos`);
                const data = await res.json();
                setProjects(Array.isArray(data) ? data : []);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Error fetching projects:', err);
                    setError(err.message);
                    setProjects([]);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
        return () => controller.abort();
    }, []);

    const featuredProjects = projects.filter(p => p.featured).slice(0, 2);
    const codeProjects     = projects.filter(p => !p.category || p.category === 'code');
    const cmsProjects      = projects.filter(p => p.category === 'cms');

    return { projects, featuredProjects, codeProjects, cmsProjects, loading, error };
}
