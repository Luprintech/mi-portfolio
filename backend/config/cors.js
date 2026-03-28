import './env.js';
import { logger } from '../lib/logger.js';

const isDev = process.env.NODE_ENV !== 'production';

const allowedOrigins = [
    'https://guadalupecano.es',
    'https://www.guadalupecano.es',
    process.env.FRONTEND_URL,
].filter(Boolean);

// Patrón que acepta cualquier puerto de localhost en desarrollo
const localhostPattern = /^http:\/\/localhost:\d+$/;

export const corsOptions = {
    origin(origin, callback) {
        // Sin origen (peticiones server-to-server, curl, etc.)
        if (!origin) {
            callback(null, true);
            return;
        }

        // En desarrollo: permitir cualquier localhost independientemente del puerto
        if (isDev && localhostPattern.test(origin)) {
            callback(null, true);
            return;
        }

        // En producción: solo orígenes explícitamente permitidos
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }

        logger.warn('CORS origin blocked', { origin });
        callback(new Error('Not allowed by CORS'));
    },
};
