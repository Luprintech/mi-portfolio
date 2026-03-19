import { useReducedMotion } from "framer-motion";
import { useTheme } from "../hooks/useTheme";

/**
 * PresentationSectionBg — Background for the "Mi historia" (#experience) section.
 *
 * Visual identity: ORGANIC, PERSONAL, EMOTIONAL.
 * Uses large soft-light blobs (halos) that float and breathe very slowly,
 * giving depth without technical feel. No particles, no grid, no lines.
 *
 * Layers (bottom → top):
 *  0. Base gradient    — deep blue with subtle tonal variation
 *  1. Blob A           — violet, top-left, floats diagonally (18s)
 *  2. Blob B           — cyan/blue, bottom-right, counter-floats (24s)
 *  3. Blob C           — fuchsia, top-right, slow pulse (14s)
 *  4. Noise grain      — prevents flatness, low opacity
 *
 * Each blob is a heavily-blurred radial div animated with CSS keyframes.
 * Fully respects prefers-reduced-motion.
 */
export default function PresentationSectionBg() {
  const { isDark } = useTheme();
  const reducedMotion = useReducedMotion();

  const base = isDark
    ? "linear-gradient(160deg, #080e1c 0%, #0c1428 45%, #0e0c1e 100%)"
    : "linear-gradient(160deg, #eef1ff 0%, #e8eeff 45%, #f0ebff 100%)";

  // blob colours
  const blobA = isDark ? "rgba(139,92,246,0.28)"  : "rgba(139,92,246,0.14)";   // violet — top-left
  const blobB = isDark ? "rgba(34,211,238,0.20)"  : "rgba(6,182,212,0.11)";    // cyan   — bottom-right
  const blobC = isDark ? "rgba(232,121,249,0.18)" : "rgba(232,121,249,0.10)";  // fuchsia — top-right

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">

      {!reducedMotion && (
        <style>{`
          @keyframes psbg-floatA {
            0%,100% { transform: translate(0,    0)    scale(1);    }
            33%      { transform: translate(3%,   4%)   scale(1.06); }
            66%      { transform: translate(-2%,  2%)   scale(0.96); }
          }
          @keyframes psbg-floatB {
            0%,100% { transform: translate(0,    0)    scale(1);    }
            40%      { transform: translate(-4%,  -3%)  scale(1.07); }
            70%      { transform: translate(2%,   -1%)  scale(0.95); }
          }
          @keyframes psbg-floatC {
            0%,100% { transform: translate(0,    0)    scale(1);    opacity: 0.85; }
            50%      { transform: translate(-3%,  3%)   scale(1.08); opacity: 1;    }
          }
        `}</style>
      )}

      {/* Layer 0 — base gradient */}
      <div className="absolute inset-0" style={{ background: base }} />

      {/* Layer 1 — Blob A: violet, anchored top-left */}
      <div
        className="absolute rounded-full"
        style={{
          width: "70vw",
          height: "70vw",
          maxWidth: "700px",
          maxHeight: "700px",
          top: "-18%",
          left: "-16%",
          background: `radial-gradient(circle, ${blobA} 0%, transparent 68%)`,
          filter: "blur(72px)",
          ...(reducedMotion ? {} : { animation: "psbg-floatA 22s ease-in-out infinite" }),
        }}
      />

      {/* Layer 2 — Blob B: cyan, anchored bottom-right */}
      <div
        className="absolute rounded-full"
        style={{
          width: "65vw",
          height: "65vw",
          maxWidth: "650px",
          maxHeight: "650px",
          bottom: "-20%",
          right: "-14%",
          background: `radial-gradient(circle, ${blobB} 0%, transparent 65%)`,
          filter: "blur(80px)",
          ...(reducedMotion ? {} : { animation: "psbg-floatB 28s ease-in-out infinite" }),
        }}
      />

      {/* Layer 3 — Blob C: fuchsia accent, anchored top-right */}
      <div
        className="absolute rounded-full"
        style={{
          width: "44vw",
          height: "44vw",
          maxWidth: "440px",
          maxHeight: "440px",
          top: "-10%",
          right: "-8%",
          background: `radial-gradient(circle, ${blobC} 0%, transparent 62%)`,
          filter: "blur(64px)",
          ...(reducedMotion ? {} : { animation: "psbg-floatC 18s ease-in-out infinite" }),
        }}
      />

      {/* Layer 4 — noise grain */}
      <div className="absolute inset-0 opacity-[0.028] mix-blend-overlay bg-noise" />
    </div>
  );
}
