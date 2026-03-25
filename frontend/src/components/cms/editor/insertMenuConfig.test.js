import { describe, expect, it } from 'vitest';

import { filterInsertMenuItems, groupInsertMenuItems, INSERT_MENU_ITEMS, PLUS_MENU_ITEMS } from './insertMenuConfig';

describe('insertMenuConfig', () => {
  it('deja en el boton + solo herramientas fuera de la toolbar principal', () => {
    expect(PLUS_MENU_ITEMS).toEqual(INSERT_MENU_ITEMS.filter(item => item.toolbar !== 'primary'));
    expect(PLUS_MENU_ITEMS.every(item => item.toolbar !== 'primary')).toBe(true);

    expect(PLUS_MENU_ITEMS.map(item => item.action)).toEqual(expect.arrayContaining([
      'terminal',
      'imageGrid',
      'document',
      'accordion',
      'contentButton',
      'callout-tip',
      'mermaid-flowchart',
    ]));

    expect(PLUS_MENU_ITEMS.map(item => item.action)).not.toEqual(expect.arrayContaining([
      'bulletList',
      'image',
      'table',
      'emoji',
    ]));
  });

  it('filtra y agrupa herramientas extra por texto visible', () => {
    const filtered = filterInsertMenuItems(PLUS_MENU_ITEMS, 'documento');
    const grouped = groupInsertMenuItems(filtered);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].action).toBe('document');
    expect(Object.keys(grouped)).toEqual(['Media']);
    expect(grouped.Media[0].title).toBe('PDF / Documento');
  });
});
