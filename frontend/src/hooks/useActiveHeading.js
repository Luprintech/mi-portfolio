/**
 * useActiveHeading — usa IntersectionObserver para detectar qué heading
 * está actualmente visible, con cleanup correcto.
 */

import { useEffect, useState } from 'react';

/**
 * @param {Array<{ id: string }>} headings - Lista de headings a observar.
 * @param {boolean} enabled - Si el TOC está activo (≥3 headings).
 * @returns {string} ID del heading activo.
 */
export function useActiveHeading(headings, enabled) {
  const [activeHeadingId, setActiveHeadingId] = useState('');

  useEffect(() => {
    if (!enabled || headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHeadingId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings, enabled]);

  return activeHeadingId;
}
