const LEVEL_PRIORITY = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
};

const REDACTED_KEYS = new Set([
    'authorization',
    'cookie',
    'password',
    'pass',
    'token',
    'jwtsecret',
    'smtppass',
]);

function getActiveLevel() {
    const configuredLevel = process.env.LOG_LEVEL;
    if (configuredLevel && LEVEL_PRIORITY[configuredLevel]) {
        return configuredLevel;
    }

    return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
}

function normalizeValue(value, key = '') {
    if (REDACTED_KEYS.has(String(key).toLowerCase())) {
        return '[REDACTED]';
    }

    if (value instanceof Error) {
        return {
            name: value.name,
            message: value.message,
            stack: value.stack,
            code: value.code,
            statusCode: value.statusCode,
        };
    }

    if (Array.isArray(value)) {
        return value.map(item => normalizeValue(item));
    }

    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([entryKey, entryValue]) => [
                entryKey,
                normalizeValue(entryValue, entryKey),
            ])
        );
    }

    return value;
}

function write(level, message, meta = {}) {
    if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[getActiveLevel()]) {
        return;
    }

    const entry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        ...normalizeValue(meta),
    };

    const line = `${JSON.stringify(entry)}\n`;
    const stream = level === 'error' ? process.stderr : process.stdout;
    stream.write(line);
}

function createLogger(baseMeta = {}) {
    return {
        debug(message, meta = {}) {
            write('debug', message, { ...baseMeta, ...meta });
        },
        info(message, meta = {}) {
            write('info', message, { ...baseMeta, ...meta });
        },
        warn(message, meta = {}) {
            write('warn', message, { ...baseMeta, ...meta });
        },
        error(message, meta = {}) {
            write('error', message, { ...baseMeta, ...meta });
        },
        child(extraMeta = {}) {
            return createLogger({ ...baseMeta, ...extraMeta });
        },
    };
}

export const logger = createLogger();
