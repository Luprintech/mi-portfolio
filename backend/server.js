import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('trust proxy', 1);

// Allow images to be viewed cross-origin
app.use(helmet({ crossOriginResourcePolicy: false }));

// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL
].filter(Boolean);

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

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

const contactLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: { error: 'Rate limit exceeded. Try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 465,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

app.post(
    '/api/contact',
    contactLimiter,
    [
        body('name').trim().notEmpty().withMessage('Required parameter missing: name').escape(),
        body('email').trim().isEmail().withMessage('Invalid format: email').normalizeEmail(),
        body('subject').trim().escape(),
        body('message').trim().notEmpty().withMessage('Required parameter missing: message').escape(),
        body('_website').trim().custom((value) => {
            if (value) {
                throw new Error('Honeypot triggered');
            }
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
            console.error('SMTP Error:', error);
            return res.status(500).json({ error: 'Internal server error processing email.' });
        }
    }
);

// --- 🎯 NEW ADMIN PROJECTS SYSTEM ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit
const projectsFile = path.join(__dirname, 'data', 'projects.json');

app.get('/api/projects', async (req, res) => {
    try {
        const data = await fs.readFile(projectsFile, 'utf8');
        res.status(200).json(JSON.parse(data));
    } catch (err) {
        console.error('Error fetching projects:', err);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

app.post('/api/admin/projects', upload.single('imagen'), async (req, res) => {
    try {
        const adminPass = process.env.ADMIN_PASSWORD || '1234';
        if (req.body.password !== adminPass) {
            if (req.file) await fs.unlink(req.file.path);
            return res.status(403).json({ error: 'Invalid password' });
        }

        const data = await fs.readFile(projectsFile, 'utf8');
        const projects = JSON.parse(data);

        // Receive arrays and texts
        const links = JSON.parse(req.body.links || '[]');
        const tech = req.body.tech ? req.body.tech.split(',').map(t => t.trim()) : [];
        const isFeatured = req.body.featured === 'true';

        // Prepare new object with literal translations saving instead of common.json dynamic ones
        const newProject = {
            id: projects.length ? Math.max(...projects.map(p => p.id)) + 1 : 1,
            titulo_es: req.body.titulo_es,
            titulo_en: req.body.titulo_en,
            descripcion_es: req.body.descripcion_es,
            descripcion_en: req.body.descripcion_en,
            shortDescription_es: req.body.shortDescription_es,
            shortDescription_en: req.body.shortDescription_en,
            imagen: req.file ? `/uploads/${req.file.filename}` : '',
            links,
            tech,
            featured: isFeatured
        };

        projects.push(newProject);
        await fs.writeFile(projectsFile, JSON.stringify(projects, null, 2));

        res.status(201).json({ success: true, project: newProject });
    } catch (err) {
        console.error('Save Project Error:', err);
        if (req.file) await fs.unlink(req.file.path).catch(() => { });
        res.status(500).json({ error: 'Internal server error processing the project' });
    }
});

app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server initialized on port ${PORT}`);
});
