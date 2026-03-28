// 🎯 SERVICIOS - DATOS CENTRALIZADOS
// Este archivo gestiona TODOS los servicios ofrecidos compaginando perfil técnico con nivel Junior/Entry

import { FaCode, FaServer, FaBrain, FaLinux, FaWordpress, FaShieldAlt } from "react-icons/fa";

export const services = [
    {
        id: 1,
        title: "services.fullstack_title",
        description: "services.fullstack_desc",
        icon: FaCode,
        iconSize: 36,
        iconColor: "text-fuchsia-500",
        hoverShadow: "hover:shadow-fuchsia-500/30",
        link: "/servicios/desarrollo-web",
        featured: true,
    },
    {
        id: 2,
        title: "services.apis_title",
        description: "services.apis_desc",
        icon: FaServer,
        iconSize: 36,
        iconColor: "text-purple-400",
        hoverShadow: "hover:shadow-purple-400/30",
        link: "/servicios/backend-apis",
        featured: true,
    },
    {
        id: 3,
        title: "services.ai_title",
        description: "services.ai_desc",
        icon: FaBrain,
        iconSize: 36,
        iconColor: "text-cyan-400",
        hoverShadow: "hover:shadow-cyan-400/30",
        link: "/servicios/inteligencia-artificial",
        featured: true,
    },
    {
        id: 4,
        title: "services.cloud_title",
        description: "services.cloud_desc",
        icon: FaLinux,
        iconSize: 36,
        iconColor: "text-emerald-400",
        hoverShadow: "hover:shadow-emerald-400/30",
        link: "/servicios/cloud-deploy",
        featured: true,
    },
    {
        id: 5,
        title: "services.wordpress_title",
        description: "services.wordpress_desc",
        icon: FaWordpress,
        iconSize: 36,
        iconColor: "text-blue-400",
        hoverShadow: "hover:shadow-blue-400/30",
        link: "/servicios/wordpress",
        featured: true,
    },
    {
        id: 6,
        title: "services.security_title",
        description: "services.security_desc",
        icon: FaShieldAlt,
        iconSize: 36,
        iconColor: "text-amber-400",
        hoverShadow: "hover:shadow-amber-400/30",
        link: "/servicios/ciberseguridad",
        featured: true,
    },
];

// Función helper para obtener servicios destacados
export const getFeaturedServices = () => {
    return services.filter((s) => s.featured);
};

// Función helper para obtener todos los servicios
export const getAllServices = () => {
    return services;
};

// Función para obtener un servicio por ID
export const getServiceById = (id) => {
    return services.find((s) => s.id === id);
};
