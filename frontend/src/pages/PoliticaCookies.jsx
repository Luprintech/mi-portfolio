import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

export default function CookiePolicy() {
  const openBanner = (e) => {
    e.preventDefault();
    window.dispatchEvent(new Event('open-cookie-banner'));
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] py-28 px-6 md:px-16 selection:bg-fuchsia-500/30">
      <Helmet>
        <title>Política de Cookies | Guadalupe Cano</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-[var(--bg-surface)] rounded-3xl p-8 md:p-12 border border-[var(--border-default)] shadow-2xl"
      >
        <h1 className="text-3xl md:text-5xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-300">
          Política de Cookies
        </h1>
        
        <div className="prose prose-invert max-w-none text-[var(--text-secondary)] space-y-6 text-sm md:text-base leading-relaxed text-justify">
          <p>
            Esta Política de Cookies explica qué son las cookies y cómo las usamos en el sitio web del portfolio profesional de Guadalupe Cano. De acuerdo con lo establecido por la LSSI-CE, el RGPD (Reglamento General de Protección de Datos) y la LOPDGDD, te ofrecemos toda la información transparente sobre nuestras prácticas de rastreo y almacenamiento local.
          </p>

          <h2 className="text-xl font-bold text-[var(--text-primary)] pt-6 border-b border-[var(--border-default)] pb-2">1. ¿Qué es una cookie?</h2>
          <p>
            Una cookie es un pequeño archivo de texto que un sitio web guarda en tu ordenador o dispositivo móvil cuando lo visitas. Nos permite reconocer tu navegador en visitas posteriores, recordar tus preferencias (como el modo claro/oscuro) y recopilar datos estadísticos anónimos sobre el rendimiento de la web.
          </p>

          <h2 className="text-xl font-bold text-[var(--text-primary)] pt-6 border-b border-[var(--border-default)] pb-2">2. Tipos de cookies que empleamos</h2>
          <p>Usamos dos grandes bloques de cookies o tecnologías de almacenamiento en el navegador (Local Storage / Session Storage):</p>
          
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)]">
              <h3 className="font-bold text-fuchsia-400 mb-2">Cookies Estrictamente Necesarias (Técnicas)</h3>
              <p className="text-sm">Son esenciales para el funcionamiento de la web. Sin ellas, acciones como guardar tus preferencias de las propias cookies o mantener tu vista en "Modo Oscuro" no podrían realizarse.</p>
              <ul className="list-disc ml-5 mt-2 space-y-1 text-sm text-[var(--text-muted)]">
                <li><code>theme</code>: Almacena localmente tu preferencia visual (claro u oscuro). Es permanente hasta que la cambies.</li>
                <li><code>user_cookie_consent</code>: Recuerda las decisiones que tomaste sobre este panel de privacidad.</li>
                <li><code>cms_token</code>: Si eres el administrador del sistema, esta cookie guarda tu JWT de autenticación.</li>
              </ul>
              <p className="text-xs text-cyan-400/80 mt-2 font-medium">No requieren de tu consentimiento previo por ser imprescindibles.</p>
            </div>

            <div className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)]">
              <h3 className="font-bold text-cyan-400 mb-2">Cookies de Análisis (Google Analytics 4)</h3>
              <p className="text-sm">Si nos das tu consentimiento, utilizamos Google Analytics 4 para ayudar a medir y entender cómo los usuarios navegan e interactúan en la aplicación.</p>
              <ul className="list-disc ml-5 mt-2 space-y-1 text-sm text-[var(--text-muted)]">
                <li><code>_ga</code>: Instaurada por GA para calcular visitas y campañas. Expira en 2 años.</li>
                <li><code>_ga_*</code>: Mantiene el estado de la sesión o las vistas de página. Expira en 2 años.</li>
              </ul>
              <p className="text-xs text-fuchsia-400 mt-2 font-medium">Destacamos que la IP de los usuarios es procesada de manera anónima (anonymize_ip: true), sin venta a terceros ni conexión con perfiles de marketing para publicidad.</p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-[var(--text-primary)] pt-6 border-b border-[var(--border-default)] pb-2">3. Configurar tu consentimiento actual</h2>
          <p>
            Puedes cambiar tu configuración de cookies aceptando explícitamente o rechazando los rastreadores en cualquier momento accediendo al panel mediante el siguiente enlace:
          </p>
          <div className="my-4">
            <button 
              onClick={openBanner}
              className="px-5 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-xl hover:bg-[var(--accent-primary-dim)] hover:text-fuchsia-400 transition-colors font-medium text-sm"
            >
              🛠️ Abrir panel de configuración de Cookies
            </button>
          </div>

          <h2 className="text-xl font-bold text-[var(--text-primary)] pt-6 border-b border-[var(--border-default)] pb-2">4. Desactivación desde el navegador</h2>
          <p>
            Adicionalmente a nuestro propio panel de consentimiento, la mayoría de los navegadores te permiten rechazar todas las cookies modificando su configuración. Los pasos suelen encontrarse en el menú de "Opciones" o "Preferencias" de los distintos navegadores:
          </p>
          <ul className="list-disc ml-5 space-y-1 text-sm">
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noreferrer" className="text-fuchsia-400 hover:underline">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noreferrer" className="text-fuchsia-400 hover:underline">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noreferrer" className="text-fuchsia-400 hover:underline">Apple Safari</a></li>
          </ul>
               
          <h2 className="text-xl font-bold text-[var(--text-primary)] pt-6 border-b border-[var(--border-default)] pb-2">5. Actualizaciones de Política</h2>
          <p>
            Esta política podrá actualizarse en función de exigencias legislativas o con la finalidad de adaptar dicha política a cambios en la web o directrices dictadas por la Agencia Española de Protección de Datos (AEPD). Fecha de última actualización: {new Date().toLocaleDateString()}.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
