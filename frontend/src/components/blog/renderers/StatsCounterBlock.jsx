import { useState, useEffect, useRef, useMemo } from 'react';

function CountUpNumber({ targetValue, suffix = '', duration = 2000, isVisible }) {
  const [count, setCount] = useState(0);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);

  // Parse the target value (handle both numbers and strings)
  const target = useMemo(() => {
    const parsed = parseFloat(targetValue);
    return isNaN(parsed) ? 0 : parsed;
  }, [targetValue]);

  useEffect(() => {
    if (!isVisible) {
      setCount(0);
      return;
    }

    // Reset animation
    startTimeRef.current = null;
    
    const animate = (currentTime) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (easeOutExpo)
      const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      const currentCount = Math.floor(easeOutExpo * target);
      setCount(currentCount);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [target, duration, isVisible]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

export default function StatsCounterBlock({ stats = [], layout = 'grid' }) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -100px 0px' }
    );

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [isVisible]);

  if (!stats || stats.length === 0) return null;

  const gridClass = layout === 'grid'
    ? 'grid grid-cols-2 gap-6 md:grid-cols-4'
    : 'flex flex-col gap-6';

  return (
    <div
      ref={containerRef}
      className="my-10"
      data-stats-counter=""
      data-layout={layout}
    >
      <div className={gridClass}>
        {stats.map((stat, index) => {
          const number = stat.number || '0';
          const suffix = stat.suffix || '';
          const label = stat.label || 'Métrica';

          return (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-[var(--border-default)] bg-gradient-to-br from-violet-900/10 to-fuchsia-900/10 p-6 text-center shadow-[0_18px_40px_rgba(15,23,42,0.12)]"
            >
              {/* Animated number with gradient */}
              <div
                className="mb-2 bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-4xl font-bold text-transparent"
                aria-live="polite"
              >
                <CountUpNumber
                  targetValue={number}
                  suffix={suffix}
                  duration={2000}
                  isVisible={isVisible}
                />
              </div>

              {/* Label */}
              <p className="text-sm font-medium text-[var(--text-muted)]">
                {label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
