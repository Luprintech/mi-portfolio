export function BlogHero() {
  return (
    <header className="pt-24 pb-12 px-4">
      <div className="mx-auto max-w-7xl">
        {/* "Mission Logs" glow label */}
        <div className="relative inline-block mb-4">
          <span
            className="relative z-10 font-label uppercase tracking-[0.3em] text-sm px-1"
            style={{ color: 'var(--accent-secondary)' }}
          >
            Mission Logs
          </span>
          {/* Blur glow behind label */}
          <div
            className="absolute -inset-1 rounded-full blur-md"
            style={{ background: 'color-mix(in srgb, var(--accent-secondary) 20%, transparent)' }}
            aria-hidden="true"
          />
        </div>

        {/* Gradient headline */}
        <h1
          className="font-headline text-4xl md:text-6xl lg:text-8xl font-extrabold mb-6 tracking-tighter"
          style={{ color: 'var(--blog-text-primary)' }}
        >
          Lupe's{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                'linear-gradient(to right, var(--accent-primary), var(--accent-violet), var(--accent-secondary))',
            }}
          >
            Logbook
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="w-full text-lg leading-relaxed font-body text-justify md:text-left"
          style={{ color: 'var(--blog-text-secondary)' }}
        >
          Aqu&iacute; documento lo que aprendo construyendo: decisiones t&eacute;cnicas, errores &uacute;tiles y cosas que ojal&aacute; hubiera encontrado en un blog cuando las necesitaba.
        </p>
      </div>
    </header>
  );
}
