export function BlogFilterChips({ activeTag, onTagChange, tagOptions }) {
  return (
    <nav className="flex flex-wrap gap-3 items-center w-full" role="group" aria-label="Filtrar por etiqueta">
      {tagOptions.map((tag) => {
        const isActive = activeTag === tag.label;

        return (
          <button
            key={tag.label}
            type="button"
            onClick={() => onTagChange(tag.label)}
            aria-pressed={isActive}
            className={`
              px-6 py-2.5 rounded-full font-label text-sm transition-all duration-300
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-secondary)]
              ${
                isActive
                  ? 'font-bold'
                  : 'hover:scale-105'
              }
            `}
            style={
              isActive
                ? {
                    border: '1px solid var(--accent-secondary)',
                    background: 'color-mix(in srgb, var(--accent-secondary) 10%, transparent)',
                    color: 'var(--accent-secondary)',
                    boxShadow: '0 0 20px var(--blog-glow-secondary)',
                  }
                : {
                    border: '1px solid var(--blog-outline-variant)',
                    background: 'color-mix(in srgb, var(--blog-surface) 50%, transparent)',
                    color: 'var(--blog-text-secondary)',
                  }
            }
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--accent-primary) 50%, transparent)';
                e.currentTarget.style.color = 'var(--accent-primary)';
                e.currentTarget.style.background = 'color-mix(in srgb, var(--accent-primary) 5%, transparent)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = 'var(--blog-outline-variant)';
                e.currentTarget.style.color = 'var(--blog-text-secondary)';
                e.currentTarget.style.background = 'color-mix(in srgb, var(--blog-surface) 50%, transparent)';
              }
            }}
          >
            {tag.label}
            {typeof tag.count === 'number' && (
              <span
                className="ml-2 text-[11px]"
                style={{ color: 'var(--blog-text-muted)' }}
              >
                {tag.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
