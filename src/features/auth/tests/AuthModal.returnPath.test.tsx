/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthModal } from '../components/AuthModal';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../stores/authStore';
import { UserRole, type UserRoleType } from '../types/auth.types';
import { useLanguage } from '../../../shared/languages';

vi.mock('../services/authService', () => ({
  authService: { forgotPassword: vi.fn(), verifyOtp: vi.fn(), resetPassword: vi.fn(), login: vi.fn(), loginWithGoogle: vi.fn() },
}));
vi.mock('../hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('../../../shared/languages', () => ({ useLanguage: vi.fn() }));

const mockedAuthService = vi.mocked(authService);
const mockedUseAuth = vi.mocked(useAuth);
const mockedUseLanguage = vi.mocked(useLanguage);

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname + location.search}</output>;
}

/**
 * Khe nối SignInForm → getRequestedReturnPath → navigate. Helper có test riêng, nhưng nếu form truyền
 * nhầm (vd `pathname + search` ⇒ quay lại kèm `?auth=login` ⇒ modal mở lại ngay) hoặc bỏ qua helper
 * thì test helper vẫn xanh — chỉ test này đỏ.
 */
describe('AuthModal · đăng nhập từ header trên trang mời quay lại đúng trang', () => {
  const fetchUser = vi.fn();

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockedUseAuth.mockReturnValue({ user: null, isAuthenticated: false, isLoading: false, fetchUser, logout: vi.fn() });
    mockedUseLanguage.mockReturnValue({ t: (key: string) => key, language: 'vi', setLanguage: vi.fn() } as never);
    mockedAuthService.login.mockResolvedValue({ accessToken: 'a', refreshToken: 'r', expiresAt: '2026-01-01T00:00:00.000Z' });
  });

  async function loginAs(role: UserRoleType, initialEntry: string) {
    fetchUser.mockImplementation(async () => {
      const profile = { id: '1', fullName: 'U', email: 'u@x.vn', location: '', title: '', role, createdAt: '2026-01-01T00:00:00.000Z' };
      useAuthStore.getState().setUser(profile);
      return profile;
    });
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="*" element={<><AuthModal isOpen onClose={() => undefined} /><LocationProbe /></>} />
        </Routes>
      </MemoryRouter>,
    );
    await user.type(screen.getByLabelText('auth.emailPlaceholder'), 'u@x.vn');
    await user.type(screen.getByLabelText('auth.passwordPlaceholder'), 'password123');
    await user.click(screen.getByRole('button', { name: 'auth.signInTitle' }));
    await waitFor(() => expect(fetchUser).toHaveBeenCalledTimes(1));
  }

  it('ứng viên đăng nhập trên /invite/<token>?auth=login ⇒ về /invite/<token>, KHÔNG kèm ?auth=login', async () => {
    await loginAs(UserRole.CANDIDATE, '/invite/abc?auth=login');
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/invite/abc'));
    expect(screen.getByTestId('location').textContent).toBe('/invite/abc');
  });

  it('employer đăng nhập trên trang mời ⇒ vẫn về dashboard employer (gác theo vai)', async () => {
    await loginAs(UserRole.ORG_ADMIN, '/invite/abc?auth=login');
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/employer/dashboard'));
  });

  it('đăng nhập trên trang marketing /enterprise ⇒ về nhà theo vai như cũ', async () => {
    await loginAs(UserRole.ORG_ADMIN, '/enterprise?auth=login');
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/employer/dashboard'));
  });
});
