/**
 * Tests para el middleware de autenticación (auth.js).
 * No require app completa ni base de datos.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { jwtSignOptions, safeCompare, verifyCmsToken } from '../../middleware/auth.js';

// Helper para crear un mock de res Express
function createMockResponse() {
    return {
        statusCode: 200,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.body = payload;
            return this;
        },
        set: vi.fn(),
    };
}

describe('safeCompare', () => {
    it('devuelve true para cadenas idénticas', () => {
        expect(safeCompare('admin', 'admin')).toBe(true);
    });

    it('devuelve false para cadenas distintas', () => {
        expect(safeCompare('admin', 'Admin')).toBe(false);
        expect(safeCompare('admin', 'admin1')).toBe(false);
        expect(safeCompare('abc', 'xyz')).toBe(false);
    });

    it('devuelve false para cadenas de distinta longitud', () => {
        expect(safeCompare('abc', 'abcd')).toBe(false);
        expect(safeCompare('', 'a')).toBe(false);
    });

    it('devuelve true para strings vacíos idénticos', () => {
        expect(safeCompare('', '')).toBe(true);
    });

    it('maneja valores null/undefined sin lanzar error', () => {
        expect(safeCompare(null, null)).toBe(true);
        expect(safeCompare(undefined, '')).toBe(true); // ambos se convierten a ''
        expect(safeCompare(null, 'algo')).toBe(false);
    });
});

describe('verifyCmsToken', () => {
    const JWT_SECRET = 'test-secret-vitest';

    beforeEach(() => {
        process.env.JWT_SECRET = JWT_SECRET;
    });

    it('llama a next() y adjunta req.user para un token válido', () => {
        const token = jwt.sign({ username: 'guadalupe' }, JWT_SECRET, jwtSignOptions);
        const req = { headers: { authorization: `Bearer ${token}` } };
        const res = createMockResponse();
        const next = vi.fn();

        verifyCmsToken(req, res, next);

        expect(next).toHaveBeenCalledOnce();
        expect(req.user.username).toBe('guadalupe');
        expect(res.body).toBeNull();
    });

    it('responde 401 para un token inválido', () => {
        const req = { headers: { authorization: 'Bearer token-invalido' } };
        const res = createMockResponse();
        const next = vi.fn();

        verifyCmsToken(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({ error: 'Token invalido o expirado' });
    });

    it('responde 401 cuando no hay header Authorization', () => {
        const req = { headers: {} };
        const res = createMockResponse();
        const next = vi.fn();

        verifyCmsToken(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({ error: 'No autorizado' });
    });

    it('responde 401 cuando el header no tiene prefijo Bearer', () => {
        const token = jwt.sign({ username: 'test' }, JWT_SECRET, jwtSignOptions);
        const req = { headers: { authorization: token } };
        const res = createMockResponse();
        const next = vi.fn();

        verifyCmsToken(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.statusCode).toBe(401);
    });

    it('responde 401 para un token expirado', () => {
        // Token que expiró hace 1 segundo
        const expiredToken = jwt.sign(
            { username: 'test' },
            JWT_SECRET,
            { ...jwtSignOptions, expiresIn: '-1s' }
        );
        const req = { headers: { authorization: `Bearer ${expiredToken}` } };
        const res = createMockResponse();
        const next = vi.fn();

        verifyCmsToken(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.statusCode).toBe(401);
    });
});
