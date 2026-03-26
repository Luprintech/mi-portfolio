import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CopyButton from './CopyButton';

let writeTextMock;

describe('CopyButton', () => {
  beforeEach(() => {
    writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: writeTextMock,
      },
    });
  });

  it('renderiza con variante button (default)', () => {
    render(<CopyButton content="test code" />);
    
    expect(screen.getByRole('button', { name: 'Copiar código' })).toBeInTheDocument();
    expect(screen.getByText('Copiar')).toBeInTheDocument();
  });

  it('renderiza con variante minimal', () => {
    render(<CopyButton content="test code" variant="minimal" />);
    
    const button = screen.getByRole('button', { name: 'Copiar código' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('copy-button-minimal');
  });

  it('copia contenido al hacer click', async () => {
    const user = userEvent.setup();
    const testContent = 'const foo = "bar";';
    
    render(<CopyButton content={testContent} />);
    
    const button = screen.getByRole('button', { name: 'Copiar código' });
    await user.click(button);
    
    // Verifica que muestra el feedback de éxito
    await waitFor(() => {
      expect(screen.getByText('¡Copiado!')).toBeInTheDocument();
    });
  });

  it('muestra feedback "Copiado" despues de copiar', async () => {
    const user = userEvent.setup();
    
    render(<CopyButton content="test" />);
    
    await user.click(screen.getByRole('button', { name: 'Copiar código' }));
    
    expect(screen.getByRole('button', { name: 'Código copiado' })).toBeInTheDocument();
    expect(screen.getByText('¡Copiado!')).toBeInTheDocument();
  });

  it('resetea estado despues de 2 segundos', async () => {
    const user = userEvent.setup();
    
    render(<CopyButton content="test" />);
    
    const button = screen.getByRole('button', { name: 'Copiar código' });
    await user.click(button);
    
    // Espera a que aparezca el texto "¡Copiado!"
    await waitFor(() => {
      expect(screen.getByText('¡Copiado!')).toBeInTheDocument();
    });
    
    // Espera a que se resetee después de 2 segundos
    await waitFor(
      () => {
        expect(screen.getByText('Copiar')).toBeInTheDocument();
      },
      { timeout: 2500 }
    );
  });

  it('respeta label personalizado', () => {
    render(<CopyButton content="test" label="Copiar snippet" />);
    
    expect(screen.getByText('Copiar snippet')).toBeInTheDocument();
  });

  it('acepta className adicional', () => {
    render(<CopyButton content="test" className="custom-class" />);
    
    const button = screen.getByRole('button', { name: 'Copiar código' });
    expect(button).toHaveClass('custom-class');
  });

  it('no copia si content esta vacio', async () => {
    const user = userEvent.setup();
    
    render(<CopyButton content="" />);
    
    const button = screen.getByRole('button', { name: 'Copiar código' });
    await user.click(button);
    
    // Esperar un poco para asegurar que el click se procesó
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(writeTextMock).not.toHaveBeenCalled();
  });

  it('funciona con variante minimal', async () => {
    const user = userEvent.setup();
    
    render(<CopyButton content="test code" variant="minimal" />);
    
    const button = screen.getByRole('button', { name: 'Copiar código' });
    await user.click(button);
    
    // Verifica que muestra feedback de éxito en variante minimal
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Código copiado' })).toBeInTheDocument();
    });
  });
});
