import { useState, useEffect } from 'react';
import { publicRequest } from '../lib/publicApi';

export function useProjects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        const fetchProjects = async () => {
            try {
                const data = await publicRequest('/api/projects', { signal: controller.signal });
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
