// Importaciones de dependencias
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';

// Configuración de rutas para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

if (process.env.NODE_ENV !== 'production') {
    console.log("FRONTEND_URL cargada:", process.env.FRONTEND_URL);
    console.log("SMTP_HOST cargado:", process.env.SMTP_HOST);
}

const app = express();

// Configuración para proxy inverso (NPM -> contenedor)
app.set('trust proxy', 1);

// CORS — permite peticiones desde tu dominio
const allowedOrigins = [
    'http://localhost:5173',
    'http://192.168.1.91:8081',
    'https://guadalupecano.es',
    'https://www.guadalupecano.es',
    process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        // Permite peticiones sin origen (ej: Postman, curl) y las de la lista
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn('CORS bloqueado para origen:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    }
};

// Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate limiter para el endpoint de contacto
const contactLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 5,
    message: { error: 'Rate limit exceeded. Try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Ruta de health check (útil para verificar que el backend responde)
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Ruta principal de contacto
app.post(
    '/api/contact',
    contactLimiter,
    [
        body('name').trim().notEmpty().withMessage('Required parameter missing: name').escape(),
        body('email').trim().isEmail().withMessage('Invalid format: email').normalizeEmail(),
        body('subject').trim().escape(),
        body('message').trim().notEmpty().withMessage('Required parameter missing: message').escape(),
        body('_website').trim().custom((value) => {
            if (value) throw new Error('Honeypot triggered');
            return true;
        }),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: 'Payload validation failed', details: errors.array() });
            }

            const { name, email, subject, message } = req.body;

            const mailOptions = {
                from: `"${name}" <${process.env.SMTP_USER}>`,
                to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
                replyTo: email,
                subject: `Portfolio Contact: ${subject}`,
                text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2>Nuevo contacto desde Portfolio</h2>
                        <p><strong>De:</strong> ${name} (<a href="mailto:${email}">${email}</a>)</p>
                        <p><strong>Asunto:</strong> ${subject}</p>
                        <hr />
                        <p style="white-space: pre-wrap; background-color: #f9f9f9; padding: 15px; border-radius: 5px;">${message}</p>
                    </div>
                `,
            };

            await transporter.sendMail(mailOptions);
            return res.status(200).json({ success: true, message: 'Message sent successfully.' });

        } catch (error) {
            console.error('Error en /api/contact:', error);
            return res.status(500).json({ error: 'Internal server error processing email.' });
        }
    }
);

// 404
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error.' });
});

// Arranque del servidor — UN SOLO app.listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend iniciado en el puerto ${PORT}`);
});