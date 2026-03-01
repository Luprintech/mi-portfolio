import { Router } from 'express';
import path from 'path';
import multer from 'multer';
import fsExtra from 'fs-extra';
import { verifyCmsToken } from '../middleware/auth.js';
import { IMAGES_DIR } from '../config/paths.js';

const router = Router();

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif']);

const imageStorage = multer.diskStorage({
    destination: async (req, file, cb) => {
        await fsExtra.ensureDir(IMAGES_DIR);
        cb(null, IMAGES_DIR);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
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
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (!file.mimetype.startsWith('image/') || !ALLOWED_EXTENSIONS.has(ext)) {
            return cb(new Error('Formato de imagen no permitido'));
        }
        cb(null, true);
    },
});

router.post('/upload', verifyCmsToken, imageUpload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No se ha recibido ninguna imagen' });
    const url = `/posts/images/${req.file.filename}`;
    res.json({ url, filename: req.file.filename });
});

router.get('/images', verifyCmsToken, async (req, res) => {
    try {
        await fsExtra.ensureDir(IMAGES_DIR);
        const files = await fsExtra.readdir(IMAGES_DIR);
        const images = files
            .filter(f => ALLOWED_EXTENSIONS.has(path.extname(f).toLowerCase()))
            .map(f => ({ filename: f, url: `/posts/images/${f}` }));
        res.json(images);
    } catch {
        res.status(500).json({ error: 'Error listando imágenes' });
    }
});

router.delete('/images/:filename', verifyCmsToken, async (req, res) => {
    try {
        // path.basename strips any directory component, preventing path traversal
        const filename = path.basename(req.params.filename);
        const ext = path.extname(filename).toLowerCase();

        if (!ALLOWED_EXTENSIONS.has(ext)) {
            return res.status(400).json({ error: 'Nombre de fichero no válido' });
        }

        await fsExtra.remove(path.join(IMAGES_DIR, filename));
        res.json({ success: true });
    } catch {
        res.status(500).json({ error: 'Error eliminando la imagen' });
    }
});

export default router;
