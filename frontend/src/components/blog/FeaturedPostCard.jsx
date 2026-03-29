import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const getReadTime = (post) => Math.max(4, Number(post.readingTime) || 4);

export function FeaturedPostCard({ post }) {
  const { t, i18n } = useTranslation();
  if (!post) return null;

  const formatDate = (dateString) =>
    new Date(`${dateString}T00:00:00`).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const hasCover = Boolean(post.coverImage || post.ogImage);
  const coverSrc = post.coverImage || post.ogImage;

  return (
    <section className="mb-24">
      <Link to={`/blog/${post.slug}`} className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-secondary)] rounded-xl">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="group relative overflow-hidden rounded-xl transition-all duration-500"
          style={{
            background: 'var(--blog-surface-low)',
            border: '1px solid color-mix(in srgb, var(--blog-outline-variant) 20%, transparent)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--accent-secondary) 30%, transparent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--blog-outline-variant) 20%, transparent)';
          }}
        >
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image area */}
            <div className="h-64 md:h-full relative overflow-hidden">
              {hasCover ? (
                <img
                  src={coverSrc}
                  alt={post.title}
                  loading="lazy"
                  className="w-full h-full object-cover motion-safe:group-hover:scale-110 transition-transform duration-700"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, 
                      color-mix(in srgb, var(--accent-primary) 15%, transparent),
                      color-mix(in srgb, var(--accent-secondary) 15%, transparent)
                    )`,
                  }}
                >
                  <span
                    className="font-headline text-6xl font-extrabold select-none"
                    style={{
                      color: 'var(--accent-primary)',
                      opacity: 0.1,
                    }}
                  >
                    {post.tags?.[0] || 'Blog'}
                  </span>
                </div>
              )}

              {/* Gradient overlay — desktop only */}
              <div
                className="absolute inset-0 hidden md:block pointer-events-none"
                style={{
                  background: `linear-gradient(to right, var(--blog-surface-low), transparent)`,
                }}
              />
            </div>

            {/* Content area */}
            <div
              className="p-8 md:p-12 flex flex-col justify-center backdrop-blur-sm"
              style={{
                background: 'color-mix(in srgb, var(--blog-surface) 40%, transparent)',
              }}
            >
              <div className="flex items-center gap-4 mb-6">
                <span
                  className="px-3 py-1 rounded font-label text-xs uppercase tracking-widest"
                  style={{
                    background: 'color-mix(in srgb, var(--accent-secondary) 10%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--accent-secondary) 30%, transparent)',
                    color: 'var(--accent-secondary)',
                    boxShadow: '0 0 8px color-mix(in srgb, var(--accent-secondary) 10%, transparent)',
                  }}
                >
                  {t('blog.featured_badge')}
                </span>
                <span
                  className="text-xs font-label uppercase tracking-widest"
                  style={{ color: 'var(--blog-text-muted)' }}
                >
                  {t('blog.read_time', { count: getReadTime(post) })}
                </span>
              </div>

              <h2
                className="font-headline text-3xl md:text-5xl font-bold mb-6 group-hover:text-[var(--accent-secondary)] transition-colors duration-300 leading-tight"
                style={{ color: 'var(--blog-text-primary)' }}
              >
                {post.title}
              </h2>

              <p
                className="text-lg mb-8 font-body leading-relaxed line-clamp-3"
                style={{ color: 'var(--blog-text-secondary)' }}
              >
                {post.excerpt}
              </p>

              <div className="flex items-center gap-4">
                <span
                  className="text-xs font-label"
                  style={{ color: 'var(--blog-text-muted)' }}
                >
                  {formatDate(post.date)}
                </span>
              </div>
            </div>
          </div>
        </motion.article>
      </Link>
    </section>
  );
}
