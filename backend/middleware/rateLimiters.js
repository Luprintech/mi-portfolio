import rateLimit from 'express-rate-limit';

// Handler compartido que garantiza respuesta JSON
const jsonHandler = (req, res) => {
    res.status(429).json({ error: 'Demasiadas peticiones. Espera unos minutos.' });
};

export const cmsLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: jsonHandler,
});

export const contactLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: jsonHandler,
    // Clave: ignorar IPs de proxies internos para no contar mal
    keyGenerator: (req) => {
        return req.headers['x-forwarded-for']?.split(',')[0].trim() 
            || req.ip;
    },
    skip: (req) => {
        // No limitar peticiones internas de Docker/red local
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
