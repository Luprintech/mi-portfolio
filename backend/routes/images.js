import { Router } from 'express';
import path from 'path';
import multer from 'multer';
import fsExtra from 'fs-extra';
import { logger } from '../lib/logger.js';
import { AUDIO_DIR, CV_FILE, DOCS_DIR, IMAGES_DIR } from '../config/paths.js';
import { verifyCmsToken, requireAdmin } from '../middleware/auth.js';
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
const IMAGE_MAX_SIZE = 5 * 1024 * 1024;
const DOCUMENT_MAX_SIZE = 20 * 1024 * 1024;
const AUDIO_MAX_SIZE = 20 * 1024 * 1024;
const CV_MAX_SIZE = 20 * 1024 * 1024;

function createUploadErrorPayload({ type, message, field, maxSize, acceptedTypes, actualSize }) {
    return {
        error: {
            type,
            message,
            field,
            maxSize,
            acceptedTypes,
            actualSize,
        },
    };
}

function sendUploadError(res, options, status = 400) {
    return res.status(status).json(createUploadErrorPayload(options));
}

function getAcceptedTypes(kind) {
    if (kind === 'image') return [...ALLOWED_IMAGE_EXTENSIONS];
    if (kind === 'audio') return [...ALLOWED_AUDIO_EXTENSIONS];
    if (kind === 'cv') return ['.pdf'];
    return [...ALLOWED_DOC_TYPES.keys()];
}

function runUpload(req, res, middleware) {
    return new Promise((resolve, reject) => {
        middleware(req, res, (error) => {
            if (error) reject(error);
            else resolve();
        });
    });
}

function normalizeUploadError(error, { field, kind, maxSize }) {
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
        return {
            status: 413,
            payload: createUploadErrorPayload({
                type: 'file-too-large',
                message: `El archivo supera el limite permitido de ${Math.round(maxSize / (1024 * 1024))} MB.`,
                field,
                maxSize,
                acceptedTypes: getAcceptedTypes(kind),
            }),
        };
    }

    if (error?.code === 'UPLOAD_VALIDATION') {
        return {
            status: 400,
            payload: createUploadErrorPayload({
                type: error.type,
                message: error.message,
                field,
                maxSize,
                acceptedTypes: getAcceptedTypes(kind),
            }),
        };
    }

    return null;
}

function createValidationError(type, message) {
    const error = new Error(message);
    error.code = 'UPLOAD_VALIDATION';
    error.type = type;
    return error;
}

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
    limits: { fileSize: IMAGE_MAX_SIZE },
    fileFilter: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (!file.mimetype.startsWith('image/') || !ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
            return cb(createValidationError('invalid-file-type', 'Formato de imagen no permitido. Usa JPG, PNG, GIF, WebP o AVIF.'));
        }
        cb(null, true);
    },
});

const documentUpload = multer({
    storage: createDiskStorage(DOCS_DIR),
    limits: { fileSize: DOCUMENT_MAX_SIZE },
    fileFilter: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (!ALLOWED_DOC_TYPES.has(ext)) {
            return cb(createValidationError('invalid-file-type', 'Tipo de documento no permitido. Solo PDF, ZIP, DOC y DOCX.'));
        }
        cb(null, true);
    },
});

const audioUpload = multer({
    storage: createDiskStorage(AUDIO_DIR),
    limits: { fileSize: AUDIO_MAX_SIZE },
    fileFilter: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (!ALLOWED_AUDIO_EXTENSIONS.has(ext) || (file.mimetype && !file.mimetype.startsWith('audio/'))) {
            return cb(createValidationError('invalid-file-type', 'Formato de audio no permitido. Usa MP3, WAV, OGG, M4A, AAC, FLAC o WebM.'));
        }
        cb(null, true);
    },
});

const cvUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: CV_MAX_SIZE },
    fileFilter: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== '.pdf' || file.mimetype !== 'application/pdf') {
            return cb(createValidationError('invalid-file-type', 'El CV debe subirse en PDF.'));
        }
        cb(null, true);
    },
});

router.post('/upload', verifyCmsToken, async (req, res, next) => {
    try {
        await runUpload(req, res, imageUpload.single('image'));
        if (!req.file) {
            return sendUploadError(res, {
                type: 'missing-file',
                message: 'No se recibio ninguna imagen.',
                field: 'image',
                maxSize: IMAGE_MAX_SIZE,
                acceptedTypes: getAcceptedTypes('image'),
            });
        }

        const url = `/posts/images/${req.file.filename}`;
        imagesLogger.info('Image uploaded', {
            requestId: req.requestId,
            filename: req.file.filename,
            size: req.file.size,
            username: req.user?.username || null,
        });

        res.json({
            ok: true,
            file: {
                url,
                filename: req.file.filename,
                fileSize: req.file.size,
            },
        });
    } catch (error) {
        const normalized = normalizeUploadError(error, { field: 'image', kind: 'image', maxSize: IMAGE_MAX_SIZE });
        if (normalized) {
            return res.status(normalized.status).json(normalized.payload);
        }

        next(createHttpError(500, 'Error subiendo la imagen', { cause: error }));
    }
});

router.post('/upload-document', verifyCmsToken, async (req, res, next) => {
    try {
        await runUpload(req, res, documentUpload.single('document'));
        if (!req.file) {
            return sendUploadError(res, {
                type: 'missing-file',
                message: 'No se recibio ningun documento.',
                field: 'document',
                maxSize: DOCUMENT_MAX_SIZE,
                acceptedTypes: getAcceptedTypes('document'),
            });
        }

        const ext = path.extname(req.file.filename).slice(1).toLowerCase();
        const fileType = ext === 'pdf' ? 'pdf' : ext === 'zip' ? 'zip' : ext === 'doc' ? 'doc' : 'docx';
        const url = `/posts/documents/${req.file.filename}`;

        imagesLogger.info('Document uploaded', {
            requestId: req.requestId,
            filename: req.file.filename,
            size: req.file.size,
            username: req.user?.username || null,
        });

        res.json({
            ok: true,
            file: {
                url,
                filename: req.file.originalname,
                fileType,
                fileSize: req.file.size,
            },
        });
    } catch (error) {
        const normalized = normalizeUploadError(error, { field: 'document', kind: 'document', maxSize: DOCUMENT_MAX_SIZE });
        if (normalized) {
            return res.status(normalized.status).json(normalized.payload);
        }

        next(createHttpError(500, 'Error subiendo el documento', { cause: error }));
    }
});

router.post('/upload-audio', verifyCmsToken, async (req, res, next) => {
    try {
        await runUpload(req, res, audioUpload.single('audio'));
        if (!req.file) {
            return sendUploadError(res, {
                type: 'missing-file',
                message: 'No se recibio ningun audio.',
                field: 'audio',
                maxSize: AUDIO_MAX_SIZE,
                acceptedTypes: getAcceptedTypes('audio'),
            });
        }

        const url = `/posts/audio/${req.file.filename}`;
        imagesLogger.info('Audio uploaded', {
            requestId: req.requestId,
            filename: req.file.filename,
            size: req.file.size,
            username: req.user?.username || null,
        });

        res.json({
            ok: true,
            file: {
                url,
                filename: req.file.originalname,
                fileSize: req.file.size,
            },
        });
    } catch (error) {
        const normalized = normalizeUploadError(error, { field: 'audio', kind: 'audio', maxSize: AUDIO_MAX_SIZE });
        if (normalized) {
            return res.status(normalized.status).json(normalized.payload);
        }

        next(createHttpError(500, 'Error subiendo el audio', { cause: error }));
    }
});

router.post('/upload-cv', verifyCmsToken, requireAdmin, async (req, res, next) => {
    try {
        await runUpload(req, res, cvUpload.single('cv'));
        if (!req.file) {
            return sendUploadError(res, {
                type: 'missing-file',
                message: 'No se recibio ningun CV.',
                field: 'cv',
                maxSize: CV_MAX_SIZE,
                acceptedTypes: ['.pdf'],
            });
        }

        await fsExtra.ensureDir(path.dirname(CV_FILE));
        await fsExtra.writeFile(CV_FILE, req.file.buffer);

        imagesLogger.info('CV uploaded', {
            requestId: req.requestId,
            filename: path.basename(CV_FILE),
            size: req.file.size,
            username: req.user?.username || null,
        });

        res.json({
            ok: true,
            file: {
                url: `/CV_Guadalupe_Cano.pdf`,
                filename: path.basename(CV_FILE),
                fileSize: req.file.size,
            },
        });
    } catch (error) {
        const normalized = normalizeUploadError(error, { field: 'cv', kind: 'cv', maxSize: CV_MAX_SIZE });
        if (normalized) {
            return res.status(normalized.status).json(normalized.payload);
        }

        next(createHttpError(500, 'Error subiendo el CV', { cause: error }));
    }
});

router.get('/images', verifyCmsToken, requireAdmin, async (req, res, next) => {
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

router.delete('/images/:filename', verifyCmsToken, requireAdmin, async (req, res, next) => {
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
