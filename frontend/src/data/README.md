# Guía de proyectos

## Fuente de verdad actual

La web pública ya no usa `frontend/public/projects.json` como fuente de verdad principal.

Los proyectos visibles en portfolio e inicio se leen desde la API pública:

- `GET /api/projects`

El hook que los consume es:

- `frontend/src/hooks/useProjects.js`

## Persistencia real

Los proyectos viven en PostgreSQL, en la tabla `projects`.

El archivo `frontend/public/projects.json` queda como contenido legacy de arranque para la importación inicial a la base de datos, pero no debe editarse como flujo habitual de mantenimiento.

## Cuándo editar proyectos

- Si quieres cambiar los proyectos del portfolio, usa el CMS.
- Si necesitas una migración manual, revisa primero `backend/lib/contentRepository.js` y `backend/lib/database.js`.
- Antes de tocar `src/data/webProjects.js`, comprueba si sigue siendo material legado o de referencia interna.

## Contrato esperado

Cada proyecto expone esta estructura pública:

```json
{
  "id": "mi-proyecto",
  "title": "Mi proyecto",
  "description": "Descripcion breve",
  "tech": ["React", "Node.js"],
  "github": "https://github.com/usuario/proyecto",
  "demo": "https://mi-proyecto.com",
  "image": "/posts/images/mi-proyecto.jpg",
  "featured": false,
  "category": "code"
}
```

## Comprobación rápida

- Inicio usa `featuredProjects` desde `useProjects()`.
- Portfolio divide proyectos entre `code` y `cms`.
- Si cambias el contrato, revisa también `frontend/src/hooks/useProjects.js`, `frontend/src/components/ProjectCard.jsx`, el CMS y `backend/routes/publicContent.js`.
