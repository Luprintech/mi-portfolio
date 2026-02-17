import { Routes, Route, useLocation, Link } from "react-router-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";

import Home from "../pages/Home";
import About from "../pages/About";
import Portfolio from "../pages/Portfolio";
import PortfolioDesarrolloWeb from "../pages/portfolio/desarrollo-web";
import PortfolioImpresion3D from "../pages/portfolio/impresion-3d";
import Services from "../pages/Services";
import ServiceDevWeb from "../pages/services/DevWeb";
import ServiceIA from "../pages/services/IA";
import ServiceSoporte from "../pages/services/SoporteTI";
import ServiceImpresion from "../pages/services/Impresion3D";
import Blog from "../pages/Blog";
import Contact from "../pages/Contact";

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
          path="/portfolio/impresion-3d"
          element={
            <Motion.div {...pageTransition}>
              <PortfolioImpresion3D />
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
        {/* Puedes seguir añadiendo rutas del mismo modo */}
      </Routes>
    </AnimatePresence>
  );
}
