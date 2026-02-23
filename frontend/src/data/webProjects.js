// 🎯 ARCHIVO CENTRALIZADO DE PROYECTOS WEB
// Aquí gestionas TODOS tus proyectos de desarrollo web
// Para que un proyecto aparezca en el INICIO, pon featured: true
// Solo los primeros 3 proyectos con featured:true aparecerán en inicio

import calculadora from "../assets/portfolio/calculadora3d.png";
import luprinchef from "../assets/portfolio/luprinchef.jpg";
import github from "../assets/portfolio/github.png";
import vocaccion from "../assets/portfolio/vocaccion.jpg";

export const webProjects = [
    {
        id: 1,
        titulo: "projects.vocaccion_title",
        descripcion: "projects.vocaccion_desc",
        shortDescription: "projects.vocaccion_short",
        imagen: vocaccion,
        links: [
            {
                url: "https://tuvocaccion.es",
                labelKey: "projects.view_app",
                type: "web",
            },
            {
                url: "https://github.com/Luprintech/vocaccion",
                labelKey: "projects.view_code",
                type: "github",
            },
        ],
        tech: ["Laravel", "React", "MySQL", "Tailwind CSS", "IA Gemini", "API REST", "MVC"],
        featured: true, // ⭐ APARECE EN INICIO
    },
    {
        id: 2,
        titulo: "projects.calc3d_title",
        descripcion: "projects.calc3d_desc",
        shortDescription: "projects.calc3d_short",
        imagen: calculadora,
        links: [
            {
                url: "https://calculadora3d.guadalupecano.es/",
                labelKey: "projects.view_app",
                type: "web",
            },
            {
                url: "https://github.com/Luprintech/calculadora-3D",
                labelKey: "projects.view_code",
                type: "github",
            },
        ],
        tech: ["Next.js", "TypeScript", "Tailwind CSS", "React"],
        featured: true, // ⭐ APARECE EN INICIO
    },
    {
        id: 3,
        titulo: "projects.luprinchef_title",
        descripcion: "projects.luprinchef_desc",
        shortDescription: "projects.luprinchef_short",
        imagen: luprinchef,
        links: [
            {
                url: "https://recetas.guadalupecano.es/",
                labelKey: "projects.view_app",
                type: "web",
            },
            {
                url: "https://github.com/Luprintech/luprinchef-recetas",
                labelKey: "projects.view_code",
                type: "github",
            },
        ],
        tech: ["Next.js", "TypeScript", "React", "Tailwind CSS", "API Edamam", "Firebase"],
        featured: true, // ⭐ APARECE EN INICIO
    },

    // 👇 AGREGA MÁS PROYECTOS AQUÍ
    // Ejemplo:
    // {
    //   id: 4,
    //   titulo: "Nuevo Proyecto",
    //   descripcion: "Descripción del proyecto",
    //   imagen: imagenImportada,
    //   link: "https://...",
    //   tech: ["React", "Node.js"],
    //   featured: false, // No aparece en inicio, solo en portfolio
    // },
];

// Función helper para obtener proyectos destacados (máximo 2 para home)
export const getFeaturedProjects = () => {
    return webProjects.filter((p) => p.featured).slice(0, 2);
};

// Función helper para obtener todos los proyectos
export const getAllWebProjects = () => {
    return webProjects;
};
