import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import LuprinCat from "./Luprincat";
import { useTheme } from "../hooks/useTheme";

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
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobilePortfolioOpen, setMobilePortfolioOpen] = useState(false);

  // Gato y logo
  const [catVisible, setCatVisible] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const clickTimeoutRef = useRef(null);

  const handleLogoClick = () => {
    setClickCount((prev) => {
      const next = prev + 1;
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = setTimeout(() => setClickCount(0), 2000);
      if (next >= 5) {
        setCatVisible(true);
        return 0;
      }
      return next;
    });
  };
  const handleCloseCat = () => setCatVisible(false);
  const goHome = () => navigate("/");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const portfolioItems = [
    { name: t("nav.sub_web"),  to: "/portfolio/desarrollo-web" },
    { name: t("nav.sub_docs"), to: "/portfolio/documentacion-tecnica" },
  ];

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
        <div className="max-w-7xl mx-auto flex items-center justify-between px-3 xs:px-5 md:px-7 h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span
              className="font-extrabold text-2xl tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-cyan-400 select-none cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
              onClick={(e) => { e.stopPropagation(); handleLogoClick(); goHome(); }}
            >
              Guadalupe <span className="text-cyan-300 font-extrabold">Cano</span>
            </span>
          </div>

          {/* Navegación desktop */}
          <div className="hidden md:flex gap-2 items-center text-base font-medium">
            <NavLink to="/"          className="px-3 py-2 rounded hover:text-fuchsia-300 transition">{t("nav.home")}</NavLink>
            <NavLink to="/sobre-mi"  className="px-3 py-2 rounded hover:text-fuchsia-300 transition">{t("nav.about")}</NavLink>

            {/* PORTFOLIO con submenú */}
            <div
              className="relative group"
              onMouseEnter={() => setOpenDropdown("portfolio")}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <span className="px-3 py-2 hover:text-fuchsia-400 cursor-pointer flex items-center gap-1">
                {t("nav.portfolio")}
                <svg width="16" height="16" fill="currentColor" className="ml-1 text-cyan-400" aria-hidden="true">
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </span>
              <AnimatePresence>
                {openDropdown === "portfolio" && (
                  <Motion.ul
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 mt-2 w-56 bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-[var(--shadow-md)] rounded-lg overflow-hidden"
                  >
                    {portfolioItems.map((item) => (
                      <li key={item.name}>
                        <NavLink
                          to={item.to}
                          className="block px-4 py-2 hover:bg-[var(--accent-primary-dim)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)]"
                        >
                          {item.name}
                        </NavLink>
                      </li>
                    ))}
                  </Motion.ul>
                )}
              </AnimatePresence>
            </div>

            <NavLink to="/blog"     className="px-3 py-2 rounded hover:text-cyan-300 transition">Blog</NavLink>
            <NavLink to="/contacto" className="px-3 py-2 rounded hover:text-cyan-300 transition">{t("nav.contact")}</NavLink>

            {/* Botón CV */}
            <a
              href="/CV_Guadalupe_Cano.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 px-4 py-1.5 rounded-full font-medium text-sm text-cyan-300 border border-cyan-500/50 hover:bg-cyan-500/10 transition-colors flex items-center gap-1"
            >
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
              </svg>
              {t("nav.cv")}
            </a>

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
              <NavLink to="/"         className="block py-2 border-b border-[var(--border-default)] text-[var(--text-primary)]" onClick={() => setMenuOpen(false)}>{t("nav.home")}</NavLink>
              <NavLink to="/sobre-mi" className="block py-2 border-b border-[var(--border-default)] text-[var(--text-primary)]" onClick={() => setMenuOpen(false)}>{t("nav.about")}</NavLink>

              {/* Submenú Portfolio con toggle */}
              <div className="border-b border-[var(--border-default)]">
                <button
                  onClick={() => setMobilePortfolioOpen(!mobilePortfolioOpen)}
                  className="w-full flex items-center justify-between py-2 text-[var(--accent-primary)] font-semibold"
                >
                  {t("nav.portfolio")}
                  <svg
                    width="16" height="16" fill="currentColor"
                    className={`transition-transform duration-200 ${mobilePortfolioOpen ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  >
                    <path d="M4 6l4 4 4-4" />
                  </svg>
                </button>
                <AnimatePresence>
                  {mobilePortfolioOpen && (
                    <Motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {portfolioItems.map((item) => (
                        <NavLink
                          key={item.name}
                          to={item.to}
                          className="block pl-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)]"
                          onClick={() => setMenuOpen(false)}
                        >
                          {item.name}
                        </NavLink>
                      ))}
                    </Motion.div>
                  )}
                </AnimatePresence>
              </div>

              <NavLink to="/blog"     className="block py-2 border-b border-[var(--border-default)] text-[var(--text-primary)]" onClick={() => setMenuOpen(false)}>Blog</NavLink>
              <NavLink to="/contacto" className="block py-2 border-b border-[var(--border-default)] text-[var(--text-primary)]" onClick={() => setMenuOpen(false)}>{t("nav.contact")}</NavLink>

              {/* Botón CV mobile */}
              <a
                href="/CV_Guadalupe_Cano.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="block py-2 border-b border-[var(--border-default)] text-cyan-400 font-semibold flex items-center gap-2"
                onClick={() => setMenuOpen(false)}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                  <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
                </svg>
                {t("nav.cv")}
              </a>

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
