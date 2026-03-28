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
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0" aria-hidden="true">

      {/* Layer 0 — base oscura con tinte cálido (no verde como Snake) */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #0a0404 0%, #0f0606 40%, #0a0508 70%, #080410 100%)",
        }}
      />

      {/* Layer 1 — grid de puntos MUY sutil (pantalla moderna, no retro) */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(239,68,68,0.6) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Layer 2 — glow rojo intenso zona video (izquierda) — YouTube brand */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 55% 65% at 28% 50%, rgba(239,68,68,0.15), transparent 65%)",
        }}
      />

      {/* Layer 3 — glow violeta zona texto (derecha) — coherencia portfolio */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 45% 55% at 78% 55%, rgba(139,92,246,0.10), transparent 65%)",
        }}
      />

      {/* Layer 4 — vignette suave (enfoca atención, no CRT como Snake) */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 50%, rgba(0,0,0,0.60) 100%)",
        }}
      />

      {/* Layer 5 — noise grain (textura orgánica premium) */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-noise" />
    </div>
  );
}
