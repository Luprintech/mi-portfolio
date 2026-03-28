import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import luprincat from '/assets/meaow.webm';

const PARTICLES_OPTIONS = {
  fullScreen: { enable: false },
  particles: {
    number: { value: 15 },
    move: { enable: true, speed: 1.5 },
    size: { value: 2 },
    opacity: { value: 0.4 },
    color: { value: "#00ffff" },
  },
  interactivity: {
    events: {
      onHover: { enable: false },
      onClick: { enable: false },
      resize: true,
    },
  },
};

export default function LuprinCat({ onClose }) {
  const [engineReady, setEngineReady] = useState(false);
  const [flip, setFlip] = useState(false);
  const [visible, setVisible] = useState(true);
  const [message, setMessage] = useState(null);
  const [catPosition, setCatPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  const messageInterval = useRef(null);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const lastTime = useRef(Date.now());
  const x = useMotionValue(catPosition.x);
  const y = useMotionValue(catPosition.y);
  const stiffness = useRef(60);
  const damping = useRef(15);

  const smoothX = useSpring(x, { stiffness: stiffness.current, damping: damping.current });
  const smoothY = useSpring(y, { stiffness: stiffness.current, damping: damping.current });

  // Inicializar el engine de tsparticles v3 una sola vez
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setEngineReady(true));
  }, []);

  // En móvil: posición inicial flotante (esquina inferior derecha)
  useEffect(() => {
    const coarsePointer = window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
    if (coarsePointer) {
      const mobileX = Math.max(16, window.innerWidth - 140);
      const mobileY = Math.max(80, window.innerHeight - 220);
      x.set(mobileX);
      y.set(mobileY);
      setCatPosition({ x: mobileX, y: mobileY });
    }
  }, [x, y]);

  // 🐾 Movimiento con detección de velocidad — mouse (desktop) + touch (móvil)
  useEffect(() => {
    const handleMouseMove = (e) => {
      const now = Date.now();
      const dt = now - lastTime.current;
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      const speed = Math.sqrt(dx * dx + dy * dy) / dt;

      setFlip(dx < 0);

      const newStiffness = Math.min(200, 60 + speed * 800);
      const newDamping = Math.max(10, 20 - speed * 8);
      stiffness.current = newStiffness;
      damping.current = newDamping;

      // El gato va DETRÁS del cursor (offset + inercia), no encima
      const newX = e.clientX + 20;
      const newY = e.clientY + 16;
      x.set(newX);
      y.set(newY);
      setCatPosition({ x: newX, y: newY });

      lastMousePos.current = { x: e.clientX, y: e.clientY };
      lastTime.current = now;
    };

    function handleTouchMove(e) {
      const touch = e.touches[0];
      if (!touch) return;
      const now = Date.now();
      const dx = touch.clientX - lastMousePos.current.x;
      setFlip(dx < 0);
      const newX = touch.clientX - 60;
      const newY = touch.clientY - 60;
      x.set(newX);
      y.set(newY);
      setCatPosition({ x: newX, y: newY });
      lastMousePos.current = { x: touch.clientX, y: touch.clientY };
      lastTime.current = now;
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [x, y]);

  // 💬 Frases dinámicas
  useEffect(() => {
    const phrases = [
      "⚡ Sistemas estables... por ahora.",
      "🐾 Miaw.exe ejecutado correctamente.",
      "👁️ Escaneo de red completado.",
      "💾 Guardando datos neuronales...",
      "🚀 Subiendo curiosidad al 120%."
    ];

    messageInterval.current = setInterval(() => {
      if (Math.random() > 0.6) {
        const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
        setMessage(randomPhrase);
        setTimeout(() => setMessage(null), 2500);
      }
    }, 6000);

    return () => clearInterval(messageInterval.current);
  }, []);

  // 🧹 Cerrar
  const handleClose = () => {
    setVisible(false);
    clearInterval(messageInterval.current);
    setTimeout(() => onClose?.(), 300);
  };

  // Callback estable para Particles (evita re-renders)
  const particlesLoaded = useCallback(() => {}, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-9999 select-none pointer-events-none">
      {engineReady && (
        <div className="pointer-events-none absolute inset-0">
          <Particles
            id="luprincat-particles"
            className="pointer-events-none absolute inset-0"
            options={PARTICLES_OPTIONS}
            particlesLoaded={particlesLoaded}
          />
        </div>
      )}

      {/* 🐈 Gato — mismo video en todos los dispositivos
           mixBlendMode:screen elimina el fondo negro en iOS/Safari sin alpha nativo */}
      <motion.video
        src={luprincat}
        aria-label="LuprinCat"
        autoPlay
        loop
        muted
        playsInline
        style={{
          x: smoothX,
          y: smoothY,
          scaleX: flip ? -1 : 1,
          filter: "drop-shadow(0 0 25px cyan)",
          mixBlendMode: "screen",
        }}
        className="absolute h-44 w-44 object-contain pointer-events-none"
      />

      {/* 💬 Frases */}
      <AnimatePresence>
        {message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: -80 }}
            exit={{ opacity: 0, y: -120 }}
            transition={{ duration: 0.5 }}
            style={{
              position: "absolute",
              left: `${catPosition.x + 80}px`,
              top: `${catPosition.y}px`,
              transform: "translate(-50%, -50%)",
            }}
            className="bg-cyan-900/60 text-cyan-300 border border-cyan-400/40 px-4 py-2 rounded-xl text-sm font-mono shadow-[0_0_12px_#22d3ee] backdrop-blur-sm"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🧩 Botones */}
      <div className="fixed bottom-6 right-6 flex gap-3 pointer-events-auto">
        <button
          onClick={handleClose}
          className="bg-cyan-500/20 text-cyan-300 px-3 py-2 rounded-lg text-sm hover:bg-cyan-500/40 transition"
        >
          Desactivar gatito 🐾
        </button>
      </div>
    </div>
  );
}
