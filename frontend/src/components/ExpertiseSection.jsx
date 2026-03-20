import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";

/**
 * ExpertiseSection - Componente profesional para mostrar áreas de expertise técnica
 */
export default function ExpertiseSection({ area, index = 0 }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = area.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl overflow-hidden backdrop-blur-sm hover:border-[var(--accent-primary)] transition-all duration-300"
    >
      {/* Header (siempre visible) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 md:px-6 py-3 md:py-5 flex items-center justify-between text-left hover:bg-[var(--bg-elevated)] transition-colors duration-200"
      >
        <div className="flex items-center gap-4">
          {Icon && (
            <div className={`${area.iconColor} text-3xl flex-shrink-0`}>
              <Icon />
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">
              {area.title}
            </h3>
            <p className="text-sm text-[var(--text-muted)] mt-1 hidden sm:block">
              {area.intro.split('.')[0]}...
            </p>
          </div>
        </div>

        <FiChevronDown
          className={`text-2xl text-[var(--text-muted)] transition-transform duration-300 flex-shrink-0 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2 space-y-6 border-t border-[var(--border-subtle)]">
              {/* Intro completo */}
              <p className="text-[var(--text-secondary)] leading-relaxed">
                {area.intro}
              </p>

              {/* Capacidades técnicas */}
              <div>
                <h4 className="text-[var(--text-primary)] font-semibold mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 bg-gradient-to-b from-fuchsia-500 to-cyan-400 rounded" />
                  Capacidades técnicas
                </h4>
                <ul className="space-y-2">
                  {area.capabilities.map((capability, idx) => (
                    <li key={idx} className="text-[var(--text-secondary)] text-sm flex items-start gap-2">
                      <span className="text-cyan-400 mt-1 flex-shrink-0">•</span>
                      <span>{capability}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Stack habitual */}
              <div>
                <h4 className="text-[var(--text-primary)] font-semibold mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 bg-gradient-to-b from-fuchsia-500 to-cyan-400 rounded" />
                  Stack habitual
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(area.stack).map(([category, technologies]) => (
                    <div key={category} className="bg-[var(--bg-elevated)] rounded-lg p-3 border border-[var(--border-subtle)]">
                      <div className="text-xs font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wide">
                        {category}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {technologies.map((tech, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 bg-fuchsia-500/10 text-fuchsia-400 rounded border border-fuchsia-500/20"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Proyecto de ejemplo (opcional) */}
              {area.projectExample && (
                <div className="bg-[var(--bg-elevated)] rounded-lg p-4 border-l-4 border-cyan-400 border border-[var(--border-subtle)]">
                  <div className="flex items-start gap-3">
                    <div className="text-cyan-400 text-2xl mt-1">💡</div>
                    <div>
                      <h5 className="text-[var(--text-primary)] font-semibold mb-1">
                        {area.projectExample.name}
                      </h5>
                      <p className="text-[var(--text-secondary)] text-sm mb-2">
                        {area.projectExample.description}
                      </p>
                      <p className="text-[var(--text-muted)] text-xs italic">
                        {area.projectExample.context}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
