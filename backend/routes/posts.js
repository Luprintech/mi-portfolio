import { Router } from 'express';
import path from 'path';
import fsExtra from 'fs-extra';
import { logger } from '../lib/logger.js';
import { POSTS_DIR, POSTS_INDEX, SITEMAP_FILE } from '../config/paths.js';
import { verifyCmsToken } from '../middleware/auth.js';
import { sanitizePostInput, validateRouteSlug } from '../utils/contentValidation.js';
import { createHttpError } from '../utils/httpErrors.js';

const router = Router();
const postsLogger = logger.child({ route: 'posts' });

async function generateSitemap(index) {
    try {
        const host = process.env.FRONTEND_URL || 'https://tusitio.com';
        const urls = index
            .filter(post => !post.noindex && post.status !== 'draft')
            .map(post => `  <url>
    <loc>${host}/blog/${post.slug}</loc>
    <lastmod>${post.date}</lastmod>
    <changefreq>monthly</changefreq>
  </url>`)
            .join('\n');

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${host}/blog</loc>
    <changefreq>daily</changefreq>
  </url>
${urls}
</urlset>`;

        await fsExtra.ensureDir(path.dirname(SITEMAP_FILE));
        await fsExtra.writeFile(SITEMAP_FILE, xml, 'utf-8');
    } catch (error) {
        postsLogger.warn('Sitemap generation failed', { error });
    }
}

router.use(verifyCmsToken);

router.get('/', async (_req, res, next) => {
    try {
        const index = await fsExtra.readJson(POSTS_INDEX);
        res.json(index);
    } catch (error) {
        next(createHttpError(500, 'Error leyendo el indice de posts', { cause: error }));
    }
});

router.get('/:slug', async (req, res, next) => {
    try {
        const slug = validateRouteSlug(req.params.slug);
        if (!slug) return res.status(400).json({ error: 'Slug no valido' });

        const index = await fsExtra.readJson(POSTS_INDEX);
        const post = index.find(item => item.slug === slug);
        if (!post) return res.status(404).json({ error: 'Post no encontrado' });

        const content = await fsExtra.readFile(path.join(POSTS_DIR, post.filename), 'utf-8');
        res.json({ ...post, content });
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

        const index = await fsExtra.readJson(POSTS_INDEX);
        if (index.find(item => item.slug === data.slug)) {
            return res.status(409).json({ error: 'Ya existe un post con ese slug' });
        }

        const filename = `${data.slug}.md`;
        const newPost = {
            slug: data.slug,
            title: data.title,
            date: data.date,
            excerpt: data.excerpt || '',
            tags: data.tags || [],
            seoTitle: data.seoTitle || '',
            seoDescription: data.seoDescription || '',
            ogImage: data.ogImage || '',
            canonicalUrl: data.canonicalUrl || '',
            noindex: data.noindex || false,
            status: data.status,
            filename,
        };

        await fsExtra.ensureDir(POSTS_DIR);
        await fsExtra.writeFile(path.join(POSTS_DIR, filename), data.content, 'utf-8');
        index.unshift(newPost);
        await fsExtra.writeJson(POSTS_INDEX, index, { spaces: 2 });
        await generateSitemap(index);

        postsLogger.info('Post created', {
            requestId: req.requestId,
            slug: newPost.slug,
            username: req.user?.username || null,
        });

        res.status(201).json(newPost);
    } catch (error) {
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

        const index = await fsExtra.readJson(POSTS_INDEX);
        const postIndex = index.findIndex(item => item.slug === slug);
        if (postIndex === -1) return res.status(404).json({ error: 'Post no encontrado' });

        if (data.content !== undefined) {
            await fsExtra.writeFile(path.join(POSTS_DIR, index[postIndex].filename), data.content, 'utf-8');
        }

        index[postIndex] = {
            ...index[postIndex],
            ...(data.title !== undefined && { title: data.title }),
            ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
            ...(data.date !== undefined && { date: data.date }),
            ...(data.tags !== undefined && { tags: data.tags }),
            ...(data.seoTitle !== undefined && { seoTitle: data.seoTitle }),
            ...(data.seoDescription !== undefined && { seoDescription: data.seoDescription }),
            ...(data.ogImage !== undefined && { ogImage: data.ogImage }),
            ...(data.canonicalUrl !== undefined && { canonicalUrl: data.canonicalUrl }),
            ...(data.noindex !== undefined && { noindex: data.noindex }),
            ...(data.status !== undefined && { status: data.status }),
        };

        await fsExtra.writeJson(POSTS_INDEX, index, { spaces: 2 });
        await generateSitemap(index);

        postsLogger.info('Post updated', {
            requestId: req.requestId,
            slug,
            username: req.user?.username || null,
        });

        res.json(index[postIndex]);
    } catch (error) {
        next(createHttpError(500, 'Error actualizando el post', { cause: error }));
    }
});

router.delete('/:slug', async (req, res, next) => {
    try {
        const slug = validateRouteSlug(req.params.slug);
        if (!slug) return res.status(400).json({ error: 'Slug no valido' });

        const index = await fsExtra.readJson(POSTS_INDEX);
        const postIndex = index.findIndex(item => item.slug === slug);
        if (postIndex === -1) return res.status(404).json({ error: 'Post no encontrado' });

        await fsExtra.remove(path.join(POSTS_DIR, index[postIndex].filename));
        index.splice(postIndex, 1);
        await fsExtra.writeJson(POSTS_INDEX, index, { spaces: 2 });
        await generateSitemap(index);

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
