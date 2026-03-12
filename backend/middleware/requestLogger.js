import { logger } from '../lib/logger.js';

export function requestLogger(req, res, next) {
    const startedAt = process.hrtime.bigint();

    res.on('finish', () => {
        const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
        const meta = {
            requestId: req.requestId,
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: Number(durationMs.toFixed(2)),
            ip: req.ip,
        };

        if (res.statusCode >= 500) {
            logger.error('Request completed with server error', meta);
            return;
        }

        if (res.statusCode >= 400) {
            logger.warn('Request completed with client error', meta);
            return;
        }

        logger.info('Request completed', meta);
    });

    next();
}
