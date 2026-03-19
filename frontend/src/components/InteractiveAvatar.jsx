import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import miFoto from "../assets/mifoto-optimized.jpg";

/**
 * InteractiveAvatar — Cursor-tracking avatar component
 * 
 * Tracks mouse position within the hero bounds and applies subtle tilt.
 * Uses useMotionValue + useSpring for smooth animation (same pattern as Luprincat.jsx).
 * Falls back to static on touch devices.
 * Respects prefers-reduced-motion.
 * 
 * @param {number} maxRotation - Maximum rotation angle in degrees (default: 15)
 * @param {object} springConfig - Spring animation config (stiffness, damping)
 */
export default function InteractiveAvatar({
  maxRotation = 15,
  springConfig = { stiffness: 150, damping: 15 },
}) {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const containerRef = useRef(null);

  // Motion values for normalized mouse position (-0.5 to 0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Transform normalized position to rotation angles
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-maxRotation, maxRotation]);
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [maxRotation, -maxRotation]);

  // Smooth spring animation
  const smoothRotateY = useSpring(rotateY, springConfig);
  const smoothRotateX = useSpring(rotateX, springConfig);

  // Detect touch device
  useEffect(() => {
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(isTouch);
  }, []);

  // Detect reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Track mouse movement (desktop only)
  // This uses the same cursor-tracking pattern as Luprincat.jsx:
  // 1. Calculate mouse position relative to container center
  // 2. Normalize to -0.5...0.5 range (left/top → right/bottom)
  // 3. Set motion values which are transformed to rotation angles
  // 4. Spring animation smooths the transitions
  useEffect(() => {
    if (isTouchDevice || reducedMotion) return;

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Normalize position: -0.5 (left/top) to 0.5 (right/bottom)
      const normalizedX = (e.clientX - centerX) / rect.width;
      const normalizedY = (e.clientY - centerY) / rect.height;

      mouseX.set(normalizedX);
      mouseY.set(normalizedY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isTouchDevice, reducedMotion, mouseX, mouseY]);

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
      <motion.div
        style={{
          rotateY: isTouchDevice || reducedMotion ? 0 : smoothRotateY,
          rotateX: isTouchDevice || reducedMotion ? 0 : smoothRotateX,
        }}
        className="relative group"
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/30 to-cyan-400/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {/* Avatar image */}
        <img
          src={miFoto}
          alt="Guadalupe Cano"
          width="320"
          height="320"
          loading="eager"
          decoding="async"
          className="relative z-10 w-64 h-64 md:w-80 md:h-80 rounded-full object-cover shadow-[0_0_30px_rgba(124,58,237,0.15)] group-hover:shadow-[0_0_40px_rgba(6,182,212,0.3)] transition-shadow duration-700 border border-[var(--border-color)] bg-[var(--bg-surface)]"
        />
      </motion.div>
    </div>
  );
}
