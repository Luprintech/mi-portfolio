import './env.js';
import { logger } from '../lib/logger.js';

const allowedOrigins = [
    'http://localhost:5173',
    'https://guadalupecano.es',
    'https://www.guadalupecano.es',
    process.env.FRONTEND_URL,
].filter(Boolean);

export const corsOptions = {
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }

        logger.warn('CORS origin blocked', { origin });
        callback(new Error('Not allowed by CORS'));
    },
};
