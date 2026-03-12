import { useState, useEffect } from 'react';
import { loadGoogleAnalytics, disableGoogleAnalytics } from '../utils/analytics';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Sustituye con tu ID real de medición de GA4
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';
const COOKIE_CONSENT_KEY = 'user_cookie_consent';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  // Opciones de configuración
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  useEffect(() => {
    // 1. Revisar si hay una decisión previa en localStorage
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);

    if (savedConsent) {
      const parsedConsent = JSON.parse(savedConsent);
      // 2. Si fue aceptado (total o parcialmente con analíticas), cargar GA4
      if (parsedConsent.status === 'accepted' || (parsedConsent.status === 'configured' && parsedConsent.analytics)) {
        loadGoogleAnalytics(GA_MEASUREMENT_ID);
      } else {
        disableGoogleAnalytics(GA_MEASUREMENT_ID);
      }
    } else {
      // Si no hay decisión, mostrar el banner
      setShowBanner(true);
    }

    // Listener para reabrir el banner desde el footer u otro lado
    const handleReopen = () => setShowBanner(true);
    window.addEventListener('open-cookie-banner', handleReopen);
    return () => window.removeEventListener('open-cookie-banner', handleReopen);
  }, []);

  const handleAcceptAll = () => {
    const consentObj = { status: 'accepted', analytics: true, timestamp: new Date().toISOString() };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentObj));
    setShowBanner(false);
    loadGoogleAnalytics(GA_MEASUREMENT_ID);
  };

  const handleRejectAll = () => {
    const consentObj = { status: 'rejected', analytics: false, timestamp: new Date().toISOString() };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentObj));
    setShowBanner(false);
    disableGoogleAnalytics(GA_MEASUREMENT_ID);
  };

  const handleSaveConfig = () => {
    const consentObj = { status: 'configured', analytics: analyticsEnabled, timestamp: new Date().toISOString() };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentObj));
    setShowBanner(false);
    setShowConfig(false);

    if (analyticsEnabled) {
      loadGoogleAnalytics(GA_MEASUREMENT_ID);
    } else {
      disableGoogleAnalytics(GA_MEASUREMENT_ID);
    }
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="fixed bottom-0 left-0 w-full z-50 p-4 md:p-6"
        role="dialog"
        aria-live="polite"
        aria-labelledby="cookie-banner-title"
      >
        <div className="max-w-4xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl shadow-2xl p-6 relative overflow-hidden">
          {/* Decorative background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-fuchsia-500/10 via-transparent to-transparent pointer-events-none" />

          {!showConfig ? (
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h2 id="cookie-banner-title" className="text-xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM12 10.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM15.5 14a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM8.5 14a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                  Valoramos tu privacidad
                </h2>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Utilizamos cookies propias necesarias para el funcionamiento de la web y cookies de terceros (Google Analytics 4) para analizar el tráfico, sin fines publicitarios y totalmente anonimizadas. Puedes aceptar todas, rechazarlas o configurar tus preferencias. 
                  Más información en la <Link to="/politica-cookies" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">Política de Cookies</Link> y <Link to="/politica-privacidad" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">Política de Privacidad</Link>.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                <button
                  onClick={() => setShowConfig(true)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors focus:ring-2 focus:ring-fuchsia-500/40 outline-none"
                >
                  Configurar
                </button>
                <button
                  onClick={handleRejectAll}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-colors focus:ring-2 focus:ring-red-500/40 outline-none"
                >
                  Rechazar no esenciales
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-fuchsia-600 to-cyan-500 text-white hover:opacity-90 transition-opacity focus:ring-2 focus:ring-cyan-500/40 outline-none shadow-lg shadow-fuchsia-500/20"
                >
                  Aceptar todas
                </button>
              </div>
            </div>
          ) : (
            <div className="relative z-10">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Configuración de Cookies</h2>
              <div className="space-y-4 mb-6">
                
                {/* Estrictamente necesarias */}
                <div className="flex items-start justify-between p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)]">
                  <div className="pr-4">
                    <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-1">Cookies Estrictamente Necesarias</h3>
                    <p className="text-xs text-[var(--text-secondary)]">Son imprescindibles para que la página web funcione correctamente. Por ejemplo, guardar tu preferencia de tema oscuro/claro de forma local o tus propias preferencias sobre cookies.</p>
                  </div>
                  <div className="shrink-0 pt-1">
                    <span className="text-xs font-bold text-[var(--text-muted)] uppercase cursor-not-allowed">Siempre activas</span>
                  </div>
                </div>

                {/* Analíticas */}
                <div className="flex items-start justify-between p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)]">
                  <div className="pr-4">
                    <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-1">Cookies de Análisis (GA4)</h3>
                    <p className="text-xs text-[var(--text-secondary)]">Nos permiten medir de forma anónima cuántos usuarios visitan la web y qué secciones leen más. Nos ayuda enormemente a mejorar el contenido del portfolio. No cruzamos perfiles ni vendemos datos.</p>
                  </div>
                  <div className="shrink-0 pt-1">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={analyticsEnabled} 
                        onChange={() => setAnalyticsEnabled(!analyticsEnabled)}
                        aria-label="Habilitar o deshabilitar cookies analíticas"
                      />
                      <div className="w-11 h-6 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-full peer peer-focus:ring-2 peer-focus:ring-fuchsia-500/40 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-fuchsia-500"></div>
                    </label>
                  </div>
                </div>

              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowConfig(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Atrás
                </button>
                <button
                  onClick={handleSaveConfig}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-fuchsia-600 to-cyan-500 text-white hover:opacity-90 shadow-lg"
                >
                  Guardar configuración
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
