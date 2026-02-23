import { useState, useEffect } from 'react';

export function useProjects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch("/projects.json");
                if (!res.ok) throw new Error("Añade el projects.json a la carpeta public");
                const data = await res.json();
                
                if (Array.isArray(data)) {
                    setProjects(data);
                } else {
                    setProjects([]);
                }
            } catch (error) {
                console.error("Error fetching projects:", error);
                setProjects([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const featuredProjects = projects.filter(p => p.featured).slice(0, 2);

    return {
        projects,
        featuredProjects,
        loading
    };
}

