/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useLanguage } from '@/shared/languages';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { authService } from '../services/authService';

vi.mock('../services/authService', () => ({
  authService: { changePassword: vi.fn() },
}));

vi.mock('@/shared/languages', () => ({
  useLanguage: vi.fn(),
}));

const mockedAuthService = vi.mocked(authService);
const mockedUseLanguage = vi.mocked(useLanguage);

describe('ChangePasswordModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseLanguage.mockReturnValue({ t: (key: string) => key } as never);
  });

  it('submits the current and new password to the authenticated endpoint', async () => {
    mockedAuthService.changePassword.mockResolvedValueOnce();

    render(<ChangePasswordModal isOpen onClose={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('auth.oldPassword'), {
      target: { value: 'OldPass123!' },
    });
    fireEvent.change(screen.getByLabelText('auth.newPasswordPlaceholder'), {
      target: { value: 'NewPassword123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'profile.change' }));

    await waitFor(() => {
      expect(mockedAuthService.changePassword).toHaveBeenCalledWith({
        oldPassword: 'OldPass123!',
        newPassword: 'NewPassword123!',
      });
    });
    expect(await screen.findByText('auth.passwordUpdated')).toBeInTheDocument();
  });
});
