import { Search } from 'lucide-react';

export function BlogSearchBar({ searchQuery, onSearchChange }) {
  return (
    <div className="relative group w-full">
      {/* Gradient glow border — idle 20% → focus 50% */}
      <div
        className="absolute -inset-0.5 rounded-xl blur opacity-20 group-focus-within:opacity-50 transition-opacity duration-500"
        style={{
          background: `linear-gradient(to right, var(--accent-primary), var(--accent-secondary))`,
        }}
        aria-hidden="true"
      />

      {/* Glass container */}
      <div className="relative blog-glass rounded-xl overflow-hidden flex items-center px-4 py-2 focus-within:border-[var(--accent-secondary)]/50 transition-all duration-300">
        <Search
          className="flex-shrink-0 mr-3 h-5 w-5"
          style={{ color: 'var(--accent-secondary)' }}
          aria-hidden="true"
        />
        <input
          type="search"
          aria-label="Buscar artículo"
          placeholder="Buscar artículos por tema, tecnología..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-transparent border-none focus:ring-0 focus:outline-none font-body py-3 placeholder:text-[var(--blog-text-muted)]"
          style={{
            color: 'var(--blog-text-primary)',
          }}
        />
      </div>
    </div>
  );
}
