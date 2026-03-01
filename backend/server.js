import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

// ─── Configuración ────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

if (process.env.NODE_ENV !== 'production') {
    console.log('FRONTEND_URL cargada:', process.env.FRONTEND_URL);
    console.log('SMTP_HOST cargado:',   process.env.SMTP_HOST);
}

// ─── Rutas (importadas después de dotenv) ────────────────────────────────────
import { IMAGES_DIR } from './config.js';
import cmsAuthRouter     from './routes/cms/auth.js';
import cmsPostsRouter    from './routes/cms/posts.js';
import cmsProjectsRouter from './routes/cms/projects.js';
import cmsImagesRouter   from './routes/cms/images.js';
import contactRouter     from './routes/contact.js';
import chatRouter        from './routes/chat.js';

// ─── Express ──────────────────────────────────────────────────────────────────
const app = express();
app.set('trust proxy', 1);

// CORS
const allowedOrigins = [
    'http://localhost:5173',
    'http://192.168.1.91:8081',
    'https://guadalupecano.es',
    'https://www.guadalupecano.es',
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn('CORS bloqueado para origen:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Servir imágenes estáticas
app.use('/posts/images', express.static(IMAGES_DIR));

// ─── Rutas API ────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/bitacora/auth',     cmsAuthRouter);
app.use('/api/bitacora/posts',    cmsPostsRouter);
app.use('/api/bitacora/projects', cmsProjectsRouter);
app.use('/api/bitacora',          cmsImagesRouter);   // /upload + /images
app.use('/api/contact',           contactRouter);
app.use('/api/chat',              chatRouter);

// ─── Error handlers ───────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error.' });
});

// ─── Arranque ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Backend iniciado en el puerto ${PORT}`));
