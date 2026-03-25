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
});
