// 🎯 TECHNICAL EXPERTISE - DATOS CENTRALIZADOS
// Estructura profesional orientada a posicionamiento para empleo tech

import { FaCode, FaBrain, FaTools, FaServer } from "react-icons/fa";

export const expertiseAreas = [
    {
        id: 1,
        title: "Full-Stack Application Development",
        icon: FaCode,
        iconColor: "text-fuchsia-500",
        intro: "Diseño y desarrollo de aplicaciones web modernas con arquitecturas escalables. Me enfoco en soluciones end-to-end que balancean experiencia de usuario, performance y mantenibilidad del código. Experiencia tanto en SPAs como en arquitecturas server-side.",
        capabilities: [
            "Arquitectura frontend: Componentes reutilizables, state management, routing client-side",
            "Backend APIs: Diseño RESTful, autenticación (JWT, OAuth), validación server-side",
            "Persistencia de datos: Modelado relacional (MySQL), migraciones, queries optimizadas",
            "Integración de servicios: Consumo de APIs externas, webhooks, manejo de errores asíncronos",
            "Testing & QA: Unit tests, integración, debugging con devtools",
            "Build & Deploy: Optimización de assets, lazy loading, code splitting"
        ],
        stack: {
            Frontend: ["React", "Next.js", "Tailwind CSS", "Vite"],
            Backend: ["Laravel (PHP)", "Node.js", "Express"],
            Database: ["MySQL", "Firebase Firestore"],
            Tools: ["Git", "npm/Composer", "Postman", "VS Code"]
        },
        projectExample: {
            name: "VocAcción",
            description: "Plataforma de orientación vocacional con 3 roles (admin/orientador/estudiante). Arquitectura MVC con Laravel backend, React SPA, autenticación con Sanctum, y panel administrativo CRUD completo.",
            context: "Proyecto final del Ciclo Superior de Desarrollo de Aplicaciones Web"
        }
    },
    {
        id: 2,
        title: "AI/ML Integration & Automation",
        icon: FaBrain,
        iconColor: "text-cyan-400",
        intro: "Integración de modelos de IA en aplicaciones web mediante APIs. No entreno modelos desde cero, pero sí diseño prompts efectivos, gestiono rate limits, manejo de errores y optimizo costos de API. Enfoque en casos de uso reales, no demos.",
        capabilities: [
            "Prompt engineering: Diseño de prompts estructurados con contexto dinámico",
            "API integration: Gemini API, manejo de streaming responses, timeouts",
            "Error handling: Fallbacks cuando API falla, retry logic, user feedback",
            "Cost optimization: Caché de respuestas, limpieza de prompts, rate limiting",
            "Data processing: Parsing de respuestas JSON, sanitización de outputs",
            "Workflow automation: Scripts Python para tareas repetitivas, web scraping básico"
        ],
        stack: {
            "AI APIs": ["Gemini API", "OpenAI (experimental)"],
            Backend: ["PHP (Laravel)", "Node.js"],
            Automation: ["Python (requests, BeautifulSoup)", "Bash scripting"],
            Tools: ["Postman", "cron jobs", "webhooks"]
        },
        projectExample: {
            name: "Sistema de análisis IA en VocAcción",
            description: "Generación de análisis vocacionales personalizados. Sistema que envía resultados de tests + perfil del estudiante a Gemini API, procesa la respuesta en formato estructurado, y almacena el análisis en BD. Incluye rate limiting y fallback a análisis pre-generado si API falla.",
            context: "Implementación práctica de IA generativa en proyecto educativo"
        }
    },
    {
        id: 3,
        title: "DevOps & Developer Tooling",
        icon: FaTools,
        iconColor: "text-purple-400",
        intro: "Configuración de entornos de desarrollo, pipelines de deployment y herramientas que automatizan procesos repetitivos. Me enfoco en que el código llegue de local a producción de forma predecible y reproducible, reduciendo friction en el workflow del equipo.",
        capabilities: [
            "Containerización: Dockerfiles para entornos consistentes (dev/prod parity)",
            "CI/CD básico: GitHub Actions para builds automáticos, testing pre-deploy",
            "Reverse proxies: NGINX para servir múltiples apps, SSL con Let's Encrypt",
            "Gestión de dependencias: npm, Composer, lockfiles, security updates",
            "Environment config: Variables de entorno (.env), secrets management",
            "Monitoring básico: Logs centralizados, uptime checks, error tracking"
        ],
        stack: {
            Containers: ["Docker", "Docker Compose"],
            Servers: ["NGINX", "Apache"],
            Hosting: ["Vercel", "Firebase Hosting", "VPS (Linux)"],
            "CI/CD": ["GitHub Actions", "Vercel auto-deploy"],
            Monitoring: ["Console logs", "Firebase Analytics"]
        },
        projectExample: {
            name: "Entorno de desarrollo multi-proyecto",
            description: "Configuración de servidor local con múltiples aplicaciones corriendo simultáneamente. NGINX reverse proxy para ruteo, contenedores Docker para aislamiento, y scripts de deployment automático.",
            context: "Infraestructura práctica para desarrollo y aprendizaje continuo"
        }
    },
    {
        id: 4,
        title: "Systems & Infrastructure Engineering",
        icon: FaServer,
        iconColor: "text-amber-400",
        intro: "Conocimiento profundo de sistemas operativos, hardware y arquitecturas de red que me permite diagnosticar problemas desde la aplicación hasta el metal. Esta base técnica sólida me convierte en developer que entiende el stack completo, no solo código, sino dónde y cómo se ejecuta.",
        capabilities: [
            "System administration: Instalación y configuración de Linux (Ubuntu Server, Debian), gestión de usuarios y permisos",
            "Hardware troubleshooting: Diagnóstico de fallos (RAM, discos, PSU), montaje de equipos, compatibilidad de componentes",
            "Networking: Configuración de routers, subnetting básico, firewall rules (ufw, iptables), DNS local",
            "Server provisioning: Setup de servidores desde cero (SSH hardening, servicios, monitoreo)",
            "Storage management: RAID configurations, backups automáticos, recuperación de datos",
            "Performance tuning: Identificación de cuellos de botella (CPU, I/O, memoria), optimización de recursos"
        ],
        stack: {
            OS: ["Linux (Ubuntu Server, Debian)", "Windows Server"],
            Hardware: ["x86-64 architecture", "Raspberry Pi (ARM)"],
            Networking: ["SSH", "FTP/SFTP", "VPN (WireGuard)", "port forwarding"],
            Services: ["systemd", "cron", "fail2ban", "rsync"],
            Tools: ["htop", "netstat", "journalctl", "dd", "rsync"],
            Platforms: ["Raspberry Pi", "VPS providers", "home lab"]
        },
        projectExample: {
            name: "Home Lab Infrastructure",
            description: "Servidor local basado en hardware reciclado con Ubuntu Server. Múltiples servicios en contenedores, NGINX reverse proxy con SSL, monitoreo de recursos, backup incremental diario, y acceso remoto seguro vía SSH.",
            context: "Laboratorio personal para experimentación y aprendizaje de arquitecturas reales"
        }
    }
];

// Helper functions
export const getAllExpertiseAreas = () => expertiseAreas;

export const getExpertiseById = (id) => {
    return expertiseAreas.find(area => area.id === id);
};

export default expertiseAreas;
