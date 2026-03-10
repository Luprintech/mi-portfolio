const BASE_URL = import.meta.env.VITE_API_URL || '';

async function request(path, { token, method = 'GET', body } = {}) {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (body)  headers['Content-Type']  = 'application/json';

    const response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    return data;
}

export const cmsApi = {
    // Auth
    login: (username, password)        => request('/api/bitacora/auth', { method: 'POST', body: { username, password } }),
    verify: (token)                    => request('/api/bitacora/verify', { token }),

    // Posts
    getPosts: (token)                  => request('/api/bitacora/posts', { token }),
    getPost:  (token, slug)            => request(`/api/bitacora/posts/${slug}`, { token }),
    createPost: (token, data)          => request('/api/bitacora/posts', { token, method: 'POST', body: data }),
    updatePost: (token, slug, data)    => request(`/api/bitacora/posts/${slug}`, { token, method: 'PUT', body: data }),
    deletePost: (token, slug)          => request(`/api/bitacora/posts/${slug}`, { token, method: 'DELETE' }),

    // Projects
    getProjects: (token)               => request('/api/bitacora/projects', { token }),
    createProject: (token, data)       => request('/api/bitacora/projects', { token, method: 'POST', body: data }),
    updateProject: (token, id, data)   => request(`/api/bitacora/projects/${id}`, { token, method: 'PUT', body: data }),
    deleteProject: (token, id)         => request(`/api/bitacora/projects/${id}`, { token, method: 'DELETE' }),

    // Images
    getImages: (token)                 => request('/api/bitacora/images', { token }),
    deleteImage: (token, filename)     => request(`/api/bitacora/images/${filename}`, { token, method: 'DELETE' }),

    // Upload (multipart)
    uploadImage: async (token, file) => {
        const form = new FormData();
        form.append('image', file);
        const response = await fetch(`${BASE_URL}/api/bitacora/upload`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: form,
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
        return data;
    },
};
