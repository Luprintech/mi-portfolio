import multer from 'multer';
import { logger } from '../lib/logger.js';

function getStatusCode(error) {
    if (error instanceof multer.MulterError) {
        return 400;
    }

    if (error?.message === 'Not allowed by CORS') {
        return 403;
    }

    const candidate = error?.statusCode ?? error?.status;
    if (Number.isInteger(candidate) && candidate >= 400 && candidate < 600) {
        return candidate;
    }

    return 500;
}

function getPublicMessage(error, statusCode) {
    if (error instanceof multer.MulterError) {
        return 'Error procesando el archivo.';
    }

    if (error?.message === 'Not allowed by CORS') {
        return 'Origen no permitido.';
    }

    if (statusCode >= 500) {
        return 'Error interno del servidor.';
    }

    return error?.publicMessage || error?.message || 'La solicitud no se pudo procesar.';
}

export function errorHandler(error, req, res, next) {
    if (res.headersSent) {
        next(error);
        return;
    }

    const statusCode = getStatusCode(error);
    const publicMessage = getPublicMessage(error, statusCode);
    const logMethod = statusCode >= 500 ? 'error' : 'warn';

    logger[logMethod]('Unhandled request error', {
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode,
        error,
    });

    res.status(statusCode).json({
        error: publicMessage,
        requestId: req.requestId,
    });
}
