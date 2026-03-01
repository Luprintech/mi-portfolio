import { Router } from 'express';
import path from 'path';
import fsExtra from 'fs-extra';
import { verifyCmsToken } from '../../middleware/auth.js';
import { POSTS_DIR, POSTS_INDEX } from '../../config.js';

const router = Router();

// GET /api/bitacora/posts — Listar todos los posts
router.get('/', verifyCmsToken, async (req, res) => {
    try {
        const index = await fsExtra.readJson(POSTS_INDEX);
        res.json(index);
    } catch {
        res.status(500).json({ error: 'Error leyendo el índice de posts' });
    }
});

// GET /api/bitacora/posts/:slug — Obtener un post con su contenido
router.get('/:slug', verifyCmsToken, async (req, res) => {
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

// POST /api/bitacora/posts — Crear nuevo post
router.post('/', verifyCmsToken, async (req, res) => {
    try {
        const { title, slug, excerpt, tags, date, content } = req.body || {};

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
            filename,
        };

        index.unshift(newPost);
        await fsExtra.writeJson(POSTS_INDEX, index, { spaces: 2 });

        res.status(201).json(newPost);
    } catch (err) {
        console.error('Error creando post:', err);
        res.status(500).json({ error: 'Error creando el post' });
    }
});

// PUT /api/bitacora/posts/:slug — Actualizar post
router.put('/:slug', verifyCmsToken, async (req, res) => {
    try {
        const { slug } = req.params;
        const { title, excerpt, tags, date, content } = req.body || {};

        const index = await fsExtra.readJson(POSTS_INDEX);
        const postIdx = index.findIndex(p => p.slug === slug);
        if (postIdx === -1) return res.status(404).json({ error: 'Post no encontrado' });

        if (content !== undefined) {
            await fsExtra.writeFile(path.join(POSTS_DIR, index[postIdx].filename), content, 'utf-8');
        }

        index[postIdx] = {
            ...index[postIdx],
            ...(title   !== undefined && { title }),
            ...(excerpt !== undefined && { excerpt }),
            ...(date    !== undefined && { date }),
            ...(tags    !== undefined && {
                tags: Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(Boolean),
            }),
        };

        await fsExtra.writeJson(POSTS_INDEX, index, { spaces: 2 });
        res.json(index[postIdx]);
    } catch (err) {
        console.error('Error actualizando post:', err);
        res.status(500).json({ error: 'Error actualizando el post' });
    }
});

// DELETE /api/bitacora/posts/:slug — Eliminar post
router.delete('/:slug', verifyCmsToken, async (req, res) => {
    try {
        const { slug } = req.params;

        const index = await fsExtra.readJson(POSTS_INDEX);
        const postIdx = index.findIndex(p => p.slug === slug);
        if (postIdx === -1) return res.status(404).json({ error: 'Post no encontrado' });

        await fsExtra.remove(path.join(POSTS_DIR, index[postIdx].filename));
        index.splice(postIdx, 1);
        await fsExtra.writeJson(POSTS_INDEX, index, { spaces: 2 });

        res.json({ success: true });
    } catch (err) {
        console.error('Error eliminando post:', err);
        res.status(500).json({ error: 'Error eliminando el post' });
    }
});

export default router;
