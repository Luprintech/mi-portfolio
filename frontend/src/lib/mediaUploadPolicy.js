const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'];
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.webm'];
const DOCUMENT_EXTENSIONS = ['.pdf', '.zip', '.doc', '.docx'];

export const IMAGE_MAX_SIZE = 5 * 1024 * 1024;
export const AUDIO_MAX_SIZE = 20 * 1024 * 1024;
export const DOCUMENT_MAX_SIZE = 20 * 1024 * 1024;

function getFileExtension(filename = '') {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1) return '';
    return filename.slice(lastDot).toLowerCase();
}

function hasAllowedExtension(file, allowedExtensions) {
    const ext = getFileExtension(file?.name);
    return allowedExtensions.includes(ext);
}

export const IMAGE_INPUT_ACCEPT = IMAGE_EXTENSIONS.join(',');
export const IMAGE_UPLOAD_LABEL = 'JPG, PNG, GIF, WebP, AVIF';

export const AUDIO_INPUT_ACCEPT = AUDIO_EXTENSIONS.join(',');
export const DOCUMENT_INPUT_ACCEPT = DOCUMENT_EXTENSIONS.join(',');
export const DOCUMENT_UPLOAD_LABEL = 'PDF, ZIP, DOC o DOCX';

function formatMaxSize(sizeInBytes) {
    return `${Math.round(sizeInBytes / (1024 * 1024))} MB`;
}

export function validateImageFile(file) {
    if (!file) return 'No se ha seleccionado ninguna imagen.';
    if (!hasAllowedExtension(file, IMAGE_EXTENSIONS)) {
        return 'Formato de imagen no permitido. Usa JPG, PNG, GIF, WebP o AVIF.';
    }
    if (file.type && !file.type.startsWith('image/')) {
        return 'El fichero seleccionado no parece ser una imagen válida.';
    }
    if (file.size > IMAGE_MAX_SIZE) {
        return `La imagen supera el limite de ${formatMaxSize(IMAGE_MAX_SIZE)}.`;
    }
    return '';
}

export function validateAudioFile(file) {
    if (!file) return 'No se ha seleccionado ningún audio.';
    if (!hasAllowedExtension(file, AUDIO_EXTENSIONS)) {
        return 'Formato de audio no permitido. Usa MP3, WAV, OGG, M4A, AAC, FLAC o WebM.';
    }
    if (file.type && !file.type.startsWith('audio/')) {
        return 'El fichero seleccionado no parece ser un audio válido.';
    }
    if (file.size > AUDIO_MAX_SIZE) {
        return `El audio supera el limite de ${formatMaxSize(AUDIO_MAX_SIZE)}.`;
    }
    return '';
}

export function validateDocumentFile(file) {
    if (!file) return 'No se ha seleccionado ningún documento.';
    if (!hasAllowedExtension(file, DOCUMENT_EXTENSIONS)) {
        return 'Tipo de documento no permitido. Solo PDF, ZIP, DOC y DOCX.';
    }
    if (file.size > DOCUMENT_MAX_SIZE) {
        return `El documento supera el limite de ${formatMaxSize(DOCUMENT_MAX_SIZE)}.`;
    }
    return '';
}
