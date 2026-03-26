import { useState, useEffect, useRef } from 'react';

const TIMELINE_THEMES = {
  default: {
    lineColor: 'bg-gradient-to-b from-fuchsia-500 to-cyan-500',
    dotBg: 'bg-gradient-to-br from-fuchsia-500 to-cyan-500',
    cardBg: 'from-violet-900/10 to-fuchsia-900/10',
  },
  minimal: {
    lineColor: 'bg-slate-400',
    dotBg: 'bg-slate-400',
    cardBg: 'from-slate-900/5 to-slate-800/5',
  },
  bold: {
    lineColor: 'bg-gradient-to-b from-orange-500 to-red-500',
    dotBg: 'bg-gradient-to-br from-orange-500 to-red-500',
    cardBg: 'from-orange-900/20 to-red-900/20',
  },
};

function TimelineEvent({ event, layout, themeConfig, index, isVisible }) {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timeout = setTimeout(() => {
        setShouldAnimate(true);
      }, index * 100); // Stagger animation
      return () => clearTimeout(timeout);
    }
  }, [isVisible, index]);

  return (
    <div
      className={`relative ${layout === 'horizontal' ? 'min-w-[260px] max-w-[280px]' : ''} ${
        shouldAnimate ? 'animate-fade-in-up' : 'opacity-0'
      }`}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Timeline dot/marker */}
      <div
        className={`absolute flex h-10 w-10 items-center justify-center rounded-full border-4 border-[var(--bg-primary)] ${themeConfig.dotBg} text-lg shadow-lg ${
          layout === 'vertical' ? '-left-[2.6rem] top-0' : 'left-1/2 -translate-x-1/2 -top-11'
        }`}
        aria-hidden="true"
      >
        {event.icon || '📌'}
      </div>

      {/* Event card */}
      <article
        className={`rounded-xl border border-[var(--border-default)] bg-gradient-to-br ${themeConfig.cardBg} p-5 shadow-[0_18px_40px_rgba(15,23,42,0.12)] transition-transform hover:-translate-y-1`}
      >
        <time
          className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]"
          dateTime={event.date}
        >
          {formatDate(event.date)}
        </time>
        <h3 className="mb-2 text-lg font-bold leading-tight text-[var(--text-primary)]">
          {event.title || 'Evento'}
        </h3>
        <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
          {event.description || ''}
        </p>
      </article>
    </div>
  );
}

function formatDate(dateString) {
  if (!dateString) return 'Fecha no especificada';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return dateString;
    
    // Format as "15 Ene 2024" or similar
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
  } catch {
    return dateString;
  }
}

export default function TimelineBlock({ events = [], layout = 'vertical', theme = 'default' }) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
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

  if (!events || events.length === 0) return null;

  const themeConfig = TIMELINE_THEMES[theme] || TIMELINE_THEMES.default;

  // Responsive: horizontal becomes vertical on mobile
  const isHorizontal = layout === 'horizontal';
  const responsiveLayout = isHorizontal
    ? 'hidden md:block' // Hide horizontal layout on mobile
    : '';
  const mobileLayout = isHorizontal
    ? 'block md:hidden' // Show vertical layout on mobile instead
    : '';

  return (
    <>
      {/* Desktop/Tablet view - respects layout prop */}
      <div
        ref={containerRef}
        className={`my-10 ${responsiveLayout}`}
        data-timeline=""
        data-layout={layout}
        data-theme={theme}
      >
        {layout === 'vertical' ? (
          <div className={`relative space-y-8 border-l-2 ${themeConfig.lineColor} pl-8`}>
            {events.map((event, index) => (
              <TimelineEvent
                key={index}
                event={event}
                layout="vertical"
                themeConfig={themeConfig}
                index={index}
                isVisible={isVisible}
              />
            ))}
          </div>
        ) : (
          <div className="relative overflow-x-auto pb-2">
            <div className="relative flex gap-8 pb-8 pt-12" style={{ minWidth: 'max-content' }}>
              {/* Horizontal line */}
              <div
                className={`absolute left-0 top-6 h-0.5 ${themeConfig.lineColor}`}
                style={{ width: '100%' }}
              />

              {events.map((event, index) => (
                <TimelineEvent
                  key={index}
                  event={event}
                  layout="horizontal"
                  themeConfig={themeConfig}
                  index={index}
                  isVisible={isVisible}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile view for horizontal layouts - force vertical */}
      {isHorizontal && (
        <div className={`my-10 ${mobileLayout}`} data-timeline-mobile="" data-theme={theme}>
          <div className={`relative space-y-8 border-l-2 ${themeConfig.lineColor} pl-8`}>
            {events.map((event, index) => (
              <TimelineEvent
                key={index}
                event={event}
                layout="vertical"
                themeConfig={themeConfig}
                index={index}
                isVisible={isVisible}
              />
            ))}
          </div>
        </div>
      )}

      {/* Animation styles */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </>
  );
}
