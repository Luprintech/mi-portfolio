import { describe, expect, it, beforeEach, vi } from 'vitest';
import { copyToClipboard, cleanCodeContent, cleanTerminalPrompts, extractTextFromElement } from './clipboardUtils';

describe('clipboardUtils', () => {
  describe('copyToClipboard', () => {
    beforeEach(() => {
      // Mock clipboard API
      Object.defineProperty(window.navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
      });
    });

    it('copia texto usando Clipboard API', async () => {
      const text = 'const foo = "bar";';
      const result = await copyToClipboard(text);
      
      expect(result).toBe(true);
      expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith(text);
    });

    it('retorna false con texto vacio', async () => {
      const result = await copyToClipboard('');
      expect(result).toBe(false);
    });

    it('retorna false con texto no-string', async () => {
      const result = await copyToClipboard(null);
      expect(result).toBe(false);
    });
  });

  describe('cleanCodeContent', () => {
    it('remueve tags HTML', () => {
      const html = '<span class="hljs-keyword">const</span> foo = "bar";';
      const result = cleanCodeContent(html);
      expect(result).toBe('const foo = "bar";');
    });

    it('decodifica entidades HTML comunes', () => {
      const html = 'if (a &lt; b &amp;&amp; c &gt; d) { return &quot;ok&quot;; }';
      const result = cleanCodeContent(html);
      expect(result).toBe('if (a < b && c > d) { return "ok"; }');
    });

    it('decodifica entidades numericas', () => {
      const html = 'Symbol: &#123; and &#x7D;';
      const result = cleanCodeContent(html);
      expect(result).toBe('Symbol: { and }');
    });

    it('normaliza whitespace', () => {
      const html = 'line1  \r\n\r\nline2\r\n\n\n\nline3';
      const result = cleanCodeContent(html);
      expect(result).toBe('line1\n\nline2\n\nline3');
    });

    it('convierte tabs a espacios', () => {
      const html = 'if (true) {\n\tconsole.log("test");\n}';
      const result = cleanCodeContent(html);
      expect(result).toBe('if (true) {\n  console.log("test");\n}');
    });

    it('retorna string vacio con entrada invalida', () => {
      expect(cleanCodeContent('')).toBe('');
      expect(cleanCodeContent(null)).toBe('');
      expect(cleanCodeContent(undefined)).toBe('');
    });
  });

  describe('cleanTerminalPrompts', () => {
    it('remueve $ al inicio de lineas', () => {
      const code = '$ npm install\n$ npm run dev';
      const result = cleanTerminalPrompts(code);
      expect(result).toBe('npm install\nnpm run dev');
    });

    it('remueve > al inicio de lineas', () => {
      const code = '> git status\n> git add .';
      const result = cleanTerminalPrompts(code);
      expect(result).toBe('git status\ngit add .');
    });

    it('preserva $ en medio de lineas', () => {
      const code = 'export API_KEY=$SECRET';
      const result = cleanTerminalPrompts(code);
      expect(result).toBe('export API_KEY=$SECRET');
    });

    it('maneja espacios antes del prompt', () => {
      const code = '  $ npm test\n $ npm build';
      const result = cleanTerminalPrompts(code);
      expect(result).toBe('npm test\nnpm build');
    });

    it('retorna string vacio con entrada invalida', () => {
      expect(cleanTerminalPrompts('')).toBe('');
      expect(cleanTerminalPrompts(null)).toBe('');
    });
  });

  describe('extractTextFromElement', () => {
    it('extrae textContent de elemento simple', () => {
      const div = document.createElement('div');
      div.textContent = 'Hello World';
      
      const result = extractTextFromElement(div);
      expect(result).toBe('Hello World');
    });

    it('limpia HTML cuando hay innerHTML', () => {
      const div = document.createElement('div');
      div.innerHTML = '<span>Hello</span> <strong>World</strong>';
      
      const result = extractTextFromElement(div);
      expect(result).toBe('Hello World');
    });

    it('retorna string vacio con elemento null', () => {
      const result = extractTextFromElement(null);
      expect(result).toBe('');
    });

    it('extrae codigo de bloque pre/code', () => {
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.textContent = 'const x = 42;';
      pre.appendChild(code);
      
      const result = extractTextFromElement(code);
      expect(result).toBe('const x = 42;');
    });
  });
});
