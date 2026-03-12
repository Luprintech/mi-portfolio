const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'];
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.webm'];

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

export function validateImageFile(file) {
    if (!file) return 'No se ha seleccionado ninguna imagen.';
    if (!hasAllowedExtension(file, IMAGE_EXTENSIONS)) {
        return 'Formato de imagen no permitido. Usa JPG, PNG, GIF, WebP o AVIF.';
    }
    if (file.type && !file.type.startsWith('image/')) {
        return 'El fichero seleccionado no parece ser una imagen válida.';
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
    return '';
}
