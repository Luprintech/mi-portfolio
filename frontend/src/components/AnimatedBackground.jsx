import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

// Deterministic pseudo-random — stable across renders, no Math.random drift
const rng = (n) => (((Math.sin(n * 127.1 + 311.7) * 43758.5453) % 1) + 1) % 1;

// Build star data once: 80 stars in 3 depth layers (far=0, mid=1, near=2)
function buildStars() {
  return Array.from({ length: 80 }, (_, i) => {
    const layer = i < 35 ? 0 : i < 65 ? 1 : 2;
    const c = rng(i * 2.7);
    const [r, g, b] =
      c < 0.15 ? [232, 121, 249] :  // fuchsia accent
      c < 0.28 ? [34,  211, 238] :  // cyan accent
                 [255, 255, 255];   // white (majority)
    return {
      x: rng(i * 9.1),             // normalized 0-1
      y: rng(i * 13.7),
      // Visible opacities — noticeably higher than the previous sub-visible values
      opBase: layer === 0 ? 0.20 + rng(i * 7.3) * 0.18  // far:  0.20–0.38
            : layer === 1 ? 0.30 + rng(i * 7.3) * 0.18  // mid:  0.30–0.48
            :               0.42 + rng(i * 7.3) * 0.16, // near: 0.42–0.58
      opAmp:  0.06 + rng(i * 3.7) * 0.10,  // twinkle amplitude
      // Proper pixel sizes — no sub-pixel rendering
      radius: layer === 0 ? 0.8 + rng(i * 3.1) * 0.7   // far:  0.8–1.5 px
            : layer === 1 ? 1.2 + rng(i * 3.1) * 1.1   // mid:  1.2–2.3 px
            :               1.8 + rng(i * 3.1) * 1.8,  // near: 1.8–3.6 px
      // Drift speed as fraction of canvas size per millisecond
      vx: (rng(i * 4.2) - 0.5) * (layer === 0 ? 0.000035 : layer === 1 ? 0.000055 : 0.000075),
      vy: (rng(i * 6.8) - 0.5) * (layer === 0 ? 0.000035 : layer === 1 ? 0.000055 : 0.000075),
      // Twinkle: independent phase and rate per star
      twPhase: rng(i * 17.3) * Math.PI * 2,
      twSpeed: (0.3 + rng(i * 11.1) * 0.7) * 0.001, // rad/ms
      r, g, b,
    };
  });
}

/**
 * AnimatedBackground — Gradient blobs + canvas particle stars for landing hero.
 *
 * Stars are rendered on a single <canvas> element via requestAnimationFrame.
 * Canvas approach bypasses all CSS cascade/custom-property interpolation limits
 * and guarantees pixel-accurate rendering with correct opacity.
 *
 * Three depth layers (far / mid / near) drift at different speeds and twinkle
 * independently. Disabled entirely with prefers-reduced-motion.
 */
export default function AnimatedBackground() {
  const reducedMotion = useReducedMotion();
  const canvasRef   = useRef(null);
  const starsRef    = useRef(null);
  const rafRef      = useRef(null);
  const lastTimeRef = useRef(null);

  // Initialize star data once — stable reference
  if (!starsRef.current) starsRef.current = buildStars();

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      // Match canvas resolution to display size × device pixel ratio
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
    };
    resize();

    // Keep canvas resolution synced on window resize
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = (time) => {
      const dt = lastTimeRef.current != null ? time - lastTimeRef.current : 16;
      lastTimeRef.current = time;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      for (const s of starsRef.current) {
        // Drift — wrap around edges for seamless movement
        s.x = ((s.x + s.vx * dt) % 1 + 1) % 1;
        s.y = ((s.y + s.vy * dt) % 1 + 1) % 1;
        // Twinkle — sine wave on opacity
        s.twPhase += s.twSpeed * dt;
        const op = Math.max(0, Math.min(1, s.opBase + Math.sin(s.twPhase) * s.opAmp));

        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.radius * dpr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.r},${s.g},${s.b},${op.toFixed(3)})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      lastTimeRef.current = null;
    };
  }, [reducedMotion]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">

      {/* Static ambient radial overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 24% 26%, rgba(232,121,249,0.18), transparent 34%),
            radial-gradient(circle at 74% 72%, rgba(34,211,238,0.16), transparent 36%),
            radial-gradient(circle at 52% 46%, rgba(168,85,247,0.12), transparent 42%)
          `,
        }}
      />

      {/* Star canvas — single DOM element for all 80 particles */}
      {!reducedMotion && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{ display: "block", position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />
      )}

      {/* Gradient blob 1 — fuchsia / top-left */}
      <motion.div
        className="absolute -left-[8%] top-[-6%] h-[38rem] w-[38rem] rounded-full bg-fuchsia-500/28 blur-[120px] md:h-[44rem] md:w-[44rem]"
        animate={reducedMotion ? {} : { x: [0, 180, -110, 0], y: [0, -24, 52, 0], scale: [1, 1.08, 0.95, 1], opacity: [0.46, 0.62, 0.52, 0.46] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Gradient blob 2 — cyan / bottom-right */}
      <motion.div
        className="absolute -bottom-[12%] -right-[6%] h-[40rem] w-[40rem] rounded-full bg-cyan-500/26 blur-[128px] md:h-[46rem] md:w-[46rem]"
        animate={reducedMotion ? {} : { x: [0, -190, 120, 0], y: [0, 44, -30, 0], scale: [1, 0.95, 1.08, 1], opacity: [0.42, 0.58, 0.5, 0.42] }}
        transition={{ duration: 34, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Gradient blob 3 — violet / center */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[44rem] w-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/14 blur-[138px] md:h-[52rem] md:w-[52rem]"
        animate={reducedMotion ? {} : { x: [0, 56, -36, 0], y: [0, -20, 18, 0], scale: [1, 1.1, 0.98, 1], opacity: [0.24, 0.32, 0.24, 0.24] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Content-focus glow — soft violet halo centered behind the text column */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 58% 48% at 38% 50%, rgba(168,85,247,0.08), transparent 70%)",
        }}
      />
    </div>
  );
}
