import './config/env.js';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { corsOptions } from './config/cors.js';
import { AUDIO_DIR, DOCS_DIR, IMAGES_DIR } from './config/paths.js';
import { logger } from './lib/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { attachRequestContext } from './middleware/requestContext.js';
import { requestLogger } from './middleware/requestLogger.js';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import contactRoutes from './routes/contact.js';
import imagesRoutes from './routes/images.js';
import postsRoutes from './routes/posts.js';
import projectsRoutes from './routes/projects.js';

const REQUIRED_ENV = ['JWT_SECRET', 'CMS_USERNAME', 'CMS_PASSWORD'];

function validateRequiredEnv() {
    const missing = REQUIRED_ENV.filter(key => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}

export function createApp() {
    validateRequiredEnv();

    const app = express();
    app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);
    app.disable('x-powered-by');

    app.use(attachRequestContext);
    app.use(requestLogger);
    app.use(helmet({ crossOriginResourcePolicy: false }));
    app.use(cors(corsOptions));
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true, limit: '1mb' }));

    app.use('/posts/images', express.static(IMAGES_DIR));
    app.use('/posts/documents', express.static(DOCS_DIR));
    app.use('/posts/audio', express.static(AUDIO_DIR));

    app.get('/api/health', (req, res) => {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            requestId: req.requestId,
        });
    });

    app.use('/api/bitacora', authRoutes);
    app.use('/api/bitacora/posts', postsRoutes);
    app.use('/api/bitacora/projects', projectsRoutes);
    app.use('/api/bitacora', imagesRoutes);
    app.use('/api/contact', contactRoutes);
    app.use('/api/chat', chatRoutes);

    app.use(notFoundHandler);
    app.use(errorHandler);

    logger.debug('Application configured', {
        nodeEnv: process.env.NODE_ENV || 'development',
        frontendUrl: process.env.FRONTEND_URL || null,
        smtpConfigured: Boolean(process.env.SMTP_HOST),
    });

    return app;
}
