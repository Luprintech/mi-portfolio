/**
 * chatStatsStore — store en memoria para estadísticas del chat.
 *
 * Los datos viven mientras el proceso del servidor esté activo.
 * Se pierden al reiniciar — es un tradeoff consciente para evitar
 * dependencias adicionales (DB, Redis, archivos).
 *
 * Estructura de cada evento:
 *   { ts, ip, messageLength, historyLength, outcome, replyLength? }
 */

const MAX_EVENTS = 1000; // cap para evitar consumo ilimitado de RAM

/** @type {Array<{ts:string, ip:string, messageLength:number, historyLength:number, outcome:string, replyLength?:number}>} */
const events = [];

/**
 * Registra una interacción del chat.
 * @param {{ ip: string, messageLength: number, historyLength: number, outcome: string, replyLength?: number }} entry
 */
export function recordChatEvent(entry) {
    if (events.length >= MAX_EVENTS) {
        events.shift(); // descarta el más antiguo (FIFO)
    }
    events.push({
        ts: new Date().toISOString(),
        ip: entry.ip ?? 'unknown',
        messageLength: entry.messageLength ?? 0,
        historyLength: entry.historyLength ?? 0,
        outcome: entry.outcome ?? 'unknown',
        ...(entry.replyLength != null ? { replyLength: entry.replyLength } : {}),
    });
}

/**
 * Devuelve un resumen agregado de los eventos almacenados.
 */
export function getChatStats() {
    const total = events.length;
    if (total === 0) {
        return {
            total: 0,
            byOutcome: {},
            uniqueIps: 0,
            recentEvents: [],
            serverUpSince: null,
        };
    }

    // Conteo por outcome
    const byOutcome = {};
    for (const e of events) {
        byOutcome[e.outcome] = (byOutcome[e.outcome] ?? 0) + 1;
    }

    // IPs únicas
    const uniqueIps = new Set(events.map(e => e.ip)).size;

    // Eventos por hora (últimas 24h)
    const now = Date.now();
    const byHour = {};
    for (const e of events) {
        const diffH = Math.floor((now - new Date(e.ts).getTime()) / 3_600_000);
        if (diffH < 24) {
            const label = `h-${diffH}`;
            byHour[label] = (byHour[label] ?? 0) + 1;
        }
    }

    // Últimos 20 eventos para la tabla (más recientes primero)
    const recentEvents = events.slice(-20).reverse();

    return {
        total,
        byOutcome,
        uniqueIps,
        byHour,
        recentEvents,
        serverUpSince: events[0]?.ts ?? null,
    };
}
