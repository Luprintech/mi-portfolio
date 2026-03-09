import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FAQ = JSON.parse(readFileSync(join(__dirname, '../data/faqAnswers.json'), 'utf-8'));

/** Minúsculas, sin tildes, sin puntuación, espacios normalizados */
function normalize(str) {
    return str
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[¿¡!?.,;:'"()[\]]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/** Detecta el idioma del mensaje → 'es' | 'en' | 'it' */
function detectLang(message) {
    const norm = normalize(message);
    const words = norm.split(' ');

    const spanishMarkers = [
        'que', 'como', 'cual', 'cuando', 'donde', 'quien', 'cuanto', 'cuantos',
        'tienes', 'eres', 'puedes', 'haces', 'tiene', 'hay', 'hablas', 'sabes',
        'puedo', 'quiero', 'necesito', 'soy', 'tengo', 'vivo', 'estas', 'esta',
        'fue', 'era', 'busco', 'hago', 'hola', 'holi', 'buenas', 'gracias',
        'claro', 'vale', 'bien', 'me', 'te', 'se', 'lo', 'la', 'los', 'las',
        'un', 'una', 'del', 'al', 'por', 'para', 'con', 'sin', 'sobre',
        'tu', 'tus', 'su', 'sus', 'mi', 'mis', 'años', 'edad', 'empresa',
        'trabajo', 'proyectos', 'experiencia', 'salario', 'sueldo',
        'idiomas', 'estudios', 'disponible',
    ];
    const italianMarkers = [
        'sei', 'hai', 'fai', 'puoi', 'parli', 'lavori', 'cosa',
        'come', 'chi', 'dove', 'quando', 'perche', 'quali', 'qual',
        'tuoi', 'miei', 'tuo', 'mio', 'della', 'degli',
    ];

    const hasSpanishAccents = /[áéíóúüñ]/i.test(message);
    const spanishScore = words.filter(w => spanishMarkers.includes(w)).length
        + (hasSpanishAccents ? 2 : 0);
    const italianScore = words.filter(w => italianMarkers.includes(w)).length;

    if (italianScore > spanishScore && italianScore >= 2) return 'it';
    if (spanishScore > 0 || hasSpanishAccents) return 'es';
    return 'en';
}

/**
 * Comprueba si una keyword/frase aparece como palabra completa en el mensaje.
 * Devuelve la longitud del texto coincidente (para puntuar especificidad) o 0.
 */
function termScore(normMessage, term) {
    const normTerm = normalize(term);
    if (!normTerm) return 0;
    const padded = ` ${normMessage} `;
    if (
        padded.includes(` ${normTerm} `) ||
        normMessage === normTerm ||
        normMessage.startsWith(`${normTerm} `) ||
        normMessage.endsWith(` ${normTerm}`)
    ) {
        return normTerm.length;
    }
    return 0;
}

/**
 * Calcula la puntuación total de un intent para el mensaje dado.
 *
 * Fórmula:
 *   score = Σ(keyword_length × weight) + Σ(secondary_keyword_length × 1)
 *
 * Las keywords principales aportan `weight` puntos por carácter coincidente.
 * Las secondary_keywords aportan 1 punto por carácter.
 * La entrada con mayor puntuación gana → frases específicas superan a saludos genéricos.
 */
function scoreEntry(normMessage, entry) {
    const weight = entry.weight ?? 2;

    const keyScore = (entry.keywords ?? []).reduce((acc, kw) => {
        const s = termScore(normMessage, kw);
        return acc + (s > 0 ? s * weight : 0);
    }, 0);

    const secScore = (entry.secondary_keywords ?? []).reduce((acc, kw) => {
        return acc + termScore(normMessage, kw);
    }, 0);

    return keyScore + secScore;
}

/**
 * Busca la mejor respuesta FAQ para el mensaje.
 * @param {string} message
 * @returns {{ matched: boolean, answer?: string, id?: string, score?: number }}
 */
export function matchFaq(message) {
    const norm = normalize(message);
    const lang = detectLang(message);

    let bestEntry = null;
    let bestScore = 0;

    for (const entry of FAQ) {
        const score = scoreEntry(norm, entry);
        if (score > bestScore) {
            bestScore = score;
            bestEntry = entry;
        }
    }

    if (!bestEntry || bestScore === 0) return { matched: false };

    let answer;
    if (lang === 'en') {
        answer = bestEntry.answer_en;
    } else if (lang === 'it') {
        answer = bestEntry.answer_it ?? bestEntry.answer_es;
    } else {
        answer = bestEntry.answer_es;
    }

    return { matched: true, answer, id: bestEntry.id, score: bestScore };
}
