import { describe, expect, it } from 'vitest';
import { createPostContentPayload, inferPostContentFields } from './postContentSource';

describe('createPostContentPayload', () => {
  it('mantiene content canonico junto al html-first', () => {
    const payload = createPostContentPayload('<p>Contenido CMS</p>', 'html');

    expect(payload).toEqual({
      format: 'html',
      content: '<p>Contenido CMS</p>',
      contentHtml: '<p>Contenido CMS</p>',
      legacyMarkdown: '',
    });
  });

  it('respeta markdown legacy cuando no hay html', () => {
    const payload = createPostContentPayload('## Titulo\n\nTexto', 'markdown');

    expect(payload).toEqual({
      format: 'markdown',
      content: '## Titulo\n\nTexto',
      contentHtml: '',
      legacyMarkdown: '## Titulo\n\nTexto',
    });
  });
});

describe('inferPostContentFields', () => {
  it('prioriza contentHtml cuando el post ya fue normalizado', () => {
    const resolved = inferPostContentFields({
      format: 'html',
      content: '<p>Fallback</p>',
      contentHtml: '<p>Canonico</p>',
    });

    expect(resolved.sourceContent).toBe('<p>Canonico</p>');
  });
});
