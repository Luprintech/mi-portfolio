import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { FaCode, FaYoutube } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

export default function Portfolio() {
  const { t } = useTranslation();
  const location = useLocation();
  const isRoot = location.pathname === '/portfolio' || location.pathname === '/portfolio/';

  return (
    <section className={`min-h-screen relative bg-[var(--bg-primary)] text-[var(--text-primary)] ${isRoot ? 'pt-32 pb-20' : 'pt-0 pb-0'} px-0 w-full flex flex-col items-center selection:bg-violet-500/30`}>
      {isRoot && (
        <>
          <Helmet>
            <title>Portfolio | Guadalupe Cano — Proyectos Full Stack con IA</title>
            <meta name="description" content="Proyectos reales de Guadalupe Cano: aplicaciones web con React, Laravel, Node.js, integración de IA con Gemini y automatización con n8n desplegadas en producción." />
            <link rel="canonical" href="https://guadalupecano.es/portfolio" />
          </Helmet>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/10 via-[var(--bg-primary)] to-[var(--bg-primary)] pointer-events-none z-0" />
          <div className="absolute inset-0 bg-noise opacity-[0.02] mix-blend-overlay pointer-events-none z-0" />

          <Motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 max-w-5xl w-full px-6 md:px-16"
          >
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 to-cyan-400">
                {t('portfolio_index.title')}
              </h1>
              <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto">
                {t('portfolio_index.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Desarrollo Web */}
              <Link
                to="desarrollo-web"
                className="group relative bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-2xl p-8 shadow-[var(--card-shadow)] hover:shadow-[0_0_25px_rgba(34,211,238,0.2)] hover:border-[var(--accent-secondary)]/40 transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[50px] rounded-full group-hover:bg-cyan-500/20 transition-all" />
                <FaCode className="text-4xl text-[var(--accent-secondary)] mb-6" />
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent-secondary)] transition-colors">
                  {t('portfolio_index.card1_title')}
                </h2>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed relative z-10">
                  {t('portfolio_index.card1_desc')}
                </p>
              </Link>

              {/* Documentación Técnica */}
              <Link
                to="documentacion-tecnica"
                className="group relative bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-2xl p-8 shadow-[var(--card-shadow)] hover:shadow-[0_0_25px_rgba(236,72,153,0.2)] hover:border-[var(--accent-primary)]/40 transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 blur-[50px] rounded-full group-hover:bg-fuchsia-500/20 transition-all" />
                <FaYoutube className="text-4xl text-fuchsia-400 mb-6" />
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3 group-hover:text-fuchsia-400 transition-colors">
                  {t('portfolio_index.card2_title')}
                </h2>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed relative z-10">
                  {t('portfolio_index.card2_desc')}
                </p>
              </Link>
            </div>
          </Motion.div>
        </>
      )}

      <div className="w-full">
        <Outlet />
      </div>
    </section>
  );
}
