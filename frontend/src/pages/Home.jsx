import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Tilt from "react-parallax-tilt";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { Helmet } from "react-helmet-async";
import miFoto from "../assets/mifoto-optimized.jpg";
import { getFeaturedServices } from "../data/services";
import ProjectCard from "../components/ProjectCard";
import ServicesGrid from "../components/ServicesGrid";
import { useProjects } from "../hooks/useProjects";

const techs = [
  { name: "React",       logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
  { name: "Docker",      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
  { name: "Nginx",       logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg" },
  { name: "WordPress",   logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/wordpress/wordpress-original.svg" },
  { name: "TailwindCSS", logo: "https://cdn.simpleicons.org/tailwindcss/06B6D4" },
  { name: "Node.js",     logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
  { name: "HTML5",       logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
  { name: "CSS3",        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
];

export default function Home() {
  const { t } = useTranslation();
  const { featuredProjects, loading } = useProjects();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans relative overflow-x-hidden selection:bg-violet-500/30">
      <Helmet>
        <title>Guadalupe Cano | Desarrolladora Full Stack · React · Node.js · IA</title>
        <meta name="description" content="Portfolio de Guadalupe Cano, desarrolladora Full Stack especializada en React, Node.js, integración de IA y automatización con n8n. Proyectos reales desplegados en producción." />
        <meta name="keywords" content="desarrolladora web, full stack, React, Node.js, Laravel, inteligencia artificial, n8n, automatización, Córdoba, España" />
        <link rel="canonical" href="https://guadalupecano.es/" />
      </Helmet>
      {/* Gradiente radial ambiental */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-[var(--bg-primary)] to-[var(--bg-primary)] pointer-events-none z-0" />
      {/* Textura noise */}
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
          <h2 className="text-lg xs:text-xl md:text-2xl font-medium text-[var(--accent-secondary)] mb-2 opacity-90">
            {t('hero.subtitle')}
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-fuchsia-500 to-cyan-500 mx-auto rounded-full opacity-70" />
        </motion.div>

        {/* Imagen con Tilt y Glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="relative mb-10 z-10"
        >
          <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.02} transitionSpeed={2000}>
            <div className="relative group rounded-full">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/30 to-cyan-400/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <img
                src={miFoto}
                alt="Guadalupe Cano"
                width="448"
                height="448"
                fetchPriority="high"
                decoding="async"
                className="relative z-10 w-40 xs:w-48 md:w-56 h-40 xs:h-48 md:h-56 rounded-full object-cover shadow-[0_0_30px_rgba(124,58,237,0.15)] group-hover:shadow-[0_0_40px_rgba(6,182,212,0.3)] transition-shadow duration-700 border border-[var(--border-color)] bg-[var(--bg-surface)]"
              />
            </div>
          </Tilt>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="max-w-3xl text-base xs:text-lg md:text-xl text-[var(--text-secondary)] mx-auto leading-relaxed"
        >
          {t('hero.description')}
        </motion.p>
      </section>

      {/* Qué hago — Services Grid */}
      <ServicesGrid services={getFeaturedServices()} showLinks={false} />

      {/* Carrusel de tecnologías */}
      <section className="relative w-full py-16 border-t border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] mt-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-grid-pattern opacity-40 z-0" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-3/4 bg-violet-600/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 px-4 md:px-8 max-w-5xl mx-auto">
          <p className="text-center text-[var(--text-muted)] text-sm font-mono mb-8 tracking-widest uppercase">
            {t('home.ecosystem_title')}
          </p>
          <Swiper
            modules={[Autoplay]}
            slidesPerView={3}
            spaceBetween={20}
            loop={true}
            autoplay={{ delay: 0, disableOnInteraction: false }}
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
                    loading="lazy"
                    decoding="async"
                    className="h-10 xs:h-12 mx-auto object-contain"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Portfolio destacado */}
      <section className="relative w-full px-6 md:px-12 lg:px-16 py-24 bg-[var(--bg-primary)]">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[var(--bg-secondary)] to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)]">
                {t('home.projects_title')}
              </h2>
              <p className="text-[var(--text-muted)] mt-2 max-w-xl">
                {t('home.projects_subtitle')}
              </p>
            </div>
            <Link
              to="/portfolio/desarrollo-web"
              className="text-[var(--accent-secondary)] hover:text-[var(--accent-primary)] font-medium flex items-center gap-2 transition-colors"
            >
              {t('home.view_all_projects')}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {loading ? (
              <p className="text-[var(--text-muted)]">Cargando proyectos...</p>
            ) : (
              featuredProjects.map((proyecto, i) => (
                <ProjectCard key={proyecto.id} project={proyecto} index={i} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="relative w-full px-6 md:px-8 py-20 bg-[var(--bg-secondary)] text-center border-t border-[var(--border-subtle)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-6">
            {t('home.cta_title')}
          </h2>
          <p className="text-lg text-[var(--text-secondary)] mb-8 leading-relaxed">
            {t('home.cta_desc')}
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
            <Link
              to="/contacto"
              className="px-8 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 shadow-md transition-all duration-300 transform hover:-translate-y-1"
            >
              {t('home.contact_btn')}
            </Link>

            <a
              href="/CV_Guadalupe_Cano.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 rounded-lg font-semibold text-[var(--accent-secondary)] border border-[var(--accent-secondary)]/50 bg-[var(--bg-elevated)] hover:bg-[var(--accent-secondary-dim)] shadow-sm transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
              </svg>
              {t('home.cv_btn')}
            </a>

            <a
              href="https://www.linkedin.com/in/guadalupe-cano-moyano/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 rounded-lg font-semibold border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-secondary)] transition-all duration-300 transform hover:-translate-y-1"
            >
              {t('home.linkedin_btn')}
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
