import { matchFaq } from './faqMatcher.js';

// Store for tracking user request timestamps
const userRequestLogs = new Map();
let lastAiRequestTime = 0;

// ─── AI Response Cache ───────────────────────────────────────────────────────
const aiCache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Remove common filler words to produce a canonical key for fuzzy matching.
 * "what technologies do you use" and "which technologies do you use"
 * both reduce to the same fingerprint.
 */
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
        .filter(w => w.length > 1 && !FILLER_WORDS.has(w))
        .sort()
        .join(' ');
}

/**
 * Return cached AI response for a message, or null if not found / expired.
 */
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

/**
 * Store an AI response in the cache.
 */
export function saveToCache(message, response) {
    const key = buildCacheKey(normalizeText(message));
    aiCache.set(key, { reply: response, timestamp: Date.now() });
}

/**
 * Remove all expired cache entries.
 */
export function cleanupCache() {
    const now = Date.now();
    for (const [key, entry] of aiCache.entries()) {
        if (now - entry.timestamp > CACHE_TTL_MS) {
            aiCache.delete(key);
        }
    }
}
// ────────────────────────────────────────────────────────────────────────────

/**
 * Normalize text: lowercase, remove accents, trim, collapse spaces
 */
export function normalizeText(text) {
    if (!text || typeof text !== 'string') return '';

    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .replace(/\s+/g, ' ');
}

/**
 * Check if message is spam
 * Returns true if message should be blocked
 */
export function isSpam(message) {
    if (!message || typeof message !== 'string') return true;

    const normalized = normalizeText(message);

    // Length check: at least 3 characters
    if (normalized.length < 3) {
        return true;
    }

    // Check for repeated characters (e.g., "aaaaaaa")
    if (/(.)\1{5,}/.test(normalized)) {
        return true;
    }

    // Word count check: max 40 words
    const wordCount = normalized.split(/\s+/).length;
    if (wordCount > 40) {
        return true;
    }

    // Check if message is mostly symbols
    const symbolCount = (message.match(/[^\w\s\u00C0-\u024F\u1E00-\u1EFF]/g) || []).length;
    const symbolRatio = symbolCount / (normalized.length || 1);
    if (symbolRatio > 0.5) {
        return true;
    }

    // Obvious spam patterns
    const spamPatterns = [
        /viagra|cialis|casino|poker|lottery|bitcoin|crypto|forex|trading/i,
        /click here|buy now|limited offer|act now/i,
        /www\./,
        /\bhttps?:\/\//,
        /([0-9]{10,})/,
    ];

    for (const pattern of spamPatterns) {
        if (pattern.test(message)) {
            return true;
        }
    }

    return false;
}

/**
 * Check if user can use AI based on rate limits
 * Max 3 requests per minute, max 10 requests per hour
 */
export function canUseAI(userId) {
    if (!userId) return false;

    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const oneHourAgo = now - 60 * 60 * 1000;

    // Initialize user log if doesn't exist
    if (!userRequestLogs.has(userId)) {
        userRequestLogs.set(userId, []);
    }

    const timestamps = userRequestLogs.get(userId);

    // Remove old entries
    const recentTimestamps = timestamps.filter(ts => ts > oneHourAgo);
    userRequestLogs.set(userId, recentTimestamps);

    // Check minute limit: max 3 requests per minute
    const lastMinute = recentTimestamps.filter(ts => ts > oneMinuteAgo);
    if (lastMinute.length >= 3) {
        return false;
    }

    // Check hour limit: max 10 requests per hour
    if (recentTimestamps.length >= 10) {
        return false;
    }

    return true;
}

/**
 * Log an AI request for rate limiting
 */
export function logAiRequest(userId) {
    if (!userId) return;

    if (!userRequestLogs.has(userId)) {
        userRequestLogs.set(userId, []);
    }

    userRequestLogs.get(userId).push(Date.now());
}

/**
 * Check global AI cooldown: 1 request every 10 seconds
 */
export function aiCooldown() {
    const now = Date.now();
    const cooldownMs = 10 * 1000;

    if (now - lastAiRequestTime < cooldownMs) {
        return false;
    }

    return true;
}

/**
 * Log global AI request for cooldown
 */
export function logGlobalAiRequest() {
    lastAiRequestTime = Date.now();
}

/**
 * Detect intent from message using FAQ matching
 */
export function detectIntent(message) {
    return matchFaq(message);
}

/**
 * Get safe fallback message based on language
 */
function getFallbackMessage(language = 'es') {
    const messages = {
        es: 'Has realizado muchas preguntas seguidas. Inténtalo de nuevo en unos segundos.',
        en: "You've asked too many questions in a short time. Please try again in a few seconds.",
    };

    return messages[language] || messages.es;
}

/**
 * Main entry point: process message with all protections
 * Returns: { shouldCallAI: boolean, reply?: string, error?: string }
 */
export function processMessage(message, userId, language = 'es') {
    // 1. Normalize text
    const normalized = normalizeText(message);

    // 2. Spam filter
    if (isSpam(message)) {
        return {
            shouldCallAI: false,
            error: language === 'en' ? 'Invalid message format.' : 'Formato de mensaje inválido.',
        };
    }

    // 3. Intent detection (FAQ first)
    const intent = detectIntent(normalized);
    if (intent.matched) {
        return {
            shouldCallAI: false,
            reply: intent.answer,
            intentId: intent.id,
        };
    }

    // 4. Check cache before calling AI
    const cached = getCachedResponse(normalized);
    if (cached) {
        return {
            shouldCallAI: false,
            reply: cached,
            fromCache: true,
        };
    }

    // 5. Check rate limit and cooldown
    if (!canUseAI(userId)) {
        return {
            shouldCallAI: false,
            error: getFallbackMessage(language),
        };
    }

    if (!aiCooldown()) {
        return {
            shouldCallAI: false,
            error: getFallbackMessage(language),
        };
    }

    // 6. All checks passed, ready for AI
    return {
        shouldCallAI: true,
        message: normalized,
    };
}

/**
 * Clean up old logs periodically (call every hour or as needed)
 */
export function cleanupOldLogs() {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    for (const [userId, timestamps] of userRequestLogs.entries()) {
        const filtered = timestamps.filter(ts => ts > oneHourAgo);
        if (filtered.length === 0) {
            userRequestLogs.delete(userId);
        } else {
            userRequestLogs.set(userId, filtered);
        }
    }
}
