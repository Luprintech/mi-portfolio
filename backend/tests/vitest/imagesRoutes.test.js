import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import express from 'express';
import request from 'supertest';

vi.mock('../../middleware/auth.js', () => ({
    verifyCmsToken: (req, _res, next) => {
        req.user = { username: 'vitest-admin' };
        next();
    },
}));

vi.mock('../../lib/logger.js', () => ({
    logger: {
        child: () => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() }),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
    },
}));

let tempRoot;
let app;

beforeAll(async () => {
    tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'mi-web-upload-'));
    process.env.CONTENT_PATH = tempRoot;

    const [{ default: imagesRouter }, { errorHandler }, { notFoundHandler }] = await Promise.all([
        import('../../routes/images.js'),
        import('../../middleware/errorHandler.js'),
        import('../../middleware/notFoundHandler.js'),
    ]);

    app = express();
    app.use('/api/bitacora', imagesRouter);
    app.use(notFoundHandler);
    app.use(errorHandler);
});

afterAll(async () => {
    await fs.rm(tempRoot, { recursive: true, force: true });
    delete process.env.CONTENT_PATH;
});

describe('images routes', () => {
    it('sube un PDF valido y responde metadata util para el CMS', async () => {
        const response = await request(app)
            .post('/api/bitacora/upload-document')
            .attach('document', Buffer.from('%PDF-1.4 test pdf'), { filename: 'guia.pdf', contentType: 'application/pdf' });

        expect(response.status).toBe(200);
        expect(response.body.ok).toBe(true);
        expect(response.body.file.fileType).toBe('pdf');
        expect(response.body.file.url).toMatch(/^\/posts\/documents\//);
        expect(response.body.file.filename).toBe('guia.pdf');
    });

    it('rechaza documentos invalidos con error normalizado', async () => {
        const response = await request(app)
            .post('/api/bitacora/upload-document')
            .attach('document', Buffer.from('fake exe'), { filename: 'malicioso.exe', contentType: 'application/octet-stream' });

        expect(response.status).toBe(400);
        expect(response.body.error.type).toBe('invalid-file-type');
        expect(response.body.error.field).toBe('document');
        expect(response.body.error.acceptedTypes).toContain('.pdf');
        expect(response.body.error.message).toContain('Solo PDF, ZIP, DOC y DOCX');
    });

    it('reemplaza el CV publico desde Bitacora', async () => {
        const response = await request(app)
            .post('/api/bitacora/upload-cv')
            .attach('cv', Buffer.from('%PDF-1.4 nuevo cv'), { filename: 'cv-guadalupe.pdf', contentType: 'application/pdf' });

        expect(response.status).toBe(200);
        expect(response.body.ok).toBe(true);
        expect(response.body.file.url).toBe('/CV_Guadalupe_Cano.pdf');

        const savedCv = await fs.readFile(path.join(tempRoot, 'CV_Guadalupe_Cano.pdf'), 'utf8');
        expect(savedCv).toContain('nuevo cv');
    });
});
