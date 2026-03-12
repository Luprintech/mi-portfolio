import { Router } from 'express';
import path from 'path';
import multer from 'multer';
import fsExtra from 'fs-extra';
import { logger } from '../lib/logger.js';
import { AUDIO_DIR, DOCS_DIR, IMAGES_DIR } from '../config/paths.js';
import { verifyCmsToken } from '../middleware/auth.js';
import { createHttpError } from '../utils/httpErrors.js';

const router = Router();
const imagesLogger = logger.child({ route: 'images' });

const ALLOWED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif']);
const ALLOWED_AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.webm']);
const ALLOWED_DOC_TYPES = new Map([
    ['.pdf', 'application/pdf'],
    ['.zip', 'application/zip'],
    ['.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ['.doc', 'application/msword'],
]);

function sanitizeFileName(originalName, ext) {
    return path.basename(originalName, ext)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 60);
}

function createDiskStorage(destinationDir) {
    return multer.diskStorage({
        destination: async (_req, _file, cb) => {
            await fsExtra.ensureDir(destinationDir);
            cb(null, destinationDir);
        },
        filename: (_req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            const name = sanitizeFileName(file.originalname, ext);
            cb(null, `${Date.now()}-${name}${ext}`);
        },
    });
}

const imageUpload = multer({
    storage: createDiskStorage(IMAGES_DIR),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (!file.mimetype.startsWith('image/') || !ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
            return cb(new Error('Formato de imagen no permitido'));
        }
        cb(null, true);
    },
});

const documentUpload = multer({
    storage: createDiskStorage(DOCS_DIR),
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (!ALLOWED_DOC_TYPES.has(ext)) {
            return cb(new Error('Tipo de documento no permitido. Solo PDF, ZIP, DOC y DOCX.'));
        }
        cb(null, true);
    },
});

const audioUpload = multer({
    storage: createDiskStorage(AUDIO_DIR),
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (!ALLOWED_AUDIO_EXTENSIONS.has(ext) || (file.mimetype && !file.mimetype.startsWith('audio/'))) {
            return cb(new Error('Formato de audio no permitido'));
        }
        cb(null, true);
    },
});

router.post('/upload', verifyCmsToken, imageUpload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No se ha recibido ninguna imagen' });

    const url = `/posts/images/${req.file.filename}`;
    imagesLogger.info('Image uploaded', {
        requestId: req.requestId,
        filename: req.file.filename,
        size: req.file.size,
        username: req.user?.username || null,
    });

    res.json({ url, filename: req.file.filename });
});

router.post('/upload-document', verifyCmsToken, documentUpload.single('document'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No se ha recibido ningun documento' });

    const ext = path.extname(req.file.filename).slice(1).toLowerCase();
    const fileType = ext === 'pdf' ? 'pdf' : ext === 'zip' ? 'zip' : ext === 'doc' ? 'doc' : 'docx';
    const url = `/posts/documents/${req.file.filename}`;

    imagesLogger.info('Document uploaded', {
        requestId: req.requestId,
        filename: req.file.filename,
        size: req.file.size,
        username: req.user?.username || null,
    });

    res.json({ url, filename: req.file.originalname, fileType, fileSize: req.file.size });
});

router.post('/upload-audio', verifyCmsToken, audioUpload.single('audio'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No se ha recibido ningun audio' });

    const url = `/posts/audio/${req.file.filename}`;
    imagesLogger.info('Audio uploaded', {
        requestId: req.requestId,
        filename: req.file.filename,
        size: req.file.size,
        username: req.user?.username || null,
    });

    res.json({ url, filename: req.file.originalname, fileSize: req.file.size });
});

router.get('/images', verifyCmsToken, async (req, res, next) => {
    try {
        await fsExtra.ensureDir(IMAGES_DIR);
        const files = await fsExtra.readdir(IMAGES_DIR);
        const images = files
            .filter(file => ALLOWED_IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
            .map(file => ({ filename: file, url: `/posts/images/${file}` }));

        res.json(images);
    } catch (error) {
        next(createHttpError(500, 'Error listando imagenes', { cause: error }));
    }
});

router.delete('/images/:filename', verifyCmsToken, async (req, res, next) => {
    try {
        const filename = path.basename(req.params.filename);
        const ext = path.extname(filename).toLowerCase();

        if (!ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
            return res.status(400).json({ error: 'Nombre de fichero no valido' });
        }

        await fsExtra.remove(path.join(IMAGES_DIR, filename));
        imagesLogger.info('Image deleted', {
            requestId: req.requestId,
            filename,
            username: req.user?.username || null,
        });

        res.json({ success: true });
    } catch (error) {
        next(createHttpError(500, 'Error eliminando la imagen', { cause: error }));
    }
});

export default router;
