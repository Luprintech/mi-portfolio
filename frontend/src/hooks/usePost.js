/**
 * usePost — carga los datos y el contenido de un post por su slug.
 * Gestiona estado de carga, error y redirección 404.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { publicRequest } from '../lib/publicApi';

/**
 * @param {string} slug - Slug del post a cargar.
 * @returns {{ postMeta: object|null, content: string, loading: boolean, error: string|null }}
 */
export function usePost(slug) {
  const navigate = useNavigate();
  const [postMeta, setPostMeta] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchPost = async () => {
      setLoading(true);
      setError(null);

      try {
        const found = await publicRequest(`/api/posts/${slug}`, { signal: controller.signal });
        setPostMeta(found);
        setContent(found.content || '');
      } catch (err) {
        if (err.name !== 'AbortError') {
          if (err.status === 404) {
            navigate('/blog', { replace: true });
            return;
          }
          console.error('Error cargando post:', err);
          setError('No se pudo cargar el artículo.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
    return () => controller.abort();
  }, [slug, navigate]);

  return { postMeta, content, loading, error };
}
