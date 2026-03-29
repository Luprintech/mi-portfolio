import { Router } from 'express';
import { logger } from '../lib/logger.js';
import {
    createProject,
    deleteProject,
    listProjectsForCms,
    updateProject,
} from '../lib/contentRepository.js';
import { verifyCmsToken, requireAdmin } from '../middleware/auth.js';
import { sanitizeProjectInput, validateRouteSlug } from '../utils/contentValidation.js';
import { createHttpError } from '../utils/httpErrors.js';

const router = Router();
const projectsLogger = logger.child({ route: 'projects' });

router.use(verifyCmsToken);

router.get('/', async (_req, res, next) => {
    try {
        res.json(await listProjectsForCms());
    } catch (error) {
        next(createHttpError(500, 'Error leyendo los proyectos', { cause: error }));
    }
});

router.post('/', requireAdmin, async (req, res, next) => {
    try {
        const { errors, data } = sanitizeProjectInput(req.body);
        if (errors.length) {
            return res.status(400).json({ error: errors[0] });
        }

        const created = await createProject(data);

        projectsLogger.info('Project created', {
            requestId: req.requestId,
            projectId: created.id,
            username: req.user?.username || null,
        });

        res.status(201).json(created);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Ya existe un proyecto con ese ID' });
        }

        next(createHttpError(500, 'Error creando el proyecto', { cause: error }));
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const id = validateRouteSlug(req.params.id);
        if (!id) return res.status(400).json({ error: 'ID de proyecto no valido' });

        const { errors, data } = sanitizeProjectInput(req.body, { partial: true });
        if (errors.length) {
            return res.status(400).json({ error: errors[0] });
        }

        const updated = await updateProject(id, data);
        if (!updated) return res.status(404).json({ error: 'Proyecto no encontrado' });

        projectsLogger.info('Project updated', {
            requestId: req.requestId,
            projectId: id,
            username: req.user?.username || null,
        });

        res.json(updated);
    } catch (error) {
        next(createHttpError(500, 'Error actualizando el proyecto', { cause: error }));
    }
});

router.delete('/:id', requireAdmin, async (req, res, next) => {
    try {
        const id = validateRouteSlug(req.params.id);
        if (!id) return res.status(400).json({ error: 'ID de proyecto no valido' });

        const deleted = await deleteProject(id);
        if (!deleted) return res.status(404).json({ error: 'Proyecto no encontrado' });

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
