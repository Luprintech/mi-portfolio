import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

function jsonHandler(_req, res) {
    res.status(429).json({ error: 'Demasiadas peticiones. Espera unos minutos.' });
}

export const cmsLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: jsonHandler,
    // Usa la IP real del cliente cuando hay proxies delante (Nginx, Docker, CDN).
    keyGenerator: (req) => {
        const rawIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
        return ipKeyGenerator(rawIp);
    },
});

export const contactLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: jsonHandler,
    // Usa la IP real del cliente cuando hay proxies delante.
    keyGenerator: (req) => {
        const rawIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
        return ipKeyGenerator(rawIp);
    },
    // Evita limitar trafico interno de Docker o red local.
    skip: (req) => {
        const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
        return ip === '127.0.0.1' || ip === '::1' || ip?.startsWith('192.168.');
    },
});

export const chatLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    handler: jsonHandler,
});

/**
 * Rate limiter para endpoints públicos de lectura (GET /api/posts, /api/projects).
 * Límite generoso para no afectar a usuarios normales; protege ante scrapers
 * o abusos automatizados.
 */
export const publicReadLimiter = rateLimit({
    windowMs: 60 * 1000,     // ventana de 1 minuto
    max: 60,                 // 60 req/min por IP — ~1 req/s, amplio para uso normal
    standardHeaders: true,
    legacyHeaders: false,
    handler: jsonHandler,
    keyGenerator: (req) => {
        const rawIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
        return ipKeyGenerator(rawIp);
    },
    skip: (req) => {
        const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
        return ip === '127.0.0.1' || ip === '::1' || ip?.startsWith('192.168.');
    },
});
