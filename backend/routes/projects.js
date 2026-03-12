import { Router } from 'express';
import fsExtra from 'fs-extra';
import { logger } from '../lib/logger.js';
import { PROJECTS_FILE } from '../config/paths.js';
import { verifyCmsToken } from '../middleware/auth.js';
import { sanitizeProjectInput, validateRouteSlug } from '../utils/contentValidation.js';
import { createHttpError } from '../utils/httpErrors.js';

const router = Router();
const projectsLogger = logger.child({ route: 'projects' });

router.use(verifyCmsToken);

router.get('/', async (_req, res, next) => {
    try {
        const projects = await fsExtra.readJson(PROJECTS_FILE);
        res.json(projects);
    } catch (error) {
        next(createHttpError(500, 'Error leyendo los proyectos', { cause: error }));
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { errors, data } = sanitizeProjectInput(req.body);
        if (errors.length) {
            return res.status(400).json({ error: errors[0] });
        }

        const projects = await fsExtra.readJson(PROJECTS_FILE);
        if (projects.find(project => project.id === data.id)) {
            return res.status(409).json({ error: 'Ya existe un proyecto con ese ID' });
        }

        projects.push(data);
        await fsExtra.writeJson(PROJECTS_FILE, projects, { spaces: 2 });

        projectsLogger.info('Project created', {
            requestId: req.requestId,
            projectId: data.id,
            username: req.user?.username || null,
        });

        res.status(201).json(data);
    } catch (error) {
        next(createHttpError(500, 'Error creando el proyecto', { cause: error }));
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const id = validateRouteSlug(req.params.id);
        if (!id) return res.status(400).json({ error: 'ID de proyecto no valido' });

        const projects = await fsExtra.readJson(PROJECTS_FILE);
        const index = projects.findIndex(project => project.id === id);
        if (index === -1) return res.status(404).json({ error: 'Proyecto no encontrado' });

        const { errors, data } = sanitizeProjectInput(req.body, { partial: true });
        if (errors.length) {
            return res.status(400).json({ error: errors[0] });
        }

        projects[index] = { ...projects[index], ...data };
        await fsExtra.writeJson(PROJECTS_FILE, projects, { spaces: 2 });

        projectsLogger.info('Project updated', {
            requestId: req.requestId,
            projectId: id,
            username: req.user?.username || null,
        });

        res.json(projects[index]);
    } catch (error) {
        next(createHttpError(500, 'Error actualizando el proyecto', { cause: error }));
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const id = validateRouteSlug(req.params.id);
        if (!id) return res.status(400).json({ error: 'ID de proyecto no valido' });

        const projects = await fsExtra.readJson(PROJECTS_FILE);
        const index = projects.findIndex(project => project.id === id);
        if (index === -1) return res.status(404).json({ error: 'Proyecto no encontrado' });

        projects.splice(index, 1);
        await fsExtra.writeJson(PROJECTS_FILE, projects, { spaces: 2 });

        projectsLogger.info('Project deleted', {
            requestId: req.requestId,
            projectId: id,
            username: req.user?.username || null,
        });

        res.json({ success: true });
    } catch (error) {
        next(createHttpError(500, 'Error eliminando el proyecto', { cause: error }));
    }
});

export default router;
