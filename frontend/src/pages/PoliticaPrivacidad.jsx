import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

export default function PoliticaPrivacidad() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] py-28 px-6 md:px-16 selection:bg-cyan-500/30">
      <Helmet>
        <title>Política de Privacidad | Guadalupe Cano</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-[var(--bg-surface)] rounded-3xl p-8 md:p-12 border border-[var(--border-default)] shadow-2xl"
      >
        <h1 className="text-3xl md:text-5xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-300">
          Política de Privacidad
        </h1>
        
        <div className="prose prose-invert max-w-none text-[var(--text-secondary)] space-y-6 text-sm md:text-base leading-relaxed text-justify">
          <p>
            En esta Política de Privacidad, Guadalupe Cano describe cómo recopila, utiliza y protege la información que los usuarios puedan proporcionar a través de este sitio web. Se ha estructurado asegurando el estricto cumplimiento del Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD) de España.
          </p>

          <h2 className="text-xl font-bold text-[var(--text-primary)] pt-6 border-b border-[var(--border-default)] pb-2">1. Responsable del Tratamiento</h2>
          <ul className="list-disc ml-5 space-y-1">
            <li><strong>Titular:</strong> Guadalupe Cano</li>
            <li><strong>Descripción:</strong> Desarrolladora Web / Administradora del Portfolio.</li>
            <li><strong>Email de contacto para privacidad:</strong> contacto@guadalupecano.es</li>
          </ul>

          <h2 className="text-xl font-bold text-[var(--text-primary)] pt-6 border-b border-[var(--border-default)] pb-2">2. Finalidad y Datos Recopilados</h2>
          <p>
            Al tratarse de una aplicación tipo <em>portfolio</em> construida puramente para exhibición profesional u ofreciendo contenido de lectura a través del blog:
          </p>
          <ul className="list-disc ml-5 space-y-1">
            <li>No recabamos datos personales como nombres, direcciones físicas, o teléfonos activamente, ya que <strong>no contamos con formularios de suscripción al newsletter comercial ni carritos de compra</strong>.</li>
            <li>El contacto en la página de información deriva hacia correos externos o enlaces a otras plataformas (como LinkedIn), aplicando entonces las políticas de dichas corporaciones.</li>
            <li><strong>Métricas Anónimas:</strong> Únicamente, con su permiso expreso a través del banner de cookies, usamos Google Analytics 4 configurado con anonimización de IPs. La finalidad de estos datos es estrictamente analítica y de seguridad (rendimiento del servidor, visitas a páginas).</li>
          </ul>
          <p className="mt-2 text-cyan-400 bg-cyan-400/10 p-3 rounded-lg border border-cyan-400/20 text-sm">
            Nunca utilizamos la información de navegación para conformar perfiles de marketing (Lead Scoring), remarketing o personalización publicitaria.
          </p>

          <h2 className="text-xl font-bold text-[var(--text-primary)] pt-6 border-b border-[var(--border-default)] pb-2">3. Legitimación Comercial y Base Legal</h2>
          <p>La base legal para el tratamiento de los rastros analíticos o cookies es el <strong>consentimiento previo explícito</strong> que se solicita al visitante nada más acceder a la plataforma web. El visitante es 100% libre de revocar dicho consentimiento en cualquier momento mediante nuestra interfaz de cookies.</p>

          <h2 className="text-xl font-bold text-[var(--text-primary)] pt-6 border-b border-[var(--border-default)] pb-2">4. Destinatarios Externos</h2>
          <p>
            No realizamos cesiones de los datos ni transferencias a terceros, salvo obligaciones puramente legales de las Autoridades competentes del Estado Español. Sin embargo, al usar Google Analytics 4, se comunica telemetría anonimizada a los servidores de Google LL.C. operando bajo los Estándares Internacionales de Privacidad y Cláusulas Contractuales Tipo (CCT) en la UE-EEUU.
          </p>

          <h2 className="text-xl font-bold text-[var(--text-primary)] pt-6 border-b border-[var(--border-default)] pb-2">5. Derechos ARCO </h2>
          <p>Según la Constitución y Ley vigente, asiste siempre a toda persona el derecho a:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Petición de Acceso a cualquier dato almacenado.</li>
            <li>Rectificación o Eliminación del mismo.</li>
            <li>Oposición y Limitación del tratamiento de la información recabada.</li>
            <li>Portabilidad estricta.</li>
          </ul>
          <p>Dado que nuestros sistemas técnicos (salvo analíticas anónimas) no retienen un registro nominativo u hojas de clientes habituales, su propia navegación en incógnito y rechazo de cookies basta para garantizar pleno anonimato. Aún así puede dirigir notificaciones al email de contacto profesional si presenciara un tratamiento dudoso o acudiendo a la AEPD en caso de que su petición sea vulnerada.</p>
        </div>
      </motion.div>
    </div>
  );
}
