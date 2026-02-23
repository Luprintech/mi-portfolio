import { motion } from "framer-motion";
import ExpertiseSection from "../components/ExpertiseSection";
import { getAllExpertiseAreas } from "../data/expertise";

export default function Services() {
  const expertiseAreas = getAllExpertiseAreas();

  return (
    <div className="min-h-screen bg-[#0f172a] text-white py-28 px-6 md:px-12 relative overflow-hidden selection:bg-violet-500/30">
      {/* Background radial y noise */}
      <div className="absolute inset-0 bg-noise opacity-[0.02] mix-blend-overlay pointer-events-none z-0" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#0b1220] to-transparent pointer-events-none z-0" />
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-5xl mx-auto mb-16 text-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-cyan-400">
          Technical Expertise
        </h1>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Áreas técnicas en las que me enfoco como desarrolladora full-stack. 
          No se trata de servicios comerciales, sino de capacidades técnicas reales 
          adquiridas mediante formación académica, proyectos y experimentación continua.
        </p>
      </motion.div>

      {/* Expertise Areas */}
      <div className="max-w-5xl mx-auto space-y-4">
        {expertiseAreas.map((area, index) => (
          <ExpertiseSection 
            key={area.id} 
            area={area} 
            index={index} 
          />
        ))}
      </div>

      {/* Footer Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="max-w-5xl mx-auto mt-16 text-center"
      >
        <p className="text-gray-400 text-sm">
          Esta sección refleja mi stack actual y áreas de desarrollo continuo. 
          Los proyectos mencionados son implementaciones prácticas de aprendizaje 
          que demuestran aplicación real de conceptos técnicos.
        </p>
      </motion.div>
    </div>
  );
}
