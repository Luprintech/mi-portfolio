import { Router } from 'express';
import bcrypt from 'bcrypt';
import { query } from '../lib/database.js';
import { verifyCmsToken, requireAdmin } from '../middleware/auth.js';
import { logger } from '../lib/logger.js';

const router = Router();
const usersLogger = logger.child({ route: 'users' });

const BCRYPT_ROUNDS = 12;

// Todos los endpoints requieren autenticación y rol admin
router.use(verifyCmsToken);
router.use(requireAdmin);

// ── GET /api/bitacora/users — lista todos los usuarios (sin hash) ─────────────
router.get('/', async (req, res, next) => {
    try {
        const { rows } = await query(
            `SELECT id, username, role, active, created_at, updated_at
             FROM cms_users
             ORDER BY created_at ASC`
        );
        res.json({ users: rows });
    } catch (err) {
        next(err);
    }
});

// ── POST /api/bitacora/users — crear usuario ──────────────────────────────────
router.post('/', async (req, res, next) => {
    try {
        const { username, password, role = 'editor' } = req.body || {};

        if (!username || typeof username !== 'string' || username.trim().length < 3) {
            return res.status(400).json({ error: 'El nombre de usuario debe tener al menos 3 caracteres' });
        }
        if (!password || typeof password !== 'string' || password.length < 8) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
        }
        if (!['admin', 'editor'].includes(role)) {
            return res.status(400).json({ error: 'Rol inválido. Usa admin o editor' });
        }

        const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

        const { rows } = await query(
            `INSERT INTO cms_users (username, password_hash, role, active)
             VALUES ($1, $2, $3, true)
             RETURNING id, username, role, active, created_at`,
            [username.trim(), hash, role]
        );

        usersLogger.info('CMS user created', { requestId: req.requestId, username: username.trim(), by: req.user.username });
        res.status(201).json({ user: rows[0] });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Ya existe un usuario con ese nombre' });
        }
        next(err);
    }
});

// ── PUT /api/bitacora/users/:id — actualizar usuario (y/o contraseña) ─────────
router.put('/:id', async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        const { username, password, role, active } = req.body || {};

        // Verificar que el usuario existe
        const existing = await query('SELECT id, username, role FROM cms_users WHERE id = $1', [id]);
        if (existing.rowCount === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Impedir que el admin se desactive a sí mismo
        if (req.user.username === existing.rows[0].username && active === false) {
            return res.status(400).json({ error: 'No puedes desactivarte a ti mismo' });
        }

        const updates = [];
        const values = [];
        let idx = 1;

        if (username !== undefined) {
            if (typeof username !== 'string' || username.trim().length < 3) {
                return res.status(400).json({ error: 'El nombre de usuario debe tener al menos 3 caracteres' });
            }
            updates.push(`username = $${idx++}`);
            values.push(username.trim());
        }

        if (password !== undefined) {
            if (typeof password !== 'string' || password.length < 8) {
                return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
            }
            const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
            updates.push(`password_hash = $${idx++}`);
            values.push(hash);
        }

        if (role !== undefined) {
            if (!['admin', 'editor'].includes(role)) {
                return res.status(400).json({ error: 'Rol inválido. Usa admin o editor' });
            }
            updates.push(`role = $${idx++}`);
            values.push(role);
        }

        if (active !== undefined) {
            updates.push(`active = $${idx++}`);
            values.push(Boolean(active));
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No se envió ningún campo para actualizar' });
        }

        updates.push(`updated_at = NOW()`);
        values.push(id);

        const { rows } = await query(
            `UPDATE cms_users SET ${updates.join(', ')}
             WHERE id = $${idx}
             RETURNING id, username, role, active, created_at, updated_at`,
            values
        );

        usersLogger.info('CMS user updated', { requestId: req.requestId, targetId: id, by: req.user.username });
        res.json({ user: rows[0] });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Ya existe un usuario con ese nombre' });
        }
        next(err);
    }
});

// ── DELETE /api/bitacora/users/:id — eliminar usuario ─────────────────────────
router.delete('/:id', async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        // No permitir auto-eliminación
        const existing = await query('SELECT username FROM cms_users WHERE id = $1', [id]);
        if (existing.rowCount === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        if (req.user.username === existing.rows[0].username) {
            return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' });
        }

        // Asegurarse de que queda al menos un admin activo
        const adminCount = await query(
            `SELECT COUNT(*)::int AS count FROM cms_users WHERE role = 'admin' AND active = true AND id != $1`,
            [id]
        );
        if (adminCount.rows[0].count === 0) {
            return res.status(400).json({ error: 'Debe quedar al menos un administrador activo' });
        }

        await query('DELETE FROM cms_users WHERE id = $1', [id]);
        usersLogger.info('CMS user deleted', { requestId: req.requestId, targetId: id, by: req.user.username });
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
});

export default router;
