import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { chatLimiter } from '../middleware/rateLimiters.js';
import { SYSTEM_PROMPT } from '../data/systemPrompt.js';

const router = Router();

const validators = [
    body('message')
        .trim()
        .notEmpty().withMessage('El mensaje no puede estar vacío.')
        .isLength({ max: 500 }).withMessage('El mensaje no puede superar los 500 caracteres.'),
    body('history').optional().isArray(),
];

router.post('/', chatLimiter, validators, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY not configured.');
            return res.status(503).json({
                error: 'El asistente no está disponible temporalmente. Puedes contactarme directamente en contacto@guadalupecano.es',
                isWarning: true,
            });
        }

        const { message, history = [] } = req.body;

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: SYSTEM_PROMPT,
        });

        const trimmedHistory = history.slice(-10).map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }],
        }));

        const chat = model.startChat({ history: trimmedHistory });

        const controller = new AbortController();
        const timeoutId  = setTimeout(() => controller.abort(), 10_000);

        let result;
        try {
            result = await chat.sendMessage(message);
            clearTimeout(timeoutId);
        } catch (geminiError) {
            clearTimeout(timeoutId);

            const isAborted = geminiError.name === 'AbortError';
            const status    = geminiError?.status ?? geminiError?.httpStatus ?? 0;
            const msg       = (geminiError?.message ?? '').toLowerCase();

            console.error('Gemini error:', geminiError.message);

            if (isAborted || status === 503 || msg.includes('503') || msg.includes('timeout') || msg.includes('unavailable')) {
                return res.status(503).json({
                    error: 'El asistente no está disponible temporalmente. Puedes contactarme directamente en contacto@guadalupecano.es',
                    isWarning: true,
                });
            }

            if (status === 429 || msg.includes('429') || msg.includes('quota') || msg.includes('rate')) {
                return res.status(429).json({
                    error: 'En este momento estoy recibiendo muchas consultas. Inténtalo en unos minutos o contáctame directamente en contacto@guadalupecano.es',
                    isWarning: true,
                });
            }

            return res.status(500).json({
                error: 'No he podido procesar tu mensaje en este momento. Inténtalo de nuevo en unos segundos.',
            });
        }

        const reply = result.response.text();
        return res.status(200).json({ reply });

    } catch (error) {
        console.error('Chat endpoint error:', error.message);
        return res.status(500).json({
            error: 'No he podido procesar tu mensaje en este momento. Inténtalo de nuevo en unos segundos.',
        });
    }
});

export default router;
