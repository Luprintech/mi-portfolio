import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RichBlockFrame from './RichBlockFrame';

describe('RichBlockFrame', () => {
  it('renderiza un affordance de borrado consistente y ejecuta la accion', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    const { container } = render(
      <RichBlockFrame alignment="right" selected onRemove={onRemove}>
        <div>Bloque enriquecido</div>
      </RichBlockFrame>
    );

    await user.click(screen.getByRole('button', { name: 'Eliminar bloque' }));

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(container.querySelector('[data-node-view-wrapper]')).toHaveStyle({
      display: 'flex',
      justifyContent: 'flex-end',
    });
  });

  it('permite una accion secundaria separada del borrado', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const onSecondaryAction = vi.fn();

    render(
      <RichBlockFrame
        selected
        onRemove={onRemove}
        onSecondaryAction={onSecondaryAction}
        secondaryActionLabel="Colapsar panel"
        renderSecondaryIcon={() => (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 12h12" />
          </svg>
        )}
      >
        <div>Bloque enriquecido</div>
      </RichBlockFrame>
    );

    await user.click(screen.getByRole('button', { name: 'Colapsar panel' }));

    expect(onSecondaryAction).toHaveBeenCalledTimes(1);
    expect(onRemove).not.toHaveBeenCalled();
  });
});
