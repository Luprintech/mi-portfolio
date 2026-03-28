import { useTheme } from "../hooks/useTheme";

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
  const { isDark } = useTheme();

  const baseGradient = isDark
    ? "linear-gradient(135deg, #020d06 0%, #040f0a 40%, #03080f 70%, #060310 100%)"
    : "linear-gradient(135deg, #f2fbf5 0%, #eefaf4 38%, #eef5ff 72%, #f7f1ff 100%)";

  const pixelDot = isDark
    ? "rgba(52,211,153,0.9)"
    : "rgba(16,185,129,0.42)";

  const scanline = isDark
    ? "repeating-linear-gradient(0deg, rgba(0,0,0,0.8) 0px, rgba(0,0,0,0.8) 2px, transparent 2px, transparent 4px)"
    : "repeating-linear-gradient(0deg, rgba(79,70,229,0.08) 0px, rgba(79,70,229,0.08) 2px, transparent 2px, transparent 4px)";

  const emeraldGlow = isDark
    ? "radial-gradient(ellipse 50% 60% at 72% 52%, rgba(52,211,153,0.12), transparent 65%)"
    : "radial-gradient(ellipse 50% 60% at 72% 52%, rgba(16,185,129,0.16), transparent 65%)";

  const violetGlow = isDark
    ? "radial-gradient(ellipse 45% 55% at 22% 50%, rgba(168,85,247,0.10), transparent 65%)"
    : "radial-gradient(ellipse 45% 55% at 22% 50%, rgba(168,85,247,0.13), transparent 65%)";

  const vignette = isDark
    ? "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 55%, rgba(0,0,0,0.72) 100%)"
    : "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 58%, rgba(99,102,241,0.16) 100%)";

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
          background: baseGradient,
        }}
      />

      {/* Layer 1 — grid de puntos pixelados tipo pantalla LCD antigua */}
      <div
        className="absolute inset-0"
        style={{
          opacity: isDark ? 0.18 : 0.11,
          backgroundImage: `radial-gradient(circle, ${pixelDot} 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Layer 2 — scanlines CRT horizontales */}
      <div
        className="absolute inset-0"
        style={{
          opacity: isDark ? 0.07 : 0.045,
          backgroundImage: scanline,
          animation: "scanline-move 0.1s steps(1) infinite",
        }}
      />

      {/* Layer 3 — glow esmeralda zona juego (derecha/centro-derecha) */}
      <div
        className="absolute inset-0"
        style={{
          background: emeraldGlow,
        }}
      />

      {/* Layer 4 — halo fuchsia/violet zona texto (izquierda) */}
      <div
        className="absolute inset-0"
        style={{
          background: violetGlow,
        }}
      />

      {/* Layer 5 — vignette tipo monitor CRT (bordes oscuros) */}
      <div
        className="absolute inset-0"
        style={{
          background: vignette,
        }}
      />

      {/* Layer 6 — flicker muy sutil — evoca CRT sin marear */}
      <div
        className="absolute inset-0"
        style={{ animation: "flicker 8s ease-in-out infinite" }}
      />

      {/* Layer 7 — noise grain */}
      <div className="absolute inset-0 mix-blend-overlay bg-noise" style={{ opacity: isDark ? 0.04 : 0.02 }} />
    </div>
  );
}
