/**
 * Copia texto al portapapeles con fallback para navegadores antiguos
 * @param {string} text - Texto a copiar
 * @returns {Promise<boolean>} true si se copió exitosamente, false en caso contrario
 */
export async function copyToClipboard(text) {
  if (!text || typeof text !== 'string') {
    return false;
  }

  // Intento moderno: Clipboard API
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.warn('Clipboard API failed, trying fallback:', error);
    }
  }

  // Fallback: document.execCommand (navegadores antiguos)
  if (typeof document !== 'undefined') {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      
      // Seleccionar y copiar
      textarea.select();
      textarea.setSelectionRange(0, text.length);
      const success = document.execCommand('copy');
      
      document.body.removeChild(textarea);
      return success;
    } catch (error) {
      console.error('Fallback clipboard copy failed:', error);
      return false;
    }
  }

  return false;
}

/**
 * Limpia contenido HTML para obtener texto plano listo para copiar
 * @param {string} html - Contenido HTML a limpiar
 * @returns {string} Texto plano limpio
 */
export function cleanCodeContent(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }

  let text = html;

  // Remover tags HTML
  text = text.replace(/<[^>]+>/g, '');

  // Decodificar entidades HTML comunes
  const entities = {
    '&lt;': '<',
    '&gt;': '>',
    '&amp;': '&',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
  };

  Object.entries(entities).forEach(([entity, char]) => {
    text = text.replace(new RegExp(entity, 'g'), char);
  });

  // Decodificar entidades numéricas (&#123; o &#x7B;)
  text = text.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec));
  text = text.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

  // Normalizar whitespace
  text = text.replace(/\r\n/g, '\n'); // Windows -> Unix
  text = text.replace(/\r/g, '\n'); // Old Mac -> Unix
  text = text.replace(/\t/g, '  '); // Tabs -> 2 espacios
  text = text.replace(/ +$/gm, ''); // Trailing spaces por línea
  text = text.replace(/\n{3,}/g, '\n\n'); // Múltiples líneas vacías -> máximo 2

  return text.trim();
}

/**
 * Limpia prefijos de prompt de terminal ($ o >) de código bash
 * @param {string} code - Código con posibles prompts
 * @returns {string} Código limpio sin prompts
 */
export function cleanTerminalPrompts(code) {
  if (!code || typeof code !== 'string') {
    return '';
  }

  return code
    .split('\n')
    .map(line => {
      // Remover $ o > al inicio de la línea (con espacios opcionales)
      return line.replace(/^\s*[$>]\s*/, '');
    })
    .join('\n');
}

/**
 * Extrae texto plano de un elemento DOM (code block)
 * @param {HTMLElement} element - Elemento DOM del que extraer texto
 * @returns {string} Texto plano extraído
 */
export function extractTextFromElement(element) {
  if (!element) {
    return '';
  }

  // Intentar textContent primero (más limpio)
  const textContent = element.textContent || '';
  
  // Si hay HTML interno, limpiar
  if (element.innerHTML && element.innerHTML.includes('<')) {
    return cleanCodeContent(element.innerHTML);
  }

  return textContent.trim();
}
