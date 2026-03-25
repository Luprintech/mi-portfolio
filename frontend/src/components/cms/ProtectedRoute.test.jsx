import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider } from '../../context/AuthContext';

const verifyMock = vi.fn();

vi.mock('../../lib/cmsApi', () => ({
  cmsApi: {
    verify: (...args) => verifyMock(...args),
  },
}));

function renderProtectedApp(initialEntries = ['/bitacora/inicio']) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/bitacora" element={<div>Login CMS</div>} />
          <Route
            path="/bitacora/inicio"
            element={(
              <ProtectedRoute>
                <div>Panel protegido</div>
              </ProtectedRoute>
            )}
          />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    sessionStorage.clear();
    verifyMock.mockReset();
  });

  it('redirige a login cuando no hay token en sesion', async () => {
    renderProtectedApp();

    await waitFor(() => {
      expect(screen.getByText('Login CMS')).toBeInTheDocument();
    });

    expect(verifyMock).not.toHaveBeenCalled();
  });

  it('permite entrar al CMS cuando el token almacenado sigue siendo valido', async () => {
    sessionStorage.setItem('cms_token', 'token-valido');
    verifyMock.mockResolvedValue({ valid: true, username: 'guada' });

    renderProtectedApp();

    await waitFor(() => {
      expect(screen.getByText('Panel protegido')).toBeInTheDocument();
    });

    expect(verifyMock).toHaveBeenCalledWith('token-valido');
  });

  it('limpia la sesion y vuelve al login cuando el token expiro o es invalido', async () => {
    sessionStorage.setItem('cms_token', 'token-vencido');
    verifyMock.mockRejectedValue(new Error('Token invalido o expirado'));

    renderProtectedApp();

    await waitFor(() => {
      expect(screen.getByText('Login CMS')).toBeInTheDocument();
    });

    expect(sessionStorage.getItem('cms_token')).toBeNull();
  });
});
