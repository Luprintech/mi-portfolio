import { motion as Motion } from "framer-motion";
import { FaYoutube } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export default function PortfolioDocumentacion() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] py-28 px-6 md:px-16 relative overflow-x-hidden selection:bg-cyan-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-fuchsia-900/10 via-[var(--bg-primary)] to-[var(--bg-primary)] pointer-events-none z-0" />
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-cyan-600/10 blur-[150px] rounded-full mix-blend-screen animate-pulse pointer-events-none z-0" />
      <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay pointer-events-none z-0" />

      <Motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-4xl mx-auto text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(236,72,153,0.3)]">
          {t('portfolio.docs_title')}
        </h1>
      </Motion.div>

      <div className="relative z-10 max-w-4xl mx-auto mb-16">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 sm:p-8 md:p-12 rounded-2xl shadow-[var(--card-shadow)] text-[var(--text-secondary)] text-lg leading-relaxed backdrop-blur-sm">
          <p className="mb-6 text-justify">{t('portfolio.docs_desc')}</p>

          <h3 className="text-xl font-bold text-[var(--accent-secondary)] mb-4 mt-8">{t('portfolio.docs_examples_title')}</h3>
          <ul className="list-disc list-inside space-y-3 mb-8 text-[var(--text-muted)] marker:text-fuchsia-400">
            <li dangerouslySetInnerHTML={{ __html: t('portfolio.docs_ex1') }} />
            <li dangerouslySetInnerHTML={{ __html: t('portfolio.docs_ex2') }} />
            <li dangerouslySetInnerHTML={{ __html: t('portfolio.docs_ex3') }} />
            <li dangerouslySetInnerHTML={{ __html: t('portfolio.docs_ex4') }} />
            <li dangerouslySetInnerHTML={{ __html: t('portfolio.docs_ex5') }} />
          </ul>

          <div className="p-4 bg-[var(--bg-elevated)] rounded-lg border-l-4 border-fuchsia-500 border border-[var(--border-subtle)]">
            <p className="text-[var(--accent-secondary)] font-medium italic">
              {t('portfolio.docs_quote')}
            </p>
          </div>
        </div>
      </div>

      {/* Tarjeta YouTube */}
      <Motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative z-10 max-w-4xl mx-auto bg-[var(--bg-surface)] border border-[var(--accent-primary)]/30 rounded-2xl p-6 sm:p-10 text-center shadow-[var(--card-shadow)] hover:shadow-[0_0_50px_rgba(34,211,238,0.15)] transition-all backdrop-blur-md"
      >
        <FaYoutube className="text-6xl text-red-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-8 text-[var(--text-primary)]">{t('portfolio.docs_yt_title')}</h2>
        <a
          href="https://www.youtube.com/@Luprintech"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded-xl text-white font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)]"
        >
          <FaYoutube className="text-xl" />
          {t('portfolio.docs_yt_btn')}
        </a>
      </Motion.div>
    </div>
  );
}
