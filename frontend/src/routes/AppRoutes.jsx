import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { lazy, Suspense } from "react";

// Lazy loading de páginas
const Home                 = lazy(() => import("../pages/Home"));
const About                = lazy(() => import("../pages/About"));
const Portfolio            = lazy(() => import("../pages/Portfolio"));
const PortfolioDesarrolloWeb = lazy(() => import("../pages/portfolio/desarrollo-web"));
const PortfolioDocumentacion = lazy(() => import("../pages/portfolio/documentacion-tecnica"));
const Blog                 = lazy(() => import("../pages/Blog"));
const BlogPost             = lazy(() => import("../pages/BlogPost"));
const Contact              = lazy(() => import("../pages/Contact"));

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin" />
      <div className="absolute inset-0 w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin animation-delay-150" />
    </div>
  </div>
);

// Animación de transición entre páginas
const pageTransition = {
  initial:    { opacity: 0, y: 8 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0, y: -8 },
  transition: { duration: 0.4, ease: "easeInOut" },
};

export default function AppRoutes() {
  const location = useLocation();

  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>

          {/* Inicio */}
          <Route path="/" element={<Motion.div {...pageTransition}><Home /></Motion.div>} />

          {/* Sobre mí */}
          <Route path="/sobre-mi" element={<Motion.div {...pageTransition}><About /></Motion.div>} />

          {/* Portfolio — índice y sub-páginas */}
          <Route path="/portfolio" element={<Motion.div {...pageTransition}><Portfolio /></Motion.div>} />
          <Route path="/portfolio/desarrollo-web"        element={<Motion.div {...pageTransition}><PortfolioDesarrolloWeb /></Motion.div>} />
          <Route path="/portfolio/documentacion-tecnica" element={<Motion.div {...pageTransition}><PortfolioDocumentacion /></Motion.div>} />

          {/* Blog */}
          <Route path="/blog"       element={<Motion.div {...pageTransition}><Blog /></Motion.div>} />
          <Route path="/blog/:slug" element={<Motion.div {...pageTransition}><BlogPost /></Motion.div>} />

          {/* Contacto */}
          <Route path="/contacto" element={<Motion.div {...pageTransition}><Contact /></Motion.div>} />

        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}
