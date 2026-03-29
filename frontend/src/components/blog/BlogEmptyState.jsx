import { SearchX, FileX } from 'lucide-react';

export function BlogEmptyState({ query, tag, onReset }) {
  const hasQuery = Boolean(query?.trim());
  const hasTag = tag && tag !== 'Todos';
  const hasFilters = hasQuery || hasTag;

  let title = 'Aún no hay artículos publicados';
  let message = '';
  const Icon = hasFilters ? SearchX : FileX;

  if (hasQuery && hasTag) {
    title = 'No hay resultados para esta búsqueda';
    message = `No encontré artículos para "${query}" dentro del tema ${tag}.`;
  } else if (hasQuery) {
    title = 'No hay resultados para esta búsqueda';
    message = `No encontré artículos que coincidan con "${query}".`;
  } else if (hasTag) {
    title = 'No hay artículos en este tema';
    message = `Todavía no hay publicaciones etiquetadas como ${tag}.`;
  }

  return (
    <section className="px-4 py-14">
      <div
        className="mx-auto max-w-lg text-center blog-glass rounded-xl p-10"
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <Icon
            className="h-12 w-12"
            style={{ color: 'var(--accent-primary)' }}
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>

        {/* Heading with gradient text */}
        <h2
          className="text-2xl font-semibold font-headline bg-clip-text text-transparent"
          style={{
            backgroundImage: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))',
          }}
        >
          {title}
        </h2>

        {message && (
          <p
            className="mt-3 text-sm font-body"
            style={{ color: 'var(--blog-text-secondary)' }}
          >
            {message}
          </p>
        )}

        {hasFilters && (
          <button
            type="button"
            onClick={onReset}
            className="mt-6 rounded-full px-6 py-2.5 text-sm font-medium font-label transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-secondary)]"
            style={{
              border: '1px solid color-mix(in srgb, var(--accent-secondary) 40%, transparent)',
              color: 'var(--accent-secondary)',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 16px var(--blog-glow-secondary)';
              e.currentTarget.style.background = 'color-mix(in srgb, var(--accent-secondary) 10%, transparent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </section>
  );
}
