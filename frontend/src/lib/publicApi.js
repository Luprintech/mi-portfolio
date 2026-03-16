const BASE_URL = import.meta.env.VITE_API_URL || '';

export async function publicRequest(path, { signal } = {}) {
  const response = await fetch(`${BASE_URL}${path}`, { signal });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || `HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return data;
}
