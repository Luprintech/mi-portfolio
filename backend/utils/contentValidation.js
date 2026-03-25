import { sanitizeHtml } from './sanitizeHtml.js';

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HTTP_URL_REGEX = /^https?:\/\//i;
const HTML_TAG_REGEX = /<\/?[a-z][\s\S]*>/i;

function looksLikeHtml(value) {
    return HTML_TAG_REGEX.test(String(value || ''));
}

function normalizeFormat(value) {
    if (value === undefined || value === null || value === '') return '';
    const normalized = String(value).trim().toLowerCase();
    return ['html', 'markdown'].includes(normalized) ? normalized : null;
}

function collectBlockValidationErrors(content, errors) {
    const imageGridMatches = content.matchAll(/<div[^>]*(?:data-block="image-grid"|data-image-grid)[^>]*>/gi);
    for (const match of imageGridMatches) {
        const tag = match[0];
        const imagesRaw = tag.match(/data-images="([^"]*)"/i)?.[1] || '[]';
        const columnsRaw = tag.match(/data-columns="([^"]*)"/i)?.[1] || tag.match(/data-cols="([^"]*)"/i)?.[1] || '2';

        try {
            const parsed = JSON.parse(imagesRaw.replace(/&quot;/g, '"'));
            if (!Array.isArray(parsed)) {
                errors.push('El bloque imageGrid debe incluir una lista valida de imagenes.');
                break;
            }
        } catch {
            errors.push('El bloque imageGrid tiene un data-images invalido.');
            break;
        }

        if (![2, 3, 4].includes(Number(columnsRaw) || 0)) {
            errors.push('El bloque imageGrid tiene una configuracion de columnas invalida.');
            break;
        }
    }

    const documentMatches = content.matchAll(/<div[^>]*(?:data-block="document"|data-document)[^>]*>/gi);
    for (const match of documentMatches) {
        const tag = match[0];
        const src = tag.match(/data-src="([^"]*)"/i)?.[1] || '';
        const filename = tag.match(/data-filename="([^"]*)"/i)?.[1] || tag.match(/data-title="([^"]*)"/i)?.[1] || '';
        if (!src || !filename) {
            errors.push('El bloque de documento requiere data-src y nombre de archivo.');
            break;
        }
    }
}

function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function normalizeText(value, { maxLength, allowEmpty = true } = {}) {
    if (value === undefined || value === null) return allowEmpty ? '' : null;
    const normalized = String(value).trim();
    if (!allowEmpty && !normalized) return null;
    if (maxLength && normalized.length > maxLength) return null;
    return normalized;
}

function normalizeBoolean(value, defaultValue = false) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        if (value.toLowerCase() === 'true') return true;
        if (value.toLowerCase() === 'false') return false;
    }
    return defaultValue;
}

function normalizeRevision(value) {
    if (value === undefined) return undefined;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 0) return null;
    return parsed;
}

function normalizeList(value, { maxItems, maxLengthPerItem }) {
    const rawItems = Array.isArray(value)
        ? value
        : String(value || '').split(',');

    const items = rawItems
        .map(item => String(item || '').trim())
        .filter(Boolean)
        .slice(0, maxItems);

    if (items.some(item => item.length > maxLengthPerItem)) return null;
    return [...new Set(items)];
}

function normalizeTocTitles(value, { maxItems = 12, maxLengthPerTitle = 120 } = {}) {
    if (!Array.isArray(value)) return [];

    const titles = value
        .map(item => {
            if (typeof item === 'string') {
                const trimmed = item.trim();
                return trimmed.length > 0 && trimmed.length <= maxLengthPerTitle ? trimmed : null;
            }
            return null;
        })
        .filter(item => item !== null)
        .slice(0, maxItems);

    return titles;
}

function normalizeUrl(value, { allowRelative = true } = {}) {
    const normalized = normalizeText(value);
    if (!normalized) return '';

    if (allowRelative && normalized.startsWith('/')) {
        return normalized;
    }

    if (!HTTP_URL_REGEX.test(normalized)) {
        return null;
    }

    try {
        const url = new URL(normalized);
        if (!['http:', 'https:'].includes(url.protocol)) return null;
        return url.toString();
    } catch {
        return null;
    }
}

function normalizeDate(value) {
    const normalized = normalizeText(value);
    if (!normalized) return new Date().toISOString().split('T')[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return null;
    return normalized;
}

export function isValidSlug(value) {
    return SLUG_REGEX.test(String(value || ''));
}

export function validateRouteSlug(value) {
    const normalized = normalizeText(value, { allowEmpty: false, maxLength: 80 });
    if (!normalized || !isValidSlug(normalized)) return null;
    return normalized;
}

export function sanitizePostInput(input, { partial = false } = {}) {
    if (!isPlainObject(input)) {
        return { errors: ['Payload invalido.'], data: null };
    }

    const errors = [];
    const data = {};

    if (!partial || input.title !== undefined) {
        const title = normalizeText(input.title, { allowEmpty: false, maxLength: 160 });
        if (!title) errors.push('El titulo es obligatorio y debe tener como maximo 160 caracteres.');
        else data.title = title;
    }

    if (!partial || input.slug !== undefined) {
        const slug = normalizeText(input.slug, { allowEmpty: false, maxLength: 80 });
        if (!slug || !isValidSlug(slug)) errors.push('El slug no es valido.');
        else data.slug = slug;
    }

    const shouldValidateContent = !partial || input.content !== undefined || input.contentHtml !== undefined || input.legacyMarkdown !== undefined || input.format !== undefined;
    if (shouldValidateContent) {
        const rawFormat = normalizeFormat(input.format);
        if (rawFormat === null) {
            errors.push('El formato del contenido no es valido.');
        } else {
            const fallbackContent = typeof input.content === 'string' ? input.content.trim() : '';
            const rawHtml = typeof input.contentHtml === 'string' ? input.contentHtml.trim() : '';
            const rawLegacy = typeof input.legacyMarkdown === 'string' ? input.legacyMarkdown.trim() : '';
            const resolvedFormat = rawFormat || (rawHtml || looksLikeHtml(fallbackContent) ? 'html' : rawLegacy ? 'markdown' : 'html');
            const resolvedHtml = sanitizeHtml(rawHtml || (resolvedFormat === 'html' ? fallbackContent : ''));
            const resolvedLegacy = rawLegacy || (resolvedFormat === 'markdown' ? fallbackContent : '');
            const canonicalContent = resolvedFormat === 'html' ? resolvedHtml : resolvedLegacy;

            if (!canonicalContent) errors.push('El contenido es obligatorio.');
            else if (canonicalContent.length > 150000) errors.push('El contenido es demasiado largo.');
            else {
                if (resolvedFormat === 'html') {
                    collectBlockValidationErrors(resolvedHtml, errors);
                }

                data.format = resolvedFormat;
                data.contentHtml = resolvedFormat === 'html' ? resolvedHtml : '';
                data.legacyMarkdown = resolvedFormat === 'markdown' ? resolvedLegacy : '';
                data.content = canonicalContent;
            }
        }
    }

    if (input.excerpt !== undefined) {
        const excerpt = normalizeText(input.excerpt, { maxLength: 320 });
        if (excerpt === null) errors.push('El resumen es demasiado largo.');
        else data.excerpt = excerpt;
    }

    if (input.tags !== undefined) {
        const tags = normalizeList(input.tags, { maxItems: 12, maxLengthPerItem: 40 });
        if (!tags) errors.push('Los tags no son validos.');
        else data.tags = tags;
    }

    if (!partial || input.date !== undefined) {
        const date = normalizeDate(input.date);
        if (!date) errors.push('La fecha no es valida.');
        else data.date = date;
    }

    if (input.seoTitle !== undefined) {
        const seoTitle = normalizeText(input.seoTitle, { maxLength: 80 });
        if (seoTitle === null) errors.push('El SEO title es demasiado largo.');
        else data.seoTitle = seoTitle;
    }

    if (input.seoDescription !== undefined) {
        const seoDescription = normalizeText(input.seoDescription, { maxLength: 180 });
        if (seoDescription === null) errors.push('La SEO description es demasiado larga.');
        else data.seoDescription = seoDescription;
    }

    if (input.ogImage !== undefined) {
        const ogImage = normalizeUrl(input.ogImage);
        if (ogImage === null) errors.push('La URL de la imagen social no es valida.');
        else data.ogImage = ogImage;
    }

    if (input.canonicalUrl !== undefined) {
        const canonicalUrl = normalizeUrl(input.canonicalUrl, { allowRelative: false });
        if (canonicalUrl === null) errors.push('La canonical URL no es valida.');
        else data.canonicalUrl = canonicalUrl;
    }

    if (input.noindex !== undefined) {
        data.noindex = normalizeBoolean(input.noindex, false);
    }

    if (input.featured !== undefined) {
        data.featured = normalizeBoolean(input.featured, false);
    }

    if (input.tocTitles !== undefined) {
        const tocTitles = normalizeTocTitles(input.tocTitles, { maxItems: 12, maxLengthPerTitle: 120 });
        data.tocTitles = tocTitles;
    }

    if (input.revision !== undefined) {
        const revision = normalizeRevision(input.revision);
        if (revision === null) errors.push('La revision no es valida.');
        else data.revision = revision;
    }

    if (!partial || input.status !== undefined) {
        const status = normalizeText(input.status, { allowEmpty: false, maxLength: 16 });
        if (!status || !['draft', 'published'].includes(status)) errors.push('El estado no es valido.');
        else data.status = status;
    }

    return { errors, data };
}

export function sanitizeProjectInput(input, { partial = false } = {}) {
    if (!isPlainObject(input)) {
        return { errors: ['Payload invalido.'], data: null };
    }

    const errors = [];
    const data = {};

    if (!partial || input.id !== undefined) {
        const id = normalizeText(input.id, { allowEmpty: false, maxLength: 80 });
        if (!id || !isValidSlug(id)) errors.push('El identificador del proyecto no es valido.');
        else data.id = id;
    }

    if (!partial || input.title !== undefined) {
        const title = normalizeText(input.title, { allowEmpty: false, maxLength: 160 });
        if (!title) errors.push('El titulo del proyecto es obligatorio.');
        else data.title = title;
    }

    if (input.description !== undefined) {
        const description = normalizeText(input.description, { maxLength: 2000 });
        if (description === null) errors.push('La descripcion es demasiado larga.');
        else data.description = description;
    }

    if (input.tech !== undefined) {
        const tech = normalizeList(input.tech, { maxItems: 16, maxLengthPerItem: 50 });
        if (!tech) errors.push('La lista de tecnologias no es valida.');
        else data.tech = tech;
    }

    if (input.github !== undefined) {
        const github = normalizeUrl(input.github, { allowRelative: false });
        if (github === null) errors.push('La URL de GitHub no es valida.');
        else data.github = github;
    }

    if (input.demo !== undefined) {
        const demo = normalizeUrl(input.demo, { allowRelative: false });
        if (demo === null) errors.push('La URL de la demo no es valida.');
        else data.demo = demo;
    }

    if (input.image !== undefined) {
        const image = normalizeUrl(input.image);
        if (image === null) errors.push('La imagen del proyecto no es valida.');
        else data.image = image;
    }

    if (input.featured !== undefined) {
        data.featured = normalizeBoolean(input.featured, false);
    }

    if (!partial || input.category !== undefined) {
        const category = normalizeText(input.category, { allowEmpty: false, maxLength: 24 });
        if (!category || !['code', 'cms'].includes(category)) errors.push('La categoria del proyecto no es valida.');
        else data.category = category;
    }

    return { errors, data };
}
