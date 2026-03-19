import { useTheme } from "../hooks/useTheme";

/**
 * ServicesSectionBg — Background for the "Lo que construyo" section.
 *
 * Visual identity: STRUCTURED, PROFESSIONAL — no particles, no grid, no blobs.
 *
 * Layers (bottom → top):
 *  0. Base gradient     — very subtle top-to-bottom tonal shift
 *  1. Cards glow band   — horizontal radial behind the services cards (~35% height)
 *  2. Lower fade        — soft darkening gradient on the bottom half
 *                         to visually separate the tech ecosystem block
 *  3. Side accents      — faint edge glows left/right for depth
 *  4. Noise grain       — low opacity organic texture
 */
export default function ServicesSectionBg() {
  const { isDark } = useTheme();

  const base = isDark
    ? "linear-gradient(180deg, #08101e 0%, #0a1220 60%, #080c1a 100%)"
    : "linear-gradient(180deg, #f0f4ff 0%, #eaefff 60%, #e8ecff 100%)";

  // Horizontal band behind the cards — wide ellipse at ~32% from top
  const cardsBand = isDark
    ? "radial-gradient(ellipse 90% 38% at 50% 32%, rgba(99,102,241,0.13), transparent 70%)"
    : "radial-gradient(ellipse 90% 38% at 50% 32%, rgba(99,102,241,0.09), transparent 70%)";

  // Subtle cyan accent at the very center of the band for brightness
  const cardsAccent = isDark
    ? "radial-gradient(ellipse 40% 20% at 50% 32%, rgba(34,211,238,0.07), transparent 65%)"
    : "radial-gradient(ellipse 40% 20% at 50% 32%, rgba(34,211,238,0.05), transparent 65%)";

  // Lower fade — dims the tech-icons zone gently
  const lowerFade = isDark
    ? "linear-gradient(180deg, transparent 50%, rgba(4,6,14,0.45) 100%)"
    : "linear-gradient(180deg, transparent 50%, rgba(220,228,255,0.30) 100%)";

  // Side edge accents — violet left, cyan-tinted right
  const sideL = isDark
    ? "radial-gradient(ellipse 28% 60% at 0% 35%, rgba(139,92,246,0.09), transparent)"
    : "radial-gradient(ellipse 28% 60% at 0% 35%, rgba(139,92,246,0.05), transparent)";

  const sideR = isDark
    ? "radial-gradient(ellipse 28% 60% at 100% 35%, rgba(34,211,238,0.07), transparent)"
    : "radial-gradient(ellipse 28% 60% at 100% 35%, rgba(6,182,212,0.04), transparent)";

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {/* Layer 0 — base */}
      <div className="absolute inset-0" style={{ background: base }} />

      {/* Layer 1 — horizontal glow band behind cards */}
      <div className="absolute inset-0" style={{ background: `${cardsBand}, ${cardsAccent}` }} />

      {/* Layer 2 — lower fade to dim tech ecosystem zone */}
      <div className="absolute inset-0" style={{ background: lowerFade }} />

      {/* Layer 3 — side edge accents */}
      <div className="absolute inset-0" style={{ background: `${sideL}, ${sideR}` }} />

      {/* Layer 4 — noise grain */}
      <div className="absolute inset-0 opacity-[0.022] mix-blend-overlay bg-noise" />
    </div>
  );
}
