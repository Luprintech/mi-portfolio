import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const REQUIRED_ENV = ['JWT_SECRET', 'CMS_USERNAME', 'CMS_PASSWORD'];
for (const key of REQUIRED_ENV) {
    if (!process.env[key]) {
        console.error(`Missing required environment variable: ${key}`);
        process.exit(1);
    }
}

if (process.env.NODE_ENV !== 'production') {
    console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
    console.log('SMTP_HOST:',    process.env.SMTP_HOST);
}

import { corsOptions }   from './config/cors.js';
import { IMAGES_DIR }    from './config/paths.js';
import authRoutes        from './routes/auth.js';
import postsRoutes       from './routes/posts.js';
import projectsRoutes    from './routes/projects.js';
import imagesRoutes      from './routes/images.js';
import contactRoutes     from './routes/contact.js';
import chatRoutes        from './routes/chat.js';

const app = express();
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use('/posts/images', express.static(IMAGES_DIR));

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/bitacora', authRoutes);
app.use('/api/bitacora/posts', postsRoutes);
app.use('/api/bitacora/projects', projectsRoutes);
app.use('/api/bitacora', imagesRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/chat', chatRoutes);

app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
// Fin del archivo limpio y funcional
