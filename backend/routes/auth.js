import { Router } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { cmsLoginLimiter } from '../middleware/rateLimiters.js';
import { verifyCmsToken } from '../middleware/auth.js';

const router = Router();

function safeCompare(a, b) {
    const bufA = Buffer.from(String(a || ''));
    const bufB = Buffer.from(String(b || ''));
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
}

router.post('/auth', cmsLoginLimiter, (req, res) => {
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
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    return res.json({ token });
});

router.get('/verify', verifyCmsToken, (req, res) => {
    res.json({ valid: true, username: req.user.username });
});

export default router;
