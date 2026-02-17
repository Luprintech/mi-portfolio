import { motion as Motion } from "framer-motion";
import { FaExternalLinkAlt } from "react-icons/fa";
import calculadora from "../../assets/portfolio/calculadora3d.png";
import youtube from "../../assets/portfolio/youtube.jpg";
import github from "../../assets/portfolio/github.png";

export default function PortfolioDesarrolloWeb() {
  const proyectos = [
    {
      titulo: "Calculadora 3D",
      descripcion:
        "Aplicación web interactiva que calcula el coste de impresión 3D según el material, tiempo y peso.",
      imagen: calculadora,
      link: "https://calculadora3d.luprintech.com/",
      tech: ["React", "CSS", "JavaScript"],
    },
    {
      titulo: "Mi GitHub",
      descripcion:
        "Repositorio donde comparto mis proyectos, experimentos y código abierto.",
      imagen: github,
      link: "https://github.com/Luprintech",
      tech: ["Open Source", "Proyectos", "Colaboraciones"],
    },
    {
      titulo: "Canal de YouTube",
      descripcion:
        "Luprintech – Tutoriales y contenido sobre desarrollo, IA e impresión 3D.",
      imagen: youtube,
      link: "https://www.youtube.com/@Luprintech",
      tech: ["Video", "Educación", "Tecnología"],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b1120] text-white py-28 px-6 md:px-16">
      {/* CABECERA */}
      <Motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-linear-to-r from-fuchsia-500 to-cyan-400">
          Proyectos de Desarrollo Web
        </h1>
        <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
          Una selección de proyectos web creados con pasión por la tecnología,
          el diseño y la experiencia del usuario.
        </p>
      </Motion.div>

      {/* GRID DE PROYECTOS */}
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto"
      >
        {proyectos.map((p, index) => (
          <Motion.div
            key={index}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 200, damping: 12 }}
            className="bg-slate-900/60 border border-slate-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-fuchsia-600/20 backdrop-blur-sm transition-all duration-300 flex flex-col"
          >
            {/* Imagen del proyecto */}
            <div className="flex justify-center items-center bg-slate-800/30 p-6">
              <img
                src={p.imagen}
                alt={p.titulo}
                className="w-48 h-36 object-contain hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>

            {/* Contenido */}
            <div className="p-6 flex flex-col grow justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2 text-center">
                  {p.titulo}
                </h3>
                <p className="text-gray-400 mb-3 text-center">
                  {p.descripcion}
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  {p.tech.map((t, i) => (
                    <span
                      key={i}
                      className="bg-fuchsia-500/20 text-fuchsia-300 text-xs px-2 py-1 rounded-md border border-fuchsia-400/30"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Botón */}
              <a
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center justify-center gap-2 bg-linear-to-r from-fuchsia-500 to-cyan-500 hover:from-fuchsia-400 hover:to-cyan-400 text-white font-semibold py-2 rounded-xl transition-all shadow-md hover:shadow-fuchsia-500/40"
              >
                Ver más <FaExternalLinkAlt className="text-sm" />
              </a>
            </div>
          </Motion.div>
        ))}
      </Motion.div>
    </div>
  );
}
