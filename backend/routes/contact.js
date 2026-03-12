import { Router } from 'express';
import nodemailer from 'nodemailer';
import { body, validationResult } from 'express-validator';
import { logger } from '../lib/logger.js';
import { contactLimiter } from '../middleware/rateLimiters.js';
import { createHttpError } from '../utils/httpErrors.js';

const router = Router();
const contactLogger = logger.child({ route: 'contact' });

function createTransporter() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10) || 465,
        secure: process.env.SMTP_SECURE === 'true',
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
}

const validators = [
    body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Required parameter missing: name').escape(),
    body('email').trim().isEmail().withMessage('Invalid format: email').normalizeEmail(),
    body('subject').trim().isLength({ max: 150 }).withMessage('Invalid format: subject').escape(),
    body('message').trim().isLength({ min: 10, max: 4000 }).withMessage('Required parameter missing: message').escape(),
    body('_website').trim().custom((value) => {
        if (value) throw new Error('Honeypot triggered');
        return true;
    }),
];

router.post('/', contactLimiter, validators, async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Payload validation failed', details: errors.array() });
    }

    const { name, email, subject, message } = req.body;

    try {
        const transporter = createTransporter();
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
        await transporter.sendMail({
            from: `"Guadalupe Cano" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'He recibido tu mensaje - Guadalupe Cano',
            text: `Hola ${name},\n\nGracias por contactarme. He recibido tu mensaje y te respondere lo antes posible.\n\nEste es un resumen de lo que me has enviado:\n---\nAsunto: ${subject}\n\n${message}\n---\n\nHasta pronto,\nGuadalupe Cano\nhttps://guadalupecano.es`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; color: #333; background: #f9f9f9; border-radius: 8px;">
                    <h2 style="color: #a855f7;">Hola, ${name}</h2>
                    <p>Gracias por contactarme. He recibido tu mensaje y te respondere lo antes posible.</p>
                    <div style="background: #fff; border-left: 4px solid #a855f7; padding: 16px; border-radius: 4px; margin: 20px 0;">
                        <p style="margin: 0 0 8px;"><strong>Asunto:</strong> ${subject}</p>
                        <p style="white-space: pre-wrap; margin: 0; color: #555;">${message}</p>
                    </div>
                    <p style="color: #888; font-size: 14px;">Hasta pronto,<br/><strong>Guadalupe Cano</strong><br/><a href="https://guadalupecano.es" style="color: #a855f7;">guadalupecano.es</a></p>
                </div>
            `,
        });

        contactLogger.info('Contact form delivered', {
            requestId: req.requestId,
            emailDomain: String(email).split('@')[1] || null,
        });

        return res.status(200).json({ success: true, message: 'Message sent successfully.' });
    } catch (error) {
        next(createHttpError(500, 'Internal server error processing email.', { cause: error }));
        return undefined;
    }
});

export default router;
