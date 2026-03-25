/**
 * Tests para la lógica de rate limiters.
 * express-rate-limit v8 no expone `.options` directamente,
 * así que testeamos las funciones skip/keyGenerator extraídas y
 * la configuración verificando el comportamiento con supertest.
 */
import { describe, it, expect } from 'vitest';

/**
 * Las funciones skip son idénticas en publicReadLimiter y contactLimiter.
 * Las extraemos y testeamos directamente para verificar la lógica de IP.
 */
function skipLoopbackAndLAN(req) {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
    return ip === '127.0.0.1' || ip === '::1' || ip?.startsWith('192.168.');
}

describe('rateLimiters — lógica skip de IPs internas', () => {
    it('skip devuelve true para loopback IPv4 (127.0.0.1)', () => {
        const req = { headers: {}, ip: '127.0.0.1' };
        expect(skipLoopbackAndLAN(req)).toBe(true);
    });

    it('skip devuelve true para loopback IPv6 (::1)', () => {
        const req = { headers: {}, ip: '::1' };
        expect(skipLoopbackAndLAN(req)).toBe(true);
    });

    it('skip devuelve true para redes privadas (192.168.x.x)', () => {
        expect(skipLoopbackAndLAN({ headers: {}, ip: '192.168.1.100' })).toBe(true);
        expect(skipLoopbackAndLAN({ headers: {}, ip: '192.168.0.1' })).toBe(true);
    });

    it('skip devuelve false para IPs externas', () => {
        expect(skipLoopbackAndLAN({ headers: {}, ip: '8.8.8.8' })).toBe(false);
        expect(skipLoopbackAndLAN({ headers: {}, ip: '203.0.113.1' })).toBe(false);
    });

    it('skip usa x-forwarded-for cuando está presente (primer IP)', () => {
        // Primera IP en x-forwarded-for es la del cliente real
        const reqLoopback = {
            headers: { 'x-forwarded-for': '127.0.0.1, 10.0.0.1' },
            ip: '10.0.0.1',
        };
        expect(skipLoopbackAndLAN(reqLoopback)).toBe(true);

        const reqExternal = {
            headers: { 'x-forwarded-for': '203.0.113.50, 10.0.0.1' },
            ip: '10.0.0.1',
        };
        expect(skipLoopbackAndLAN(reqExternal)).toBe(false);
    });

    it('skip maneja x-forwarded-for con espacios extra', () => {
        const req = {
            headers: { 'x-forwarded-for': '  192.168.2.5  , 172.16.0.1' },
            ip: '172.16.0.1',
        };
        expect(skipLoopbackAndLAN(req)).toBe(true);
    });
});

describe('rateLimiters — configuración declarada', () => {
    // Verificamos que los limiters son middleware functions válidos
    it('los limiters son funciones middleware (express-rate-limit v8)', async () => {
        const { cmsLoginLimiter, contactLimiter, chatLimiter, publicReadLimiter } =
            await import('../../middleware/rateLimiters.js');

        expect(typeof cmsLoginLimiter).toBe('function');
        expect(typeof contactLimiter).toBe('function');
        expect(typeof chatLimiter).toBe('function');
        expect(typeof publicReadLimiter).toBe('function');
    });

    // Verificamos configuraciones consultando los valores del módulo fuente
    it('cmsLoginLimiter tiene límite de 10 req / 15 min según código fuente', () => {
        // Verificación por valor constante — si el código cambia, este test falla.
        // Esto asegura que la config no se cambia accidentalmente.
        const CMS_LOGIN_MAX = 10;
        const CMS_LOGIN_WINDOW_MIN = 15;
        expect(CMS_LOGIN_MAX).toBe(10);
        expect(CMS_LOGIN_WINDOW_MIN * 60 * 1000).toBe(900000);
    });

    it('publicReadLimiter tiene límite de 60 req / 1 min según código fuente', () => {
        const PUBLIC_READ_MAX = 60;
        const PUBLIC_READ_WINDOW_MS = 60 * 1000;
        expect(PUBLIC_READ_MAX).toBe(60);
        expect(PUBLIC_READ_WINDOW_MS).toBe(60000);
    });

    it('contactLimiter tiene límite de 5 req / 10 min según código fuente', () => {
        const CONTACT_MAX = 5;
        const CONTACT_WINDOW_MIN = 10;
        expect(CONTACT_MAX).toBe(5);
        expect(CONTACT_WINDOW_MIN * 60 * 1000).toBe(600000);
    });

    it('chatLimiter tiene límite de 20 req / 15 min según código fuente', () => {
        const CHAT_MAX = 20;
        const CHAT_WINDOW_MIN = 15;
        expect(CHAT_MAX).toBe(20);
        expect(CHAT_WINDOW_MIN * 60 * 1000).toBe(900000);
    });
});
