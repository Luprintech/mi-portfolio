import { motion } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";
import Tilt from "react-parallax-tilt";
// import Particles from "react-tsparticles";
import { FaCode, FaBrain, FaCubes, FaCog } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import miFoto from "../assets/mifoto.png"; // actualiza tu ruta

const techs = [
  {
    name: "React",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  },
  {
    name: "Docker",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
  },
  {
    name: "Nginx",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg",
  },
  {
    name: "WordPress",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/wordpress/wordpress-original.svg",
  },
  {
    name: "TailwindCSS",
    logo: "https://cdn.simpleicons.org/tailwindcss",
  },
  {
    name: "Node.js",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  },
  {
    name: "HTML5",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
  },
  {
    name: "CSS3",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
  },
];

const projects = [
  {
    tipo: "Web",
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    desc: "Landing tech futurista",
  },
  {
    tipo: "IA",
    img: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
    desc: "Chatbot inteligente",
  },
  {
    tipo: "3D",
    img: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    desc: "Prototipo impreso personalizado",
  },
  {
    tipo: "Educación",
    img: "https://images.unsplash.com/photo-1522202195461-cb71c6b4c804?auto=format&fit=crop&w=400&q=80",
    desc: "Plataforma educativa gamificada",
  },
];

const reels = [
  {
    url: "https://www.youtube.com/embed/ch8kkY6j8LE?si=AfOwqs0PYm4Ybcc7",
    title: "Cómo hacer un Funko Pop con IA e Impresión 3D",
  },
  {
    url: "https://www.youtube.com/embed/zU9PBKOhgWc?si=H23Lio4ommnTmIdj",
    title: "Migrar SO a un SSD con más capacidad",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0b1120] text-white font-sans relative overflow-x-hidden">
      {/* Fondo partículas y gradiente */}
      {/* <Particles /> */}
      <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-800/20 via-cyan-500/10 to-cyan-800/30 pointer-events-none z-0" />

      {/* HERO */}
      <section className="flex flex-col items-center text-center pt-32 pb-12 z-10 relative px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl xs:text-5xl md:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 to-cyan-400">
            ¡Hola, soy Lupe!
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          <h2 className="text-lg xs:text-xl md:text-2xl font-bold mb-6 text-cyan-200">
            <Typewriter
              words={[
                "Desarrolladora Web",
                "Creadora de Contenido",
                "Maker Tecnológica",
                "Apasionada por la IA",
              ]}
              loop={true}
              cursor
              cursorColor="#94f0ff"
            />
          </h2>
        </motion.div>

        {/* Imagen dinámica con Tilt y aura giratoria */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="relative mb-10"
        >
          {/* Aura giratoria */}
          <div className="absolute inset-0 rounded-full animate-spin-slow bg-gradient-to-r from-fuchsia-600 via-cyan-400 to-purple-500 opacity-40 blur-xl" />

          {/* Contenedor del borde animado */}
          <div className="gradient-border">
            <div className="gradient-border-inner">
              <Tilt tiltMaxAngleX={15} tiltMaxAngleY={15} scale={1.05}>
                <img
                  src={miFoto}
                  alt="Lupe"
                  className="w-44 xs:w-56 md:w-64 h-44 xs:h-56 md:h-64 rounded-full object-cover"
                />
              </Tilt>
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="max-w-2xl text-sm xs:text-base md:text-xl text-gray-300 mx-auto"
        >
          Combino tecnología, inteligencia artificial, impresión 3D y soporte
          técnico para crear soluciones únicas que unen lo digital y lo físico.
        </motion.p>
      </section>

      {/* Qué hago - Cards Tilt */}
      <section className="w-full px-4 md:px-8 max-w-6xl mx-auto grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-7 pb-8">
        {[
          {
            icon: <FaCode size={36} />,
            title: "Desarrollo Web",
            desc: "Webs únicas y funcionales, creadas para impulsar tu proyecto.",
            color: "fuchsia-600",
          },
          {
            icon: <FaBrain size={36} />,
            title: "Inteligencia Artificial",
            desc: "Automatización y análisis inteligente para potenciar tus ideas.",
            color: "cyan-400",
          },
          {
            icon: <FaCog size={36} />,
            title: "Soporte TI",
            desc: "Soluciones y asistencia tech para tu día a día digital.",
            color: "yellow-400",
          },
          {
            icon: <FaCubes size={36} />,
            title: "Impresión 3D",
            desc: "Materializa conceptos innovadores en piezas físicas y personalizadas.",
            color: "emerald-400",
          },
        ].map(({ icon, title, desc, color }, i) => (
          <Tilt key={title + i} tiltEnable scale={1.07}>
            <motion.div
              whileHover={{ scale: 1.08, boxShadow: "0 0 24px #ec4899" }}
              className={`bg-slate-800/70 p-6 rounded-2xl text-center shadow-lg transition-all flex flex-col justify-between items-center min-h-[180px] md:min-h-[200px] hover:shadow-[0_0_24px_var(--tw-color-${color})]`}
            >
              <div
                className={`flex justify-center items-center mb-3 text-${color}`}
              >
                {icon}
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className="text-sm opacity-80">{desc}</p>
              </div>
            </motion.div>
          </Tilt>
        ))}
      </section>

      {/* Carrusel de tecnologías */}
      <section className="w-full px-4 md:px-8 max-w-5xl mx-auto py-6">
        <Swiper
          modules={[Autoplay]}
          slidesPerView={2}
          spaceBetween={24}
          loop={true}
          autoplay={{
            delay: 0, // movimiento continuo
            disableOnInteraction: false,
          }}
          speed={3000} // velocidad de desplazamiento
          allowTouchMove={false} // evita detenerlo con el ratón
          breakpoints={{
            480: { slidesPerView: 3 },
            640: { slidesPerView: 4 },
            1024: { slidesPerView: 6 },
          }}
        >
          {techs.map((tech) => (
            <SwiperSlide key={tech.name}>
              <div className="flex flex-col items-center gap-1">
                <img
                  src={tech.logo}
                  alt={tech.name}
                  className="h-12 xs:h-14 mx-auto object-contain"
                />
                <div className="text-center text-xs mt-2">{tech.name}</div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Mini bloque filosofía - Scroll reveal */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9 }}
      >
        <div className="max-w-3xl mx-auto my-8 pb-4 text-center px-4 md:px-0">
          <p className="text-lg xs:text-xl text-cyan-200 font-medium">
            “Creo en la unión de tecnología, educación y creatividad. La
            innovación debe estar al alcance de todas las personas.”
          </p>
        </div>
      </motion.section>

      {/* Portfolio destacado */}
      <section className="w-full px-4 md:px-8 max-w-5xl mx-auto py-10">
        <h2 className="text-xl xs:text-2xl md:text-3xl font-semibold mb-7 text-fuchsia-300 text-center">
          Algunos proyectos destacados
        </h2>
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-8 mb-7">
          {projects.map((proj, i) => (
            <motion.div
              key={proj.tipo + i}
              whileHover={{ scale: 1.04, filter: "brightness(1.13)" }}
              className="bg-gradient-to-br from-fuchsia-600/30 to-cyan-600/20 rounded-2xl overflow-hidden shadow-xl transition-all"
            >
              <img
                src={proj.img}
                alt={proj.tipo}
                className="w-full h-40 xs:h-52 object-cover"
              />
              <div className="p-4 text-sm text-white font-bold">
                {proj.tipo}
              </div>
              <div className="px-4 pb-4 text-xs text-gray-200">{proj.desc}</div>
            </motion.div>
          ))}
        </div>
        <div className="text-center">
          <a
            href="/portfolio"
            className="px-6 py-3 bg-gradient-to-r from-fuchsia-700 to-cyan-700 shadow-xl rounded-xl font-semibold neon-glow hover:scale-105 transition duration-300"
          >
            Ver todos los proyectos →
          </a>
        </div>
      </section>

      {/* Grid/Slider - LuprinTech en acción */}
      <section className="w-full px-4 md:px-8 max-w-4xl mx-auto pt-4 pb-12">
        <h2 className="text-xl md:text-2xl font-bold text-cyan-300 mb-7 text-center">
          Luprintech en acción
        </h2>
        
        {/* Vista móvil: Stack vertical - muestra todos los vídeos */}
        <div className="md:hidden flex flex-col gap-6">
          {reels.map((vid, i) => (
            <div key={vid.title + i}>
              <div className="rounded-xl overflow-hidden shadow-xl bg-black aspect-video w-full max-w-lg mx-auto mb-3">
                <iframe
                  src={vid.url}
                  title={vid.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
              <div className="text-center text-sm text-gray-300">{vid.title}</div>
            </div>
          ))}
        </div>

        {/* Vista desktop: Grid de 2 columnas */}
        <div className="hidden md:grid md:grid-cols-2 gap-8">
          {reels.map((vid, i) => (
            <div key={vid.title + i}>
              <div className="rounded-xl overflow-hidden shadow-xl bg-black aspect-video w-full">
                <iframe
                  src={vid.url}
                  title={vid.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
              <div className="text-center text-sm text-gray-300 mt-3">{vid.title}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="relative w-full px-6 md:px-8 py-16 bg-gradient-to-br from-[#0b1120] via-[#1a1a40]/60 to-[#0b1120] text-center overflow-hidden">
        {/* Fondo animado con blur */}
        <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600/20 via-cyan-500/10 to-purple-700/20 blur-3xl animate-pulse-slow" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative max-w-2xl mx-auto z-10"
        >
          {/* Título principal */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-extrabold mb-4 text-white drop-shadow-[0_0_12px_rgba(236,72,153,0.25)]"
          >
            ¿Tienes una idea?
          </motion.h2>

          {/* Subtítulo */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-slate-300 leading-relaxed mb-10"
          >
            Demos vida a tu proyecto con{" "}
            <span className="text-fuchsia-400 font-semibold">
              desarrollo web
            </span>
            ,{" "}
            <span className="text-cyan-400 font-semibold">soporte técnico</span>{" "}
            e{" "}
            <span className="text-emerald-400 font-semibold">
              inteligencia artificial
            </span>
            .
          </motion.p>

          {/* Botones */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <a
              href="/portfolio"
              className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 shadow-lg shadow-fuchsia-500/30 hover:scale-105 hover:shadow-cyan-400/30 transition-all duration-300"
            >
              Ver proyectos →
            </a>

            <a
              href="/contacto"
              className="px-8 py-3 rounded-xl font-semibold border border-cyan-400 text-cyan-300 hover:text-white hover:shadow-[0_0_20px_#22d3ee] transition-all duration-300"
            >
              Contactar
            </a>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
