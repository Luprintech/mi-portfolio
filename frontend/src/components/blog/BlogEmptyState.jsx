import { SearchX, FileX } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function BlogEmptyState({ query, tag, onReset }) {
  const { t } = useTranslation();
  const filterAll = t('blog.filter_all');
  const hasQuery = Boolean(query?.trim());
  const hasTag = tag && tag !== filterAll;
  const hasFilters = hasQuery || hasTag;

  let title = t('blog.empty_no_posts');
  let message = '';
  const Icon = hasFilters ? SearchX : FileX;

  if (hasQuery && hasTag) {
    title = t('blog.empty_no_results');
    message = t('blog.empty_query_tag', { query, tag });
  } else if (hasQuery) {
    title = t('blog.empty_no_results');
    message = t('blog.empty_query', { query });
  } else if (hasTag) {
    title = t('blog.empty_no_tag');
    message = t('blog.empty_tag', { tag });
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
            {t('blog.empty_clear_filters')}
          </button>
        )}
      </div>
    </section>
  );
}
