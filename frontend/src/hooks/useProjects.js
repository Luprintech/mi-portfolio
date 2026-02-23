import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function useProjects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch(`${API_URL}/api/projects`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setProjects(data);
                } else {
                    console.error("API didn't return an array", data);
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

    return {
        projects,
        featuredProjects: Array.isArray(projects) ? projects.filter(p => p.featured).slice(0, 2) : [],
        loading
    };
}
