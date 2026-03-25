import { Router } from 'express';
import { logger } from '../lib/logger.js';
import {
    autosavePost,
    createPost,
    deletePost,
    getPostForCms,
    listPostRevisions,
    listPostsForCms,
    listPostsForSitemap,
    restorePostRevision,
    updatePost,
} from '../lib/contentRepository.js';
import { generateSitemap } from '../lib/sitemap.js';
import { verifyCmsToken } from '../middleware/auth.js';
import { sanitizePostInput, validateRouteSlug } from '../utils/contentValidation.js';
import { createHttpError } from '../utils/httpErrors.js';

const router = Router();
const postsLogger = logger.child({ route: 'posts' });

router.use(verifyCmsToken);

router.get('/', async (_req, res, next) => {
    try {
        res.json(await listPostsForCms());
    } catch (error) {
        next(createHttpError(500, 'Error leyendo el indice de posts', { cause: error }));
    }
});

router.get('/:slug', async (req, res, next) => {
    try {
        const slug = validateRouteSlug(req.params.slug);
        if (!slug) return res.status(400).json({ error: 'Slug no valido' });

        const post = await getPostForCms(slug);
        if (!post) return res.status(404).json({ error: 'Post no encontrado' });

        res.json(post);
    } catch (error) {
        next(createHttpError(500, 'Error leyendo el post', { cause: error }));
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { errors, data } = sanitizePostInput(req.body);
        if (errors.length) {
            return res.status(400).json({ error: errors[0] });
        }

        const created = await createPost(data);
        await generateSitemap(listPostsForSitemap);

        postsLogger.info('Post created', {
            requestId: req.requestId,
            slug: created.slug,
            username: req.user?.username || null,
        });

        res.status(201).json(created);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Ya existe un post con ese slug' });
        }

        if (error.code === 'REVISION_CONFLICT') {
            return res.status(409).json({ error: error.message, currentRevision: error.currentRevision });
        }

        next(createHttpError(500, 'Error creando el post', { cause: error }));
    }
});

router.put('/:slug', async (req, res, next) => {
    try {
        const slug = validateRouteSlug(req.params.slug);
        if (!slug) return res.status(400).json({ error: 'Slug no valido' });

        const { errors, data } = sanitizePostInput(req.body, { partial: true });
        if (errors.length) {
            return res.status(400).json({ error: errors[0] });
        }

        const updated = await updatePost(slug, data, {
            source: data.status === 'published' ? 'publish' : 'manual-save',
        });
        if (!updated) return res.status(404).json({ error: 'Post no encontrado' });

        await generateSitemap(listPostsForSitemap);

        postsLogger.info('Post updated', {
            requestId: req.requestId,
            slug,
            username: req.user?.username || null,
        });

        res.json(updated);
    } catch (error) {
        if (error.code === 'REVISION_CONFLICT') {
            return res.status(409).json({ error: error.message, currentRevision: error.currentRevision });
        }

        next(createHttpError(500, 'Error actualizando el post', { cause: error }));
    }
});

router.post('/:slug/autosave', async (req, res, next) => {
    try {
        const slug = validateRouteSlug(req.params.slug);
        if (!slug) return res.status(400).json({ error: 'Slug no valido' });

        const { errors, data } = sanitizePostInput(req.body, { partial: true });
        if (errors.length) {
            return res.status(400).json({ error: errors[0] });
        }

        const updated = await autosavePost(slug, data);
        if (!updated) return res.status(404).json({ error: 'Post no encontrado' });

        postsLogger.info('Post autosaved', {
            requestId: req.requestId,
            slug,
            username: req.user?.username || null,
            revision: updated.revision,
        });

        res.json(updated);
    } catch (error) {
        if (error.code === 'REVISION_CONFLICT') {
            return res.status(409).json({ error: error.message, currentRevision: error.currentRevision });
        }

        next(createHttpError(500, 'Error autoguardando el post', { cause: error }));
    }
});

router.get('/:slug/revisions', async (req, res, next) => {
    try {
        const slug = validateRouteSlug(req.params.slug);
        if (!slug) return res.status(400).json({ error: 'Slug no valido' });

        const revisions = await listPostRevisions(slug);
        if (!revisions) return res.status(404).json({ error: 'Post no encontrado' });

        res.json(revisions);
    } catch (error) {
        next(createHttpError(500, 'Error leyendo revisiones del post', { cause: error }));
    }
});

router.post('/:slug/restore', async (req, res, next) => {
    try {
        const slug = validateRouteSlug(req.params.slug);
        if (!slug) return res.status(400).json({ error: 'Slug no valido' });

        const revisionId = Number(req.body?.revisionId);
        if (!Number.isInteger(revisionId) || revisionId <= 0) {
            return res.status(400).json({ error: 'La revision solicitada no es valida' });
        }

        const restored = await restorePostRevision(slug, revisionId, req.body?.revision);
        if (restored === undefined) {
            return res.status(404).json({ error: 'Revision no encontrada' });
        }

        if (!restored) return res.status(404).json({ error: 'Post no encontrado' });

        postsLogger.info('Post restored from revision', {
            requestId: req.requestId,
            slug,
            revisionId,
            username: req.user?.username || null,
            revision: restored.revision,
        });

        res.json(restored);
    } catch (error) {
        if (error.code === 'REVISION_CONFLICT') {
            return res.status(409).json({ error: error.message, currentRevision: error.currentRevision });
        }

        next(createHttpError(500, 'Error restaurando la revision del post', { cause: error }));
    }
});

router.delete('/:slug', async (req, res, next) => {
    try {
        const slug = validateRouteSlug(req.params.slug);
        if (!slug) return res.status(400).json({ error: 'Slug no valido' });

        const deleted = await deletePost(slug);
        if (!deleted) return res.status(404).json({ error: 'Post no encontrado' });

        await generateSitemap(listPostsForSitemap);

        postsLogger.info('Post deleted', {
            requestId: req.requestId,
            slug,
            username: req.user?.username || null,
        });

        res.json({ success: true });
    } catch (error) {
        next(createHttpError(500, 'Error eliminando el post', { cause: error }));
    }
});

export default router;
