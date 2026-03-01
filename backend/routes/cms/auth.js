import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { safeCompare, verifyCmsToken } from '../../middleware/auth.js';
import { cmsLoginLimiter } from '../../middleware/rateLimiters.js';

const router = Router();

// POST /api/bitacora/auth — Login
router.post('/', cmsLoginLimiter, (req, res) => {
    const { username, password } = req.body || {};

    const expectedUser = process.env.CMS_USERNAME || '';
    const expectedPass = process.env.CMS_PASSWORD || '';

    const userOk = safeCompare(username, expectedUser);
    const passOk = safeCompare(password, expectedPass);

    if (!userOk || !passOk || !expectedUser || !expectedPass) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
        { username },
        process.env.JWT_SECRET || 'dev-secret-change-me',
        { expiresIn: '24h' }
    );

    return res.json({ token });
});

// GET /api/bitacora/verify — Verificar token
router.get('/verify', verifyCmsToken, (req, res) => {
    res.json({ valid: true, username: req.user.username });
});

export default router;
