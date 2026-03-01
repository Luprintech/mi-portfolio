import { Router } from 'express';
import nodemailer from 'nodemailer';
import { body, validationResult } from 'express-validator';
import { contactLimiter } from '../middleware/rateLimiters.js';

const router = Router();

const transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   parseInt(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const validators = [
    body('name').trim().notEmpty().withMessage('Required parameter missing: name').escape(),
    body('email').trim().isEmail().withMessage('Invalid format: email').normalizeEmail(),
    body('subject').trim().escape(),
    body('message').trim().notEmpty().withMessage('Required parameter missing: message').escape(),
    body('_website').trim().custom((value) => {
        if (value) throw new Error('Honeypot triggered');
        return true;
    }),
];

router.post('/', contactLimiter, validators, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Payload validation failed', details: errors.array() });
        }

        const { name, email, subject, message } = req.body;

        const mailOptions = {
            from:    `"${name}" <${process.env.SMTP_USER}>`,
            to:      process.env.CONTACT_EMAIL || process.env.SMTP_USER,
            replyTo: email,
            subject: `Portfolio Contact: ${subject}`,
            text:    `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
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
        console.error('Contact form error:', error);
        return res.status(500).json({ error: 'Internal server error processing email.' });
    }
});

export default router;
