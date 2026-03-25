const SCRIPT_TAG_REGEX = /<script[\s\S]*?>[\s\S]*?<\/script>/gi;
const EVENT_HANDLER_REGEX = /\son[a-z]+\s*=\s*(['"]).*?\1/gi;
const JAVASCRIPT_URL_REGEX = /(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi;

export function sanitizeHtml(content = '') {
    return String(content || '')
        .replace(SCRIPT_TAG_REGEX, '')
        .replace(EVENT_HANDLER_REGEX, '')
        .replace(JAVASCRIPT_URL_REGEX, '$1="#"');
}
