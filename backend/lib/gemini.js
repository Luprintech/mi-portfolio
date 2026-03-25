/**
 * Singleton del cliente Gemini.
 *
 * GoogleGenerativeAI y el modelo se inicializan una única vez al primer uso.
 * Esto evita crear una nueva instancia por request y permite que la SDK
 * reutilice conexiones HTTP subyacentes.
 *
 * Si GEMINI_API_KEY no está definida en el momento de la llamada se devuelve
 * null para que el caller pueda responder con 503 de forma controlada.
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SYSTEM_PROMPT } from '../data/systemPrompt.js';

let _genAI = null;
let _model = null;

/**
 * Devuelve el modelo Gemini compartido.
 * @returns {import('@google/generative-ai').GenerativeModel | null}
 */
export function getGeminiModel() {
    if (!process.env.GEMINI_API_KEY) return null;

    if (!_model) {
        _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        _model = _genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: SYSTEM_PROMPT,
        });
    }

    return _model;
}
