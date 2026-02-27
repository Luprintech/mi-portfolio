import { motion } from "framer-motion";
import ExpertiseSection from "../components/ExpertiseSection";
import { getAllExpertiseAreas } from "../data/expertise";

export default function Expertise() {
  const expertiseAreas = getAllExpertiseAreas();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)] text-[var(--text-primary)] py-28 px-6 md:px-12">
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
        <p className="text-lg text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed">
          Áreas técnicas en las que me enfoco como desarrolladora full-stack.
          No se trata de servicios, sino de capacidades técnicas reales adquiridas
          mediante formación, proyectos y experimentación continua.
        </p>
      </motion.div>

      {/* Expertise Areas */}
      <div className="max-w-5xl mx-auto space-y-4">
        {expertiseAreas.map((area, index) => (
          <ExpertiseSection key={area.id} area={area} index={index} />
        ))}
      </div>

      {/* Footer Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="max-w-5xl mx-auto mt-16 text-center"
      >
        <p className="text-[var(--text-muted)] text-sm">
          Esta sección refleja mi stack actual y áreas de desarrollo continuo.
          Los proyectos mencionados son implementaciones prácticas de aprendizaje,
          no productos comerciales.
        </p>
      </motion.div>
    </div>
  );
}
