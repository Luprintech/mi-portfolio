import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { FaCode, FaYoutube } from 'react-icons/fa';

export default function Portfolio() {
  const location = useLocation();
  const isRoot = location.pathname === '/portfolio' || location.pathname === '/portfolio/';

  return (
    <section className={`min-h-screen relative bg-[#0b1220] text-white ${isRoot ? 'pt-32 pb-20' : 'pt-0 pb-0'} px-0 w-full flex flex-col items-center selection:bg-violet-500/30`}>
      {isRoot && (
        <>
          {/* Textura ambiental general para la raíz */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/10 via-[#0b1220] to-[#0b1220] pointer-events-none z-0" />
          <div className="absolute inset-0 bg-noise opacity-[0.02] mix-blend-overlay pointer-events-none z-0" />

          <Motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 max-w-5xl w-full px-6 md:px-16"
          >
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 to-cyan-400">
              Proyectos y Registro Técnico
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Explora mis desarrollos enfocados en arquitectura web y consulta la documentación donde desgloso flujos de trabajo e integraciones complejas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Desarrollo Web */}
            <Link 
              to="desarrollo-web" 
              className="group relative bg-[#151a2a] border border-slate-700/50 rounded-2xl p-8 shadow-lg hover:shadow-[0_0_25px_rgba(34,211,238,0.2)] hover:border-cyan-500/30 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[50px] rounded-full group-hover:bg-cyan-500/20 transition-all"></div>
              <FaCode className="text-4xl text-cyan-400 mb-6" />
              <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                Desarrollo Full Stack
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed relative z-10">
                Aplicaciones web, APIs REST, plataformas y arquitecturas integrales, desarrolladas con tecnologías modernas y metodologías robustas acorde a necesidades del negocio.
              </p>
            </Link>

            {/* Documentación Técnica */}
            <Link 
              to="documentacion-tecnica" 
              className="group relative bg-[#151a2a] border border-slate-700/50 rounded-2xl p-8 shadow-lg hover:shadow-[0_0_25px_rgba(236,72,153,0.2)] hover:border-fuchsia-500/30 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 blur-[50px] rounded-full group-hover:bg-fuchsia-500/20 transition-all"></div>
              <FaYoutube className="text-4xl text-fuchsia-400 mb-6" />
              <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-fuchsia-300 transition-colors">
                Documentación Técnica
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed relative z-10">
                Registro en formato videoblog orientado estrictamente al desarrollo, en el que detallo flujos de trabajo, infraestructuras de sistemas, automatizaciones y lógica de negocio.
              </p>
            </Link>
          </div>
        </Motion.div>
        </>
      )}

      {/* Aquí se renderizarán las sub-páginas, que ya tienen su propio padding y min-h-screen habitualmente */}
      <div className="w-full">
        <Outlet />
      </div>
    </section>
  );
}
