# 📚 Guía de Administración de Proyectos

## 📌 Cómo agregar o editar proyectos

Todos los proyectos de **Desarrollo Web** se gestionan desde un único archivo:

**📂 Ubicación:** `src/data/webProjects.js`

---

## ✏️ Formato de un Proyecto

Cada proyecto puede tener **un link** (formato simple) o **múltiples links** (formato avanzado):

### 📌 Formato Simple (Un solo link)

```javascript
{
  id: 1,
  titulo: "Mi Proyecto",
  descripcion: "Breve descripción de qué hace el proyecto",
  imagen: imagenVariable,
  link: "https://...",      // ✅ Un solo link
  tech: ["React", "CSS"],
  featured: true,
}
```

### 🔗 Formato Avanzado (Múltiples links)

```javascript
{
  id: 2,
  titulo: "Mi Proyecto Completo",
  descripcion: "Proyecto con código en GitHub y aplicación web desplegada",
  imagen: imagenVariable,
  links: [                  // ✅ Array de múltiples links
    {
      url: "https://mi-app.com",
      label: "Ver aplicación",
      type: "web",          // web, github, o generic
    },
    {
      url: "https://github.com/usuario/proyecto",
      label: "Ver código",
      type: "github",
    },
  ],
  tech: ["React", "Node.js", "MySQL"],
  featured: true,
}
```

#### Tipos de links disponibles:
- `"web"` - Botón con gradiente fuchsia/cyan y icono de web 🌐
- `"github"` - Botón gris oscuro con icono de GitHub 🐙
- `"generic"` - Botón morado/rosa con icono genérico 🔗

---

## 🎯 Proyectos Destacados en INICIO

- Solo aparecen proyectos con **`featured: true`**
- **Máximo 3 proyectos** destacados se muestran en Inicio
- Si hay más de 3 con `featured: true`, solo se muestran los primeros 3

### ¿Cómo destacar un proyecto?

```javascript
featured: true,  // ⭐ Aparece en Inicio
```

### ¿Cómo quitar un proyecto del Inicio?

```javascript
featured: false, // Solo aparece en Portfolio
```

---

## 📝 Ejemplo: Agregar un nuevo proyecto

### 1️⃣ Importa la imagen (si está en assets)

```javascript
import calculadora from "../assets/portfolio/calculadora3d.png";
import miNuevoProyecto from "../assets/portfolio/mi-proyecto.png"; // ⬅️ NUEVO
```

### 2️⃣ Agrega el proyecto al array

**Opción A: Con un solo link**
```javascript
export const webProjects = [
  // ... proyectos existentes ...
  
  {
    id: 4,
    titulo: "Mi Portfolio Personal",
    descripcion: "Sitio web personal con mis proyectos",
    imagen: miNuevoProyecto,
    link: "https://mi-portfolio.com",
    tech: ["React", "Tailwind"],
    featured: false,
  },
];
```

**Opción B: Con múltiples links**
```javascript
export const webProjects = [
  // ... proyectos existentes ...
  
  {
    id: 4,
    titulo: "Tienda Online",
    descripcion: "E-commerce desarrollado con MERN stack",
    imagen: miNuevoProyecto,
    links: [
      {
        url: "https://tienda-demo.com",
        label: "Ver tienda",
        type: "web",
      },
      {
        url: "https://github.com/usuario/tienda",
        label: "Ver código",
        type: "github",
      },
    ],
    tech: ["React", "Node.js", "MongoDB", "Express"],
    featured: true, // Aparecerá en Inicio
  },
];
```


---

## 🔄 Dónde se usan los proyectos

### 🏠 **Inicio** (`src/pages/Home.jsx`)
- Muestra solo los **3 primeros proyectos con `featured: true`**
- Usa la función `getFeaturedProjects()`

### 💼 **Portfolio > Desarrollo Web** (`src/pages/portfolio/desarrollo-web.jsx`)
- Muestra **TODOS** los proyectos
- Usa la función `getAllWebProjects()`

---

## 🎨 Personalización

### Cambiar el número de proyectos destacados

En `src/data/webProjects.js`, línea 52:

```javascript
export const getFeaturedProjects = () => {
  return webProjects.filter((p) => p.featured).slice(0, 3); // ⬅️ Cambia el 3
};
```

---

## ⚠️ Importante

- **NO modifiques** `Home.jsx` o `desarrollo-web.jsx` para agregar proyectos
- **Solo edita** `src/data/webProjects.js`
- Asegúrate de que cada proyecto tenga un **ID único**
- Importa las imágenes al inicio del archivo

---

## 📌 Resumen Rápido

| Acción | Dónde editarlo |
|--------|---------------|
| Agregar proyecto | `src/data/webProjects.js` |
| Destacar en Inicio | Poner `featured: true` |
| Quitar de Inicio | Poner `featured: false` |
| Cambiar orden | Reordenar en el array |

---

✅ **Con este sistema, solo tocas un archivo para gestionar todo**
