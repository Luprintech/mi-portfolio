import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { publicRequest } from '../lib/publicApi';
import { BlogEmptyState } from '../components/blog/BlogEmptyState';
import { BlogFilterChips } from '../components/blog/BlogFilterChips';
import { BlogHero } from '../components/blog/BlogHero';
import { BlogPagination } from '../components/blog/BlogPagination';
import { BlogSearchBar } from '../components/blog/BlogSearchBar';
import { FeaturedPostCard } from '../components/blog/FeaturedPostCard';
import { PostCard } from '../components/blog/PostCard';

const POSTS_PER_PAGE = 6;

function getDeterministicPostKey(post = {}) {
  const slug = typeof post.slug === 'string' ? post.slug.trim() : '';
  if (slug) return slug.toLowerCase();

  const title = typeof post.title === 'string' ? post.title.trim() : '';
  if (title) return title.toLowerCase();

  return '';
}

function getTimestampFromDate(value) {
  if (typeof value !== 'string' || !value.trim()) {
    return Number.NEGATIVE_INFINITY;
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
}

function normalizePostsForListing(posts) {
  if (!Array.isArray(posts)) return [];

  return posts
    .map((post, originalIndex) => ({
      post,
      timestamp: getTimestampFromDate(post?.date),
      key: getDeterministicPostKey(post),
      originalIndex,
    }))
    .sort((a, b) => {
      if (a.timestamp !== b.timestamp) {
        return b.timestamp - a.timestamp;
      }

      if (a.key !== b.key) {
        return a.key.localeCompare(b.key, 'es');
      }

      return a.originalIndex - b.originalIndex;
    })
    .map((entry) => entry.post);
}

function SkeletonCard() {
  return (
    <div
      className="rounded-xl overflow-hidden animate-pulse"
      style={{ background: 'var(--blog-surface-low)' }}
    >
      <div className="h-48" style={{ background: 'var(--blog-surface)' }} />
      <div className="p-6 space-y-3">
        <div className="h-5 w-2/3 rounded-full" style={{ background: 'var(--blog-surface-high)' }} />
        <div className="h-4 w-full rounded-full" style={{ background: 'var(--blog-surface-high)' }} />
        <div className="h-4 w-4/5 rounded-full" style={{ background: 'var(--blog-surface-high)' }} />
        <div className="flex gap-2 pt-4">
          <div className="h-3 w-16 rounded-full" style={{ background: 'var(--blog-surface-high)' }} />
        </div>
      </div>
    </div>
  );
}

function SkeletonSection() {
  return (
    <section className="px-4 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Featured skeleton */}
        <div
          className="rounded-xl overflow-hidden animate-pulse mb-24"
          style={{ background: 'var(--blog-surface-low)' }}
        >
          <div className="grid md:grid-cols-2 gap-0">
            <div className="h-64 md:h-80" style={{ background: 'var(--blog-surface)' }} />
            <div className="p-8 md:p-12 space-y-4">
              <div className="h-4 w-20 rounded-full" style={{ background: 'var(--blog-surface-high)' }} />
              <div className="h-10 w-3/4 rounded-full" style={{ background: 'var(--blog-surface-high)' }} />
              <div className="h-4 w-full rounded-full" style={{ background: 'var(--blog-surface-high)' }} />
              <div className="h-4 w-5/6 rounded-full" style={{ background: 'var(--blog-surface-high)' }} />
            </div>
          </div>
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((item) => (
            <SkeletonCard key={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ErrorMessage({ error }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div
        className="rounded-2xl p-6 text-center"
        style={{
          border: '1px solid color-mix(in srgb, #ef4444 20%, transparent)',
          background: 'color-mix(in srgb, #ef4444 10%, transparent)',
          color: '#f87171',
        }}
      >
        {error}
      </div>
    </div>
  );
}

// ── Blog ───────────────────────────────────────────────────────────────────────

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTag, setActiveTag] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);
  const deferredQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    const controller = new AbortController();

    const fetchPosts = async () => {
      try {
        const data = await publicRequest('/api/posts', { signal: controller.signal });
        setPosts(normalizePostsForListing(data));
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error cargando posts:', err);
          setError('No se pudieron cargar los art\u00edculos. Int\u00e9ntalo de nuevo m\u00e1s tarde.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
    return () => controller.abort();
  }, []);

  const tagOptions = useMemo(() => {
    const counts = new Map();
    posts.forEach((post) => post.tags?.forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1)));
    const sortedTags = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'es'))
      .map(([label, count]) => ({ label, count }));

    return [{ label: 'Todos', count: posts.length }, ...sortedTags];
  }, [posts]);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();

    return posts.filter((post) => {
      if (activeTag !== 'Todos' && !post.tags?.includes(activeTag)) {
        return false;
      }

      if (!q) {
        return true;
      }

      return [post.title, post.excerpt, ...(post.tags || [])].join(' ').toLowerCase().includes(q);
    });
  }, [activeTag, deferredQuery, posts]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(POSTS_PER_PAGE);
  }, [activeTag, searchQuery]);

  const featured = useMemo(() => filtered.find((post) => post.featured) || filtered[0] || null, [filtered]);
  const remainingPosts = featured ? filtered.filter((post) => post.slug !== featured.slug) : filtered;
  const hasMore = visibleCount < remainingPosts.length;
  const paginated = remainingPosts.slice(0, visibleCount);

  return (
    <div
      className="min-h-screen blog-cosmic-grid"
      style={{ background: 'var(--blog-bg)' }}
    >
      <Helmet>
        <title>Lupe's Logbook | Guadalupe Cano - Desarrollo web e IA</title>
        <meta
          name="description"
          content="Blog t\u00e9cnico de Guadalupe Cano sobre desarrollo web, inteligencia artificial, arquitectura, despliegue e infraestructura aplicada a proyectos reales."
        />
        <link rel="canonical" href="https://guadalupecano.es/blog" />
      </Helmet>

      <BlogHero />

      {/* Search & Filter section */}
      <section className="mb-16 space-y-8 w-full max-w-7xl mx-auto px-4">
        <BlogSearchBar
          searchQuery={searchQuery}
          onSearchChange={(value) => {
            setSearchQuery(value);
            setVisibleCount(POSTS_PER_PAGE);
          }}
        />
        <BlogFilterChips
          activeTag={activeTag}
          onTagChange={(tag) => {
            setActiveTag(tag);
            setVisibleCount(POSTS_PER_PAGE);
          }}
          tagOptions={tagOptions}
        />
        {/* TODO: date filter near future selector insertion point. */}
        <div data-date-filter-anchor />
      </section>

      <main className="pb-20 max-w-7xl mx-auto px-4">
        {loading && <SkeletonSection />}
        {error && <ErrorMessage error={error} />}
        {!loading && !error && (
          <>
            {featured && <FeaturedPostCard post={featured} />}

            {filtered.length > 0 && (
              <section
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                aria-label="Art\u00edculos del blog"
              >
                {paginated.map((post, index) => (
                  <PostCard key={post.slug} post={post} index={index} />
                ))}
              </section>
            )}

            {filtered.length === 0 && (
              <BlogEmptyState
                query={deferredQuery}
                tag={activeTag}
                onReset={() => {
                  setSearchQuery('');
                  setActiveTag('Todos');
                  setVisibleCount(POSTS_PER_PAGE);
                }}
              />
            )}

            <BlogPagination
              hasMore={hasMore}
              onLoadMore={() => setVisibleCount((v) => v + POSTS_PER_PAGE)}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default Blog;
