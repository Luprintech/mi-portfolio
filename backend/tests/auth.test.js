import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { jwtSignOptions, safeCompare, verifyCmsToken } from '../middleware/auth.js';

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
    };
}

export function runAuthTests(runTest) {
    runTest('safeCompare returns true only for exact matches', () => {
        assert.equal(safeCompare('admin', 'admin'), true);
        assert.equal(safeCompare('admin', 'Admin'), false);
        assert.equal(safeCompare('admin', 'admin1'), false);
    });

    runTest('verifyCmsToken attaches the decoded user for a valid token', () => {
        process.env.JWT_SECRET = 'test-secret';

        const token = jwt.sign({ username: 'guada' }, process.env.JWT_SECRET, jwtSignOptions);
        const req = {
            headers: {
                authorization: `Bearer ${token}`,
            },
        };
        const res = createMockResponse();

        let nextCalled = false;
        verifyCmsToken(req, res, () => {
            nextCalled = true;
        });

        assert.equal(nextCalled, true);
        assert.equal(req.user.username, 'guada');
        assert.equal(res.body, null);
    });

    runTest('verifyCmsToken rejects invalid tokens', () => {
        process.env.JWT_SECRET = 'test-secret';

        const req = {
            headers: {
                authorization: 'Bearer invalid-token',
            },
        };
        const res = createMockResponse();

        verifyCmsToken(req, res, () => {});

        assert.equal(res.statusCode, 401);
        assert.deepEqual(res.body, { error: 'Token invalido o expirado' });
    });
}
