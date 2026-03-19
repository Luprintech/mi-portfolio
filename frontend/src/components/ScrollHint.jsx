import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function ScrollHint({ activeSection }) {
  const [visible, setVisible] = useState(false);
  const showTimerRef = useRef(null);
  const hideTimerRef = useRef(null);

  // On every section change: hide immediately, wait for snap to settle (700ms),
  // show for 2.5s, then hide. The scroll listener is intentionally omitted —
  // with scroll-snap the section always changes when scrolling, so activeSection
  // changing is the only signal we need. A scroll listener would race with
  // the snap animation and cancel the show timer before it fires.
  useEffect(() => {
    clearTimeout(showTimerRef.current);
    clearTimeout(hideTimerRef.current);
    setVisible(false);

    if (activeSection === "contact") return;

    showTimerRef.current = setTimeout(() => {
      setVisible(true);
      hideTimerRef.current = setTimeout(() => setVisible(false), 2500);
    }, 750);

    return () => {
      clearTimeout(showTimerRef.current);
      clearTimeout(hideTimerRef.current);
    };
  }, [activeSection]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="pointer-events-none fixed bottom-8 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex"
          aria-hidden="true"
        >
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.35em] text-[var(--text-muted)]">
            Scroll
          </span>
          <div className="flex h-14 w-9 items-start justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)]/70 p-2 shadow-[var(--shadow-sm)] backdrop-blur-sm">
            <motion.span
              animate={{ y: [0, 16, 0], opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="h-3 w-1.5 rounded-full bg-gradient-to-b from-[var(--accent-primary)] to-[var(--accent-secondary)]"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
