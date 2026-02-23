import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

/**
 * Grid de servicios reutilizable
 * @param {Array} services - Array de servicios a mostrar
 * @param {boolean} showLinks - Si true, las tarjetas son clicables
 */
export default function ServicesGrid({ services, showLinks = false }) {
  const { t } = useTranslation();
  return (
    <section className="w-full px-4 md:px-8 max-w-6xl mx-auto grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-6 pb-8">
      {services.map((service, index) => {
        const Icon = service.icon;
        
        const CardContent = (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            className={`bg-slate-800/70 p-6 rounded-2xl text-center shadow-lg transition-all flex flex-col justify-between items-center min-h-[180px] md:min-h-[200px] ${service.hoverShadow} ${showLinks ? 'cursor-pointer' : ''}`}
          >
            <div className={`flex justify-center items-center mb-3 ${service.iconColor}`}>
              <Icon size={service.iconSize} />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">{t(service.title)}</h3>
              <p className="text-sm opacity-80">{t(service.description)}</p>
            </div>
          </motion.div>
        );

        return (
          <Tilt key={service.id} tiltEnable scale={1.03}>
            {showLinks ? (
              <Link to={service.link}>
                {CardContent}
              </Link>
            ) : (
              CardContent
            )}
          </Tilt>
        );
      })}
    </section>
  );
}
