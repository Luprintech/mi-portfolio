import { useReducedMotion } from "framer-motion";
import { useTheme } from "../hooks/useTheme";

/**
 * ProfileStorySectionBg — Background for the "about" section.
 *
 * Visual identity: structured grid lines + breathing glow. Elegant and
 * reflexive — different from the organic star-particles of the hero.
 *
 * Layers (bottom → top):
 *  0. Base diagonal gradient    — deep blue → subtle purple
 *  1. Horizontal scanlines      — slow upward drift (20s)
 *  2. Vertical lines            — slow rightward drift (28s), offset grid
 *  3. Corner edge glows         — static fuchsia TR + cyan BL
 *  4. Central radial glow       — slow breathing pulse (7s ease-in-out)
 *  5. Noise grain               — organic texture, zero extra request
 *
 * All animations respect prefers-reduced-motion via useReducedMotion().
 */
export default function ProfileStorySectionBg() {
  const { isDark } = useTheme();
  const reducedMotion = useReducedMotion();

  // ── palette ─────────────────────────────────────────────────────────────────
  const baseGradient = isDark
    ? "linear-gradient(155deg, #0b1120 0%, #0f1a2e 40%, #130d22 100%)"
    : "linear-gradient(155deg, #f0f4ff 0%, #eaf0ff 45%, #f3f0ff 100%)";

  // Slightly softer than before — movement adds presence, so less opacity needed
  const lineH = isDark ? "rgba(255,255,255,0.05)" : "rgba(99,102,241,0.08)";
  const lineV = isDark ? "rgba(255,255,255,0.038)" : "rgba(99,102,241,0.062)";

  const glowTR = isDark
    ? "radial-gradient(ellipse 52% 46% at 100% 0%, rgba(232,121,249,0.18), transparent)"
    : "radial-gradient(ellipse 52% 46% at 100% 0%, rgba(232,121,249,0.11), transparent)";

  const glowBL = isDark
    ? "radial-gradient(ellipse 52% 46% at 0% 100%, rgba(34,211,238,0.15), transparent)"
    : "radial-gradient(ellipse 52% 46% at 0% 100%, rgba(6,182,212,0.09), transparent)";

  const glowCenter = isDark
    ? "radial-gradient(ellipse 68% 58% at 50% 50%, rgba(139,92,246,0.22), transparent 70%)"
    : "radial-gradient(ellipse 68% 58% at 50% 50%, rgba(99,102,241,0.14), transparent 70%)";

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">

      {/* Keyframes — injected only when motion is allowed */}
      {!reducedMotion && (
        <style>{`
          @keyframes psbg-scanH {
            from { background-position: 0 0; }
            to   { background-position: 0 56px; }
          }
          @keyframes psbg-scanV {
            from { background-position: 40px 0; }
            to   { background-position: 120px 0; }
          }
          @keyframes psbg-glowPulse {
            0%, 100% { opacity: 0.6; }
            50%       { opacity: 1; }
          }
        `}</style>
      )}

      {/* Layer 0 — base diagonal gradient */}
      <div className="absolute inset-0" style={{ background: baseGradient }} />

      {/* Layer 1 — horizontal scanlines, slow upward drift */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 55px,
            ${lineH} 55px,
            ${lineH} 56px
          )`,
          ...(reducedMotion
            ? {}
            : { animation: "psbg-scanH 20s linear infinite" }),
        }}
      />

      {/* Layer 2 — vertical lines, slow rightward drift */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 79px,
            ${lineV} 79px,
            ${lineV} 80px
          )`,
          ...(reducedMotion
            ? { backgroundPositionX: "40px" }
            : { animation: "psbg-scanV 28s linear infinite" }),
        }}
      />

      {/* Layer 3 — corner edge glows (static) */}
      <div
        className="absolute inset-0"
        style={{ background: `${glowTR}, ${glowBL}` }}
      />

      {/* Layer 4 — central breathing glow */}
      <div
        className="absolute inset-0"
        style={{
          background: glowCenter,
          ...(reducedMotion
            ? {}
            : { animation: "psbg-glowPulse 7s ease-in-out infinite" }),
        }}
      />

      {/* Layer 5 — noise grain */}
      <div className="absolute inset-0 opacity-[0.028] mix-blend-overlay bg-noise" />
    </div>
  );
}
