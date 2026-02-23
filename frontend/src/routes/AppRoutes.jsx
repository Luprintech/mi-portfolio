import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { lazy, Suspense } from "react";

// Lazy loading de páginas para mejorar performance
const Home = lazy(() => import("../pages/Home"));
const About = lazy(() => import("../pages/About"));
const Portfolio = lazy(() => import("../pages/Portfolio"));
const PortfolioDesarrolloWeb = lazy(() => import("../pages/portfolio/desarrollo-web"));
const PortfolioDocumentacion = lazy(() => import("../pages/portfolio/documentacion-tecnica"));
const Services = lazy(() => import("../pages/Services"));
const ServiceDevWeb = lazy(() => import("../pages/services/DevWeb"));
const ServiceIA = lazy(() => import("../pages/services/IA"));
const ServiceSoporte = lazy(() => import("../pages/services/SoporteTI"));
const ServiceImpresion = lazy(() => import("../pages/services/Impresion3D"));
const Blog = lazy(() => import("../pages/Blog"));
const Contact = lazy(() => import("../pages/Contact"));
const Admin = lazy(() => import("../pages/Admin"));

// Loading fallback con animación
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0b1120]">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin"></div>
      <div className="absolute inset-0 w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin animation-delay-150"></div>
    </div>
  </div>
);

// Configuración de animación
const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.4, ease: "easeInOut" },
};

export default function AppRoutes() {
  const location = useLocation();

  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <Motion.div {...pageTransition}>
                <Home />
              </Motion.div>
            }
          />
          <Route
            path="/sobre-mi"
            element={
              <Motion.div {...pageTransition}>
                <About />
              </Motion.div>
            }
          />
          <Route
            path="/portfolio"
            element={
              <Motion.div {...pageTransition}>
                <Portfolio />
              </Motion.div>
            }
          />
          <Route
            path="/portfolio/desarrollo-web"
            element={
              <Motion.div {...pageTransition}>
                <PortfolioDesarrolloWeb />
              </Motion.div>
            }
          />
          <Route
            path="/portfolio/documentacion-tecnica"
            element={
              <Motion.div {...pageTransition}>
                <PortfolioDocumentacion />
              </Motion.div>
            }
          />

          <Route
            path="/servicios"
            element={
              <Motion.div {...pageTransition}>
                <Services />
              </Motion.div>
            }
          />
          <Route
            path="/servicios/desarrollo-web"
            element={
              <Motion.div {...pageTransition}>
                <ServiceDevWeb />
              </Motion.div>
            }
          />
          <Route
            path="/servicios/inteligencia-artificial"
            element={
              <Motion.div {...pageTransition}>
                <ServiceIA />
              </Motion.div>
            }
          />
          <Route
            path="/servicios/soporte-ti"
            element={
              <Motion.div {...pageTransition}>
                <ServiceSoporte />
              </Motion.div>
            }
          />
          <Route
            path="/servicios/impresion-3d"
            element={
              <Motion.div {...pageTransition}>
                <ServiceImpresion />
              </Motion.div>
            }
          />

          <Route
            path="/blog"
            element={
              <Motion.div {...pageTransition}>
                <Blog />
              </Motion.div>
            }
          />
          <Route
            path="/contacto"
            element={
              <Motion.div {...pageTransition}>
                <Contact />
              </Motion.div>
            }
          />
          <Route
            path="/admin-secreto"
            element={
              <Motion.div {...pageTransition}>
                <Admin />
              </Motion.div>
            }
          />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}
