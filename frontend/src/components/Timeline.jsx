import { motion as Motion } from "framer-motion";
import {
  FaLaptopCode,
  FaGraduationCap,
  FaServer,
  FaNetworkWired,
  FaCode,
  FaRobot,
  FaShieldAlt,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";

const lineGradient = "from-fuchsia-500 via-violet-500 to-cyan-400";

export default function Timeline() {
  const { t } = useTranslation();

  const eventos = [
    { year: "2003",      title: t('timeline.e1_title'), icon: <FaLaptopCode size={28} />,   desc: t('timeline.e1_desc') },
    { year: "2014",      title: t('timeline.e2_title'), icon: <FaGraduationCap size={28} />, desc: t('timeline.e2_desc') },
    { year: "2019",      title: t('timeline.e3_title'), icon: <FaServer size={28} />,        desc: t('timeline.e3_desc') },
    { year: "2021",      title: t('timeline.e4_title'), icon: <FaNetworkWired size={28} />,  desc: t('timeline.e4_desc') },
    { year: "2024–2026", title: t('timeline.e5_title'), icon: <FaCode size={28} />,          desc: t('timeline.e5_desc') },
    { year: "2025",      title: t('timeline.e6_title'), icon: <FaRobot size={28} />,         desc: t('timeline.e6_desc') },
    { year: "2026",      title: t('timeline.e7_title'), icon: <FaShieldAlt size={28} />,     desc: t('timeline.e7_desc') },
  ];

  return (
    <div className="w-full flex flex-col items-center py-14 relative">
      <Motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-3xl md:text-4xl font-bold mb-16 text-center bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-cyan-400 z-10"
      >
        {t('timeline.title_main')}
      </Motion.h2>

      <div className="relative w-full max-w-3xl z-10">
        {/* Línea vertical animada */}
        <div
          className={`absolute left-[38px] md:left-1/2 top-4 bottom-8 md:-translate-x-1/2 w-1 z-0
            bg-gradient-to-b ${lineGradient} animate-pulse blur-[1.5px] rounded-full`}
          style={{ boxShadow: "0 0 48px #d946ef55, 0 0 38px #22d3ee88" }}
        />
        {eventos.map((e, i) => (
          <TimelineItem key={i} {...e} index={i} />
        ))}
      </div>
    </div>
  );
}

function TimelineItem({ year, title, icon, desc, index }) {
  const isLeft = index % 2 === 0;
  return (
    <Motion.div
      initial={{ opacity: 0, x: isLeft ? -80 : 80 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.1 }}
      className={`relative mb-16 group flex md:items-center
        ${isLeft ? "flex-row md:flex-row" : "flex-row md:flex-row-reverse"}`}
    >
      {/* Punto + icono */}
      <div className="shrink-0 flex flex-col items-center z-20 ml-2 md:ml-0">
        <span
          className={`flex items-center justify-center w-16 h-16 rounded-full
            border-4 border-fuchsia-400 bg-[var(--bg-primary)] shadow-lg shadow-fuchsia-500/20
            group-hover:shadow-cyan-300/40 transition-all duration-300
            ring-2 ring-cyan-300/30 text-[var(--text-primary)]`}
          style={{ boxShadow: "0 0 28px #d946ef77, 0 0 11px #22d3ee66" }}
        >
          {icon}
        </span>
        <span className={`h-full w-2 bg-gradient-to-b ${lineGradient} my-1 rounded-full hidden md:block`} />
      </div>

      {/* Card */}
      <Motion.div
        whileHover={{
          scale: 1.03,
          boxShadow: "0 0 16px #d946ef88, 0 0 18px #22d3ee55",
        }}
        className={`flex-1 ml-4 mr-0 md:mx-10 bg-[var(--bg-surface)] border border-[var(--accent-primary)]/40
          shadow-[var(--shadow-sm)] rounded-2xl px-5 py-5 md:px-8 md:py-6 backdrop-blur-xl
          hover:border-[var(--accent-secondary)]/50 transition-all
          ${isLeft ? "md:ml-0 md:mr-10" : "md:mr-0 md:ml-10"}`}
      >
        <div className="flex flex-col md:flex-row md:items-center mb-2 gap-2">
          <div className="font-mono text-xs text-[var(--accent-secondary)]">{year}</div>
          <div className="font-bold text-xl md:ml-3 bg-gradient-to-r from-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
            {title}
          </div>
        </div>
        <div className="text-[var(--text-secondary)]">{desc}</div>
      </Motion.div>
    </Motion.div>
  );
}
