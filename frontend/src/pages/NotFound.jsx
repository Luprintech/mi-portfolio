import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-900/20 via-[var(--bg-primary)] to-[var(--bg-primary)] pointer-events-none" />
      <div className="absolute inset-0 bg-noise opacity-[0.02] mix-blend-overlay pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 text-center max-w-xl mx-auto"
      >
        <p className="text-8xl md:text-9xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-cyan-400 leading-none mb-4">
          404
        </p>

        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-4">
          {t("notfound.title", "Página no encontrada")}
        </h1>

        <p className="text-[var(--text-secondary)] mb-10 leading-relaxed">
          {t("notfound.desc", "La ruta que buscas no existe o ha sido movida.")}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 shadow-md transition-all duration-300 hover:-translate-y-1"
          >
            {t("notfound.go_home", "Volver al inicio")}
          </Link>
          <Link
            to="/contacto"
            className="px-8 py-3 rounded-xl font-semibold text-[var(--accent-secondary)] border border-[var(--accent-secondary)]/50 bg-[var(--bg-elevated)] hover:bg-[var(--accent-secondary-dim)] transition-all duration-300 hover:-translate-y-1"
          >
            {t("notfound.contact", "Contacto")}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
