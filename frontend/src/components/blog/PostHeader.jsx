/**
 * PostHeader — cabecera del post: link volver, excerpt, fecha, tiempo de lectura y tags.
 */

import { Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Clock3 } from 'lucide-react';
import { formatDate, getReadTime } from './markdownComponents';

export default function PostHeader({ postMeta }) {
  return (
    <header className="mx-auto max-w-none">
      <Link
        to="/blog"
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver al blog
      </Link>

      <h1 className="mt-8 text-3xl font-extrabold leading-tight text-[var(--text-primary)] md:text-5xl">
        {postMeta.title}
      </h1>

      {postMeta.excerpt && (
        <p className="mt-6 max-w-3xl text-lg leading-8 text-justify text-[var(--text-secondary)] md:text-[1.05rem]">
          {postMeta.excerpt}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-[var(--text-secondary)]">
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)]/80 px-3.5 py-2">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          {formatDate(postMeta.date)}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)]/80 px-3.5 py-2">
          <Clock3 className="h-4 w-4" aria-hidden="true" />
          {getReadTime(postMeta)} min de lectura
        </span>
        {postMeta.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {postMeta.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)]/65 px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
