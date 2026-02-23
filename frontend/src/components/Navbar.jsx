import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import LuprinCat from "./LuprinCat";

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
  const [clickTimeout, setClickTimeout] = useState(null);

  const handleLogoClick = () => {
    setClickCount((prev) => prev + 1);
    if (clickTimeout) clearTimeout(clickTimeout);
    const timeout = setTimeout(() => setClickCount(0), 2000);
    setClickTimeout(timeout);
    if (clickCount + 1 >= 5) {
      setCatVisible(true);
      setClickCount(0);
    }
  };
  const handleCloseCat = () => setCatVisible(false);
  const goHome = () => navigate("/");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const portfolioItems = [
    { name: t('nav.sub_web'), to: "/portfolio/desarrollo-web" },
    { name: t('nav.sub_docs'), to: "/portfolio/documentacion-tecnica" }
  ];


  return (
    <>
      <nav className={`
        fixed w-full z-30 backdrop-blur-xl transition-all duration-300
        ${isScrolled ? "bg-[#0b1220]/80 border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.3)] shadow-violet-900/10" : "bg-transparent"}
      `}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-3 xs:px-5 md:px-7 h-20">
          <div className="flex items-center gap-2">
            <span
              className="font-extrabold text-2xl tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-cyan-400 select-none cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
              onClick={e => { e.stopPropagation(); handleLogoClick(); goHome(); }}
            >
              Guadalupe <span className="text-cyan-300 font-extrabold">Cano</span>
            </span>
          </div>
          <div className="hidden md:flex gap-2 items-center text-base font-medium">
            <NavLink to="/" className="px-3 py-2 rounded hover:text-fuchsia-300 transition">{t('nav.home')}</NavLink>
            <NavLink to="/sobre-mi" className="px-3 py-2 rounded hover:text-fuchsia-300 transition">{t('nav.about')}</NavLink>
            
            {/* PORTFOLIO con submenú */}
            <li
              className="relative group list-none"
              onMouseEnter={() => setOpenDropdown("portfolio")}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <span className="px-3 py-2 hover:text-fuchsia-400 cursor-pointer flex items-center gap-1">
                {t('nav.portfolio')}
                <svg width="16" height="16" fill="currentColor" className="ml-1 text-cyan-400"><path d="M4 6l4 4 4-4"/></svg>
              </span>
              <AnimatePresence>
                {openDropdown === "portfolio" && (
                  <Motion.ul
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 mt-2 w-56 bg-[#0b1120] border border-slate-800 shadow-lg rounded-lg overflow-hidden"
                  >
                    {portfolioItems.map(item => (
                      <li key={item.name}>
                        <NavLink
                          to={item.to}
                          className="block px-4 py-2 hover:bg-fuchsia-500/20 text-gray-300"
                        >
                          {item.name}
                        </NavLink>
                      </li>
                    ))}
                  </Motion.ul>
                )}
              </AnimatePresence>
            </li>

            <NavLink to="/blog" className="px-3 py-2 rounded hover:text-cyan-300 transition">Blog</NavLink>
            <NavLink to="/contacto" className="px-3 py-2 rounded hover:text-cyan-300 transition">{t('nav.contact')}</NavLink>
            
            {/* Botón de CV (Escritorio) */}
            <a
              href="/CV_Guadalupe_Cano.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 px-4 py-1.5 rounded-full font-medium text-sm text-cyan-300 border border-cyan-500/50 hover:bg-cyan-500/10 transition-colors flex items-center gap-1"
            >
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
              </svg>
              {t('nav.cv')}
            </a>

            {/* Separador e i18n Switcher */}
            <div className="h-5 w-px bg-slate-700/50 mx-2 hidden lg:block"></div>
            <LanguageSwitcher />
          </div>
          {/* HAMBURGUESA MOBILE */}
          <button
            className="md:hidden text-3xl focus:outline-none px-2 py-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menú"
          >
            ☰
          </button>
        </div>
        {/* MENÚ MOBILE */}
        <AnimatePresence>
          {menuOpen && (
            <Motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="md:hidden bg-[#181a25]/95 shadow-xl rounded-b-2xl border-t border-fuchsia-700/10 px-4 py-3"
            >
              <NavLink to="/" className="block py-2 border-b border-slate-700" onClick={() => setMenuOpen(false)}>{t('nav.home')}</NavLink>
              <NavLink to="/sobre-mi" className="block py-2 border-b border-slate-700" onClick={() => setMenuOpen(false)}>{t('nav.about')}</NavLink>
              
              {/* Submenú Portfolio con toggle */}
              <div className="border-b border-slate-700">
                <button
                  onClick={() => setMobilePortfolioOpen(!mobilePortfolioOpen)}
                  className="w-full flex items-center justify-between py-2 text-fuchsia-300 font-semibold"
                >
                  {t('nav.portfolio')}
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    className={`transition-transform duration-200 ${mobilePortfolioOpen ? 'rotate-180' : ''}`}
                  >
                    <path d="M4 6l4 4 4-4"/>
                  </svg>
                </button>
                <AnimatePresence>
                  {mobilePortfolioOpen && (
                    <Motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {portfolioItems.map(item => (
                        <NavLink
                          key={item.name}
                          to={item.to}
                          className="block pl-4 py-2 text-sm text-gray-300 hover:text-fuchsia-200"
                          onClick={() => setMenuOpen(false)}
                        >
                          {item.name}
                        </NavLink>
                      ))}
                    </Motion.div>
                  )}
                </AnimatePresence>
              </div>

              <NavLink to="/blog" className="block py-2 border-b border-slate-700" onClick={() => setMenuOpen(false)}>Blog</NavLink>
              <NavLink to="/contacto" className="block py-2 border-b border-slate-700" onClick={() => setMenuOpen(false)}>{t('nav.contact')}</NavLink>
              
              {/* Botón de CV (Mobile) */}
              <a
                href="/CV_Guadalupe_Cano.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="block py-2 border-b border-slate-700 text-cyan-400 font-semibold flex items-center gap-2"
                onClick={() => setMenuOpen(false)}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                  <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                </svg>
                {t('nav.cv')}
              </a>
              
              {/* i18n mobile switcher */}
              <div className="py-4 flex justify-end">
                <LanguageSwitcher />
              </div>
            </Motion.div>
          )}
        </AnimatePresence>
      </nav>
      {/* 🐾 Gato holográfico */}
      {catVisible && (
        <LuprinCat onClose={handleCloseCat} />
      )}
    </>
  );
}
