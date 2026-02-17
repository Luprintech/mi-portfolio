import { motion as Motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import mifoto from "../assets/pc.jpg";
import Timeline from "../components/Timeline.jsx";
import ToolsGrid from "../components/ToolsGrid.jsx";

export default function SobreMi() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-[#0b1120] to-[#1a1f3b] text-white px-6 pt-32 pb-20 overflow-hidden relative">
      {/* Luz ambiental suave */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-fuchsia-600/20 blur-[160px] rounded-full z-0" />
      <div className="absolute bottom-0 right-1/2 translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/10 blur-[120px] rounded-full z-0" />

      {/* PRESENTACIÓN */}
      <Motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="max-w-6xl flex flex-col md:flex-row items-center gap-12 mx-auto z-10"
      >
        {/* FOTO con Tilt y borde neón limpio */}
        <div className="shrink-0 md:order-2 relative group">
          <Motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 150 }}
            className="relative"
          >
            <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.05}>
              <div className="p-[3px] bg-linear-to-r from-fuchsia-500 via-cyan-400 to-purple-600 rounded-2xl shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all duration-500 group-hover:shadow-[0_0_25px_rgba(34,211,238,0.6)]">
                <img
                  src={mifoto}
                  alt="Lupe - Luprintech"
                  className="w-72 h-[430px] object-cover rounded-2xl"
                />
              </div>
            </Tilt>
          </Motion.div>
        </div>

        {/* TEXTO */}
        <div className="md:order-1 max-w-2xl space-y-6 text-justify">
          <p className="text-gray-300 text-lg leading-relaxed">
            Desde que montaba servidores caseros con ordenadores antiguos hasta
            el diseño e impresión 3D, la tecnología siempre ha formado parte de
            mi vida. Soy una persona curiosa, autodidacta y con una enorme
            pasión por aprender, experimentar y compartir lo que descubro.
          </p>
          <p className="text-gray-300 text-lg leading-relaxed">
            Cuento con el Ciclo Superior de{" "}
            <span className="text-emerald-500 font-semibold">
              Desarrollo de Aplicaciones Web
            </span>{" "}
            y con el{" "}
            <span className="text-fuchsia-400 font-semibold">
              Grado en Pedagogía.
            </span>{" "}
            Aplico esa mirada educativa en todo lo que hago: mi forma de
            comunicar, crear contenido y desarrollar proyectos se basa en un
            enfoque{" "}
            <span className="text-cyan-400 font-semibold">
              pedagógico y accesible
            </span>
            , donde enseñar y aprender van de la mano.
          </p>

          {/* BLOQUE DE SERVICIOS */}
          <Motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="border-l-4 border-fuchsia-500 pl-5 mt-6 space-y-5 bg-slate-800/30 rounded-lg py-4 shadow-md shadow-fuchsia-500/10"
          >
            <p>
              <span className="text-fuchsia-400 font-semibold">
                Desarrollo Web
              </span>
              : diseño y desarrollo de sitios y aplicaciones funcionales,
              modernas y personalizadas. Trabajo tanto con{" "}
              <span className="text-cyan-300">lenguajes y frameworks</span>{" "}
              (como React, Node.js o PHP) como con{" "}
              <span className="text-cyan-300">WordPress</span> y frameworks como{" "}
              <span className="text-cyan-300">Divi</span>, adaptando cada
              proyecto a las necesidades del cliente.
            </p>

            <p>
              <span className="text-amber-400 font-semibold">
                Soporte Técnico y Reparación
              </span>
              : mantenimiento de equipos, diagnóstico y reparación tanto a nivel{" "}
              <span className="text-cyan-300">hardware</span> como{" "}
              <span className="text-cyan-300">software</span>, de forma remota o
              presencial.
            </p>

            <p>
              <span className="text-emerald-400 font-semibold">
                Servidores y Sistemas
              </span>
              : instalación, configuración y gestión de entornos locales y
              cloud, incluyendo{" "}
              <span className="text-cyan-300">
                Raspberry Pi, Docker y NGINX
              </span>
              .
            </p>

            <p>
              <span className="text-cyan-400 font-semibold">Impresión 3D</span>:
              hobby personal enfocado en la{" "}
              <span className="text-cyan-300">impresión, calibración</span> y
              mantenimiento de impresoras, con proyectos creativos y piezas
              personalizadas.
            </p>

            <p>
              <span className="text-red-400 font-semibold">
                Divulgación Tecnológica
              </span>
              : contenido en redes como{" "}
              <span className="font-semibold text-fuchsia-400">Luprintech</span>
              , donde comparto tutoriales sobre desarrollo, impresión 3D y
              cultura maker.
            </p>
          </Motion.div>

          <Motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-gray-300 text-lg leading-relaxed"
          >
            Combino{" "}
            <span className="text-fuchsia-400 font-semibold">tecnología</span>,{" "}
            <span className="text-cyan-400 font-semibold">creatividad</span> y{" "}
            <span className="text-emerald-400 font-semibold">educación</span>{" "}
            para crear proyectos que no solo funcionen, sino que enseñen,
            inspiren y despierten curiosidad. Mi objetivo es seguir creciendo en
            el mundo del desarrollo y la innovación, aportando una visión donde
            la pedagogía y la tecnología se complementan para transformar ideas
            en experiencias reales.
          </Motion.p>
        </div>
      </Motion.div>

      {/* LÍNEA DE TIEMPO */}
      <Timeline />

      {/* GRID DE TOOLS */}
      <ToolsGrid />
    </section>
  );
}
