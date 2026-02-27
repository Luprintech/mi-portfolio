import { motion as Motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function ToolsGrid() {
  const { t } = useTranslation();

  const toolsSections = [
    {
      section: t('tools.sec_dev'),
      tools: [
        { name: "JavaScript", color: "from-yellow-400 to-orange-400", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
        { name: "React",      color: "from-cyan-400 to-blue-400",     logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
        { name: "Node.js",    color: "from-green-400 to-emerald-500", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
        { name: "PHP",        color: "from-indigo-400 to-blue-500",   logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg" },
        { name: "Python",     color: "from-yellow-400 to-blue-500",   logo: "https://cdn.simpleicons.org/python/3776AB" },
        { name: "SQL",        color: "from-blue-500 to-sky-400",      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
        { name: "Git",        color: "from-orange-400 to-red-500",    logo: "https://cdn.simpleicons.org/git/F05032" },
      ],
    },
    {
      section: t('tools.sec_infra'),
      tools: [
        { name: "Linux",  color: "from-gray-700 to-black",         logo: "https://cdn.simpleicons.org/linux/FAA918" },
        { name: "Docker", color: "from-sky-400 to-blue-500",       logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
        { name: "NGINX",  color: "from-green-400 to-emerald-500",  logo: "https://cdn.simpleicons.org/nginx/009639" },
      ],
    },
    {
      section: t('tools.sec_ai'),
      tools: [
        { name: "n8n",              color: "from-pink-400 to-orange-400",  logo: "https://cdn.simpleicons.org/n8n/EA4B71" },
        { name: t('tools.tool_api'), color: "from-blue-400 to-indigo-500", logo: "https://cdn.simpleicons.org/postman/FF6C37" },
        { name: t('tools.tool_ai'), color: "from-blue-500 to-indigo-500",  logo: "https://cdn.simpleicons.org/googlegemini/4285F4" },
      ],
    },
  ];

  return (
    <section className="relative w-full mx-auto py-16">
      <Motion.h2
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        viewport={{ once: true }}
        className="text-center text-3xl md:text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-cyan-400 drop-shadow-lg"
      >
        {t('tools.title_main')}
      </Motion.h2>
      <p className="text-[var(--text-muted)] text-center mb-10">
        {t('tools.subtitle')}
      </p>
      <div className="flex flex-col gap-14 max-w-6xl mx-auto">
        {toolsSections.map(
          ({ section, tools }) =>
            tools.length > 0 && (
              <div key={section}>
                <h3 className="text-lg md:text-xl font-bold mb-5 pl-2 bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-indigo-600 bg-clip-text text-transparent drop-shadow">
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
        y: -5,
        rotateZ: 2,
        boxShadow: "0 10px 30px -10px rgba(124, 58, 237, 0.4)",
        scale: 1.05,
      }}
      className="relative group flex flex-col items-center justify-center p-5 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-color)] shadow-[var(--shadow-sm)] hover:shadow-xl transition-all cursor-pointer backdrop-blur-md"
    >
      <div
        className={`w-16 h-16 mb-3 rounded-full bg-gradient-to-tr ${color} flex items-center justify-center shadow-[0_0_16px_#d946ef66,0_0_20px_#22d3ee55]`}
      >
        <img
          src={logo}
          alt={name}
          className="w-10 h-10 object-contain"
        />
      </div>
      <span className="text-base font-medium text-[var(--text-primary)] select-none">
        {name}
      </span>
    </Motion.div>
  );
}
