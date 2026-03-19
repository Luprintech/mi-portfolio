import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useTheme } from "../hooks/useTheme";

const rng = (n) => (((Math.sin(n * 127.1 + 311.7) * 43758.5453) % 1) + 1) % 1;

function buildStars(isDark) {
  return Array.from({ length: 60 }, (_, i) => {
    const layer = i < 26 ? 0 : i < 50 ? 1 : 2;
    const c = rng(i * 2.7);
    const [r, g, b] = isDark
      ? (c < 0.15 ? [232, 121, 249] : c < 0.28 ? [34, 211, 238] : [255, 255, 255])
      : (c < 0.18 ? [99, 102, 241]  : c < 0.34 ? [139, 92, 246]  : [6, 182, 212]);
    return {
      x: rng(i * 9.1),
      y: rng(i * 13.7),
      opBase: isDark
        ? (layer === 0 ? 0.14 + rng(i * 7.3) * 0.12 : layer === 1 ? 0.20 + rng(i * 7.3) * 0.13 : 0.28 + rng(i * 7.3) * 0.13)
        : (layer === 0 ? 0.06 + rng(i * 7.3) * 0.06 : layer === 1 ? 0.09 + rng(i * 7.3) * 0.08 : 0.13 + rng(i * 7.3) * 0.08),
      opAmp: 0.04 + rng(i * 3.7) * 0.07,
      radius: layer === 0 ? 0.6 + rng(i * 3.1) * 0.7 : layer === 1 ? 1.0 + rng(i * 3.1) * 1.0 : 1.5 + rng(i * 3.1) * 1.6,
      vx: (rng(i * 4.2) - 0.5) * (layer === 0 ? 0.000035 : layer === 1 ? 0.000055 : 0.000072),
      vy: (rng(i * 6.8) - 0.5) * (layer === 0 ? 0.000035 : layer === 1 ? 0.000055 : 0.000072),
      twPhase: rng(i * 17.3) * Math.PI * 2,
      twSpeed: (0.3 + rng(i * 11.1) * 0.7) * 0.001,
      r, g, b,
    };
  });
}

function StarCanvas({ isDark, reducedMotion }) {
  const canvasRef   = useRef(null);
  const starsRef    = useRef(null);
  const rafRef      = useRef(null);
  const lastTimeRef = useRef(null);

  starsRef.current = buildStars(isDark);

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = (time) => {
      const dt = lastTimeRef.current != null ? time - lastTimeRef.current : 16;
      lastTimeRef.current = time;
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      for (const s of starsRef.current) {
        s.x = ((s.x + s.vx * dt) % 1 + 1) % 1;
        s.y = ((s.y + s.vy * dt) % 1 + 1) % 1;
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
  }, [reducedMotion, isDark]);

  if (reducedMotion) return null;
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ display: "block", position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}

/**
 * TimelineSectionBg — Background for the "timeline / evolution" section.
 *
 * Layers (bottom → top):
 *  0. Base vertical gradient    — subtle top-to-bottom tonal shift
 *  1. Ambient top/bottom glows  — cyan top, violet bottom
 *  2. Star particles canvas     — same engine as PresentationSectionBg
 *  3. Breathing center halo     — slow pulse, violet
 *  4. Vertical flow strip       — two synchronized "energy" strips
 *  5. Noise grain               — organic texture
 */
export default function TimelineSectionBg() {
  const { isDark } = useTheme();
  const reducedMotion = useReducedMotion();

  // ── palette ──────────────────────────────────────────────────────────────────
  const baseGradient = isDark
    ? "linear-gradient(180deg, #06111f 0%, #0a1628 50%, #0d1030 100%)"
    : "linear-gradient(180deg, #edf2ff 0%, #e8efff 50%, #ece8ff 100%)";

  const ambientTop = isDark
    ? "radial-gradient(ellipse 80% 28% at 50% 0%, rgba(34,211,238,0.07), transparent)"
    : "radial-gradient(ellipse 80% 28% at 50% 0%, rgba(99,102,241,0.06), transparent)";

  const ambientBottom = isDark
    ? "radial-gradient(ellipse 80% 28% at 50% 100%, rgba(139,92,246,0.09), transparent)"
    : "radial-gradient(ellipse 80% 28% at 50% 100%, rgba(139,92,246,0.06), transparent)";

  const haloBg = isDark
    ? "radial-gradient(ellipse 50% 48% at 50% 50%, rgba(139,92,246,0.11), transparent 70%)"
    : "radial-gradient(ellipse 50% 48% at 50% 50%, rgba(99,102,241,0.07), transparent 70%)";

  // The "flowing energy" gradient — transparent on both ends for seamless loop
  const flowGradient = isDark
    ? "linear-gradient(180deg, transparent 0%, transparent 18%, rgba(34,211,238,0.0) 34%, rgba(34,211,238,0.85) 46%, rgba(139,92,246,0.65) 50%, rgba(34,211,238,0.85) 54%, rgba(34,211,238,0.0) 66%, transparent 82%, transparent 100%)"
    : "linear-gradient(180deg, transparent 0%, transparent 18%, rgba(99,102,241,0.0) 34%, rgba(99,102,241,0.65) 46%, rgba(139,92,246,0.50) 50%, rgba(99,102,241,0.65) 54%, rgba(99,102,241,0.0) 66%, transparent 82%, transparent 100%)";

  // ── render ───────────────────────────────────────────────────────────────────
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">

      {!reducedMotion && (
        <style>{`
          @keyframes tl-flow {
            0%   { transform: translateY(0); }
            100% { transform: translateY(33.334%); }
          }
          @keyframes tl-halo {
            0%, 100% { opacity: 0.45; }
            50%       { opacity: 1; }
          }
        `}</style>
      )}

      {/* Layer 0 — base vertical gradient */}
      <div className="absolute inset-0" style={{ background: baseGradient }} />

      {/* Layer 1 — ambient top/bottom tone */}
      <div className="absolute inset-0" style={{ background: `${ambientTop}, ${ambientBottom}` }} />

      {/* Layer 2 — star particles canvas */}
      <StarCanvas isDark={isDark} reducedMotion={reducedMotion} />

      {/* Layer 3 — center breathing halo */}
      <div
        className="absolute inset-0"
        style={{
          background: haloBg,
          ...(reducedMotion ? {} : { animation: "tl-halo 7s ease-in-out infinite" }),
        }}
      />

      {/* Layer 3 — vertical flow strip, desktop (centered at 50%) */}
      {!reducedMotion && (
        <div
          className="absolute inset-y-0 hidden md:block"
          style={{ left: "calc(50% - 14px)", width: "28px" }}
        >
          {/* Soft outer glow (wide + blurred) */}
          {[0, -6].map((delay) => (
            <div
              key={`desktop-glow-${delay}`}
              style={{
                position: "absolute",
                top: "-150%",
                left: 0,
                right: 0,
                height: "300%",
                backgroundImage: flowGradient,
                filter: "blur(8px)",
                opacity: isDark ? 0.6 : 0.45,
                animation: `tl-flow 12s linear ${delay}s infinite`,
              }}
            />
          ))}
          {/* Sharp inner core (1px) */}
          {[0, -6].map((delay) => (
            <div
              key={`desktop-core-${delay}`}
              style={{
                position: "absolute",
                top: "-150%",
                left: "calc(50% - 1px)",
                width: "2px",
                height: "300%",
                backgroundImage: flowGradient,
                animation: `tl-flow 12s linear ${delay}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* Layer 3b — vertical flow strip, mobile (left side at ~20px) */}
      {!reducedMotion && (
        <div
          className="absolute inset-y-0 md:hidden"
          style={{ left: "14px", width: "16px" }}
        >
          {[0, -6].map((delay) => (
            <div
              key={`mobile-glow-${delay}`}
              style={{
                position: "absolute",
                top: "-150%",
                left: 0,
                right: 0,
                height: "300%",
                backgroundImage: flowGradient,
                filter: "blur(6px)",
                opacity: isDark ? 0.55 : 0.4,
                animation: `tl-flow 12s linear ${delay}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* Layer 4 — noise grain */}
      <div className="absolute inset-0 opacity-[0.025] mix-blend-overlay bg-noise" />
    </div>
  );
}
