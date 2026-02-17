import { motion as Motion } from "framer-motion";

// Agrupadas por secciones
const toolsSections = [
  {
    section: "Desarrollo Web",
    tools: [
      { name: "HTML5", color: "from-orange-400 to-red-500", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
      { name: "CSS3", color: "from-blue-400 to-cyan-500", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
      { name: "JavaScript", color: "from-yellow-400 to-orange-400", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
      { name: "PHP", color: "from-indigo-400 to-blue-500", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg" },
      { name: "Python", color: "from-yellow-400 to-blue-500", logo: "https://cdn.simpleicons.org/python/3776AB" },
      { name: "SQL", color: "from-blue-500 to-sky-400", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
      { name: "Java", color: "from-red-400 to-orange-500", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
      { name: "Node.js", color: "from-green-400 to-emerald-500", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
      { name: "React", color: "from-cyan-400 to-blue-400", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
      { name: "Tailwind CSS", logo: "https://cdn.simpleicons.org/tailwindcss" },
      { name: "Visual Studio Code", color: "from-blue-400 to-indigo-500", logo: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Visual_Studio_Code_1.35_icon.svg" },
      { name: "NetBeans", logo: "https://cdn.simpleicons.org/apache/2496ED" },
      { name: "Eclipse", color: "from-purple-500 to-indigo-500", logo: "https://cdn.simpleicons.org/eclipseide/2C2255" },
      { name: "Odoo", color: "from-purple-400 to-pink-500", logo: "https://cdn.simpleicons.org/odoo/714B67" },
      { name: "MySQL Workbench", color: "from-orange-400 to-blue-400", logo: "https://cdn.simpleicons.org/mysql/4479A1" },
      { name: "GitHub", color: "from-gray-400 to-gray-600", logo: "https://cdn.simpleicons.org/github/ffffff" },
      { name: "Git", color: "from-orange-400 to-red-500", logo: "https://cdn.simpleicons.org/git/F05032" },
    ],
  },
  {
    section: "Servidores, Sistemas y Herramientas",
    tools: [
      { name: "Linux", color: "from-gray-700 to-black", logo: "https://cdn.simpleicons.org/linux/FAA918" },
      { name: "Raspbian", color: "from-rose-500 to-pink-500", logo: "https://cdn.simpleicons.org/raspberrypi/C51A4A" },
      { name: "Synology NAS", color: "from-slate-400 to-sky-400", logo: "https://cdn.simpleicons.org/synology/B5B5B6" },
      { name: "NGINX", color: "from-green-400 to-emerald-500", logo: "https://cdn.simpleicons.org/nginx/009639" },
      { name: "PuTTY", color: "from-yellow-400 to-amber-500", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e7/PuTTY_Icon.svg" },
      { name: "XAMPP", color: "from-orange-400 to-amber-500", logo: "https://cdn.simpleicons.org/xampp/F37623" },
      { name: "Docker", color: "from-sky-400 to-blue-500", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
      { name: "FileZilla", color: "from-red-500 to-rose-500", logo: "https://cdn.simpleicons.org/filezilla/BF0000" },
      { name: "Portainer", color: "from-white to-white", logo: "https://cdn.simpleicons.org/portainer/13BEF9" },
      { name: "DuckDNS", color: "from-amber-400 to-yellow-500", logo: "https://cdn.simpleicons.org/duckduckgo/DE5833" },
      { name: "Let's Encrypt", color: "from-blue-400 to-yellow-400", logo: "https://cdn.simpleicons.org/letsencrypt/003A70" },
      { name: "Cisco Packet Tracer", color: "from-blue-400 to-yellow-400", logo: "https://cdn.simpleicons.org/cisco" },
    ],
  },
    {
    section: "Soporte TI y Mantenimiento",
    tools: [
      { name: "Balena Etcher", color: "from-green-400 to-teal-500", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2d/Etcher-icon.png" },
      { name: "Pi-hole", color: "from-red-500 to-rose-500", logo: "https://cdn.simpleicons.org/pihole/96060C" },
      { name: "Anydesk", color: "from-gray-400 to-gray-600", logo: "https://cdn.simpleicons.org/anydesk" },
    ],
  },
  {
    section: "Automatización e Inteligencia Artificial",
    tools: [
      { name: "n8n", color: "from-pink-400 to-orange-400", logo: "https://cdn.simpleicons.org/n8n" },
      { name: "Make (Integromat)", color: "from-purple-400 to-pink-400", logo: "https://cdn.simpleicons.org/make" },
      { name: "ChatGPT", color: "from-emerald-400 to-teal-500", logo: "https://cdn.simpleicons.org/openai/10A37F" },
      { name: "Gemini", color: "from-sky-400 to-indigo-500", logo: "https://cdn.simpleicons.org/google/4285F4" },
      { name: "Grok", color: "from-fuchsia-500 to-purple-600", logo: "https://cdn.simpleicons.org/x/FFFFFF" },
      { name: "Perplexity AI", color: "from-cyan-400 to-blue-500", logo: "https://cdn.simpleicons.org/perplexity/1E88E5" },
      { name: "ComfyUI", color: "from-orange-400 to-pink-500", logo: "https://cdn.simpleicons.org/ubuntu/E95420" },
      { name: "Stable Diffusion", color: "from-fuchsia-500 to-purple-500", logo: "https://cdn2.steamgriddb.com/icon/0a8e9d1cf3ee0af0e6526059e1ac59d1/32/256x256.png" },
      { name: "Ollama", color: "from-emerald-400 to-teal-500", logo: "https://cdn.simpleicons.org/openai/10A37F" },
    ],
  },
  {
    section: "Diseño y Fabricación 3D",
    tools: [
      { name: "Ultimaker Cura", color: "from-teal-400 to-cyan-400", logo: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Ultimaker_cura.png" },
      { name: "Bambu Studio", color: "from-green-400 to-lime-400", logo: "https://cdn.simpleicons.org/bambulab/00AE42" },
      { name: "Fusion 360", color: "from-orange-400 to-amber-400", logo: "https://cdn.simpleicons.org/autodesk/0696D7" },
      { name: "Blender", color: "from-orange-400 to-yellow-400", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/blender/blender-original.svg" },
    ],
  },
  {
    section: "Infraestructura Cloud",
    tools: [
      { name: "Firebase", color: "from-amber-400 to-orange-500", logo: "https://cdn.simpleicons.org/firebase/FFCA28" },
      { name: "Vercel", color: "from-gray-700 to-black", logo: "https://cdn.simpleicons.org/vercel/ffffff" },
      { name: "Netlify", logo: "https://cdn.simpleicons.org/netlify/00C7B7" },
      { name: "Cloudflare", color: "from-orange-400 to-yellow-400", logo: "https://cdn.simpleicons.org/cloudflare/F38020" },
    ],
  },
  {
    section: "Creación de Contenido",
    tools: [
      { name: "DaVinci Resolve", color: "from-fuchsia-400 to-cyan-400", logo: "https://cdn.simpleicons.org/davinciresolve" },
      { name: "OBS Studio", color: "from-indigo-400 to-blue-500", logo: "https://cdn.simpleicons.org/obsstudio" },
      { name: "Canva", color: "from-cyan-400 to-white-200", logo: "https://cdn.simpleicons.org/canva" },
      { name: "Figma", color: "from-pink-400 to-orange-400", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" },
      { name: "CapCut", color: "from-white to-gray-600", logo: "https://upload.wikimedia.org/wikipedia/en/a/a0/Capcut-logo.svg" },
      { name: "The Gimp", color: "from-white to-gray-600", logo: "https://upload.wikimedia.org/wikipedia/commons/4/45/The_GIMP_icon_-_gnome.svg" },
    ],
  },
];

export default function ToolsGrid() {
  return (
    <section className="relative w-full mx-auto py-16">
      <Motion.h2
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        viewport={{ once: true }}
        className="text-center text-3xl md:text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-linear-to-r from-fuchsia-400 to-cyan-400 drop-shadow-lg"
      >
        Stack y ecosistema de trabajo
      </Motion.h2>
      <p className="text-gray-400 text-center mb-10">
        Conjunto de tecnologías, frameworks y herramientas que forman parte de mi flujo de desarrollo y experimentación.
      </p>
      <div className="flex flex-col gap-14 max-w-6xl mx-auto">
        {toolsSections.map(
          ({ section, tools }) =>
            tools.length > 0 && (
              <div key={section}>
                <h3 className="text-lg md:text-xl font-bold mb-5 pl-2 bg-linear-to-r from-cyan-300 via-fuchsia-400 to-indigo-600 bg-clip-text text-transparent drop-shadow">
                  {section}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
                  {tools.map((tool, idx) => (
                    <ToolCard key={tool.name} {...tool} idx={idx} />
                  ))}
                </div>
              </div>
            )
        )}
      </div>
    </section>
  );
}

function ToolCard({ name, color, logo, idx }) {
  return (
    <Motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay: idx * 0.04 }}
      viewport={{ once: true, margin: "-100px" }}
      whileHover={{
        y: -10,
        rotateZ: 7,
        boxShadow: "0 0 18px #d946ef88, 0 0 14px #22d3ee55",
        scale: 1.08,
      }}
      className={`flex flex-col items-center justify-center p-5 bg-slate-900/60 rounded-2xl border border-slate-700/50 shadow-md hover:shadow-xl transition-all cursor-pointer backdrop-blur-md`}
      style={{ boxShadow: `0 2px 22px 2px #d946ef22, 0 0 33px #22d3ee33` }}
    >
      <div
        className={`w-16 h-16 mb-3 rounded-full bg-linear-to-tr ${color} flex items-center justify-center shadow-[0_0_16px_#d946ef66,0_0_20px_#22d3ee55]`}
      >
        <img
          src={logo}
          alt={name}
          className="w-10 h-10 object-contain drop-shadow-glow-fuchsia"
        />
      </div>
      <span className="text-base font-medium text-gray-200 select-none">
        {name}
      </span>
    </Motion.div>
  );
}
