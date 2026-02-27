import { motion as Motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";

export default function ModalMedia({ open, onClose, item }) {
  if (!open || !item) return null;

  const isVideo = item.isVideo;

  return (
    <AnimatePresence>
      <Motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <Motion.div
          key="modal"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, filter: "drop-shadow(0 0 40px #0ff8, 0 0 60px #ec38fc88)" }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 18 }}
          className="relative bg-[var(--bg-elevated)] rounded-3xl p-0 md:p-8 shadow-[0_0_50px_2px_#f0f,0_0_80px_6px_#0ff6] border border-fuchsia-500/50"
          style={{ maxWidth: "90vw", maxHeight: "90vh" }}
          onClick={e => e.stopPropagation()}
        >
          {/* Botón de cierre */}
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute top-4 right-4 text-fuchsia-400 bg-[var(--accent-primary-dim)] hover:bg-[var(--accent-primary-dim)] rounded-full p-2 z-10 transition-colors shadow-[0_0_18px_#f0f5] ring-2 ring-cyan-500/60 focus:outline-none"
          >
            <FaTimes size={22} />
          </button>

          {/* Multimedia centrada */}
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
            <div className="shrink-0 max-w-full md:max-w-[440px] mx-auto">
              {isVideo ? (
                <video
                  src={item.src}
                  controls
                  autoPlay
                  className="rounded-2xl max-h-[60vh] w-full bg-black border-4 border-cyan-400/40 shadow-[0_0_30px_#0ff]"
                  style={{ boxShadow: "0 0 50px #0ff9" }}
                />
              ) : (
                <img
                  src={item.src}
                  alt={item.nombre}
                  className="rounded-2xl max-h-[60vh] w-full object-contain bg-[var(--bg-surface)] border-4 border-fuchsia-500/40 shadow-[0_0_30px_#ec38fc99]"
                  style={{ boxShadow: "0 0 55px #ec38fcbb" }}
                />
              )}
            </div>
            {/* Info del proyecto */}
            <div className="text-center md:text-left w-full flex flex-col justify-center gap-2 px-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
                {item.nombre}
              </h2>
              <p className="text-[var(--text-secondary)] mb-1">{item.descripcion}</p>
              <div className="mt-2 text-sm text-[var(--accent-secondary)] space-y-1 font-mono">
                <div><span className="text-fuchsia-400">Material:</span> {item.material}</div>
                <div><span className="text-violet-400">Tiempo:</span> {item.tiempo}</div>
                <div><span className="text-[var(--accent-secondary)]">Color:</span> {item.color}</div>
              </div>
            </div>
          </div>
        </Motion.div>
      </Motion.div>
    </AnimatePresence>
  );
}
