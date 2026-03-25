import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CodeBlock from './CodeBlock';

let writeTextMock;

describe('CodeBlock', () => {
  beforeEach(() => {
    writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: writeTextMock,
      },
    });
  });

  it('renderiza metadata tecnica y variante terminal', () => {
    render(
      <CodeBlock
        code="npm run lint"
        language="bash"
        filename="terminal"
        title="Chequeos rapidos"
        variant="terminal"
      />
    );

    expect(screen.getByText('Terminal')).toBeInTheDocument();
    expect(screen.getByText('terminal')).toBeInTheDocument();
    expect(screen.getByText('Chequeos rapidos')).toBeInTheDocument();
  });

  it('copia el contenido del bloque', async () => {
    const user = userEvent.setup();

    render(
      <CodeBlock
        code="npm run lint"
        language="bash"
      />
    );

    await user.click(screen.getByRole('button', { name: 'Copiar' }));

    expect(screen.getByRole('button', { name: 'Copiado' })).toBeInTheDocument();
  });
});
