import { describe, expect, it } from 'vitest';

import { ContentButtonExtension } from './extensions';

describe('ContentButtonExtension', () => {
  it('serializa y rehidrata los atributos clave del CTA sin perder configuracion', () => {
    const attributes = ContentButtonExtension.config.addAttributes();
    const element = document.createElement('a');

    element.textContent = 'Descargar dossier';
    element.setAttribute('href', '/posts/documents/dossier.pdf');
    element.setAttribute('target', '_self');
    element.setAttribute('download', 'dossier.pdf');
    element.setAttribute('data-content-button', '');
    element.setAttribute('data-text', 'Descargar dossier');
    element.setAttribute('data-href', 'https://guadalupe.dev/demo');
    element.setAttribute('data-variant', 'dark');
    element.setAttribute('data-new-tab', 'false');
    element.setAttribute('data-bg-color', '#18181b');
    element.setAttribute('data-text-color', '#f8fafc');
    element.setAttribute('data-bold', 'true');
    element.setAttribute('data-italic', 'true');
    element.setAttribute('data-underline', 'true');
    element.setAttribute('data-uppercase', 'true');
    element.setAttribute('data-font-size', '18');
    element.setAttribute('data-rounded', '20');
    element.setAttribute('data-document-url', '/posts/documents/dossier.pdf');
    element.setAttribute('data-document-filename', 'dossier.pdf');
    element.className = 'content-button content-button--dark';
    element.style.background = '#18181b';
    element.style.color = '#f8fafc';
    element.style.fontWeight = '700';
    element.style.fontStyle = 'italic';
    element.style.textDecoration = 'underline';
    element.style.textTransform = 'uppercase';
    element.style.fontSize = '18px';
    element.style.borderRadius = '20px';

    expect(attributes.text.parseHTML(element)).toBe('Descargar dossier');
    expect(attributes.href.parseHTML(element)).toBe('https://guadalupe.dev/demo');
    expect(attributes.variant.parseHTML(element)).toBe('dark');
    expect(attributes.newTab.parseHTML(element)).toBe(false);
    expect(attributes.bgColor.parseHTML(element)).toBe('#18181b');
    expect(attributes.textColor.parseHTML(element)).toBe('#f8fafc');
    expect(attributes.bold.parseHTML(element)).toBe(true);
    expect(attributes.italic.parseHTML(element)).toBe(true);
    expect(attributes.underline.parseHTML(element)).toBe(true);
    expect(attributes.uppercase.parseHTML(element)).toBe(true);
    expect(attributes.fontSize.parseHTML(element)).toBe(18);
    expect(attributes.rounded.parseHTML(element)).toBe(20);
    expect(attributes.documentUrl.parseHTML(element)).toBe('/posts/documents/dossier.pdf');
    expect(attributes.documentFilename.parseHTML(element)).toBe('dossier.pdf');

    const [, htmlAttributes, text] = ContentButtonExtension.config.renderHTML({
      node: {
        attrs: {
          text: 'Descargar dossier',
          href: 'https://guadalupe.dev/demo',
          variant: 'dark',
          newTab: false,
          bgColor: '#18181b',
          textColor: '#f8fafc',
          bold: true,
          italic: true,
          underline: true,
          uppercase: true,
          fontSize: 18,
          rounded: 20,
          documentUrl: '/posts/documents/dossier.pdf',
          documentFilename: 'dossier.pdf',
          textAlign: 'center',
        },
      },
      HTMLAttributes: {},
    });

    expect(text).toBe('Descargar dossier');
    expect(htmlAttributes['data-text']).toBe('Descargar dossier');
    expect(htmlAttributes['data-href']).toBe('https://guadalupe.dev/demo');
    expect(htmlAttributes['data-variant']).toBe('dark');
    expect(htmlAttributes['data-new-tab']).toBe('false');
    expect(htmlAttributes['data-document-url']).toBe('/posts/documents/dossier.pdf');
    expect(htmlAttributes['data-document-filename']).toBe('dossier.pdf');
    expect(htmlAttributes.download).toBe('dossier.pdf');
    expect(htmlAttributes.style).toContain('background:#18181b');
    expect(htmlAttributes.style).toContain('font-size:18px');
    expect(htmlAttributes.style).toContain('border-radius:20px');
    expect(htmlAttributes['data-align']).toBe('center');
  });
});
