import { useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { Youtube, ExternalLink } from "lucide-react";
import youtubeBg from "../assets/youtube.png";
import { getFeaturedServices } from "../data/services";
import ProjectCard from "../components/ProjectCard";
import AnimatedBackground from "../components/AnimatedBackground";
import Footer from "../components/Footer";
import PresentationSectionBg from "../components/PresentationSectionBg";
import ProfileStorySectionBg from "../components/ProfileStorySectionBg";
import TimelineSectionBg from "../components/TimelineSectionBg";
import ServicesSectionBg from "../components/ServicesSectionBg";
import ServicesGrid from "../components/ServicesGrid";
import LandingHero from "../components/LandingHero";
import PresentationSection from "../components/PresentationSection";
import ProfileStorySection from "../components/ProfileStorySection";
import SectionViewport from "../components/SectionViewport";
import SnakeGameBg from "../components/SnakeGameBg";
import YoutubeSectionBg from "../components/YoutubeSectionBg";

import Timeline from "../components/Timeline";
import SnakeGame from "../components/SnakeGame";
import { scrollToSection as scrollSnapToSection } from "../components/ScrollSnapContainer";
import ScrollHint from "../components/ScrollHint";
import SectionIndicators from "../components/SectionIndicators";
import useScrollSpy from "../hooks/useScrollSpy";
import { useProjects } from "../hooks/useProjects";

const SECTION_IDS = [
  "hero",
  "about",
  "experience",
  "timeline",
  "services",
  "projects",
  "snake",
  "youtube",
  "contact",
];

const techs = [
  { name: "React",       logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
  { name: "TypeScript",  logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
  { name: "JavaScript",  logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
  { name: "Node.js",     logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
  { name: "PHP",         logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg" },
  { name: "Laravel",     logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg" },
  { name: "MySQL",       logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
  { name: "TailwindCSS", logo: "https://cdn.simpleicons.org/tailwindcss/06B6D4" },
  { name: "HTML5",       logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
  { name: "CSS3",        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
  { name: "Docker",      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
  { name: "Linux",       logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg" },
  { name: "Nginx",       logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg" },
  { name: "WordPress",   logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/wordpress/wordpress-original.svg" },
];

export default function Home() {
  const { t } = useTranslation();
  const location = useLocation();
  const { featuredProjects, loading } = useProjects();
  const snapRef = useRef(null);
  const activeSection = useScrollSpy(SECTION_IDS, { rootRef: snapRef });

  const scrollToSectionHelper = useCallback(
    (sectionId) => scrollSnapToSection(snapRef.current, sectionId),
    []
  );

  const scrollToSection = useCallback(
    (sectionId, { updateHash = true } = {}) => {
      const didScroll = scrollToSectionHelper(sectionId);
      if (!didScroll) return;

      if (updateHash) {
        const basePath = window.location.pathname || "/";
        window.history.replaceState(null, "", sectionId === "hero" ? basePath : `${basePath}#${sectionId}`);
      }
    },
    [scrollToSectionHelper]
  );

  useEffect(() => {
    document.body.classList.add("home-scroll-snap");
    return () => document.body.classList.remove("home-scroll-snap");
  }, []);

  useEffect(() => {
    if (location.pathname !== "/") return;

    const hash = location.hash.replace("#", "");
    if (!hash || !SECTION_IDS.includes(hash)) return;

    const timeoutId = window.setTimeout(() => {
      scrollToSection(hash, { updateHash: false });
    }, 120);

    return () => window.clearTimeout(timeoutId);
  }, [location.hash, location.pathname, scrollToSection]);

  const handleIndicatorSelect = useCallback(
    (sectionId) => {
      scrollToSection(sectionId);
    },
    [scrollToSection]
  );

  return (
    <>
      <div
        ref={snapRef}
        id="snap-root"
        className="snap-root relative bg-[var(--bg-primary)] font-sans text-[var(--text-primary)] selection:bg-violet-500/30"
      >
      <Helmet>
        <title>Guadalupe Cano | Desarrolladora Full Stack · React · Node.js · IA</title>
        <meta name="description" content="Portfolio de Guadalupe Cano, desarrolladora Full Stack especializada en React, Node.js, integración de IA y automatización con n8n. Proyectos reales desplegados en producción." />
        <meta name="keywords" content="desarrolladora web, full stack, React, Node.js, Laravel, inteligencia artificial, n8n, automatización, Córdoba, España" />
        <link rel="canonical" href="https://guadalupecano.es/" />
      </Helmet>
      <ScrollHint activeSection={activeSection} />
      <SectionIndicators activeSection={activeSection} onSelectSection={handleIndicatorSelect} sectionIds={SECTION_IDS} snapRef={snapRef} />

      {/* Gradiente radial ambiental */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-[var(--bg-primary)] to-[var(--bg-primary)]" />
      {/* Textura noise */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-noise opacity-[0.03] mix-blend-overlay" />

      {/* ========== SECTION 1: HERO ========== */}
      <section id="hero" className="snap-page hero-section">
        <AnimatedBackground />
        <SectionViewport width="wide">
          <LandingHero />
        </SectionViewport>
      </section>

      {/* ========== SECTION 2: PRESENTATION (Photo + Identity) ========== */}
      <section id="about" className="snap-page">
        <ProfileStorySectionBg />
        <SectionViewport width="wide">
          <PresentationSection />
        </SectionViewport>
      </section>

      {/* ========== SECTION 3: PROFILE STORY (Tech + Story + Differentiation) ========== */}
      <section id="experience" className="snap-page">
        <PresentationSectionBg />
        <SectionViewport width="wide">
          <ProfileStorySection />
        </SectionViewport>
      </section>

      {/* ========== SECTION 4: TIMELINE ========== */}
      <section id="timeline" className="snap-page border-y border-[var(--border-subtle)]">
        <TimelineSectionBg />
        <SectionViewport width="full" contentClassName="relative z-10">
          <Timeline />
        </SectionViewport>
      </section>

      {/* ========== SECTION 5: SERVICES + ECOSYSTEM ========== */}
      <section id="services" className="snap-page">
        <ServicesSectionBg />
        <SectionViewport width="full" contentClassName="relative z-10">
          <div className="flex w-full max-w-[1180px] flex-col justify-center gap-10 md:gap-20">
            <ServicesGrid services={getFeaturedServices()} />

            <div id="tech" className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,black_12%,black_88%,transparent_100%)]">
              <div className="tech-track flex w-max items-center gap-10">
                {[...techs, ...techs].map((tech, i) => (
                  <div
                    key={`${tech.name}-${i}`}
                    className="flex shrink-0 items-center justify-center opacity-50 transition-all duration-300 hover:opacity-90 hover:scale-105 hover:drop-shadow-[0_0_14px_rgba(34,211,238,0.30)]"
                  >
                    <img
                      src={tech.logo}
                      alt={tech.name}
                      loading="lazy"
                      decoding="async"
                      className="h-7 object-contain md:h-8"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionViewport>
      </section>

      {/* ========== SECTION 7: FEATURED PROJECTS ========== */}
      <section id="projects" className="snap-page bg-[var(--bg-secondary)]">
        <div className="ambient-grid-halos pointer-events-none absolute inset-0 overflow-hidden" />
        <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.015] mix-blend-overlay" />

        <SectionViewport width="wide" scroll contentClassName="relative z-10">
          <div className="w-full">
          <div className="mb-8 flex flex-col items-start justify-between gap-4 md:mb-12 md:flex-row md:items-end">
            <div>
              <h2 className="typo-title text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)]">
                {t("home.projects_title")}
              </h2>
              <p className="typo-body text-[var(--text-muted)] mt-2 max-w-xl">
                {t("home.projects_subtitle")}
              </p>
            </div>
            <Link
              to="/proyectos"
              className="typo-label text-[var(--accent-secondary)] hover:text-[var(--accent-primary)] font-medium flex items-center gap-2 transition-colors"
            >
              {t("home.view_all_projects")}
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:gap-6">
            {loading ? (
              <p className="typo-body text-[var(--text-muted)]">Cargando proyectos...</p>
            ) : (
              featuredProjects.map((proyecto, i) => (
                <ProjectCard key={proyecto.id} project={proyecto} index={i} compact />
              ))
            )}
          </div>
          </div>
        </SectionViewport>
      </section>

      {/* ========== SECTION 8: SNAKE GAME ========== */}
      <section id="snake" className="snap-page overflow-hidden">
        <SnakeGameBg />

        <SectionViewport width="wide" contentClassName="relative z-10">
          <SnakeGame />
        </SectionViewport>
      </section>

      {/* ========== SECTION 9: YOUTUBE — antes del CTA final ========== */}
      <section id="youtube" className="snap-page">
        <YoutubeSectionBg />

        <SectionViewport width="wide" contentClassName="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65 }}
              className="flex w-full flex-col items-center gap-7 md:flex-row md:items-center md:gap-14"
            >
              {/* ── Preview tipo video ── */}
              <a
                href="https://www.youtube.com/@Luprintech"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-full shrink-0 md:w-[52%]"
                aria-label="Ver canal Luprintech en YouTube"
              >
                {/* Glow detrás */}
                <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-br from-red-500/14 via-transparent to-violet-500/10 blur-2xl transition-opacity duration-500 group-hover:opacity-150" />

                {/* Marco del preview */}
                <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.6)] transition-all duration-500 group-hover:scale-[1.025] group-hover:shadow-[0_32px_72px_rgba(0,0,0,0.7),0_0_40px_rgba(239,68,68,0.12)]">
                  {/* Imagen — recortada en zona central/thumbnails */}
                  <img
                    src={youtubeBg}
                    alt="Vista previa del canal Luprintech en YouTube"
                    className="aspect-video w-full object-cover object-top brightness-90 transition-all duration-500 group-hover:brightness-105"
                    loading="lazy"
                    decoding="async"
                  />

                  {/* Overlay gradiente: oscuro abajo */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  {/* Botón Play */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 shadow-[0_0_0_6px_rgba(220,38,38,0.20)] transition-all duration-300 group-hover:scale-110 group-hover:bg-red-500 group-hover:shadow-[0_0_0_10px_rgba(220,38,38,0.18),0_0_32px_rgba(220,38,38,0.4)]">
                      {/* Triángulo play */}
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="white" className="translate-x-0.5" aria-hidden="true">
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                    </div>
                  </div>

                  {/* Badge "YouTube" esquina inferior izquierda */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 backdrop-blur-sm">
                    <Youtube className="h-3.5 w-3.5 text-red-400" />
                    <span className="typo-label text-[11px] font-semibold tracking-wide text-white/90">Luprintech</span>
                  </div>
                </div>
              </a>

              {/* ── Contenido ── */}
              <div className="flex flex-col items-center gap-5 text-center">
                {/* Eyebrow */}
                <span className="typo-label text-[11px] font-semibold uppercase tracking-[0.18em] text-red-400/80">
                  Canal de YouTube
                </span>

                {/* Título */}
                <h2 className="typo-title text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl">
                  {t("about.yt_title")}
                </h2>

                {/* Descripción */}
                <p className="typo-body max-w-sm text-base leading-relaxed text-[var(--text-secondary)]">
                  {t("about.yt_desc")}
                </p>

                {/* CTA */}
                <a
                  href="https://www.youtube.com/@Luprintech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-xl bg-red-600 px-7 py-3.5 font-semibold text-white shadow-[0_10px_40px_rgba(220,38,38,0.32)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:bg-red-500 hover:shadow-[0_16px_52px_rgba(220,38,38,0.50)]"
                >
                  <Youtube className="h-5 w-5" />
                  {t("about.yt_btn")}
                  <ExternalLink className="h-4 w-4 opacity-70" />
                </a>
              </div>
            </motion.div>
          </SectionViewport>
      </section>

      {/* ========== SECTION 10: FINAL CTA — CONTACTO ========== */}
      <section id="contact" className="snap-page overflow-hidden">
        {/* Fondo oscuro base */}
        <div className="pointer-events-none absolute inset-0 bg-[var(--bg-primary)]" />

        {/* Glows grandes animados */}
        <div className="cta-glow-a pointer-events-none absolute left-1/2 top-1/2 h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-700/15 blur-[100px]" />
        <div className="cta-glow-b pointer-events-none absolute -left-[10%] bottom-[10%] h-[55vh] w-[55vh] rounded-full bg-indigo-600/12 blur-[90px]" />
        <div className="cta-glow-c pointer-events-none absolute -right-[8%] top-[12%] h-[50vh] w-[50vh] rounded-full bg-cyan-600/10 blur-[85px]" />

        {/* Grid sutil */}
        <div className="cta-grid-bg pointer-events-none absolute inset-0 opacity-[0.028]" />

        <SectionViewport width="narrow">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative w-full text-center"
          >
            {/* Halo focal detrás del card */}
            <div className="pointer-events-none absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-violet-600/10 via-transparent to-cyan-600/8 blur-3xl" />

            {/* Card glass */}
            <div className="group/card relative rounded-[2rem] border border-white/8 bg-white/[0.04] px-5 py-10 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_32px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:border-violet-400/20 hover:bg-white/[0.06] hover:shadow-[0_0_0_1px_rgba(139,92,246,0.18),0_40px_90px_rgba(0,0,0,0.55),0_0_60px_rgba(139,92,246,0.12),0_0_30px_rgba(34,211,238,0.07)] sm:px-10 md:px-14 md:py-14">

              {/* Línea decorativa superior */}
              <div className="mx-auto mb-8 h-px w-24 bg-gradient-to-r from-transparent via-violet-400/60 to-transparent" />

              <h2 className="typo-title mb-4 text-3xl font-extrabold tracking-tight text-[var(--text-primary)] xs:text-4xl md:mb-5 md:text-5xl">
                {t("home.cta_title")}
              </h2>
              <p className="typo-body mx-auto mb-8 max-w-xl text-base leading-relaxed text-[var(--text-secondary)] md:mb-10 md:text-lg">
                {t("home.cta_desc")}
              </p>

              <div className="flex flex-col flex-wrap items-center justify-center gap-4 sm:flex-row">
                {/* Botón principal — gradient + glow en hover */}
                <Link
                  to="/contacto"
                  className="rounded-xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-500 px-9 py-3.5 text-base font-semibold text-white shadow-[0_0_32px_rgba(139,92,246,0.30)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-[0_0_48px_rgba(139,92,246,0.50),0_0_20px_rgba(34,211,238,0.22)]"
                >
                  {t("home.contact_btn")}
                </Link>

                {/* CV — outline cian */}
                <a
                  href="/CV_Guadalupe_Cano.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-cyan-500/35 bg-cyan-500/5 px-8 py-3.5 text-base font-semibold text-cyan-300 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/60 hover:bg-cyan-500/10 hover:shadow-[0_0_24px_rgba(34,211,238,0.18)]"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                  </svg>
                  {t("home.cv_btn")}
                </a>

                {/* LinkedIn — outline violeta */}
                <a
                  href="https://www.linkedin.com/in/guadalupe-cano-moyano/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-violet-500/30 bg-violet-500/5 px-8 py-3.5 text-base font-semibold text-violet-300 transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/55 hover:bg-violet-500/10 hover:shadow-[0_0_24px_rgba(139,92,246,0.18)]"
                >
                  {t("home.linkedin_btn")}
                </a>
              </div>

              {/* Línea decorativa inferior */}
              <div className="mx-auto mt-10 h-px w-24 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
            </div>
          </motion.div>
        </SectionViewport>
      </section>

        {/* Footer dentro del snap-root para que no flote fuera del scroll */}
        <div className="snap-footer">
          <Footer />
        </div>
      </div>
    </>
  );
}
