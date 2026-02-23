// Importaciones de dependencias necesarias para el servidor
import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import path from 'path';
import { fileURLToPath } from 'url';

// Carga las variables de entorno desde el archivo .env
dotenv.config();

// Configuración de rutas absolutas (necesario al usar módulos ES6)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicialización de la aplicación Express
const app = express();

// Configuración para entornos con proxy inverso (ej. Nginx, Heroku, Vercel)
app.set('trust proxy', 1);

// Middleware de seguridad básica
// Permite que las imágenes se carguen desde diferentes orígenes si fuera necesario
app.use(helmet({ crossOriginResourcePolicy: false }));

// Definición de orígenes permitidos para peticiones cruzadas (CORS)
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL
].filter(Boolean);

// Configuración estricta de CORS
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS Error: Origin not allowed'));
        }
    }
};

app.use(cors(corsOptions));

// Parsea el cuerpo de las peticiones a JSON y limita el tamaño para evitar abusos
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Limitador de peticiones para la ruta de contacto (prevención de spam/fuerza bruta)
// Limita a 5 peticiones cada 10 minutos por IP
const contactLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: { error: 'Rate limit exceeded. Try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Configuración del servicio de correo mediante Nodemailer y variables de entorno
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 465,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Ruta principal para el envío de formularios de contacto
app.post(
    '/api/contact',
    // Aplica el limitador de peticiones
    contactLimiter,
    // Validaciones de los campos del formulario
    [
        body('name').trim().notEmpty().withMessage('Required parameter missing: name').escape(),
        body('email').trim().isEmail().withMessage('Invalid format: email').normalizeEmail(),
        body('subject').trim().escape(),
        body('message').trim().notEmpty().withMessage('Required parameter missing: message').escape(),
        // Campo señuelo (honeypot) para detectar bots automáticos
        body('_website').trim().custom((value) => {
            if (value) {
                throw new Error('Honeypot triggered');
            }
            return true;
        }),
    ],
    async (req, res) => {
        try {
            // Verifica si la validación anterior encontró errores
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: 'Payload validation failed', details: errors.array() });
            }

            const { name, email, subject, message } = req.body;

            // Construcción del correo electrónico a enviar
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

            // Envío real del correo
            await transporter.sendMail(mailOptions);

            return res.status(200).json({ success: true, message: 'Message sent successfully.' });
        } catch (error) {
            console.error('SMTP Error:', error);
            return res.status(500).json({ error: 'Internal server error processing email.' });
        }
    }
);

// Manejador genérico para rutas no definidas (Error 404)
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Manejador central de errores del servidor (Error 500)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error.' });
});

// Arranque del servidor en el puerto especificado
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server initialized on port ${PORT}`);
});
