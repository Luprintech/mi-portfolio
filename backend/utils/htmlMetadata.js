const HTML_TAG_REGEX = /<[^>]+>/g;
const HEADING_REGEX = /<h([1-4])[^>]*>([\s\S]*?)<\/h\1>/gi;
const IMAGE_REGEX = /<img[^>]+src=["']([^"']+)["'][^>]*>/i;
const DOCUMENT_BLOCK_REGEX = /<div[^>]+data-block=["']document["'][^>]*>/gi;
const ATTR_REGEX = /([a-zA-Z0-9:-]+)=["']([^"']*)["']/g;
const READING_SPEED_WPM = 190;

function decodeHtmlEntities(value = '') {
    return String(value)
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>');
}

function stripHtml(value = '') {
    return decodeHtmlEntities(String(value).replace(HTML_TAG_REGEX, ' '))
        .replace(/\s+/g, ' ')
        .trim();
}

function getWordCount(html = '') {
    const normalizedText = String(html)
        .replace(/<pre[\s\S]*?<\/pre>/gi, ' ')
        .replace(/<code[\s\S]*?<\/code>/gi, ' ')
        .replace(/<img[^>]*>/gi, ' ')
        .replace(/<figure[\s\S]*?<\/figure>/gi, match => match.replace(/<img[^>]*>/gi, ' '))
        .replace(HTML_TAG_REGEX, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    if (!normalizedText) return 0;
    return normalizedText.split(' ').filter(Boolean).length;
}

function parseAttributes(tag = '') {
    const attributes = {};

    for (const match of tag.matchAll(ATTR_REGEX)) {
        attributes[match[1]] = decodeHtmlEntities(match[2]);
    }

    return attributes;
}

function parseDocumentAttachments(html = '') {
    const attachments = [];

    for (const match of String(html).matchAll(DOCUMENT_BLOCK_REGEX)) {
        const attrs = parseAttributes(match[0]);
        attachments.push({
            src: attrs['data-src'] || '',
            title: attrs['data-title'] || attrs['data-filename'] || '',
            fileType: attrs['data-file-type'] || '',
            display: attrs['data-display'] || 'download',
        });
    }

    return attachments.filter(item => item.src);
}

function parseTocTitles(html = '') {
    const titles = [];

    for (const match of String(html).matchAll(HEADING_REGEX)) {
        const level = Number(match[1]);
        if (level < 2 || level > 4) continue;

        const title = stripHtml(match[2]);
        if (title) {
            titles.push(title);
        }
    }

    return titles.slice(0, 12);
}

export function deriveHtmlMetadata(html = '', { fallbackImage = '' } = {}) {
    const wordCount = getWordCount(html);
    const coverImage = fallbackImage || String(html).match(IMAGE_REGEX)?.[1] || '';
    const tocTitles = parseTocTitles(html);
    const attachmentsMeta = parseDocumentAttachments(html);

    return {
        coverImage,
        readingTime: Math.max(4, Math.ceil(wordCount / READING_SPEED_WPM)),
        tocTitles,
        attachmentsMeta,
        documentSummary: attachmentsMeta.map(({ title, fileType, src }) => ({ title, fileType, src })),
    };
}
