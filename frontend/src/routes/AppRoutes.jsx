import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { lazy, Suspense } from "react";
import ProtectedRoute from "../components/cms/ProtectedRoute";

// ─── Páginas del portfolio (lazy) ────────────────────────────────────────────
const Home                   = lazy(() => import("../pages/Home"));
const About                  = lazy(() => import("../pages/About"));
const Portfolio              = lazy(() => import("../pages/Portfolio"));
const PortfolioDesarrolloWeb = lazy(() => import("../pages/portfolio/desarrollo-web"));
const PortfolioDocumentacion = lazy(() => import("../pages/portfolio/documentacion-tecnica"));
const Blog                   = lazy(() => import("../pages/Blog"));
const BlogPost               = lazy(() => import("../pages/BlogPost"));
const Contact                = lazy(() => import("../pages/Contact"));
const NotFound               = lazy(() => import("../pages/NotFound"));

// ─── Páginas del CMS /bitacora (lazy) ────────────────────────────────────────
const BitacoraLogin          = lazy(() => import("../pages/cms/BitacoraLogin"));
const BitacoraLayout         = lazy(() => import("../pages/cms/BitacoraLayout"));
const BitacoraHome           = lazy(() => import("../pages/cms/BitacoraHome"));
const BitacoraPosts          = lazy(() => import("../pages/cms/BitacoraPosts"));
const BitacoraPostEditor     = lazy(() => import("../pages/cms/BitacoraPostEditor"));
const BitacoraProjects       = lazy(() => import("../pages/cms/BitacoraProjects"));
const BitacoraProjectEditor  = lazy(() => import("../pages/cms/BitacoraProjectEditor"));
const BitacoraImages         = lazy(() => import("../pages/cms/BitacoraImages"));

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

          {/* ─── Portfolio ─── */}
          <Route path="/" element={<Motion.div {...pageTransition}><Home /></Motion.div>} />
          <Route path="/sobre-mi" element={<Motion.div {...pageTransition}><About /></Motion.div>} />
          <Route path="/portfolio" element={<Motion.div {...pageTransition}><Portfolio /></Motion.div>} />
          <Route path="/portfolio/desarrollo-web"        element={<Motion.div {...pageTransition}><PortfolioDesarrolloWeb /></Motion.div>} />
          <Route path="/portfolio/documentacion-tecnica" element={<Motion.div {...pageTransition}><PortfolioDocumentacion /></Motion.div>} />
          <Route path="/blog"       element={<Motion.div {...pageTransition}><Blog /></Motion.div>} />
          <Route path="/blog/:slug" element={<Motion.div {...pageTransition}><BlogPost /></Motion.div>} />
          <Route path="/contacto"   element={<Motion.div {...pageTransition}><Contact /></Motion.div>} />

          {/* ─── CMS /bitacora ─── */}
          <Route path="/bitacora">
            {/* Login — index route, accesible sin autenticación */}
            <Route index element={<BitacoraLogin />} />

            {/* Layout protegido (pathless) — aplica ProtectedRoute + BitacoraLayout a todos los hijos */}
            <Route element={<ProtectedRoute><BitacoraLayout /></ProtectedRoute>}>
              <Route path="inicio"                  element={<BitacoraHome />} />
              <Route path="posts"                   element={<BitacoraPosts />} />
              <Route path="posts/nuevo"             element={<BitacoraPostEditor />} />
              <Route path="posts/editar/:slug"      element={<BitacoraPostEditor />} />
              <Route path="proyectos"               element={<BitacoraProjects />} />
              <Route path="proyectos/nuevo"         element={<BitacoraProjectEditor />} />
              <Route path="proyectos/editar/:id"    element={<BitacoraProjectEditor />} />
              <Route path="imagenes"                element={<BitacoraImages />} />
            </Route>
          </Route>

          {/* 404 — catch-all */}
          <Route path="*" element={<Motion.div {...pageTransition}><NotFound /></Motion.div>} />

        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}
