import { matchFaq } from './faqMatcher.js';

const userRequestLogs = new Map();
const aiCache = new Map();

let lastAiRequestTime = 0;

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const FILLER_WORDS = new Set([
    'a', 'an', 'the', 'do', 'does', 'did', 'is', 'are', 'was', 'were',
    'can', 'could', 'would', 'should', 'have', 'has', 'had',
    'what', 'which', 'who', 'how', 'when', 'where', 'why',
    'your', 'you', 'me', 'my', 'i', 'please', 'tell', 'know',
    'que', 'cual', 'cuales', 'como', 'quien', 'donde', 'cuando', 'por',
    'tu', 'tus', 'me', 'mi', 'yo', 'el', 'la', 'los', 'las', 'un', 'una',
    'del', 'al', 'se', 'te', 'le', 'hay', 'tiene', 'tienes', 'es', 'son',
]);

function buildCacheKey(normalizedText) {
    return normalizedText
        .split(' ')
        .filter(word => word.length > 1 && !FILLER_WORDS.has(word))
        .sort()
        .join(' ');
}

function getFallbackMessage(language = 'es') {
    const messages = {
        es: 'Has realizado muchas preguntas seguidas. Intentalo de nuevo en unos segundos.',
        en: "You've asked too many questions in a short time. Please try again in a few seconds.",
    };

    return messages[language] || messages.es;
}

export function normalizeText(text) {
    if (!text || typeof text !== 'string') return '';

    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .replace(/\s+/g, ' ');
}

export function getCachedResponse(message) {
    const key = buildCacheKey(normalizeText(message));
    const entry = aiCache.get(key);

    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
        aiCache.delete(key);
        return null;
    }

    return entry.reply;
}

export function saveToCache(message, response) {
    const key = buildCacheKey(normalizeText(message));
    aiCache.set(key, { reply: response, timestamp: Date.now() });
}

export function cleanupCache() {
    const now = Date.now();

    for (const [key, entry] of aiCache.entries()) {
        if (now - entry.timestamp > CACHE_TTL_MS) {
            aiCache.delete(key);
        }
    }
}

export function isSpam(message) {
    if (!message || typeof message !== 'string') return true;

    const normalized = normalizeText(message);
    if (normalized.length < 3) return true;
    if (/(.)\1{5,}/.test(normalized)) return true;

    const wordCount = normalized.split(/\s+/).length;
    if (wordCount > 40) return true;

    const symbolCount = (message.match(/[^\w\s\u00C0-\u024F\u1E00-\u1EFF]/g) || []).length;
    const symbolRatio = symbolCount / (normalized.length || 1);
    if (symbolRatio > 0.5) return true;

    const spamPatterns = [
        /viagra|cialis|casino|poker|lottery|bitcoin|crypto|forex|trading/i,
        /click here|buy now|limited offer|act now/i,
        /www\./,
        /\bhttps?:\/\//,
        /([0-9]{10,})/,
    ];

    return spamPatterns.some(pattern => pattern.test(message));
}

export function canUseAI(userId) {
    if (!userId) return false;

    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const oneHourAgo = now - 60 * 60 * 1000;

    if (!userRequestLogs.has(userId)) {
        userRequestLogs.set(userId, []);
    }

    const timestamps = userRequestLogs.get(userId);
    const recentTimestamps = timestamps.filter(timestamp => timestamp > oneHourAgo);
    userRequestLogs.set(userId, recentTimestamps);

    const lastMinute = recentTimestamps.filter(timestamp => timestamp > oneMinuteAgo);
    if (lastMinute.length >= 3) return false;
    if (recentTimestamps.length >= 10) return false;

    return true;
}

export function logAiRequest(userId) {
    if (!userId) return;

    if (!userRequestLogs.has(userId)) {
        userRequestLogs.set(userId, []);
    }

    userRequestLogs.get(userId).push(Date.now());
}

export function aiCooldown() {
    const now = Date.now();
    const cooldownMs = 10 * 1000;

    return now - lastAiRequestTime >= cooldownMs;
}

export function logGlobalAiRequest() {
    lastAiRequestTime = Date.now();
}

export function detectIntent(message) {
    return matchFaq(message);
}

export function processMessage(message, userId, language = 'es') {
    const normalized = normalizeText(message);

    if (isSpam(message)) {
        return {
            shouldCallAI: false,
            error: language === 'en' ? 'Invalid message format.' : 'Formato de mensaje invalido.',
        };
    }

    const intent = detectIntent(normalized);
    if (intent.matched) {
        return {
            shouldCallAI: false,
            reply: intent.answer,
            intentId: intent.id,
        };
    }

    const cached = getCachedResponse(normalized);
    if (cached) {
        return {
            shouldCallAI: false,
            reply: cached,
            fromCache: true,
        };
    }

    if (!canUseAI(userId) || !aiCooldown()) {
        return {
            shouldCallAI: false,
            error: getFallbackMessage(language),
        };
    }

    return {
        shouldCallAI: true,
        message: normalized,
    };
}

export function cleanupOldLogs() {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    for (const [userId, timestamps] of userRequestLogs.entries()) {
        const filtered = timestamps.filter(timestamp => timestamp > oneHourAgo);
        if (filtered.length === 0) {
            userRequestLogs.delete(userId);
        } else {
            userRequestLogs.set(userId, filtered);
        }
    }
}
