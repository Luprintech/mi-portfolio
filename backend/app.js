import './config/env.js';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { corsOptions } from './config/cors.js';
import { AUDIO_DIR, DOCS_DIR, IMAGES_DIR } from './config/paths.js';
import { ensureDatabaseReady } from './lib/database.js';
import { listPostsForSitemap } from './lib/contentRepository.js';
import { logger } from './lib/logger.js';
import { generateSitemap } from './lib/sitemap.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { attachRequestContext } from './middleware/requestContext.js';
import { requestLogger } from './middleware/requestLogger.js';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import chatStatsRoutes from './routes/chatStats.js';
import contactRoutes from './routes/contact.js';
import imagesRoutes from './routes/images.js';
import ogMetaRoutes from './routes/ogMeta.js';
import postsRoutes from './routes/posts.js';
import projectsRoutes from './routes/projects.js';
import publicContentRoutes from './routes/publicContent.js';
import usersRoutes from './routes/users.js';

const REQUIRED_ENV = ['JWT_SECRET', 'CMS_USERNAME', 'CMS_PASSWORD'];

function validateRequiredEnv() {
    const missing = REQUIRED_ENV.filter(key => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}

export async function createApp() {
    validateRequiredEnv();
    await ensureDatabaseReady();
    await generateSitemap(listPostsForSitemap);

    const app = express();
    app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);
    app.disable('x-powered-by');

    app.use(attachRequestContext);
    app.use(requestLogger);
    app.use(helmet({
        crossOriginResourcePolicy: false,
        contentSecurityPolicy: {
            directives: {
                defaultSrc:     ["'self'"],
                scriptSrc:      ["'self'"],
                styleSrc:       ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
                fontSrc:        ["'self'", 'https://fonts.gstatic.com'],
                imgSrc:         [
                    "'self'",
                    'data:',
                    'blob:',
                    'https://cdn.jsdelivr.net',
                    'https://cdn.simpleicons.org',
                ],
                connectSrc:     ["'self'"],
                mediaSrc:       ["'self'", 'blob:'],
                objectSrc:      ["'none'"],
                frameSrc:       ["'none'"],
                workerSrc:      ["'self'", 'blob:', 'https://cdn.jsdelivr.net'],
                upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
            },
            reportOnly: false,
        },
    }));
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
    app.use('/api/bitacora/users', usersRoutes);
    app.use('/api/bitacora', imagesRoutes);
    app.use('/api/bitacora', chatStatsRoutes);
    app.use('/api/og', ogMetaRoutes);
    app.use('/api', publicContentRoutes);
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
