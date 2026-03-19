import { useEffect, useMemo, useState } from "react";

function getViewportMiddle(rootElement) {
  if (rootElement instanceof HTMLElement) {
    const rootRect = rootElement.getBoundingClientRect();
    return rootRect.top + rootElement.clientHeight * 0.45;
  }

  return window.innerHeight * 0.45;
}

function getVisibleSection(entries, ids, rootElement) {
  const visibleEntries = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

  if (visibleEntries.length > 0) {
    return visibleEntries[0].target.id;
  }

  const viewportMiddle = getViewportMiddle(rootElement);

  return ids.find((id) => {
    const element = document.getElementById(id);
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    return rect.top <= viewportMiddle && rect.bottom >= viewportMiddle;
  }) || null;
}

export function useScrollSpy(sectionIds = [], options = {}) {
  const ids = useMemo(() => sectionIds.filter(Boolean), [sectionIds]);
  const [activeSection, setActiveSection] = useState(ids[0] || null);
  const { rootRef = null } = options;

  useEffect(() => {
    if (typeof window === "undefined" || ids.length === 0) return undefined;

    const rootElement = rootRef?.current || document.getElementById("snap-root") || null;

    const updateFromViewport = (entries = []) => {
      const nextSection = getVisibleSection(entries, ids, rootElement);
      if (nextSection) {
        setActiveSection(nextSection);
      }
    };

    const observer = new IntersectionObserver(updateFromViewport, {
      root: rootElement,
      threshold: [0.2, 0.35, 0.5, 0.7],
      rootMargin: "-15% 0px -45% 0px",
    });

    ids.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    const scrollTarget = rootElement || window;
    const handleScroll = () => updateFromViewport();
    scrollTarget.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      observer.disconnect();
      scrollTarget.removeEventListener("scroll", handleScroll);
    };
  }, [ids, rootRef]);

  return activeSection;
}

export default useScrollSpy;
