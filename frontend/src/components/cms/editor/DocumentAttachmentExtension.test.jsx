import { describe, expect, it } from 'vitest';

import { DocumentAttachmentExtension } from './extensions';

describe('DocumentAttachmentExtension', () => {
  it('serializa y rehidrata data-embed-width para embeds PDF del CMS', () => {
    const attributes = DocumentAttachmentExtension.config.addAttributes();
    const element = document.createElement('div');

    element.setAttribute('data-embed-width', '960');

    expect(attributes.embedWidth.parseHTML(element)).toBe(960);

    const [, htmlAttributes] = DocumentAttachmentExtension.config.renderHTML({
      node: {
        attrs: {
          src: '/posts/documents/guia.pdf',
          filename: 'guia.pdf',
          fileType: 'pdf',
          displayMode: 'embed',
          embedHeight: 640,
          embedWidth: 960,
          textAlign: 'left',
        },
      },
      HTMLAttributes: {},
    });

    expect(htmlAttributes['data-embed-width']).toBe('960');
    expect(htmlAttributes.style).toContain('width:960px;max-width:100%');
  });
});
