import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import LuprinCat from "./LuprinCat";
import logo from "../assets/logo/logo.png";
import { FaCode, FaBrain, FaCogs, FaCubes } from "react-icons/fa";

export default function Navbar() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobilePortfolioOpen, setMobilePortfolioOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

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
    { name: "Desarrollo Web", to: "/portfolio/desarrollo-web" },
    { name: "Impresión 3D", to: "/portfolio/impresion-3d" }
  ];
  const servicesItems = [
    { name: "Desarrollo Web", to: "/servicios/desarrollo-web", icon: <FaCode /> },
    { name: "Inteligencia Artificial y automatizaciones", to: "/servicios/inteligencia-artificial", icon: <FaBrain /> },
    { name: "Soporte TI", to: "/servicios/soporte-ti", icon: <FaCogs /> },
    { name: "Impresión 3D", to: "/servicios/impresion-3d", icon: <FaCubes /> }
  ];

  return (
    <>
      <nav className={`
        fixed w-full z-30 backdrop-blur-xl transition-all duration-300
        ${isScrolled ? "bg-[#182032]/60 shadow-2xl" : "bg-[#151A24]/80"}
      `}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-3 xs:px-5 md:px-7 h-20">
          {/* LOGO + TEXTO */}
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt="LuprinTech Logo"
              onClick={e => { e.stopPropagation(); handleLogoClick(); goHome(); }}
              className="h-[54px] w-[54px] object-cover rounded-full bg-[#181a25] transition-transform duration-300 ease-in-out cursor-pointer hover:scale-110"
              style={{ border: "none", boxShadow: "none" }}
            />
            <span
              className="font-extrabold text-xl tracking-wider bg-clip-text text-transparent bg-linear-to-r from-fuchsia-400 to-cyan-400 select-none cursor-pointer"
              onClick={goHome}
            >
              Luprin<span className="text-cyan-300 font-extrabold">tech</span>
            </span>
          </div>
          {/* MENÚ DESKTOP */}
          <div className="hidden md:flex gap-2 items-center text-base font-medium">
            <NavLink to="/" className="px-3 py-2 rounded hover:text-fuchsia-300 transition">Inicio</NavLink>
            <NavLink to="/sobre-mi" className="px-3 py-2 rounded hover:text-fuchsia-300 transition">Sobre mí</NavLink>
            
            {/* PORTFOLIO con submenú */}
            <li
              className="relative group list-none"
              onMouseEnter={() => setOpenDropdown("portfolio")}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <span className="px-3 py-2 hover:text-fuchsia-400 cursor-pointer flex items-center gap-1">
                Portfolio
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

            {/* SERVICIOS con submenú */}
            <li
              className="relative group list-none"
              onMouseEnter={() => setOpenDropdown("servicios")}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <span className="px-3 py-2 hover:text-fuchsia-400 cursor-pointer flex items-center gap-1">
                Servicios
                <svg width="16" height="16" fill="currentColor" className="ml-1 text-cyan-400"><path d="M4 6l4 4 4-4"/></svg>
              </span>
              <AnimatePresence>
                {openDropdown === "servicios" && (
                  <Motion.ul
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 mt-2 w-56 bg-[#0b1120] border border-slate-800 shadow-lg rounded-lg overflow-hidden"
                  >
                    {servicesItems.map(item => (
                      <li key={item.name}>
                        <NavLink
                          to={item.to}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-fuchsia-500/20 text-gray-300"
                        >
                          {item.icon}
                          {item.name}
                        </NavLink>
                      </li>
                    ))}
                  </Motion.ul>
                )}
              </AnimatePresence>
            </li>
            <NavLink to="/blog" className="px-3 py-2 rounded hover:text-cyan-300 transition">Blog</NavLink>
            <NavLink to="/contacto" className="px-3 py-2 rounded hover:text-cyan-300 transition">Contacto</NavLink>
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
              <NavLink to="/" className="block py-2 border-b border-slate-700" onClick={() => setMenuOpen(false)}>Inicio</NavLink>
              <NavLink to="/sobre-mi" className="block py-2 border-b border-slate-700" onClick={() => setMenuOpen(false)}>Sobre mí</NavLink>
              
              {/* Submenú Portfolio con toggle */}
              <div className="border-b border-slate-700">
                <button
                  onClick={() => setMobilePortfolioOpen(!mobilePortfolioOpen)}
                  className="w-full flex items-center justify-between py-2 text-fuchsia-300 font-semibold"
                >
                  Portfolio
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

              {/* Submenú Servicios con toggle */}
              <div className="border-b border-slate-700">
                <button
                  onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                  className="w-full flex items-center justify-between py-2 text-cyan-300 font-semibold"
                >
                  Servicios
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    className={`transition-transform duration-200 ${mobileServicesOpen ? 'rotate-180' : ''}`}
                  >
                    <path d="M4 6l4 4 4-4"/>
                  </svg>
                </button>
                <AnimatePresence>
                  {mobileServicesOpen && (
                    <Motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {servicesItems.map(item => (
                        <NavLink
                          key={item.name}
                          to={item.to}
                          className="flex items-center gap-2 pl-4 py-2 text-sm text-gray-300 hover:text-cyan-200"
                          onClick={() => setMenuOpen(false)}
                        >
                          {item.icon}
                          {item.name}
                        </NavLink>
                      ))}
                    </Motion.div>
                  )}
                </AnimatePresence>
              </div>

              <NavLink to="/blog" className="block py-2 border-b border-slate-700" onClick={() => setMenuOpen(false)}>Blog</NavLink>
              <NavLink to="/contacto" className="block py-2" onClick={() => setMenuOpen(false)}>Contacto</NavLink>
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
