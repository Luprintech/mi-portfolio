import { Router } from 'express';
import path from 'path';
import fsExtra from 'fs-extra';
import { verifyCmsToken } from '../middleware/auth.js';
import { POSTS_DIR, POSTS_INDEX } from '../config/paths.js';

// Helpers to automatically update sitemap
async function generateSitemap(index) {
    try {
        const HOST = process.env.FRONTEND_URL || 'https://tusitio.com';
        const sitemapPath = path.join(process.cwd(), '../frontend/public/sitemap.xml');

        // We only map standard blog URLs. In a real scenario, you'd add your main site pages too
        const urls = index
            .filter(p => !p.noindex)
            .map(p => {
                return `  <url>
    <loc>${HOST}/blog/${p.slug}</loc>
    <lastmod>${p.date}</lastmod>
    <changefreq>monthly</changefreq>
  </url>`;
            }).join('\n');

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${HOST}/blog</loc>
    <changefreq>daily</changefreq>
  </url>
${urls}
</urlset>`;

        await fsExtra.ensureDir(path.dirname(sitemapPath));
        await fsExtra.writeFile(sitemapPath, xml, 'utf-8');
    } catch (err) {
        console.error('Error generando sitemap:', err);
    }
}

const router = Router();

router.use(verifyCmsToken);

router.get('/', async (req, res) => {
    try {
        const index = await fsExtra.readJson(POSTS_INDEX);
        res.json(index);
    } catch {
        res.status(500).json({ error: 'Error leyendo el índice de posts' });
    }
});

router.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const index = await fsExtra.readJson(POSTS_INDEX);
        const post = index.find(p => p.slug === slug);
        if (!post) return res.status(404).json({ error: 'Post no encontrado' });

        const content = await fsExtra.readFile(path.join(POSTS_DIR, post.filename), 'utf-8');
        res.json({ ...post, content });
    } catch {
        res.status(500).json({ error: 'Error leyendo el post' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { title, slug, excerpt, tags, date, content, seoTitle, seoDescription, ogImage, canonicalUrl, noindex } = req.body || {};

        if (!title || !slug || !content) {
            return res.status(400).json({ error: 'title, slug y content son obligatorios' });
        }

        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
            return res.status(400).json({ error: 'El slug solo puede contener letras minúsculas, números y guiones' });
        }

        const index = await fsExtra.readJson(POSTS_INDEX);
        if (index.find(p => p.slug === slug)) {
            return res.status(409).json({ error: 'Ya existe un post con ese slug' });
        }

        const filename = `${slug}.md`;
        await fsExtra.writeFile(path.join(POSTS_DIR, filename), content, 'utf-8');

        const newPost = {
            slug,
            title,
            date: date || new Date().toISOString().split('T')[0],
            excerpt: excerpt || '',
            tags: Array.isArray(tags) ? tags : (tags || '').split(',').map(t => t.trim()).filter(Boolean),
            seoTitle: seoTitle || '',
            seoDescription: seoDescription || '',
            ogImage: ogImage || '',
            canonicalUrl: canonicalUrl || '',
            noindex: !!noindex,
            filename,
        };

        index.unshift(newPost);
        await fsExtra.writeJson(POSTS_INDEX, index, { spaces: 2 });
        // Generate sitemap on modification
        await generateSitemap(index);

        res.status(201).json(newPost);
    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).json({ error: 'Error creando el post' });
    }
});

router.put('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const { title, excerpt, tags, date, content, seoTitle, seoDescription, ogImage, canonicalUrl, noindex } = req.body || {};

        const index = await fsExtra.readJson(POSTS_INDEX);
        const postIdx = index.findIndex(p => p.slug === slug);
        if (postIdx === -1) return res.status(404).json({ error: 'Post no encontrado' });

        if (content !== undefined) {
            await fsExtra.writeFile(path.join(POSTS_DIR, index[postIdx].filename), content, 'utf-8');
        }

        index[postIdx] = {
            ...index[postIdx],
            ...(title !== undefined && { title }),
            ...(excerpt !== undefined && { excerpt }),
            ...(date !== undefined && { date }),
            ...(tags !== undefined && {
                tags: Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(Boolean),
            }),
            ...(seoTitle !== undefined && { seoTitle }),
            ...(seoDescription !== undefined && { seoDescription }),
            ...(ogImage !== undefined && { ogImage }),
            ...(canonicalUrl !== undefined && { canonicalUrl }),
            ...(noindex !== undefined && { noindex }),
        };

        await fsExtra.writeJson(POSTS_INDEX, index, { spaces: 2 });
        await generateSitemap(index);
        res.json(index[postIdx]);
    } catch (err) {
        console.error('Error updating post:', err);
        res.status(500).json({ error: 'Error actualizando el post' });
    }
});

router.delete('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;

        const index = await fsExtra.readJson(POSTS_INDEX);
        const postIdx = index.findIndex(p => p.slug === slug);
        if (postIdx === -1) return res.status(404).json({ error: 'Post no encontrado' });

        await fsExtra.remove(path.join(POSTS_DIR, index[postIdx].filename));
        index.splice(postIdx, 1);
        await fsExtra.writeJson(POSTS_INDEX, index, { spaces: 2 });
        await generateSitemap(index);

        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting post:', err);
        res.status(500).json({ error: 'Error eliminando el post' });
    }
});

export default router;
