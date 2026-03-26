import { describe, expect, it, vi } from 'vitest';

import { MERMAID_TEMPLATES } from './diagramConfig';
import {
  filterInsertMenuItems,
  groupInsertMenuItems,
  INSERT_MENU_ITEMS,
  PLUS_MENU_ITEMS,
  runInsertMenuEditorActionWithOptions,
} from './insertMenuConfig';

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

  it('ejecuta el CTA del menu slash en una sola transaccion con el mismo comando del editor', () => {
    const chain = {
      focus: vi.fn(),
      deleteRange: vi.fn(),
      insertContentButton: vi.fn(),
      run: vi.fn(() => true),
    };

    chain.focus.mockReturnValue(chain);
    chain.deleteRange.mockReturnValue(chain);
    chain.insertContentButton.mockReturnValue(chain);

    const editor = { chain: vi.fn(() => chain) };
    const slashRange = { from: 10, to: 14 };

    const result = runInsertMenuEditorActionWithOptions(editor, 'contentButton', { range: slashRange });

    expect(result).toBe(true);
    expect(editor.chain).toHaveBeenCalledTimes(1);
    expect(chain.focus).toHaveBeenCalledTimes(1);
    expect(chain.deleteRange).toHaveBeenCalledWith(slashRange);
    expect(chain.insertContentButton).toHaveBeenCalledTimes(1);
    expect(chain.run).toHaveBeenCalledTimes(1);
  });

  it('usa la misma plantilla Mermaid para los menus del editor', () => {
    const chain = {
      focus: vi.fn(),
      insertMermaid: vi.fn(),
      run: vi.fn(() => true),
    };

    chain.focus.mockReturnValue(chain);
    chain.insertMermaid.mockReturnValue(chain);

    const editor = { chain: vi.fn(() => chain) };

    const result = runInsertMenuEditorActionWithOptions(editor, 'mermaid-graph');

    expect(result).toBe(true);
    expect(chain.insertMermaid).toHaveBeenCalledWith(MERMAID_TEMPLATES.graph);
    expect(chain.run).toHaveBeenCalledTimes(1);
  });
});
