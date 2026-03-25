import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { getGeminiModel } from '../lib/gemini.js';
import { logger } from '../lib/logger.js';
import { chatLimiter } from '../middleware/rateLimiters.js';
import { matchFaq } from '../utils/faqMatcher.js';
import { createHttpError } from '../utils/httpErrors.js';
import { getCachedResponse, isSpam, saveToCache } from '../utils/messageProtection.js';

const router = Router();
const chatLogger = logger.child({ route: 'chat' });

function withTimeout(promise, timeoutMs) {
    return Promise.race([
        promise,
        new Promise((_, reject) => {
            setTimeout(() => {
                reject(createHttpError(503, 'El asistente no esta disponible temporalmente.', {
                    code: 'GEMINI_TIMEOUT',
                }));
            }, timeoutMs);
        }),
    ]);
}

const validators = [
    body('message')
        .trim()
        .notEmpty().withMessage('El mensaje no puede estar vacio.')
        .isLength({ max: 500 }).withMessage('El mensaje no puede superar los 500 caracteres.'),
    body('history').optional().isArray({ max: 10 }).withMessage('El historial no es valido.'),
    body('history.*.role').optional().isIn(['user', 'model']).withMessage('El historial contiene un rol no valido.'),
    body('history.*.content')
        .optional()
        .isString().withMessage('El historial contiene contenido no valido.')
        .isLength({ max: 1000 }).withMessage('Una entrada del historial es demasiado larga.'),
];

router.post('/', chatLimiter, validators, async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { message, history = [] } = req.body;

    if (isSpam(message)) {
        chatLogger.warn('Chat message blocked as spam', {
            requestId: req.requestId,
            messageLength: message.length,
        });
        return res.status(400).json({ error: 'Mensaje no valido.' });
    }

    const faq = matchFaq(message);
    if (faq.matched) {
        chatLogger.info('Chat resolved from FAQ', {
            requestId: req.requestId,
            faqId: faq.id,
        });
        return res.status(200).json({ reply: faq.answer });
    }

    const cached = getCachedResponse(message);
    if (cached) {
        chatLogger.info('Chat resolved from cache', {
            requestId: req.requestId,
            messageLength: message.length,
        });
        return res.status(200).json({ reply: cached });
    }

    const model = getGeminiModel();
    if (!model) {
        chatLogger.warn('Gemini API key is missing', {
            requestId: req.requestId,
        });
        return res.status(503).json({
            error: 'El asistente no esta disponible temporalmente. Puedes contactarme directamente en contacto@guadalupecano.es',
            isWarning: true,
        });
    }

    try {
        const trimmedHistory = history.slice(-10).map(entry => ({
            role: entry.role,
            parts: [{ text: entry.content }],
        }));

        chatLogger.info('Sending message to Gemini', {
            requestId: req.requestId,
            messageLength: message.length,
            historyLength: trimmedHistory.length,
        });

        const chat = model.startChat({ history: trimmedHistory });
        const result = await withTimeout(chat.sendMessage(message), 10_000);
        const reply = result.response.text();

        saveToCache(message, reply);
        chatLogger.info('Chat response generated', {
            requestId: req.requestId,
            replyLength: reply.length,
        });

        return res.status(200).json({ reply });
    } catch (error) {
        const status = error?.statusCode ?? error?.status ?? error?.httpStatus ?? 0;
        const normalizedMessage = (error?.message ?? '').toLowerCase();
        const isUnavailable =
            error?.code === 'GEMINI_TIMEOUT' ||
            status === 503 ||
            normalizedMessage.includes('503') ||
            normalizedMessage.includes('timeout') ||
            normalizedMessage.includes('unavailable');

        if (isUnavailable) {
            chatLogger.warn('Gemini request unavailable', {
                requestId: req.requestId,
                error,
            });
            return res.status(503).json({
                error: 'El asistente no esta disponible temporalmente. Puedes contactarme directamente en contacto@guadalupecano.es',
                isWarning: true,
            });
        }

        if (status === 429 || normalizedMessage.includes('429') || normalizedMessage.includes('quota') || normalizedMessage.includes('rate')) {
            chatLogger.warn('Gemini rate limited', {
                requestId: req.requestId,
                error,
            });
            return res.status(429).json({
                error: 'En este momento estoy recibiendo muchas consultas. Intentalo en unos minutos o contactame directamente en contacto@guadalupecano.es',
                isWarning: true,
            });
        }

        next(createHttpError(
            500,
            'No he podido procesar tu mensaje en este momento. Intentalo de nuevo en unos segundos.',
            { cause: error }
        ));
        return undefined;
    }
});

export default router;
