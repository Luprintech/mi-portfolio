import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import Particles from "react-tsparticles";
import meowSound from "/sounds/meow.mp3";
import luprincat from '/assets/meaow.webm';

export default function LuprinCat({ onClose }) {
  const [flip, setFlip] = useState(false);
  const [visible, setVisible] = useState(true);
  const [message, setMessage] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [catPosition, setCatPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [achievement, setAchievement] = useState(false);

  const meowInterval = useRef(null);
  const messageInterval = useRef(null);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const lastTime = useRef(Date.now());
  const clickCountRef = useRef(0);

  const x = useMotionValue(catPosition.x);
  const y = useMotionValue(catPosition.y);
  const stiffness = useRef(60);
  const damping = useRef(15);

  const smoothX = useSpring(x, { stiffness: stiffness.current, damping: damping.current });
  const smoothY = useSpring(y, { stiffness: stiffness.current, damping: damping.current });

  // 🐾 Movimiento con detección de velocidad
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

      const newX = e.clientX - 80;
      const newY = e.clientY - 80;
      x.set(newX);
      y.set(newY);
      setCatPosition({ x: newX, y: newY });

      lastMousePos.current = { x: e.clientX, y: e.clientY };
      lastTime.current = now;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [x, y]);

  // 🧠 Maullidos automáticos
  useEffect(() => {
    const playMeow = () => {
      if (isMuted) return;
      const audio = new Audio(meowSound);
      audio.volume = 0.3;
      audio.playbackRate = 0.8 + Math.random() * 0.6;
      audio.play();
    };

    meowInterval.current = setInterval(() => playMeow(), 3000);
    return () => clearInterval(meowInterval.current);
  }, [isMuted]);

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

  // 🖱️ Click sobre el gato
  const handleCatClick = () => {
    if (!isMuted) {
      const audio = new Audio(meowSound);
      audio.volume = 0.4;
      audio.play();
    }

    const clickMessages = [
      "¡Oye humano! 😼",
      "⚙️ Sistema felino alterado.",
      "¡Eso hace cosquillas! 🐾",
    ];
    const random = clickMessages[Math.floor(Math.random() * clickMessages.length)];
    setMessage(random);
    setTimeout(() => setMessage(null), 2000);

    // Logro secreto 🏆
    clickCountRef.current += 1;
    if (clickCountRef.current >= 3 && !achievement) {
      clickCountRef.current = 0;
      setAchievement(true);
      setTimeout(() => setAchievement(false), 4000);
    }
  };

  // 🔇 Silenciar
  const toggleMute = () => setIsMuted((m) => !m);

  // 🧹 Cerrar
  const handleClose = () => {
    setVisible(false);
    clearInterval(meowInterval.current);
    clearInterval(messageInterval.current);
    setTimeout(() => onClose?.(), 300);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-9999 select-none pointer-events-none">
      <Particles
        options={{
          particles: {
            number: { value: 15 },
            move: { enable: true, speed: 1.5 },
            size: { value: 2 },
            opacity: { value: 0.4 },
            color: { value: "#00ffff" },
          },
        }}
      />

      {/* 🐈 Gato */}
      <motion.video
        src={luprincat}
        alt ="LuprinCat"
        autoPlay
        loop
        muted
        playsInline
        onClick={handleCatClick}
        style={{
          x: smoothX,
          y: smoothY,
          transform: `scaleX(${flip ? -1 : 1})`,
          filter: "drop-shadow(0 0 25px cyan)",
          mixBlendMode: "screen",
        }}
        className="absolute w-48 h-48 object-contain pointer-events-auto cursor-pointer"
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

      {/* 🏆 Logro */}
      <AnimatePresence>
        {achievement && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 flex items-center justify-center z-10000"
          >
            <div className="bg-gradient-to-r from-fuchsia-600 to-cyan-500 text-white px-6 py-4 rounded-2xl shadow-2xl font-semibold text-lg border border-white/20">
              ✨ Logro desbloqueado: Amigo de los felinos cibernéticos 🐱💾
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🧩 Botones */}
      <div className="fixed bottom-6 right-6 flex gap-3 pointer-events-auto">
        <button
          onClick={toggleMute}
          className={`${
            isMuted ? "bg-red-500/20 text-red-300 hover:bg-red-500/40" : "bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/40"
          } px-3 py-2 rounded-lg text-sm transition`}
        >
          {isMuted ? "🔇 Silenciado" : "🔊 Desactivar sonido"}
        </button>

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
