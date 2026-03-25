/**
 * useReadingProgress — rastrea el progreso de lectura (0-100) y si el usuario scrolleó
 * suficiente para mostrar el botón "scroll to top".
 */

import { useEffect, useState } from 'react';

const SCROLL_TOP_THRESHOLD = 400;

/**
 * @returns {{ readProgress: number, showScrollTop: boolean }}
 */
export function useReadingProgress() {
  const [readProgress, setReadProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setReadProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
      setShowScrollTop(scrollTop > SCROLL_TOP_THRESHOLD);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { readProgress, showScrollTop };
}
