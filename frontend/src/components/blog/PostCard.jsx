import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const formatDate = (dateString) =>
  new Date(`${dateString}T00:00:00`).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).toUpperCase();

const FALLBACK_GRADIENTS = [
  'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
  'linear-gradient(135deg, var(--accent-secondary) 0%, var(--accent-violet) 100%)',
  'linear-gradient(135deg, var(--accent-violet) 0%, var(--accent-primary) 100%)',
];

function getGradientIndex(tags) {
  if (!tags || tags.length === 0) return 0;
  const firstTag = tags[0];
  let hash = 0;
  for (let i = 0; i < firstTag.length; i++) {
    hash = firstTag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % FALLBACK_GRADIENTS.length;
}

export function PostCard({ post, index }) {
  const gradientIdx = getGradientIndex(post.tags);
  const hasCover = Boolean(post.coverImage || post.ogImage);
  const coverSrc = post.coverImage || post.ogImage;
  const primaryTag = post.tags?.[0] || '';

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="group relative rounded-xl overflow-hidden flex flex-col motion-safe:hover:-translate-y-2 transition-all duration-500"
      style={{
        background: 'var(--blog-surface-low)',
        border: '1px solid color-mix(in srgb, var(--blog-outline-variant) 30%, transparent)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--accent-primary) 40%, transparent)';
        e.currentTarget.style.boxShadow = '0 0 24px var(--blog-glow-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--blog-outline-variant) 30%, transparent)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Cover image area */}
      <Link to={`/blog/${post.slug}`} className="block h-48 relative overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-secondary)] rounded-t-xl">
        {hasCover ? (
          <img
            src={coverSrc}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover motion-safe:group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: FALLBACK_GRADIENTS[gradientIdx],
              opacity: 0.2,
            }}
          >
            <span
              className="font-headline text-4xl font-extrabold select-none"
              style={{
                color: 'var(--blog-text-primary)',
                opacity: 0.1,
              }}
            >
              {primaryTag}
            </span>
          </div>
        )}

        {/* Category badge — top-right */}
        {primaryTag && (
          <div
            className="absolute top-4 right-4 backdrop-blur-md px-3 py-1 rounded font-label text-[10px] uppercase tracking-widest"
            style={{
              background: 'color-mix(in srgb, var(--blog-bg) 80%, transparent)',
              color: 'var(--accent-primary)',
              border: '1px solid color-mix(in srgb, var(--accent-primary) 30%, transparent)',
            }}
          >
            {primaryTag}
          </div>
        )}
      </Link>

      {/* Card content */}
      <div className="p-6 flex flex-col flex-grow">
        <Link to={`/blog/${post.slug}`} className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-secondary)] rounded">
          <h3
            className="font-headline text-xl font-bold mb-3 transition-colors duration-300 line-clamp-2 text-justify"
            style={{ color: 'var(--blog-text-primary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--accent-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--blog-text-primary)';
            }}
          >
            {post.title}
          </h3>
        </Link>

        <p
          className="text-sm mb-6 line-clamp-2 font-body text-justify"
          style={{ color: 'var(--blog-text-secondary)' }}
        >
          {post.excerpt}
        </p>

        <div className="mt-auto flex justify-between items-center">
          <span
            className="text-xs font-label uppercase"
            style={{ color: 'var(--blog-text-muted)' }}
          >
            {formatDate(post.date)}
          </span>
          <div className="flex gap-2">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: 'var(--accent-primary)' }}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </motion.article>
  );
}
