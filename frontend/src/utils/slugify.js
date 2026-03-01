/**
 * Converts a string to a URL-friendly slug.
 * Strips accents, removes special characters, and joins words with hyphens.
 */
export function slugify(str) {
    return str
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}
