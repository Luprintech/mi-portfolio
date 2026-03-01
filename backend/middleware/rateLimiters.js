import rateLimit from 'express-rate-limit';

export const cmsLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Demasiados intentos de acceso. Espera unos minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
});

export const contactLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: { error: 'Rate limit exceeded. Try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

export const chatLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: 'En este momento estoy recibiendo muchas consultas. Inténtalo en unos minutos o contáctame directamente en contacto@guadalupecano.es' },
    standardHeaders: true,
    legacyHeaders: false,
});
