export function scrollToSection(snapRootEl, sectionId) {
  const target = document.getElementById(sectionId);

  if (!target) {
    return false;
  }

  if (snapRootEl instanceof HTMLElement && !snapRootEl.contains(target)) {
    return false;
  }

  target.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}
