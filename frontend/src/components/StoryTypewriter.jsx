import { useEffect, useRef, useState, useCallback } from "react";

/**
 * StoryTypewriter — Progressive paragraph-by-paragraph typewriter effect
 *
 * Each paragraph appears one at a time with a typing animation.
 * Once fully typed, the animation is marked as done and won't replay
 * (controlled externally via `hasPlayed` / `onFinished`).
 *
 * @param {string[]} paragraphs     - Array of paragraph texts
 * @param {number}   charDelay      - ms between characters (default: 18)
 * @param {number}   paragraphDelay - ms pause between paragraphs (default: 400)
 * @param {boolean}  hasPlayed      - If true, show all text instantly (no animation)
 * @param {function} onFinished     - Called once when the full animation completes
 */
export default function StoryTypewriter({
  paragraphs = [],
  charDelay = 18,
  paragraphDelay = 400,
  hasPlayed = false,
  onFinished,
}) {
  // Which paragraph is currently being typed (index)
  const [activeParagraph, setActiveParagraph] = useState(0);
  // How many characters of the active paragraph are visible
  const [charIndex, setCharIndex] = useState(0);
  // Paragraphs that have been fully typed
  const [completedParagraphs, setCompletedParagraphs] = useState([]);
  // Whether the entire animation is done
  const [isDone, setIsDone] = useState(hasPlayed);

  const timerRef = useRef(null);
  const containerRef = useRef(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // If hasPlayed changes to true externally, show everything
  useEffect(() => {
    if (hasPlayed) {
      cleanup();
      setIsDone(true);
      setCompletedParagraphs([...paragraphs]);
      setActiveParagraph(paragraphs.length);
      setCharIndex(0);
    }
  }, [hasPlayed, paragraphs, cleanup]);

  // Typing engine
  useEffect(() => {
    if (isDone || hasPlayed || paragraphs.length === 0) return;

    const currentText = paragraphs[activeParagraph];
    if (!currentText) return;

    if (charIndex < currentText.length) {
      // Type next character
      timerRef.current = setTimeout(() => {
        setCharIndex((prev) => prev + 1);
      }, charDelay);
    } else {
      // Paragraph complete — add to completed and move to next
      timerRef.current = setTimeout(() => {
        setCompletedParagraphs((prev) => [...prev, currentText]);
        const nextParagraph = activeParagraph + 1;

        if (nextParagraph >= paragraphs.length) {
          // All paragraphs done
          setIsDone(true);
          setActiveParagraph(paragraphs.length);
          setCharIndex(0);
          onFinished?.();
        } else {
          setActiveParagraph(nextParagraph);
          setCharIndex(0);
        }
      }, paragraphDelay);
    }

    return cleanup;
  }, [activeParagraph, charDelay, charIndex, cleanup, hasPlayed, isDone, onFinished, paragraphDelay, paragraphs]);

  // Auto-scroll to keep the cursor visible
  useEffect(() => {
    if (containerRef.current && !isDone) {
      const el = containerRef.current;
      el.scrollTop = el.scrollHeight;
    }
  }, [charIndex, activeParagraph, isDone]);

  // ── Render ──

  const containerClassName = "w-full max-h-none space-y-5 overflow-x-hidden";
  const paragraphClassName = "w-full text-sm text-[var(--text-secondary)] leading-relaxed tracking-wide md:text-base";

  // If already played, show everything instantly
  if (isDone || hasPlayed) {
    return (
      <div ref={containerRef} className={containerClassName}>
        {paragraphs.map((text, i) => (
          <p key={i} className={paragraphClassName}>
            {text}
          </p>
        ))}
      </div>
    );
  }

  // Typing in progress
  const currentText = paragraphs[activeParagraph] || "";
  const visibleText = currentText.slice(0, charIndex);

  return (
    <div ref={containerRef} className={containerClassName}>
      {/* Already completed paragraphs */}
      {completedParagraphs.map((text, i) => (
        <p key={i} className={paragraphClassName}>
          {text}
        </p>
      ))}

      {/* Currently typing paragraph */}
      {activeParagraph < paragraphs.length && (
        <p className={paragraphClassName}>
          {visibleText}
          <span className="inline-block w-[2px] h-[1.1em] bg-[var(--accent-secondary)] ml-0.5 align-middle animate-blink" />
        </p>
      )}
    </div>
  );
}
