import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function BlogPagination({ hasMore, onLoadMore, loading }) {
  const { t } = useTranslation();
  if (!hasMore) return null;

  return (
    <div className="mt-24 flex justify-center">
      <button
        type="button"
        onClick={onLoadMore}
        disabled={loading}
        aria-label={loading ? t('blog.loading_more') : t('blog.load_more')}
        aria-busy={loading}
        className="group relative px-10 py-4 font-headline font-bold overflow-hidden rounded-lg transition-transform duration-300 motion-safe:hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-secondary)] disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ color: 'var(--blog-text-primary)' }}
      >
        {/* Gradient background layer */}
        <span
          className="absolute inset-0 motion-safe:group-hover:scale-110 transition-transform duration-500"
          style={{
            background: 'linear-gradient(to right, var(--accent-primary), var(--accent-violet), var(--accent-secondary))',
          }}
          aria-hidden="true"
        />
        {/* Content */}
        <span className="relative flex items-center gap-2">
          {loading ? t('blog.loading_more') : t('blog.load_more')}
          {!loading && <ChevronDown className="h-5 w-5" aria-hidden="true" />}
        </span>
      </button>
    </div>
  );
}
