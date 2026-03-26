import { useState } from 'react';
import { copyToClipboard } from '../../lib/clipboardUtils';

/**
 * Componente reutilizable para copiar contenido al portapapeles
 * @param {Object} props
 * @param {string} props.content - Contenido a copiar
 * @param {('minimal'|'button')} [props.variant='button'] - Variante visual
 * @param {string} [props.className] - Clases CSS adicionales
 * @param {string} [props.label] - Etiqueta personalizada (default: "Copiar")
 */
export default function CopyButton({ 
  content, 
  variant = 'button',
  className = '',
  label = 'Copiar'
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!content) return;

    const success = await copyToClipboard(content);
    
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const isMinimal = variant === 'minimal';

  if (isMinimal) {
    return (
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? 'Código copiado' : 'Copiar código'}
        className={`copy-button-minimal group inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/5 text-slate-300 transition-all hover:bg-white/10 hover:text-slate-100 ${className}`}
        title={copied ? '¡Copiado!' : label}
      >
        {copied ? (
          <svg 
            className="h-4 w-4 text-green-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        ) : (
          <svg 
            className="h-4 w-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
            />
          </svg>
        )}
      </button>
    );
  }

  // Variant: 'button' (default)
  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Código copiado' : 'Copiar código'}
      className={`copy-button inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-all hover:bg-white/10 ${
        copied ? 'border-green-500/30 bg-green-500/10 text-green-300' : ''
      } ${className}`}
    >
      {copied ? (
        <>
          <svg 
            className="h-3.5 w-3.5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
          <span>¡Copiado!</span>
        </>
      ) : (
        <>
          <svg 
            className="h-3.5 w-3.5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
            />
          </svg>
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
