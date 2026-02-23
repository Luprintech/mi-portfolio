# 🚀 Guadalupe Cano | Tecnología e Innovación

<div align="center">

[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.1.7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1.16-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.23.24-FF0080?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)

**Portfolio profesional en React con animaciones modernas y diseño futurista**

[Ver Demo](#) • [Reportar Bug](#) • [Solicitar Feature](#)

</div>

---

## 📖 Sobre el Proyecto

**Guadalupe Cano** es un sitio web portfolio profesional que combina:
- 💻 **Desarrollo Web** moderno y responsivo
- 🧠 **Inteligencia Artificial** aplicada a proyectos creativos
- 🖨️ **Impresión 3D** y fabricación digital
- 🛠️ **Soporte TI** especializado

El sitio presenta un diseño futurista con gradientes vibrantes (fuchsia/cyan), partículas animadas, efectos parallax y transiciones fluidas creadas con Framer Motion.

---

## ✨ Características Principales

### 🎨 Diseño & UX
- **Diseño Dark Mode** con paleta de colores fuchsia/cyan
- **Animaciones suaves** con Framer Motion
- **Efectos Parallax Tilt** en tarjetas interactivas
- **Typewriter effect** en el hero con texto rotativo
- **Carrusel infinito** de tecnologías con Swiper
- **Gradientes animados** y auras giratorias

### 📱 Páginas y Secciones
- **Home**: Hero con foto animada, servicios destacados, proyectos y videos
- **About**: Timeline de experiencia, herramientas y componente Luprincat
- **Services**: Desarrollo Web, IA, Impresión 3D, Soporte TI
- **Portfolio**: Muestra de proyectos realizados
- **Blog**: Sección de artículos y contenido
- **Contact**: Formulario de contacto

### 🛠️ Componentes Reutilizables
- `Navbar`: Navegación responsive con animaciones
- `Footer`: Pie de página con enlaces sociales
- `Timeline`: Línea temporal de experiencia
- `ToolsGrid`: Grid de herramientas y tecnologías
- `ModalMedia`: Modal para visualización de medios
- `Luprincat`: Componente especial animado

---

## 🚀 Tecnologías Utilizadas

### Core
- **React 19.1.1** - Biblioteca de UI moderna
- **Vite 7.1.7** - Build tool ultrarrápido
- **React Router DOM 7.9.5** - Navegación SPA

### Estilos
- **Tailwind CSS 4.1.16** - Framework CSS utility-first
- **PostCSS & Autoprefixer** - Procesamiento CSS

### Animaciones & Efectos
- **Framer Motion 12.23.24** - Animaciones declarativas
- **React Parallax Tilt** - Efectos 3D interactivos
- **React Simple Typewriter** - Efecto de máquina de escribir
- **@tsparticles/react** - Sistema de partículas

### UI Components
- **React Icons 5.5.0** - Biblioteca de iconos
- **Swiper 12.0.3** - Carruseles modernos

### Desarrollo
- **ESLint 9.36.0** - Linter de código
- **@vitejs/plugin-react** - Plugin oficial de React para Vite

---

## 📦 Instalación

### Prerrequisitos
- **Node.js** (versión 18 o superior)
- **npm** o **yarn**

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/guadalupe-cano.git
   cd guadalupe-cano
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```
   El sitio estará disponible en `http://localhost:5173`

4. **Construir para producción**
   ```bash
   npm run build
   ```

5. **Previsualizar build de producción**
   ```bash
   npm run preview
   ```

---

## 📂 Estructura del Proyecto

```
Mi web/
├── public/                 # Recursos estáticos
│   ├── favicon.ico
│   └── ...
├── src/
│   ├── assets/            # Imágenes y recursos
│   │   └── mifoto.png
│   ├── components/        # Componentes reutilizables
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── Timeline.jsx
│   │   ├── ToolsGrid.jsx
│   │   ├── Luprincat.jsx
│   │   ├── ModalMedia.jsx
│   │   └── icons.jsx
│   ├── pages/             # Páginas de la aplicación
│   │   ├── Home.jsx
│   │   ├── About.jsx
│   │   ├── Services.jsx
│   │   ├── Portfolio.jsx
│   │   ├── Blog.jsx
│   │   ├── Contact.jsx
│   │   ├── services/      # Páginas de servicios
│   │   │   ├── DevWeb.jsx
│   │   │   ├── IA.jsx
│   │   │   ├── Impresion3D.jsx
│   │   │   └── SoporteTI.jsx
│   │   └── portfolio/     # Páginas de portfolio
│   ├── routes/            # Configuración de rutas
│   │   └── AppRoutes.jsx
│   ├── App.jsx            # Componente principal
│   ├── main.jsx           # Punto de entrada
│   └── index.css          # Estilos globales
├── index.html             # HTML template
├── vite.config.js         # Configuración de Vite
├── eslint.config.js       # Configuración de ESLint
├── package.json
└── README.md
```

---

## 🎨 Paleta de Colores

El diseño utiliza una paleta futurista:

- **Fondo Principal**: `#0b1120` (Dark navy)
- **Primario**: `#ec4899` (Fuchsia) → `#22d3ee` (Cyan)
- **Secundario**: `#a855f7` (Purple)
- **Acentos**: `#34d399` (Emerald), `#fbbf24` (Yellow)
- **Texto**: `#f3f4f6` (Gray-100)

---

## 🎯 Scripts Disponibles

```bash
npm run dev      # Inicia servidor de desarrollo
npm run build    # Construye para producción
npm run preview  # Previsualiza build de producción
npm run lint     # Ejecuta ESLint
```

---

## 🌟 Características Destacadas

### Hero Section
- Foto de perfil con efecto **Tilt 3D**
- Aura giratoria con gradiente animado
- Texto dinámico con **Typewriter effect**
- 4 roles rotativos: Desarrolladora Web, Creadora de Contenido, Maker, IA

### Servicios
Tarjetas interactivas con hover effects para:
- 💻 Desarrollo Web
- 🧠 Inteligencia Artificial
- 🛠️ Soporte TI
- 🖨️ Impresión 3D

### Carrusel de Tecnologías
Movimiento continuo infinito mostrando:
React, Docker, Nginx, WordPress, Tailwind, Node.js, HTML5, CSS3

### Videos Embebidos
Sección "Guadalupe Cano en acción" con videos de YouTube:
- Funko Pop con IA e Impresión 3D
- Migración de SO a SSD

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para cambios importantes:

1. Fork el proyecto
2. Crea tu rama de features (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: nueva característica'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📧 Contacto

**Lupe** - Guadalupe Cano

- 🌐 Web: [guadalupecano.es](#)
- 📧 Email: [contacto@guadalupecano.es](#)
- 💼 LinkedIn: [linkedin.com/in/guadalupe-cano](#)

---

## 📝 Licencia

Este proyecto es privado y de uso personal.

---

<div align="center">

**Hecho con ❤️ por Lupe usando React y Vite**

⭐ Si te gusta este proyecto, ¡dale una estrella!

</div>
