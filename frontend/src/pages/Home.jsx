import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Typewriter } from "react-simple-typewriter";
import Tilt from "react-parallax-tilt";
// import Particles from "react-tsparticles";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import miFoto from "../assets/mifoto.png";
import { getFeaturedProjects } from "../data/webProjects";
import { getFeaturedServices } from "../data/services";
import ProjectCard from "../components/ProjectCard";
import ServicesGrid from "../components/ServicesGrid";

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



export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans relative overflow-x-hidden selection:bg-violet-500/30">
      {/* 1. HERO - Identidad */}
      {/* Gradiente radial profundo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-[#0f172a] to-[#0f172a] pointer-events-none z-0" />
      {/* Textura Noise sutil general */}
      <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay pointer-events-none z-0" />

      {/* HERO */}
      <section className="flex flex-col items-center text-center pt-32 pb-12 z-10 relative px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl xs:text-5xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-cyan-400 tracking-tight">
            {t('hero.title')}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mb-10"
        >
          <h2 className="text-lg xs:text-xl md:text-2xl font-medium text-cyan-200/90 mb-2">
            {t('hero.subtitle')}
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-fuchsia-500 to-cyan-500 mx-auto rounded-full opacity-70"></div>
        </motion.div>

        {/* Imagen dinámica Glow y Tilt */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="relative mb-10 z-10"
        >
          <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.02} transitionSpeed={2000}>
            {/* Contenedor Glow Hover */}
            <div className="relative group rounded-full">
              {/* Sombra Glow interna */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/30 to-cyan-400/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <img
                src={miFoto}
                alt="Guadalupe Cano"
                className="relative z-10 w-40 xs:w-48 md:w-56 h-40 xs:h-48 md:h-56 rounded-full object-cover shadow-[0_0_30px_rgba(124,58,237,0.15)] group-hover:shadow-[0_0_40px_rgba(6,182,212,0.3)] transition-shadow duration-700 border border-white/5 bg-[#0f172a]"
              />
            </div>
          </Tilt>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="max-w-3xl text-base xs:text-lg md:text-xl text-slate-300 mx-auto leading-relaxed"
          dangerouslySetInnerHTML={{ __html: t('hero.description') }}
        />
      </section>

      {/* Qué hago - Services Grid */}
      <ServicesGrid services={getFeaturedServices()} showLinks={false} />

      {/* 3. Carrusel de tecnologías (Stack) con Grid */}
      <section className="relative w-full py-16 border-t border-b border-white/5 bg-[#0b1220] mt-12 overflow-hidden">
        {/* Fondo grid sutil */}
        <div className="absolute inset-0 pointer-events-none bg-grid-pattern opacity-40 z-0 text-white/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-3/4 bg-violet-600/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 px-4 md:px-8 max-w-5xl mx-auto">
          <p className="text-center text-slate-500 text-sm font-mono mb-8 tracking-widest uppercase">
            {t('home.ecosystem_title')}
          </p>
        <Swiper
          modules={[Autoplay]}
          slidesPerView={3}
          spaceBetween={20}
          loop={true}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
          }}
          speed={4000}
          allowTouchMove={false}
          breakpoints={{
            480: { slidesPerView: 4 },
            640: { slidesPerView: 5 },
            1024: { slidesPerView: 7 },
          }}
          className="opacity-70 grayscale hover:grayscale-0 transition-all duration-500"
        >
          {techs.map((tech) => (
            <SwiperSlide key={tech.name}>
              <div className="flex flex-col items-center gap-2">
                <img
                  src={tech.logo}
                  alt={tech.name}
                  className="h-10 xs:h-12 mx-auto object-contain"
                />
              </div>
            </SwiperSlide>
          ))}
          </Swiper>
        </div>
      </section>

      {/* 4. Portfolio destacado - Fondo alternado suave */}
      <section className="relative w-full px-6 md:px-12 lg:px-16 py-24 bg-gradient-to-br from-[#111827] to-[#0f172a]">
        {/* Separador overlay oscuro suave en la parte superior */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#0b1220] to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              {t('home.projects_title')}
            </h2>
            <p className="text-slate-400 mt-2 max-w-xl">
              {t('home.projects_subtitle')}
            </p>
          </div>
          <a
            href="/portfolio/desarrollo-web"
            className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-2 transition-colors"
          >
            {t('home.view_all_projects')}
          </a>
        </div>
        
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {getFeaturedProjects().map((proyecto, i) => (
              <ProjectCard key={proyecto.id} project={proyecto} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. CTA final Profesional - Limpieza visual extrema */}
      <section className="relative w-full px-6 md:px-8 py-20 bg-[#0b1220] text-center border-t border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            {t('home.cta_title')}
          </h2>
          <p className="text-lg text-slate-300 mb-8 leading-relaxed">
            {t('home.cta_desc')}
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
            <a
              href="/contacto"
              className="px-8 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 shadow-md transition-all duration-300 transform hover:-translate-y-1"
            >
              {t('home.contact_btn')}
            </a>
            
            <a
              href="/CV_Guadalupe_Cano.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 rounded-lg font-semibold text-cyan-300 border border-cyan-500/50 bg-[#0f172a]/50 hover:bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
              </svg>
              {t('home.cv_btn')}
            </a>

            <a
              href="https://www.linkedin.com/in/guadalupe-cano-moyano/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 rounded-lg font-semibold border border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 transition-all duration-300 transform hover:-translate-y-1"
            >
              {t('home.linkedin_btn')}
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
