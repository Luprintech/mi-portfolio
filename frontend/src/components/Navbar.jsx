import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import LuprinCat from "./Luprincat";
import { useTheme } from "../hooks/useTheme";
import useScrollSpy from "../hooks/useScrollSpy";
import { scrollToSection } from "./ScrollSnapContainer";

const HOME_SECTIONS = ["hero", "contact"];

function getSectionLinkClass(isActive) {
  return `px-3 py-2 rounded transition ${
    isActive
      ? "text-[var(--accent-secondary)] bg-[var(--accent-secondary-dim)]"
      : "hover:text-fuchsia-300"
  }`;
}

function getMobileSectionLinkClass(isActive) {
  return `block py-2 border-b border-[var(--border-default)] transition ${
    isActive
      ? "text-[var(--accent-secondary)] font-semibold"
      : "text-[var(--text-primary)]"
  }`;
}

/* ─── Íconos inline sol / luna ─── */
function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1"  x2="12" y2="3"  />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22"   x2="5.64" y2="5.64"   />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1"  y1="12" x2="3"  y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78"  x2="5.64" y2="18.36"  />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

/* ─── Botón de toggle de tema ─── */
function ThemeToggleButton({ className = "" }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      id="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className={`
        flex items-center justify-center w-9 h-9 rounded-full
        border border-[var(--toggle-border)]
        bg-[var(--toggle-bg)]
        text-[var(--toggle-icon)]
        hover:bg-[var(--toggle-hover)]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2
        transition-all duration-200
        ${className}
      `}
    >
      <Motion.span
        key={isDark ? "moon" : "sun"}
        initial={{ scale: 0.7, opacity: 0, rotate: -30 }}
        animate={{ scale: 1,   opacity: 1, rotate: 0   }}
        exit={{    scale: 0.7, opacity: 0, rotate: 30  }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-center"
      >
        {isDark ? <MoonIcon /> : <SunIcon />}
      </Motion.span>
    </button>
  );
}

/* ─── Navbar principal ─── */
export default function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const activeSection = useScrollSpy(HOME_SECTIONS);
  const isHome = location.pathname === "/";

  // Gato y logo
  const [catVisible, setCatVisible] = useState(false);
  const clickTimeoutRef = useRef(null);
  const clickCountRef = useRef(0);

  const handleLogoClick = () => {
    clickCountRef.current += 1;
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 2000);
    if (clickCountRef.current >= 5) {
      clickCountRef.current = 0;
      setCatVisible(true);
    }
  };
  const handleCloseCat = () => setCatVisible(false);
  const goHome = useCallback(() => {
    if (isHome) {
      scrollToSection(document.getElementById("snap-root"), "hero");
      window.history.replaceState(null, "", window.location.pathname || "/");
      return;
    }

    navigate("/");
  }, [isHome, navigate]);

  const navigateToSection = useCallback(
    (sectionId) => {
      setMenuOpen(false);

      if (!isHome) {
        navigate(sectionId === "hero" ? "/" : `/#${sectionId}`);
        return;
      }

      if (!scrollToSection(document.getElementById("snap-root"), sectionId)) {
        return;
      }

      const basePath = window.location.pathname || "/";
      window.history.replaceState(null, "", sectionId === "hero" ? basePath : `${basePath}#${sectionId}`);
    },
    [isHome, navigate]
  );

  const isSectionActive = useCallback(
    (sectionId) => isHome && activeSection === sectionId,
    [activeSection, isHome]
  );

  useEffect(() => {
    const snapRoot = isHome ? document.getElementById("snap-root") : null;
    const scrollTarget = snapRoot || window;
    const handleScroll = () => {
      const offset = snapRoot ? snapRoot.scrollTop : window.scrollY;
      setIsScrolled(offset > 10);
    };

    scrollTarget.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => scrollTarget.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);


  return (
    <>
      <nav
        className={`
          fixed w-full z-30 backdrop-blur-xl transition-all duration-300
          ${
            isScrolled
              ? "bg-[var(--nav-bg-scrolled)] border-b border-[var(--nav-border)] shadow-[var(--shadow-nav)]"
              : "bg-transparent"
          }
        `}
      >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 px-3 xs:px-5 md:px-7 h-20">
            {/* Logo */}
          <div className="flex min-w-0 items-center gap-2">
             <span
               className="max-w-[160px] truncate font-extrabold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-cyan-400 select-none cursor-pointer transition-transform duration-300 hover:scale-[1.02] sm:max-w-none sm:text-xl md:text-2xl"
               onClick={(e) => { e.stopPropagation(); handleLogoClick(); goHome(); }}
             >
               Guadalupe <span className="text-cyan-300 font-extrabold">Cano</span>
            </span>
          </div>

          {/* Navegación desktop */}
          <div className="hidden md:flex gap-2 items-center text-base font-medium">
            <button type="button" onClick={() => navigateToSection("hero")} className={getSectionLinkClass(isSectionActive("hero"))}>{t("nav.home")}</button>
            <NavLink to="/portfolio/desarrollo-web" className={({ isActive }) => getSectionLinkClass(isActive)}>{t("nav.projects")}</NavLink>

            <NavLink to="/blog" className={({ isActive }) => getSectionLinkClass(isActive && !isHome)}>Blog</NavLink>
            <button type="button" onClick={() => navigateToSection("contact")} className={getSectionLinkClass(isSectionActive("contact"))}>{t("nav.contact")}</button>

            {/* Separador */}
            <div className="h-5 w-px bg-[var(--border-default)] mx-2 hidden lg:block" />

            {/* 🌓 Toggle de tema */}
            <ThemeToggleButton />

            {/* i18n Switcher */}
            <LanguageSwitcher />
          </div>

          {/* MOBILE — solo toggle de tema + hamburguesa en la barra */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggleButton />
            <button
              className="flex items-center justify-center w-9 h-9 text-[var(--text-primary)] focus:outline-none"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <line x1="3" y1="6"  x2="21" y2="6"  />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* MENÚ MOBILE */}
        <AnimatePresence>
          {menuOpen && (
            <Motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="md:hidden bg-[var(--nav-bg-mobile)] shadow-xl rounded-b-2xl border-t border-[var(--nav-border)] px-4 py-3"
            >
              <button type="button" className={getMobileSectionLinkClass(isSectionActive("hero"))} onClick={() => navigateToSection("hero")}>{t("nav.home")}</button>
              <NavLink
                to="/portfolio/desarrollo-web"
                className={({ isActive }) => getMobileSectionLinkClass(isActive)}
                onClick={() => setMenuOpen(false)}
              >
                {t("nav.projects")}
              </NavLink>

              <NavLink to="/blog"     className="block py-2 border-b border-[var(--border-default)] text-[var(--text-primary)]" onClick={() => setMenuOpen(false)}>Blog</NavLink>
              <button type="button" className={getMobileSectionLinkClass(isSectionActive("contact"))} onClick={() => navigateToSection("contact")}>{t("nav.contact")}</button>

              {/* Selector de idioma — dentro del drawer */}
              <div className="pt-3 pb-1 flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Idioma
                </span>
                <LanguageSwitcher />
              </div>

            </Motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* 🐾 Gato holográfico */}
      {catVisible && <LuprinCat onClose={handleCloseCat} />}
    </>
  );
}
