/* @vitest-environment jsdom */
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthModal } from '../components/AuthModal';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
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

    render(<AuthModal isOpen={true} onClose={onClose} />);

    // Use only the visible email/password fields (sign-in form)
    const emailInputs = screen.getAllByPlaceholderText('auth.emailPlaceholder');
    const passwordInputs = screen.getAllByPlaceholderText('auth.passwordPlaceholder');
    await user.type(emailInputs[0], 'test@example.com');
    await user.type(passwordInputs[0], 'password123');
    // Find the visible sign-in button
    const signInButtons = screen.getAllByRole('button', { name: 'auth.signInTitle' });
    await user.click(signInButtons[0]);

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

    render(<AuthModal isOpen={true} onClose={onClose} />);

    // Find and click the sign-in button without filling in the form
    const signInButtons = screen.getAllByRole('button', { name: 'auth.signInTitle' });
    await user.click(signInButtons[0]);

    // Wait for the validation message to appear
    const loginRequiredMessages = await screen.findAllByText((content) => content.includes('auth.loginRequired'));
    expect(loginRequiredMessages.length).toBeGreaterThan(0);

    expect(mockedAuthService.login).not.toHaveBeenCalled();
    expect(fetchUser).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('switches to forgot password form when forgot password is clicked', async () => {
    const user = userEvent.setup();

    render(<AuthModal isOpen={true} onClose={onClose} />);

    const forgotButtons = screen.getAllByRole('button', { name: 'auth.forgotPassword' });
    await user.click(forgotButtons[0]);

    // The forgot password form title may be 'auth.forgotTitle'
    const forgotTitles = screen.queryAllByText((content) => content.includes('auth.forgotTitle'));
    expect(forgotTitles.length).toBeGreaterThan(0);
  });

  it('calls loginWithGoogle when clicking Google button', async () => {
    const user = userEvent.setup();

    render(<AuthModal isOpen={true} onClose={onClose} />);

    // Find the Google button by text content
    const googleButtons = screen.getAllByRole('button');
    const googleButton = googleButtons.find(btn =>
      btn.textContent?.toLowerCase().includes('google')
    );
    if (!googleButton) throw new Error('Google button not found');
    await user.click(googleButton);

    expect(mockedAuthService.loginWithGoogle).toHaveBeenCalledTimes(1);
  });
});