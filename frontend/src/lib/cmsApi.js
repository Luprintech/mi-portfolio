const BASE_URL = import.meta.env.VITE_API_URL || '';

class CmsApiError extends Error {
    constructor(message, details = {}) {
        super(message);
        this.name = 'CmsApiError';
        this.status = details.status;
        this.code = details.code || details.type || 'api-error';
        this.details = details;
    }
}

function extractErrorPayload(data) {
    if (data?.error && typeof data.error === 'object') {
        return data.error;
    }

    return {
        message: data?.error || data?.message || '',
    };
}

function createApiError(response, data) {
    const payload = extractErrorPayload(data);
    return new CmsApiError(payload.message || `HTTP ${response.status}`, {
        ...payload,
        status: response.status,
    });
}

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
    if (!response.ok) throw createApiError(response, data);
    return data;
}

async function upload(path, fieldName, token, file) {
    const form = new FormData();
    form.append(fieldName, file);
    const response = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw createApiError(response, data);
    return data.file || data;
}

export const cmsApi = {
    // Auth
    login: (username, password)        => request('/api/bitacora/auth', { method: 'POST', body: { username, password } }),
    verify: (token)                    => request('/api/bitacora/verify', { token }),

    // Posts
    getPosts: (token)                  => request('/api/bitacora/posts', { token }),
    getPost:  (token, slug)            => request(`/api/bitacora/posts/${slug}`, { token }),
    getPostRevisions: (token, slug)    => request(`/api/bitacora/posts/${slug}/revisions`, { token }),
    createPost: (token, data)          => request('/api/bitacora/posts', { token, method: 'POST', body: data }),
    updatePost: (token, slug, data)    => request(`/api/bitacora/posts/${slug}`, { token, method: 'PUT', body: data }),
    autosavePost: (token, slug, data)  => request(`/api/bitacora/posts/${slug}/autosave`, { token, method: 'POST', body: data }),
    restorePostRevision: (token, slug, revisionId, revision) => request(`/api/bitacora/posts/${slug}/restore`, {
        token,
        method: 'POST',
        body: { revisionId, revision },
    }),
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
    uploadImage: (token, file) => upload('/api/bitacora/upload', 'image', token, file),

    // Upload Document (multipart)
    uploadDocument: (token, file) => upload('/api/bitacora/upload-document', 'document', token, file),
    uploadAudio: (token, file) => upload('/api/bitacora/upload-audio', 'audio', token, file),
    uploadCv: (token, file) => upload('/api/bitacora/upload-cv', 'cv', token, file),

    // Chat stats
    getChatStats: (token) => request('/api/bitacora/chat-stats', { token }),

    // Users
    getUsers:   (token)              => request('/api/bitacora/users', { token }),
    createUser: (token, data)        => request('/api/bitacora/users', { token, method: 'POST', body: data }),
    updateUser: (token, id, data)    => request(`/api/bitacora/users/${id}`, { token, method: 'PUT', body: data }),
    deleteUser: (token, id)          => request(`/api/bitacora/users/${id}`, { token, method: 'DELETE' }),
};
