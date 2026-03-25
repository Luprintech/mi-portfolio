import { useMemo, useState } from 'react';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import css from 'highlight.js/lib/languages/css';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import go from 'highlight.js/lib/languages/go';
import html from 'highlight.js/lib/languages/xml';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import php from 'highlight.js/lib/languages/php';
import python from 'highlight.js/lib/languages/python';
import ruby from 'highlight.js/lib/languages/ruby';
import rust from 'highlight.js/lib/languages/rust';
import sql from 'highlight.js/lib/languages/sql';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';
import 'highlight.js/styles/github-dark.css';

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('sh', bash);
hljs.registerLanguage('zsh', bash);
hljs.registerLanguage('powershell', bash);
hljs.registerLanguage('cmd', bash);
hljs.registerLanguage('c', c);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('css', css);
hljs.registerLanguage('docker', dockerfile);
hljs.registerLanguage('dockerfile', dockerfile);
hljs.registerLanguage('go', go);
hljs.registerLanguage('html', html);
hljs.registerLanguage('java', java);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('php', php);
hljs.registerLanguage('python', python);
hljs.registerLanguage('ruby', ruby);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('yaml', yaml);

const TERMINAL_LANGUAGES = new Set(['bash', 'shell', 'sh', 'zsh', 'powershell', 'cmd']);

function normalizeLanguage(language = '') {
  return String(language || '').trim().toLowerCase();
}

function resolveVariant(variant, language) {
  if (variant === 'terminal' || variant === 'plain') return variant;
  return TERMINAL_LANGUAGES.has(normalizeLanguage(language)) ? 'terminal' : 'plain';
}

function getLanguageLabel(language = '') {
  const normalized = normalizeLanguage(language);
  if (!normalized) return 'Plain text';
  return normalized === 'bash' ? 'Bash' : normalized;
}

function highlightCode(code, language) {
  const normalized = normalizeLanguage(language);
  if (normalized && hljs.getLanguage(normalized)) {
    return hljs.highlight(code, { language: normalized }).value;
  }
  return hljs.highlightAuto(code).value;
}

async function copyCodeToClipboard(code) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(code);
    return;
  }

  if (typeof document === 'undefined') {
    throw new Error('Clipboard no disponible.');
  }

  const textarea = document.createElement('textarea');
  textarea.value = code;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

export default function CodeBlock({
  code = '',
  language = '',
  filename = '',
  title = '',
  variant = 'plain',
}) {
  const [copyState, setCopyState] = useState('idle');
  const resolvedVariant = resolveVariant(variant, language);
  const resolvedLanguage = normalizeLanguage(language);
  const highlightedCode = useMemo(() => highlightCode(code, resolvedLanguage), [code, resolvedLanguage]);
  const showChrome = resolvedVariant === 'terminal';

  async function handleCopy() {
    try {
      await copyCodeToClipboard(code);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('error');
      window.setTimeout(() => setCopyState('idle'), 1800);
    }
  }

  return (
    <section className="terminal-window relative mb-8 overflow-hidden rounded-[1.25rem] border border-[var(--border-default)]" data-rendered-block="code">
      <div className={`flex flex-wrap items-center justify-between gap-3 border-b border-white/5 px-4 py-3 ${showChrome ? 'terminal-window__header' : 'bg-[var(--bg-code-header)]/85'}`}>
        <div className="flex min-w-0 items-center gap-3">
          {showChrome && (
            <div className="flex items-center gap-2" aria-hidden="true">
              <span className="h-3 w-3 rounded-full bg-red-500/80" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <span className="h-3 w-3 rounded-full bg-green-500/80" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-400">
              <span>{showChrome ? 'Terminal' : 'Snippet'}</span>
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-[0.62rem] text-slate-300">{getLanguageLabel(resolvedLanguage)}</span>
              {filename ? <span className="truncate text-slate-200 normal-case tracking-normal">{filename}</span> : null}
            </div>
            {title ? <p className="mt-1 truncate text-sm font-medium text-slate-100">{title}</p> : null}
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/10"
        >
          <span>{copyState === 'copied' ? 'Copiado' : copyState === 'error' ? 'Error' : 'Copiar'}</span>
        </button>
      </div>

      <pre className="terminal-window__body overflow-x-auto bg-[var(--bg-code)] p-5">
        <code
          className={`hljs language-${resolvedLanguage || 'plaintext'} block text-sm leading-7`}
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </pre>
    </section>
  );
}
