import fsExtra from 'fs-extra';
import path from 'path';
import { SITEMAP_FILE } from '../config/paths.js';
import { logger } from './logger.js';

const sitemapLogger = logger.child({ area: 'sitemap' });

function escapeXml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&apos;');
}

export async function writeSitemap(entries) {
    const host = process.env.FRONTEND_URL || 'https://tusitio.com';
    const urls = entries
        .map(entry => `  <url>
    <loc>${escapeXml(`${host}/blog/${entry.slug}`)}</loc>
    <lastmod>${escapeXml(entry.date)}</lastmod>
    <changefreq>monthly</changefreq>
  </url>`)
        .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${escapeXml(`${host}/blog`)}</loc>
    <changefreq>daily</changefreq>
  </url>
${urls}
</urlset>`;

    await fsExtra.ensureDir(path.dirname(SITEMAP_FILE));
    await fsExtra.writeFile(SITEMAP_FILE, xml, 'utf-8');
}

export async function generateSitemap(listEntries) {
    try {
        const entries = await listEntries();
        await writeSitemap(entries);
    } catch (error) {
        sitemapLogger.warn('Sitemap generation failed', { error });
    }
}
