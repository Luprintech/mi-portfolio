import { scrollToSection } from "./ScrollSnapContainer";

const SECTION_LABELS = {
  hero: "Inicio",
  about: "Sobre mi",
  services: "Servicios",
  experience: "Experiencia",
  skills: "Skills",
  timeline: "Timeline",
  tech: "Tecnologias",
  projects: "Proyectos",
  contact: "Contacto",
  youtube: "YouTube",
};

export default function SectionIndicators({ activeSection, onSelectSection, sectionIds = [], snapRef = null }) {
  return (
    <nav
      aria-label="Indicadores de seccion"
      className="fixed right-3 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-overlay)]/70 px-2 py-3 shadow-[var(--shadow-sm)] backdrop-blur-md md:flex lg:right-8 lg:gap-3 lg:px-2.5"
    >
      {sectionIds.map((sectionId) => {
        const isActive = activeSection === sectionId;

        return (
          <button
            key={sectionId}
            type="button"
            onClick={() => {
              if (typeof onSelectSection === "function") {
                onSelectSection(sectionId);
                return;
              }

              scrollToSection(snapRef?.current || document.getElementById("snap-root"), sectionId);
            }}
            aria-label={`Ir a ${SECTION_LABELS[sectionId] || sectionId}`}
            aria-current={isActive ? "true" : undefined}
            className={`group relative flex items-center justify-center rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-secondary)] ${
              isActive ? "h-3.5 w-3.5 lg:h-4 lg:w-4" : "h-2.5 w-2.5 lg:h-3 lg:w-3"
            }`}
          >
            <span
              className={`block rounded-full border transition-all duration-300 ${
                isActive
                  ? "h-full w-full border-[var(--accent-secondary)]/45 bg-[var(--accent-secondary)] shadow-[0_0_12px_rgba(34,211,238,0.35)]"
                  : "h-full w-full border-[var(--border-default)] bg-[var(--text-muted)]/45 group-hover:bg-[var(--accent-secondary)]/75"
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
}
