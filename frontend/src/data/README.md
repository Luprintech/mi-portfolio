# Guia de Proyectos

## Fuente de verdad actual

La web publica ya no consume `src/data/webProjects.js` como fuente principal.

Los proyectos visibles en portfolio e inicio se leen desde:

- `frontend/public/projects.json`

El hook que los carga es:

- `frontend/src/hooks/useProjects.js`

## Cuando editar proyectos

- Si quieres cambiar los proyectos que muestra la web publica, edita `frontend/public/projects.json`.
- Si el cambio viene desde el CMS, el backend actualizara ese mismo fichero o la ruta definida por `CONTENT_PATH`.
- Antes de tocar `src/data/webProjects.js`, comprueba si sigue siendo contenido legacy o de referencia.

## Formato esperado

Cada proyecto sigue esta estructura base:

```json
{
  "id": "mi-proyecto",
  "title": "Mi proyecto",
  "description": "Descripcion breve",
  "tech": ["React", "Node.js"],
  "github": "https://github.com/usuario/proyecto",
  "demo": "https://mi-proyecto.com",
  "image": "/images/mi-proyecto.jpg",
  "featured": false,
  "category": "code"
}
```

## Campos relevantes

- `id`: identificador unico.
- `title`: titulo mostrado en UI y CMS.
- `description`: texto corto para cards.
- `tech`: array de tecnologias.
- `github`: enlace al repositorio si existe.
- `demo`: enlace al proyecto desplegado si existe.
- `image`: ruta publica de la imagen.
- `featured`: si es `true`, puede aparecer en inicio.
- `category`: usa `code` o `cms`.

## Comprobacion rapida

- Inicio usa `featuredProjects` desde `useProjects()`.
- Portfolio divide proyectos entre `code` y `cms`.
- Si cambias el esquema JSON, revisa tambien `frontend/src/hooks/useProjects.js`, `frontend/src/components/ProjectCard.jsx` y el CMS.
