import { motion as Motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import mifoto from "../assets/pc.jpg";
import Timeline from "../components/Timeline.jsx";
import ToolsGrid from "../components/ToolsGrid.jsx";
import ExpertiseSection from "../components/ExpertiseSection.jsx";
import { useTranslation } from "react-i18next";

// Los datos serán generados dinámicamente dentro del componente para usar useTranslation

export default function SobreMi() {
  const { t } = useTranslation();

  const coreExpertise = [
    {
      id: 1,
      title: t('about.expertise_1_title'),
      icon: null,
      iconColor: "text-fuchsia-500",
      intro: t('about.expertise_1_intro'),
      capabilities: [
        t('about.expertise_1_cap_1'),
        t('about.expertise_1_cap_2'),
        t('about.expertise_1_cap_3'),
        t('about.expertise_1_cap_4'),
        t('about.expertise_1_cap_5')
      ],
      stack: {
        Frontend: ["React", "Next.js", "Tailwind CSS", "Vite"],
        Backend: ["Laravel (PHP)", "Node.js", "Express"],
        Database: ["MySQL", "Firebase Firestore"],
        Tools: ["Git", "npm/Composer", "Postman", "VS Code"]
      },
      projectExample: {
        name: t('about.expertise_1_proj_name'),
        description: t('about.expertise_1_proj_desc'),
        context: t('about.expertise_1_proj_ctx')
      }
    },
    {
      id: 2,
      title: t('about.expertise_2_title'),
      iconColor: "text-cyan-400",
      intro: t('about.expertise_2_intro'),
      capabilities: [
        t('about.expertise_2_cap_1'),
        t('about.expertise_2_cap_2'),
        t('about.expertise_2_cap_3'),
        t('about.expertise_2_cap_4'),
        t('about.expertise_2_cap_5')
      ],
      stack: {
        "AI APIs": ["Gemini API", "OpenAI (experimental)"],
        Backend: ["PHP (Laravel)", "Node.js"],
        Automation: ["Python", "Bash scripting"],
        Tools: ["Postman", "cron jobs"]
      },
      projectExample: {
        name: t('about.expertise_2_proj_name'),
        description: t('about.expertise_2_proj_desc'),
        context: t('about.expertise_2_proj_ctx')
      }
    },
    {
      id: 3,
      title: t('about.expertise_3_title'),
      iconColor: "text-amber-400",
      intro: t('about.expertise_3_intro'),
      capabilities: [
        t('about.expertise_3_cap_1'),
        t('about.expertise_3_cap_2'),
        t('about.expertise_3_cap_3'),
        t('about.expertise_3_cap_4'),
        t('about.expertise_3_cap_5'),
        t('about.expertise_3_cap_6'),
        t('about.expertise_3_cap_7')
      ],
      stack: {
        OS: ["Linux (Ubuntu Server, Debian)", "Windows Server"],
        Containers: ["Docker", "Docker Compose"],
        Servers: ["NGINX", "Apache"],
        Hosting: ["Vercel", "Firebase", "VPS"],
        Hardware: ["Raspberry Pi", "x86-64 architecture"],
        "CI/CD": ["GitHub Actions"]
      },
      projectExample: {
        name: t('about.expertise_3_proj_name'),
        description: t('about.expertise_3_proj_desc'),
        context: t('about.expertise_3_proj_ctx')
      }
    }
  ];

  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-[#0b1220] text-white px-6 pt-32 pb-20 overflow-hidden relative selection:bg-violet-500/30">
      {/* Textura Noise sutil general */}
      <div className="absolute inset-0 bg-noise opacity-[0.02] mix-blend-overlay pointer-events-none z-0" />
      
      {/* Gradiente lineal suave de fondo */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b1220] via-[#0f172a] to-[#0b1220] pointer-events-none z-0" />

      {/* PRESENTACIÓN */}
      <Motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="max-w-6xl flex flex-col md:flex-row items-center gap-12 mx-auto z-10 mb-20"
      >
        {/* FOTO con Tilt y borde neón limpio */}
        <div className="shrink-0 md:order-2 relative group">
          <Motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 150 }}
            className="relative"
          >
            <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.05}>
              <div className="p-[3px] bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-purple-600 rounded-2xl shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all duration-500 group-hover:shadow-[0_0_25px_rgba(34,211,238,0.6)]">
                <img
                  src={mifoto}
                  alt="Lupe - Guadalupe Cano"
                  className="w-64 md:w-72 h-[380px] md:h-[430px] object-cover rounded-2xl"
                />
              </div>
            </Tilt>
          </Motion.div>
        </div>

        {/* TEXTO */}
        <div className="md:order-1 max-w-2xl space-y-6">
          <p className="text-gray-300 text-lg leading-relaxed text-justify">
            {t('about.bio_p1')}
          </p>
          <p className="text-gray-300 text-lg leading-relaxed text-justify" dangerouslySetInnerHTML={{ __html: t('about.bio_p2') }} />
          <p className="text-gray-300 text-lg leading-relaxed text-justify" dangerouslySetInnerHTML={{ __html: t('about.bio_p3') }} />
          <p className="text-gray-300 text-lg leading-relaxed text-justify">
            {t('about.bio_p4')}
          </p>
          <p className="text-gray-300 text-lg leading-relaxed text-justify" dangerouslySetInnerHTML={{ __html: t('about.bio_p5') }} />
           <p className="text-gray-300 text-lg leading-relaxed text-justify">
           {t('about.bio_p6')}
           </p>
          <p className="text-gray-300 text-lg leading-relaxed text-justify">
            {t('about.bio_p7')}
          </p>

          <Motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-gray-300 text-lg leading-relaxed text-justify"
          >
            {t('about.bio_p8')}
          </Motion.p>
        </div>
      </Motion.div>

      {/* ÁREAS DE ESPECIALIZACIÓN */}
      <Motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="max-w-5xl mx-auto w-full z-10 mb-20"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-cyan-400">
          {t('about.areas_title')}
        </h2>
        <p className="text-gray-400 text-center mb-12 max-w-3xl mx-auto">
          {t('about.areas_subtitle')}
        </p>

        <div className="space-y-4">
          {coreExpertise.map((area, index) => (
            <ExpertiseSection 
              key={area.id} 
              area={area} 
              index={index} 
            />
          ))}
        </div>
      </Motion.div>

      {/* LÍNEA DE TIEMPO */}
      <Timeline />

      {/* GRID DE TOOLS */}
      <ToolsGrid />
    </section>
  );
}
