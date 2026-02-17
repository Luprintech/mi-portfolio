import { motion as Motion } from "framer-motion";
import {
  FaGraduationCap,
  FaReact,
  FaRaspberryPi,
  FaCube,
  FaCode,
  FaLaptopCode,
  FaLaptop,
} from "react-icons/fa";

// Puedes ampliar o personalizar los íconos según tu historia
const eventos = [
  {
    year: "2003",
    title: "Inicios en la reparación y montaje de ordenadores",
    icon: <FaLaptopCode size={28} />,
    desc: "Con apenas 12 años ya desmontaba, reparaba y montaba ordenadores por curiosidad y pasión por la tecnología.",
  },
  {
    year: "2014",
    title: "Grado de Pedagogía",
    icon: <FaGraduationCap size={28} />,
    desc: "Graduada de Pedagogía con Mención en Gestión en la Organización.",
  },
  {
    year: "2019",
    title: "Montaje de servidores caseros",
    icon: <FaLaptop size={28} />,
    desc: "Primeros proyectos con servidores caseros utilizando ordenadores antiguos.",
  },
  {
    year: "2021",
    title: "Descubrimiento Impresión 3D",
    icon: <FaRaspberryPi size={28} />,
    desc: "Primeros proyectos con Raspberry Pi, impresión 3D y electrónica DIY.",
  },
  {
    year: "2024 - 2026",
    title: "Ciclo Superior en Desarrollo De Aplicaciones Web",
    icon: <FaGraduationCap size={28} />,
    desc: "Formación oficial enfocada en el desarrollo de aplicaciones web con tecnologías como HTML, CSS, JavaScript, Java, PHP y SQL, integrando frameworks y bases de datos para crear soluciones funcionales y escalables.",
  },
  {
    year: "2025",
    title: "Primeros proyectos con React",
    icon: <FaReact size={28} />,
    desc: "Aprendizaje autodidacta de tecnologías frontend modernas.",
  },
  {
    year: "2025",
    title: "LuprinTech Youtube",
    icon: <FaCube size={28} />,
    desc: "Lanzamiento de LuprinTech, contenido sobre impresión 3D y tecnología educativa.",
  },
  {
    year: "2025",
    title: "Inteligencia Artificial y Automatizaciones",
    icon: <FaCode size={28} />,
    desc: "Curso de especialización en Inteligencia Artificial y automatización, ampliado con formación autodidacta. Experimenté con modelos de IA, APIs y flujos automatizados para integrar soluciones inteligentes en proyectos web y de creación de contenido.",
  },
];

const lineGradient = "from-fuchsia-500 via-violet-500 to-cyan-400";

export default function Timeline() {
  return (
    <div className="w-full flex flex-col items-center py-14 relative">
      {/* Línea vertical animada */}
      <div
        className={`absolute left-1/2 top-8 bottom-8 -translate-x-1/2 w-1 z-0
        bg-linear-to-b ${lineGradient} animate-pulse blur-[1.5px] rounded-full`}
        style={{ boxShadow: "0 0 48px #d946ef55, 0 0 38px #22d3ee88" }}
      />
      {/* Cards animadas */}
      <div className="relative w-full max-w-3xl z-10">
        {eventos.map((e, i) => (
          <TimelineItem key={i} {...e} index={i} />
        ))}
      </div>
    </div>
  );
}

function TimelineItem({ year, title, icon, desc, index }) {
  // Alterna lado visual
  const isLeft = index % 2 === 0;
  return (
    <Motion.div
      initial={{ opacity: 0, x: isLeft ? -80 : 80 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.1 }}
      className={`
        relative mb-16 group flex md:items-center gap-0
        ${isLeft ? "md:flex-row" : "md:flex-row-reverse"}
      `}
    >
      {/* Punto+icono */}
      <div className="shrink-0 flex flex-col items-center z-20">
        <span
          className={`flex items-center justify-center w-16 h-16 rounded-full
            border-4 border-fuchsia-400 bg-[#131a2c] shadow-lg shadow-fuchsia-500/20
            group-hover:shadow-cyan-300/40 transition-all duration-300
            ring-2 ring-cyan-300/30
            `}
          style={{ boxShadow: "0 0 28px #d946ef77, 0 0 11px #22d3ee66" }}
        >
          {icon}
        </span>
        {/* Conector línea */}
        <span
          className={`h-full w-2 bg-linear-to-b ${lineGradient} my-1 rounded-full hidden md:block`}
        />
      </div>

      {/* Card */}
      <Motion.div
        whileHover={{
          scale: 1.03,
          boxShadow: "0 0 16px #d946ef88, 0 0 18px #22d3ee55",
        }}
        className={`
          flex-1 mx-4 md:mx-10 bg-slate-900/70 border border-fuchsia-500/40
          shadow-lg shadow-cyan-500/10 rounded-2xl px-8 py-6 backdrop-blur-xl
          hover:border-cyan-300/50 transition-all
          ${isLeft ? "md:ml-0 md:mr-10" : "md:mr-0 md:ml-10"}
        `}
      >
        <div className="flex flex-col md:flex-row md:items-center mb-2 gap-2">
          <div className="font-mono text-xs text-cyan-200">{year}</div>
          <div className="font-bold text-xl md:ml-3 bg-linear-to-r from-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
            {title}
          </div>
        </div>
        <div className="text-gray-300">{desc}</div>
      </Motion.div>
    </Motion.div>
  );
}
