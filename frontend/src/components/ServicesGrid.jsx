import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

/**
 * Grid de servicios reutilizable
 * @param {Array} services - Array de servicios a mostrar
 * @param {boolean} showLinks - Si true, las tarjetas son clicables
 */
export default function ServicesGrid({ services, showLinks = false, compact = false }) {
  const { t } = useTranslation();

  return (
    <div className={`flex w-full flex-col items-center justify-center ${compact ? "max-w-6xl" : "max-w-7xl"}`}>
      <div className={`${compact ? "mb-6 md:mb-8" : "mb-10 md:mb-12"} text-center`}>
        <h2 className={`bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text font-extrabold text-transparent ${compact ? "text-[1.65rem] md:text-[2.05rem]" : "text-3xl md:text-4xl"}`}>
          {t("services.section_title")}
        </h2>
      </div>

      <div className={`grid w-full grid-cols-1 ${compact ? "gap-3 sm:grid-cols-2 lg:grid-cols-5" : "gap-5 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-5"}`}>
        {services.map((service, index) => {
          const Icon = service.icon;
          const iconSize = compact ? 24 : service.iconSize;

          const CardContent = (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              className={`flex h-full flex-col items-center rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-center shadow-[var(--shadow-sm)] transition-all hover:shadow-[var(--shadow-md)] ${compact ? "min-h-[136px] p-3.5 lg:min-h-[146px]" : "min-h-[168px] p-5 md:min-h-[188px]"} ${service.hoverShadow} ${showLinks ? "cursor-pointer" : ""}`}
            >
              <div className={`${compact ? "mb-2" : "mb-3"} flex shrink-0 items-center justify-center ${service.iconColor}`}>
                <Icon size={iconSize} />
              </div>
              <div className="flex w-full flex-col">
                <h3 className={`shrink-0 font-bold text-[var(--text-primary)] ${compact ? "mb-1 text-[15px] leading-tight" : "mb-2 text-lg"}`}>{t(service.title)}</h3>
                <p className={`${compact ? "text-[12px] leading-[1.45]" : "text-sm"} text-[var(--text-secondary)]`}>{t(service.description)}</p>
              </div>
            </motion.div>
          );

          return (
            <Tilt key={service.id} tiltEnable scale={1.03} className="flex h-full flex-col">
              {showLinks ? (
                <Link to={service.link} className="block h-full">
                  {CardContent}
                </Link>
              ) : (
                CardContent
              )}
            </Tilt>
          );
        })}
      </div>
    </div>
  );
}
