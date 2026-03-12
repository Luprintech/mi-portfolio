import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../lib/logger.js';
import { jwtSignOptions, verifyCmsToken, safeCompare } from '../middleware/auth.js';
import { cmsLoginLimiter } from '../middleware/rateLimiters.js';

const router = Router();
const authLogger = logger.child({ route: 'auth' });

router.post('/auth', cmsLoginLimiter, (req, res) => {
    const { username, password } = req.body || {};

    const expectedUser = process.env.CMS_USERNAME || '';
    const expectedPass = process.env.CMS_PASSWORD || '';

    const userOk = safeCompare(username, expectedUser);
    const passOk = safeCompare(password, expectedPass);

    res.set('Cache-Control', 'no-store');

    if (!userOk || !passOk || !expectedUser || !expectedPass) {
        authLogger.warn('CMS authentication failed', {
            requestId: req.requestId,
            username: username || null,
        });
        return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
        { username },
        process.env.JWT_SECRET,
        jwtSignOptions
    );

    authLogger.info('CMS authentication succeeded', {
        requestId: req.requestId,
        username,
    });

    return res.json({ token });
});

router.get('/verify', verifyCmsToken, (req, res) => {
    res.set('Cache-Control', 'no-store');
    authLogger.debug('CMS token verified', {
        requestId: req.requestId,
        username: req.user.username,
    });
    res.json({ valid: true, username: req.user.username });
});

export default router;
