import { useEffect, useState, useMemo } from "react";
import { motion as Motion } from "framer-motion";
import ModalMedia from "../../components/ModalMedia.jsx";
import { FaExternalLinkAlt, FaSearch, FaTimes } from "react-icons/fa";
import data from "../../assets/portfolio/impresion3d/data.json";

// ImportMedia igual...
const importMedia = import.meta.glob(
  "../../assets/portfolio/impresion3d/*.{jpg,jpeg,png,mp4,webm,JPG,JPEG,PNG,MP4,WEBM}",
  { eager: true }
);

export default function PortfolioImpresion3D() {
  const [media, setMedia] = useState([]);
  const [modalItem, setModalItem] = useState(null);
  const [tab, setTab] = useState("todos");
  const [verTodo, setVerTodo] = useState(false);
  const [search, setSearch] = useState(""); // Estado del buscador

  // Derivar categorías únicas del JSON (solo tipos presentes)
  const categorias = useMemo(() => [
    "todos",
    ...Array.from(new Set(data.map(d => d.tipo)))
  ], []);

  useEffect(() => {
    const loadMedia = async () => {
      const result = await Promise.all(
        data.map(async (item) => {
          const filePath = Object.keys(importMedia).find((path) =>
            path.toLowerCase().endsWith(`/${item.archivo.toLowerCase()}`)
          );
          if (!filePath) return null;
          const file = importMedia[filePath];
          const src = typeof file === "string" ? file : file.default || Object.values(file)[0];
          const isVideo = /\.mp4$|\.webm$/i.test(item.archivo);
          let orientacion = item.orientacion;
          if (!orientacion && !isVideo) {
            try {
              const img = new window.Image();
              img.src = src;
              await new Promise((res) => {
                img.onload = () => {
                  orientacion = img.width > img.height ? "horizontal" : "vertical";
                  res();
                };
              });
            } catch {
              orientacion = "vertical";
            }
          } else if (!orientacion && isVideo) {
            orientacion = "horizontal";
          }
          return { ...item, src, isVideo, orientacion };
        })
      );
      setMedia(result.filter(Boolean));
    };
    loadMedia();
  }, []);

  // Filtro dinámico por tab y búsqueda  
  const mediaFiltrada = useMemo(() => {
    const filtrarTab = tab === "todos"
      ? media
      : media.filter(item => item.tipo === tab);

    // Si hay términos de búsqueda, filtrar también por texto en campos clave:
    if (search.trim() === "") return filtrarTab;
    const term = search.toLowerCase();

    // Puedes añadir campos: nombre, descripcion, material, color, tipo...
    return filtrarTab.filter(item =>
      [item.nombre, item.descripcion, item.material, item.color, item.tipo]
        .some(valor => valor?.toLowerCase().includes(term))
    );
  }, [media, tab, search]);

  const mediaAMostrar = verTodo ? mediaFiltrada : mediaFiltrada.slice(0, 6);

  return (
    <div className="min-h-screen bg-[#0b1120] text-white py-28 px-6 md:px-16">
      {/* CABECERA */}
      <Motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto text-center mb-10"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-linear-to-r from-fuchsia-500 to-cyan-400">
          Creaciones en Impresión 3D
        </h1>
        <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
          Una muestra de mis impresiones 3D, donde combino creatividad,
          precisión y tecnología.<br />Filtra por categoría o busca por palabra clave.
        </p>
      </Motion.div>

      {/* BUSCADOR */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="relative flex items-center">
          <input
            type="text"
            className="w-full py-2 pl-10 pr-4 rounded-xl bg-[#181f33] text-cyan-200 placeholder-gray-400 border border-cyan-700/30 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
            placeholder="Buscar (ej: 'link', 'funko', 'verde'...)"
            value={search}
            onChange={e => { setSearch(e.target.value); setVerTodo(true); }}
            aria-label="Buscar en portfolio"
            spellCheck={false}
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-fuchsia-400 hover:text-red-400 transition"
              aria-label="Limpiar búsqueda"
              tabIndex={0}
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      {/* TABS CATEGORÍAS */}
      <div className="flex justify-center gap-2 mb-8 mt-2 flex-wrap">
        {categorias.map(cat =>
          <button
            key={cat}
            onClick={() => { setTab(cat); setVerTodo(false); }}
            className={`px-5 py-2 rounded-full font-semibold border transition-all outline-none focus:ring-2
            ${tab === cat
              ? 'bg-linear-to-r from-fuchsia-500 to-cyan-400 text-white border-transparent shadow-[0_0_16px_#ec38fc99,0_0_20px_#0ff6] scale-105'
              : 'bg-[#181f33] border-cyan-700/30 text-cyan-300 hover:bg-fuchsia-800/30 hover:scale-105'}`}
            style={{ textTransform: "capitalize" }}
          >
            {cat === "todos" ? "Todos" : cat}
          </button>
        )}
      </div>

      {/* GALERÍA */}
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
      >
        {mediaAMostrar.map((item, index) => (
          <Motion.div
            key={index}
            whileHover={{ scale: 1.05, y: -5, boxShadow: "0 0 32px 2px #ec38fc77,0 0 32px 6px #0ff7" }}
            transition={{ type: "spring", stiffness: 200, damping: 12 }}
            className="relative rounded-2xl overflow-hidden bg-slate-900/60 border border-slate-700 shadow-lg hover:shadow-fuchsia-500/40 transition-all duration-300 cursor-pointer"
            onClick={() => setModalItem(item)}
            tabIndex={0}
            onKeyDown={e => e.key === "Enter" ? setModalItem(item) : undefined}
            aria-label={`Ampliar ${item.nombre}`}
          >
            {item.isVideo ? (
              <video
                src={item.src}
                controls
                muted
                playsInline
                preload="metadata"
                className={`w-full ${item.orientacion === "horizontal" ? "h-48" : "h-80"} object-contain bg-black`}
                tabIndex={-1}
                poster={item.poster || undefined}
                style={{ pointerEvents: "none" }}
              />
            ) : (
              <img
                src={item.src}
                alt={item.nombre}
                className={`w-full ${item.orientacion === "horizontal" ? "h-48" : "h-80"} object-contain bg-black`}
                tabIndex={-1}
                draggable={false}
              />
            )}
            {/* Info */}
            <div className="p-4 text-center">
              <h3 className="text-lg font-semibold text-fuchsia-300">{item.nombre}</h3>
              <p className="text-sm text-gray-400 mt-1">{item.descripcion}</p>
              <p className="text-xs text-gray-500 mt-2">
                <span className="text-fuchsia-300">Material:</span> {item.material} <br />
                <span className="text-cyan-400">Tiempo:</span> {item.tiempo}
              </p>
            </div>
          </Motion.div>
        ))}
        {mediaAMostrar.length === 0 &&
          <div className="col-span-full text-center text-fuchsia-400/60 mt-8">
            No se han encontrado resultados para tu búsqueda 😐
          </div>
        }
      </Motion.div>

      {/* Ver más solo si hay más elementos filtrados */}
      {(mediaFiltrada.length > 6 && !verTodo) && (
        <div className="text-center mt-10">
          <button
            onClick={() => setVerTodo(true)}
            className="px-8 py-2 rounded-xl bg-linear-to-r from-fuchsia-500 to-cyan-500 hover:from-fuchsia-400 hover:to-cyan-400 text-white font-semibold shadow-lg hover:shadow-fuchsia-500/40 transition-all outline-none focus:ring-2 focus:ring-cyan-400"
          >
            Ver más
          </button>
        </div>
      )}

      {/* BOTÓN HACIA SERVICIOS */}
      <div className="text-center mt-16">
        <a
          href="/servicios"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-fuchsia-500 to-cyan-500 hover:from-fuchsia-400 hover:to-cyan-400 text-white font-semibold shadow-lg hover:shadow-fuchsia-500/40 transition-all"
        >
          Solicitar un trabajo en 3D <FaExternalLinkAlt />
        </a>
      </div>

      {/* MODAL */}
      <ModalMedia
        open={!!modalItem}
        onClose={() => setModalItem(null)}
        item={modalItem}
      />
    </div>
  );
}
