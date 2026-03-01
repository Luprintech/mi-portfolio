import { Router } from 'express';
import fsExtra from 'fs-extra';
import { verifyCmsToken } from '../../middleware/auth.js';
import { PROJECTS_FILE } from '../../config.js';

const router = Router();

// GET /api/bitacora/projects
router.get('/', verifyCmsToken, async (req, res) => {
    try {
        const projects = await fsExtra.readJson(PROJECTS_FILE);
        res.json(projects);
    } catch {
        res.status(500).json({ error: 'Error leyendo los proyectos' });
    }
});

// POST /api/bitacora/projects
router.post('/', verifyCmsToken, async (req, res) => {
    try {
        const project = req.body || {};
        if (!project.id || !project.title) {
            return res.status(400).json({ error: 'id y title son obligatorios' });
        }

        const projects = await fsExtra.readJson(PROJECTS_FILE);
        if (projects.find(p => p.id === project.id)) {
            return res.status(409).json({ error: 'Ya existe un proyecto con ese ID' });
        }

        projects.push(project);
        await fsExtra.writeJson(PROJECTS_FILE, projects, { spaces: 2 });
        res.status(201).json(project);
    } catch (err) {
        console.error('Error creando proyecto:', err);
        res.status(500).json({ error: 'Error creando el proyecto' });
    }
});

// PUT /api/bitacora/projects/:id
router.put('/:id', verifyCmsToken, async (req, res) => {
    try {
        const { id } = req.params;
        const projects = await fsExtra.readJson(PROJECTS_FILE);
        const idx = projects.findIndex(p => p.id === id);
        if (idx === -1) return res.status(404).json({ error: 'Proyecto no encontrado' });

        projects[idx] = { ...projects[idx], ...req.body };
        await fsExtra.writeJson(PROJECTS_FILE, projects, { spaces: 2 });
        res.json(projects[idx]);
    } catch (err) {
        console.error('Error actualizando proyecto:', err);
        res.status(500).json({ error: 'Error actualizando el proyecto' });
    }
});

// DELETE /api/bitacora/projects/:id
router.delete('/:id', verifyCmsToken, async (req, res) => {
    try {
        const { id } = req.params;
        const projects = await fsExtra.readJson(PROJECTS_FILE);
        const idx = projects.findIndex(p => p.id === id);
        if (idx === -1) return res.status(404).json({ error: 'Proyecto no encontrado' });

        projects.splice(idx, 1);
        await fsExtra.writeJson(PROJECTS_FILE, projects, { spaces: 2 });
        res.json({ success: true });
    } catch (err) {
        console.error('Error eliminando proyecto:', err);
        res.status(500).json({ error: 'Error eliminando el proyecto' });
    }
});

export default router;
