import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export function safeCompare(a, b) {
    const bufA = Buffer.from(String(a || ''));
    const bufB = Buffer.from(String(b || ''));
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
}

export function verifyCmsToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No autorizado' });
    }
    const token = authHeader.slice(7);
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-me');
        next();
    } catch {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
}
