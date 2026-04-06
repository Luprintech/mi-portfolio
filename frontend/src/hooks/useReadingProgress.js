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
    let rafId = 0;

    const calculateProgress = () => {
      rafId = 0;
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
      const nextShowScrollTop = scrollTop > SCROLL_TOP_THRESHOLD;

      setReadProgress((current) => Math.abs(current - nextProgress) > 0.5 ? nextProgress : current);
      setShowScrollTop((current) => current !== nextShowScrollTop ? nextShowScrollTop : current);
    };

    const handleScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(calculateProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    calculateProgress();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return { readProgress, showScrollTop };
}
