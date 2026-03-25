import { Router } from 'express';
import { getPostForPublic } from '../lib/contentRepository.js';
import { validateRouteSlug } from '../utils/contentValidation.js';

const router = Router();

const SITE_URL = (process.env.SITE_URL || process.env.FRONTEND_URL || 'https://guadalupecano.es').replace(/\/$/, '');

function esc(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * GET /api/og/blog/:slug
 *
 * Devuelve un HTML mínimo con los Open Graph / Twitter Card del post.
 * Nginx redirige aquí las peticiones de bots de redes sociales (Twitterbot,
 * LinkedInBot, facebookexternalhit, WhatsApp, etc.) que no ejecutan JS
 * y necesitan leer las meta tags en el HTML crudo.
 */
router.get('/blog/:slug', async (req, res, next) => {
    try {
        const slug = validateRouteSlug(req.params.slug);
        if (!slug) return res.status(400).send('Slug inválido');

        const post = await getPostForPublic(slug);
        if (!post) return res.status(404).send('Artículo no encontrado');

        const postUrl  = `${SITE_URL}/blog/${esc(post.slug)}`;
        const canonicalUrl = esc(post.canonicalUrl || postUrl);
        const title    = esc(post.seoTitle || post.title || 'Artículo');
        const desc     = esc(post.seoDescription || post.excerpt || '');
        const image    = post.ogImage
            ? (post.ogImage.startsWith('http') ? esc(post.ogImage) : `${SITE_URL}${esc(post.ogImage)}`)
            : `${SITE_URL}/og-image.jpg`;
        const robots = post.noindex ? 'noindex, nofollow' : 'index, follow';

        res.set('Content-Type', 'text/html; charset=utf-8');
        res.set('Cache-Control', 'no-store');
        res.send(`<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>${title} | Guadalupe Cano</title>
  <meta name="description" content="${desc}" />

  <!-- Open Graph -->
  <meta property="og:type"        content="article" />
  <meta property="og:url"         content="${canonicalUrl}" />
  <meta property="og:title"       content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:image"       content="${image}" />

  <!-- Twitter Card -->
  <meta name="twitter:card"        content="summary_large_image" />
  <meta name="twitter:url"         content="${canonicalUrl}" />
  <meta name="twitter:title"       content="${title}" />
  <meta name="twitter:description" content="${desc}" />
  <meta name="twitter:image"       content="${image}" />
  <meta name="robots"              content="${robots}" />

  <link rel="canonical" href="${canonicalUrl}" />
</head>
<body>
  <h1>${title}</h1>
  <p>${desc}</p>
  <a href="${postUrl}">Leer artículo completo</a>
</body>
</html>`);
    } catch (err) {
        next(err);
    }
});

export default router;
