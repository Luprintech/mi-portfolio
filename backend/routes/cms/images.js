import { Router } from 'express';
import path from 'path';
import multer from 'multer';
import fsExtra from 'fs-extra';
import { verifyCmsToken } from '../../middleware/auth.js';
import { IMAGES_DIR } from '../../config.js';

const router = Router();

const imageStorage = multer.diskStorage({
    destination: async (_req, _file, cb) => {
        await fsExtra.ensureDir(IMAGES_DIR);
        cb(null, IMAGES_DIR);
    },
    filename: (_req, file, cb) => {
        const ext  = path.extname(file.originalname).toLowerCase();
        const name = path.basename(file.originalname, ext)
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .slice(0, 60);
        cb(null, `${Date.now()}-${name}${ext}`);
    },
});

const imageUpload = multer({
    storage: imageStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Solo se permiten imágenes'));
        }
        cb(null, true);
    },
});

// POST /api/bitacora/upload — Subir imagen
router.post('/upload', verifyCmsToken, imageUpload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No se ha recibido ninguna imagen' });
    const url = `/posts/images/${req.file.filename}`;
    res.json({ url, filename: req.file.filename });
});

// GET /api/bitacora/images — Listar imágenes
router.get('/images', verifyCmsToken, async (_req, res) => {
    try {
        await fsExtra.ensureDir(IMAGES_DIR);
        const files = await fsExtra.readdir(IMAGES_DIR);
        const images = files
            .filter(f => /\.(jpe?g|png|gif|webp|svg|avif)$/i.test(f))
            .map(f => ({ filename: f, url: `/posts/images/${f}` }));
        res.json(images);
    } catch {
        res.status(500).json({ error: 'Error listando imágenes' });
    }
});

// DELETE /api/bitacora/images/:filename — Eliminar imagen
router.delete('/images/:filename', verifyCmsToken, async (req, res) => {
    try {
        const { filename } = req.params;
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return res.status(400).json({ error: 'Nombre de fichero no válido' });
        }
        await fsExtra.remove(path.join(IMAGES_DIR, filename));
        res.json({ success: true });
    } catch {
        res.status(500).json({ error: 'Error eliminando la imagen' });
    }
});

export default router;
