import { useTheme } from "../hooks/useTheme";

/**
 * YoutubeSectionBg — Fondo "Studio/Streaming" para la sección de YouTube.
 *
 * Estética: Plataforma de contenido moderno (no retro como Snake).
 * Evoca pantalla/streaming sin competir con el thumbnail del video.
 *
 * Capas (abajo → arriba):
 *  0. Base oscura con tinte cálido/rojizo muy sutil
 *  1. Grid de puntos MUY sutil (evoca píxeles de pantalla moderna)
 *  2. Glow rojo intenso detrás del área del video (izquierda)
 *  3. Glow violeta detrás del texto (derecha) — coherencia portfolio
 *  4. Vignette — enfoca la atención al centro
 *  5. Noise grain — textura orgánica premium
 */
export default function YoutubeSectionBg() {
  const { isDark } = useTheme();

  const baseGradient = isDark
    ? "linear-gradient(135deg, #0a0404 0%, #0f0606 40%, #0a0508 70%, #080410 100%)"
    : "linear-gradient(135deg, #fff5f5 0%, #fff3f3 40%, #f8f3ff 72%, #f5f7ff 100%)";

  const gridDot = isDark
    ? "rgba(239,68,68,0.6)"
    : "rgba(239,68,68,0.32)";

  const videoGlow = isDark
    ? "radial-gradient(ellipse 55% 65% at 28% 50%, rgba(239,68,68,0.15), transparent 65%)"
    : "radial-gradient(ellipse 55% 65% at 28% 50%, rgba(239,68,68,0.22), transparent 65%)";

  const textGlow = isDark
    ? "radial-gradient(ellipse 45% 55% at 78% 55%, rgba(139,92,246,0.10), transparent 65%)"
    : "radial-gradient(ellipse 45% 55% at 78% 55%, rgba(139,92,246,0.16), transparent 65%)";

  const vignette = isDark
    ? "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 50%, rgba(0,0,0,0.60) 100%)"
    : "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 56%, rgba(99,102,241,0.10) 100%)";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0" aria-hidden="true">

      {/* Layer 0 — base oscura con tinte cálido (no verde como Snake) */}
      <div
        className="absolute inset-0"
        style={{
          background: baseGradient,
        }}
      />

      {/* Layer 1 — grid de puntos MUY sutil (pantalla moderna, no retro) */}
      <div
        className="absolute inset-0"
        style={{
          opacity: isDark ? 0.08 : 0.06,
          backgroundImage: `radial-gradient(circle, ${gridDot} 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Layer 2 — glow rojo intenso zona video (izquierda) — YouTube brand */}
      <div
        className="absolute inset-0"
        style={{
          background: videoGlow,
        }}
      />

      {/* Layer 3 — glow violeta zona texto (derecha) — coherencia portfolio */}
      <div
        className="absolute inset-0"
        style={{
          background: textGlow,
        }}
      />

      {/* Layer 4 — vignette suave (enfoca atención, no CRT como Snake) */}
      <div
        className="absolute inset-0"
        style={{
          background: vignette,
        }}
      />

      {/* Layer 5 — noise grain (textura orgánica premium) */}
      <div className="absolute inset-0 mix-blend-overlay bg-noise" style={{ opacity: isDark ? 0.03 : 0.018 }} />
    </div>
  );
}
