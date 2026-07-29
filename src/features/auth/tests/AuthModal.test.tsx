/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthModal } from '../components/AuthModal';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../stores/authStore';
import { UserRole } from '../types/auth.types';
import { useLanguage } from '../../../shared/languages';

vi.mock('../services/authService', () => ({
  authService: {
    login: vi.fn(),
    loginWithGoogle: vi.fn(),
  },
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../../shared/languages', () => ({
  useLanguage: vi.fn(),
}));

const mockedAuthService = vi.mocked(authService);
const mockedUseAuth = vi.mocked(useAuth);
const mockedUseLanguage = vi.mocked(useLanguage);

describe('AuthModal integration', () => {
  const onClose = vi.fn();
  const fetchUser = vi.fn();

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();

    mockedUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      fetchUser,
      logout: vi.fn(),
    });

    mockedUseLanguage.mockReturnValue({
      t: (key: string) => key,
      language: 'en',
      setLanguage: vi.fn(),
    } as never);
  });

  it('submits login form, fetches user and closes modal on success', async () => {
    const user = userEvent.setup();

    mockedAuthService.login.mockResolvedValueOnce({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresAt: '2026-01-01T00:00:00.000Z',
    });
    fetchUser.mockImplementation(async () => {
      const profile = {
        id: '1',
        fullName: 'Test User',
        email: 'test@example.com',
        location: '',
        title: '',
        role: UserRole.CANDIDATE,
        createdAt: '2026-01-01T00:00:00.000Z',
      };
      useAuthStore.getState().setUser(profile);
      return profile;
    });

    render(
      <MemoryRouter>
        <AuthModal isOpen={true} onClose={onClose} />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText('auth.emailPlaceholder'), 'test@example.com');
    await user.type(screen.getByLabelText('auth.passwordPlaceholder'), 'password123');
    await user.click(screen.getByRole('button', { name: 'auth.signInTitle' }));

    await waitFor(() => {
      expect(mockedAuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(fetchUser).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText('auth.loginSuccess')).toBeInTheDocument();
  });

  it('shows validation message when submitting empty login form', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AuthModal isOpen={true} onClose={onClose} />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'auth.signInTitle' }));

    expect(await screen.findByText('auth.loginRequired')).toBeInTheDocument();
    expect(mockedAuthService.login).not.toHaveBeenCalled();
    expect(fetchUser).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('switches to forgot password form when forgot password is clicked', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AuthModal isOpen={true} onClose={onClose} />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'auth.forgotPassword' }));

    expect(await screen.findByText('auth.forgotTitle')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'auth.signInTitle' })).not.toBeInTheDocument();
    });
  });

  it('calls loginWithGoogle when clicking Google button', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AuthModal isOpen={true} onClose={onClose} />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'auth.continueWithGoogle' }));

    expect(mockedAuthService.loginWithGoogle).toHaveBeenCalledTimes(1);
  });

  it('keeps a single email field in the accessibility tree on login', () => {
    render(
      <MemoryRouter>
        <AuthModal isOpen={true} onClose={onClose} />
      </MemoryRouter>,
    );

    expect(screen.getAllByLabelText('auth.emailPlaceholder')).toHaveLength(1);
    expect(screen.getAllByLabelText('auth.passwordPlaceholder')).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'auth.signInTitle' })).toHaveLength(1);
  });
});
