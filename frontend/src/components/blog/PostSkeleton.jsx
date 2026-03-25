/**
 * PostSkeleton — placeholder animado mientras se carga un post.
 */

export default function PostSkeleton() {
  return (
    <div className="relative min-h-screen overflow-x-hidden blog-cosmic-grid px-6 py-24 text-[var(--text-primary)] md:px-10 lg:px-14">
      <div className="pointer-events-none absolute inset-0" style={{ background: 'var(--blog-bg)' }} />
      <div className="relative z-10 mx-auto w-full max-w-6xl animate-pulse">
        {/* Back link */}
        <div className="h-4 w-28 rounded-full bg-[var(--bg-elevated)]" />
        {/* Title */}
        <div className="mt-8 space-y-3">
          <div className="h-10 w-3/4 rounded-2xl bg-[var(--bg-elevated)]" />
          <div className="h-10 w-1/2 rounded-2xl bg-[var(--bg-elevated)]" />
        </div>
        {/* Excerpt */}
        <div className="mt-6 space-y-2">
          <div className="h-4 w-full rounded-full bg-[var(--bg-elevated)]" />
          <div className="h-4 w-5/6 rounded-full bg-[var(--bg-elevated)]" />
        </div>
        {/* Meta row */}
        <div className="mt-8 flex gap-3">
          <div className="h-9 w-36 rounded-full bg-[var(--bg-elevated)]" />
          <div className="h-9 w-32 rounded-full bg-[var(--bg-elevated)]" />
          <div className="h-9 w-20 rounded-full bg-[var(--bg-elevated)]" />
        </div>
        {/* Cover image placeholder */}
        <div className="mt-10 h-64 w-full rounded-[1.8rem] bg-[var(--bg-elevated)] md:h-80" />
        {/* Content blocks */}
        <div className="mt-10 space-y-4">
          {[1, 0.9, 0.95, 0.8, 0.92, 0.7, 0.88, 0.6].map((w, i) => (
            <div
              key={i}
              className="h-4 rounded-full bg-[var(--bg-elevated)]"
              style={{ width: `${w * 100}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
