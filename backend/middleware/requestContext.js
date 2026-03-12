import crypto from 'crypto';

export function attachRequestContext(req, res, next) {
    const requestId = crypto.randomUUID();
    req.requestId = requestId;
    res.locals.requestId = requestId;
    res.setHeader('X-Request-Id', requestId);
    next();
}
