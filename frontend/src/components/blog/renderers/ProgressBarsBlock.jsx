import { useState, useEffect, useRef } from 'react';
import { getGradientPreset } from '../../../lib/gradients';

function CountUpNumber({ targetValue, duration = 1500, isVisible }) {
  const [count, setCount] = useState(0);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);

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

      const currentCount = Math.floor(easeOutExpo * targetValue);
      setCount(currentCount);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setCount(targetValue);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, duration, isVisible]);

  return <span>{count}</span>;
}

function ProgressBar({ bar, theme, animated, delay = 0, isVisible }) {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const percentage = Math.min(100, Math.max(0, bar.percentage));

  useEffect(() => {
    if (isVisible && animated) {
      const timer = setTimeout(() => {
        setShouldAnimate(true);
      }, delay);
      return () => clearTimeout(timer);
    } else if (!animated) {
      setShouldAnimate(true);
    }
  }, [isVisible, animated, delay]);

  function getBarStyle() {
    const baseStyle = {
      width: shouldAnimate ? `${percentage}%` : '0%',
      transition: animated ? 'width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
    };

    if (theme === 'gradient') {
      // Check if color is a gradient preset name
      const gradientPreset = getGradientPreset(bar.color);
      if (gradientPreset && gradientPreset.gradient) {
        return { ...baseStyle, background: gradientPreset.gradient };
      }
      return { ...baseStyle, backgroundColor: bar.color };
    }

    if (theme === 'neon') {
      return {
        ...baseStyle,
        backgroundColor: bar.color,
        boxShadow: `0 0 10px ${bar.color}, 0 0 20px ${bar.color}80, 0 0 30px ${bar.color}40`,
      };
    }

    return { ...baseStyle, backgroundColor: bar.color };
  }

  function getBarContainerClass() {
    if (theme === 'minimal') {
      return 'h-2 bg-slate-800/30 rounded-full overflow-hidden';
    }
    if (theme === 'neon') {
      return 'h-8 bg-slate-900/50 rounded-lg overflow-hidden backdrop-blur-sm border border-slate-700/50';
    }
    return 'h-7 bg-slate-800/40 rounded-lg overflow-hidden';
  }

  function getLabelClass() {
    if (theme === 'neon') {
      return 'font-semibold text-[var(--text-primary)] drop-shadow-sm';
    }
    return 'font-semibold text-[var(--text-primary)]';
  }

  function getPercentageClass() {
    if (theme === 'neon') {
      return 'font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400';
    }
    return 'font-mono font-bold text-[var(--text-muted)]';
  }

  return (
    <div className="relative">
      {/* Label and percentage */}
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className={getLabelClass()}>{bar.label || 'Sin nombre'}</span>
        <span
          className={getPercentageClass()}
          style={{ fontVariantNumeric: 'tabular-nums' }}
          aria-live="polite"
          role="status"
        >
          {animated && isVisible ? (
            <>
              <CountUpNumber targetValue={percentage} duration={1500} isVisible={isVisible} />%
            </>
          ) : (
            `${percentage}%`
          )}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className={getBarContainerClass()}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label={`${bar.label}: ${percentage}%`}
      >
        <div className="h-full rounded-lg" style={getBarStyle()} />
      </div>
    </div>
  );
}

export default function ProgressBarsBlock({ bars = [], theme = 'default', animated = true }) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (!animated) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          setIsVisible(true);
          hasAnimatedRef.current = true;
        }
      },
      { threshold: 0.5, rootMargin: '0px 0px -50px 0px' }
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
  }, [animated]);

  if (!bars || bars.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="my-10"
      data-progress-bars=""
      data-theme={theme}
      data-animated={animated.toString()}
    >
      <div className="mx-auto max-w-3xl space-y-5 rounded-2xl border border-[var(--border-default)] bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
        {bars.map((bar, index) => (
          <ProgressBar
            key={index}
            bar={bar}
            theme={theme}
            animated={animated}
            delay={animated ? index * 150 : 0}
            isVisible={isVisible}
          />
        ))}
      </div>
    </div>
  );
}
