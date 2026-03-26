import { useState, useEffect, useRef } from 'react';

// Mapeo de colores de línea
const LINE_COLOR_MAP = {
  'fuchsia-cyan': 'bg-gradient-to-b from-fuchsia-500 to-cyan-500',
  'blue-cyan': 'bg-gradient-to-b from-blue-500 to-cyan-500',
  'purple-pink': 'bg-gradient-to-b from-purple-500 to-pink-500',
  'orange-red': 'bg-gradient-to-b from-orange-500 to-red-500',
  'green-teal': 'bg-gradient-to-b from-green-500 to-teal-500',
  'yellow-amber': 'bg-gradient-to-b from-yellow-500 to-amber-500',
  'slate': 'bg-slate-400',
  'white': 'bg-white',
};

// Mapeo de fondos de tarjetas
const CARD_BG_MAP = {
  'violet-fuchsia': 'from-violet-900/10 to-fuchsia-900/10',
  'blue-indigo': 'from-blue-900/10 to-indigo-900/10',
  'emerald-teal': 'from-emerald-900/10 to-teal-900/10',
  'orange-amber': 'from-orange-900/10 to-amber-900/10',
  'slate': 'from-slate-900/5 to-slate-800/5',
  'white': 'from-white/10 to-white/5',
  'transparent': 'from-transparent to-transparent',
};

// Tamaños
const SIZE_CONFIG = {
  sm: { date: 'text-[10px]', title: 'text-sm', desc: 'text-xs', dot: 'h-8 w-8 text-sm', card: 'p-3' },
  md: { date: 'text-xs', title: 'text-base', desc: 'text-sm', dot: 'h-10 w-10 text-base', card: 'p-4' },
  lg: { date: 'text-sm', title: 'text-lg', desc: 'text-base', dot: 'h-12 w-12 text-lg', card: 'p-5' },
};

function formatDate(dateString) {
  if (!dateString) return 'Fecha no especificada';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
  } catch {
    return dateString;
  }
}

function TimelineEvent({ event, layout, themeConfig, index, isVisible, size }) {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const sizeClasses = SIZE_CONFIG[size] || SIZE_CONFIG.md;

  useEffect(() => {
    if (isVisible) {
      const timeout = setTimeout(() => {
        setShouldAnimate(true);
      }, index * 100);
      return () => clearTimeout(timeout);
    }
  }, [isVisible, index]);

  return (
    <div
      className={`relative ${layout === 'horizontal' ? 'min-w-[260px] max-w-[280px]' : ''} ${
        shouldAnimate ? 'animate-fade-in-up' : 'opacity-0'
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Timeline dot/marker */}
      <div
        className={`absolute flex ${sizeClasses.dot} items-center justify-center rounded-full border-4 border-[var(--bg-primary)] ${themeConfig.dotBg} text-lg shadow-lg ${
          layout === 'vertical' ? '-left-[2.6rem] top-0' : 'left-1/2 -translate-x-1/2 -top-11'
        }`}
        aria-hidden="true"
      >
        {event.icon || '📌'}
      </div>

      {/* Event card */}
      <article
        className={`rounded-xl border border-[var(--bg-default)] bg-gradient-to-br ${themeConfig.cardBg} ${sizeClasses.card} shadow-[0_18px_40px_rgba(15,23,42,0.12)] transition-transform hover:-translate-y-1`}
      >
        <time
          className={`mb-2 block font-semibold uppercase tracking-wider text-[var(--text-muted)] ${sizeClasses.date}`}
          dateTime={event.date}
        >
          {formatDate(event.date)}
        </time>
        <h3 className={`mb-2 font-bold leading-tight text-[var(--text-primary)] ${sizeClasses.title}`}>
          {event.title || 'Evento'}
        </h3>
        <p className={`leading-relaxed text-[var(--text-secondary)] ${sizeClasses.desc}`}>
          {event.description || ''}
        </p>
      </article>
    </div>
  );
}

export default function TimelineBlock({ events = [], layout = 'vertical', theme = 'default', lineColor = 'fuchsia-cyan', cardBg = 'violet-fuchsia', size = 'md' }) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  // Configurar el tema basado en las props
  const lineColorClass = LINE_COLOR_MAP[lineColor] || LINE_COLOR_MAP['fuchsia-cyan'];
  const cardBgClass = CARD_BG_MAP[cardBg] || CARD_BG_MAP['violet-fuchsia'];
  
  // Combinar theme base con personalizaciones
  const themeConfig = {
    lineColor: lineColorClass,
    dotBg: lineColorClass,
    cardBg: cardBgClass,
  };

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

  // Responsive: horizontal becomes vertical on mobile
  const isHorizontal = layout === 'horizontal';
  const responsiveLayout = isHorizontal ? 'hidden md:block' : '';
  const mobileLayout = isHorizontal ? 'block md:hidden' : '';

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
                size={size}
              />
            ))}
          </div>
        ) : (
          <div className="relative overflow-x-auto pb-2">
            <div className="relative flex gap-8 pb-8 pt-12" style={{ minWidth: 'max-content' }}>
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
                  size={size}
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
                size={size}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}