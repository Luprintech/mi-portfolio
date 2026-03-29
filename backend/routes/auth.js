import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { logger } from '../lib/logger.js';
import { jwtSignOptions, verifyCmsToken } from '../middleware/auth.js';
import { cmsLoginLimiter } from '../middleware/rateLimiters.js';
import { query } from '../lib/database.js';

const router = Router();
const authLogger = logger.child({ route: 'auth' });

router.post('/auth', cmsLoginLimiter, async (req, res) => {
    const { username, password } = req.body || {};

    res.set('Cache-Control', 'no-store');

    if (!username || !password) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    try {
        const { rows } = await query(
            'SELECT id, username, password_hash, role, active FROM cms_users WHERE username = $1 LIMIT 1',
            [username]
        );

        const user = rows[0];

        // Siempre ejecutar bcrypt.compare aunque no haya usuario (evita timing attacks)
        const dummyHash = '$2b$12$invalidhashfortimingnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn';
        const hashToCompare = user ? user.password_hash : dummyHash;
        const passwordOk = await bcrypt.compare(password, hashToCompare);

        if (!user || !passwordOk || !user.active) {
            authLogger.warn('CMS authentication failed', {
                requestId: req.requestId,
                username: username || null,
            });
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        const token = jwt.sign(
            { username: user.username, role: user.role },
            process.env.JWT_SECRET,
            jwtSignOptions
        );

        authLogger.info('CMS authentication succeeded', {
            requestId: req.requestId,
            username: user.username,
            role: user.role,
        });

        return res.json({ token });
    } catch (err) {
        authLogger.error('CMS authentication error', { requestId: req.requestId, err });
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.get('/verify', verifyCmsToken, (req, res) => {
    res.set('Cache-Control', 'no-store');
    authLogger.debug('CMS token verified', {
        requestId: req.requestId,
        username: req.user.username,
    });
    res.json({ valid: true, username: req.user.username });
});

// ── PUT /api/bitacora/me/password — el usuario cambia su propia contraseña ────
router.put('/me/password', verifyCmsToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Se requieren la contraseña actual y la nueva' });
    }
    if (typeof newPassword !== 'string' || newPassword.length < 8) {
        return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres' });
    }
    if (currentPassword === newPassword) {
        return res.status(400).json({ error: 'La nueva contraseña debe ser diferente a la actual' });
    }

    try {
        const { rows } = await query(
            'SELECT id, password_hash FROM cms_users WHERE username = $1 LIMIT 1',
            [req.user.username]
        );

        if (!rows[0]) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'La contraseña actual no es correcta' });
        }

        const newHash = await bcrypt.hash(newPassword, 12);
        await query(
            'UPDATE cms_users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
            [newHash, rows[0].id]
        );

        authLogger.info('CMS user changed own password', {
            requestId: req.requestId,
            username: req.user.username,
        });

        res.set('Cache-Control', 'no-store');
        res.json({ ok: true });
    } catch (err) {
        authLogger.error('Error changing password', { requestId: req.requestId, err });
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

export default router;
