import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../src/context/AuthContext';
import Login from '../src/pages/Login';
import Register from '../src/pages/Register';
import ProfilePage from '../src/pages/Profile';
import { HashRouter } from 'react-router-dom';
import { apiClient } from '../src/services/api/client';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Frontend Auth & Profile UI', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders Login form and handles submission', async () => {
    const loginSpy = vi.spyOn(apiClient, 'login').mockResolvedValueOnce({
      user: { id: 'u-1', email: 'test@example.com' },
      token: 'mock-jwt-token',
    });

    render(
      <AuthProvider>
        <HashRouter>
          <Login />
        </HashRouter>
      </AuthProvider>,
    );

    expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'Password123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(loginSpy).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!',
      });
      expect(localStorage.getItem('cvmaker_token')).toBe('mock-jwt-token');
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });
  });

  it('validates password length and match in Register form', () => {
    render(
      <AuthProvider>
        <HashRouter>
          <Register />
        </HashRouter>
      </AuthProvider>,
    );

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'new@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^contraseña/i), {
      target: { value: 'short' },
    });
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), {
      target: { value: 'short' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Crear Cuenta' }));

    expect(screen.getByText('La contraseña debe tener al menos 8 caracteres.')).toBeInTheDocument();

    // Check mismatch
    fireEvent.change(screen.getByLabelText(/^contraseña/i), {
      target: { value: 'Password123!' },
    });
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), {
      target: { value: 'MismatchPassword!' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Crear Cuenta' }));

    expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument();
  });

  it('loads profile and updates profile fields', async () => {
    vi.spyOn(apiClient, 'getProfile').mockResolvedValueOnce({
      profile: {
        id: 'p-1',
        userId: 'u-1',
        fullName: 'Ana Gómez',
        headline: 'Lead Architect',
        phone: '123456',
        location: 'Bogotá',
        bio: 'Mi bio',
        photoUrl: null,
        links: [{ label: 'GitHub', url: 'https://github.com/ana' }],
      },
    });

    const updateSpy = vi.spyOn(apiClient, 'updateProfile').mockResolvedValueOnce({
      profile: {
        id: 'p-1',
        userId: 'u-1',
        fullName: 'Ana María Gómez',
        headline: 'Lead Architect',
        phone: '123456',
        location: 'Bogotá',
        bio: 'Mi bio',
        photoUrl: null,
        links: [{ label: 'GitHub', url: 'https://github.com/ana' }],
      },
    });

    function TestProfileWrapper() {
      return <ProfilePage />;
    }

    render(
      <AuthProvider>
        <HashRouter>
          <TestProfileWrapper />
        </HashRouter>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Ana Gómez')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Lead Architect')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByDisplayValue('Ana Gómez'), {
      target: { value: 'Ana María Gómez' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Guardar Cambios' }));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ fullName: 'Ana María Gómez' }),
      );
      expect(screen.getByText('Perfil actualizado exitosamente.')).toBeInTheDocument();
    });
  });
});
