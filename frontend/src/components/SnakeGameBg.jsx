/**
 * SnakeGameBg — Fondo retro/pixel para la sección del Snake.
 *
 * Capas (abajo → arriba):
 *  0. Base oscura casi negra con tinte verde muy sutil
 *  1. Grid de puntos pixelados (CSS radial-gradient repeat)
 *  2. Scanlines CRT horizontales
 *  3. Glow esmeralda detrás del área del juego (derecha)
 *  4. Halo fuchsia/violet detrás del texto (izquierda)
 *  5. Vignette — oscurece los bordes como monitor antiguo
 *  6. Noise grain — textura orgánica
 */
export default function SnakeGameBg() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0" aria-hidden="true">

      {/* Animación scanlines */}
      <style>{`
        @keyframes scanline-move {
          0%   { transform: translateY(0); }
          100% { transform: translateY(4px); }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          92%       { opacity: 1; }
          93%       { opacity: 0.94; }
          94%       { opacity: 1; }
          96%       { opacity: 0.97; }
          97%       { opacity: 1; }
        }
      `}</style>

      {/* Layer 0 — base oscura con tinte verde-negro retro */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #020d06 0%, #040f0a 40%, #03080f 70%, #060310 100%)",
        }}
      />

      {/* Layer 1 — grid de puntos pixelados tipo pantalla LCD antigua */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(52,211,153,0.9) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Layer 2 — scanlines CRT horizontales */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.8) 0px, rgba(0,0,0,0.8) 2px, transparent 2px, transparent 4px)",
          animation: "scanline-move 0.1s steps(1) infinite",
        }}
      />

      {/* Layer 3 — glow esmeralda zona juego (derecha/centro-derecha) */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 50% 60% at 72% 52%, rgba(52,211,153,0.12), transparent 65%)",
        }}
      />

      {/* Layer 4 — halo fuchsia/violet zona texto (izquierda) */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 45% 55% at 22% 50%, rgba(168,85,247,0.10), transparent 65%)",
        }}
      />

      {/* Layer 5 — vignette tipo monitor CRT (bordes oscuros) */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 55%, rgba(0,0,0,0.72) 100%)",
        }}
      />

      {/* Layer 6 — flicker muy sutil — evoca CRT sin marear */}
      <div
        className="absolute inset-0"
        style={{ animation: "flicker 8s ease-in-out infinite" }}
      />

      {/* Layer 7 — noise grain */}
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay bg-noise" />
    </div>
  );
}
