/**
 * ReadingProgressBar — Sticky progress bar at top of page showing reading progress as user scrolls.
 * 
 * @param {Object} props
 * @param {string} [props.color] - Override default gradient (e.g., 'linear-gradient(90deg, #f00, #00f)')
 * @param {number} [props.height=3] - Bar height in pixels
 * @param {number} [props.showOnlyAfter=0] - Start showing after X% scroll (0-100)
 */

import { useState, useEffect } from 'react';

const ReadingProgressBar = ({ color, height = 3, showOnlyAfter = 0 }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let rafId = null;
    let ticking = false;

    const calculateProgress = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      const scrollable = scrollHeight - clientHeight;

      if (scrollable <= 0) {
        setProgress(0);
      } else {
        const newProgress = Math.min(100, Math.max(0, (scrollTop / scrollable) * 100));
        setProgress(newProgress);
      }

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        rafId = requestAnimationFrame(calculateProgress);
        ticking = true;
      }
    };

    const handleResize = () => {
      // Recalculate on resize (document height may change)
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(calculateProgress);
    };

    // Calculate on mount
    calculateProgress();

    // Attach listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  // Hide bar if progress is below threshold
  const shouldShow = progress >= showOnlyAfter;
  const opacity = shouldShow ? 1 : 0;

  const defaultGradient = 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))';
  const barColor = color || defaultGradient;

  return (
    <div
      className="reading-progress-bar"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progreso de lectura"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: `${height}px`,
        zIndex: 9999,
        pointerEvents: 'none',
        backgroundColor: 'transparent',
        opacity,
        transition: 'opacity 0.2s ease-out',
      }}
    >
      <div
        className="reading-progress-fill"
        style={{
          height: '100%',
          width: `${progress}%`,
          background: barColor,
          transition: 'width 0.1s ease-out',
          boxShadow: '0 0 10px rgba(6, 182, 212, 0.5), 0 0 20px rgba(232, 121, 249, 0.3)',
        }}
      />
    </div>
  );
};

export default ReadingProgressBar;
