import { Router } from 'express';
import {
    getPostForPublic,
    listPostsForPublic,
    listProjectsForPublic,
} from '../lib/contentRepository.js';
import { publicReadLimiter } from '../middleware/rateLimiters.js';
import { validateRouteSlug } from '../utils/contentValidation.js';
import { createHttpError } from '../utils/httpErrors.js';

const router = Router();

router.get('/posts', publicReadLimiter, async (_req, res, next) => {
    try {
        res.json(await listPostsForPublic());
    } catch (error) {
        next(createHttpError(500, 'Error leyendo los posts publicos', { cause: error }));
    }
});

router.get('/posts/:slug', publicReadLimiter, async (req, res, next) => {
    try {
        const slug = validateRouteSlug(req.params.slug);
        if (!slug) return res.status(400).json({ error: 'Slug no valido' });

        const post = await getPostForPublic(slug);
        if (!post) return res.status(404).json({ error: 'Post no encontrado' });

        res.json(post);
    } catch (error) {
        next(createHttpError(500, 'Error leyendo el post publico', { cause: error }));
    }
});

router.get('/projects', publicReadLimiter, async (_req, res, next) => {
    try {
        res.json(await listProjectsForPublic());
    } catch (error) {
        next(createHttpError(500, 'Error leyendo los proyectos publicos', { cause: error }));
    }
});

export default router;
