import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { AuthTokensResponse } from '../types/auth.types';
import { useAuth } from './useAuth';
import { useAuthStore } from '../stores/authStore';
import { resolvePostLoginPath } from '../utils/getPostLoginPath';

export function useRegisterFlow(onRegisterSuccess: () => void) {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchUser } = useAuth();
  const redirectFrom = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;

  const completeRegistration = useCallback(
    async (result: AuthTokensResponse, email: string) => {
      if (result.mfaRequired) {
        onRegisterSuccess();
        navigate('/mfa', {
          replace: true,
          state: { mfaToken: result.mfaToken, email: email.trim(), from: redirectFrom },
        });
        return;
      }

      if (result.emailVerificationRequired) {
        onRegisterSuccess();
        navigate(`/verify-email?email=${encodeURIComponent(email.trim())}`, { replace: true });
        return;
      }

      await fetchUser();
      const currentUser = useAuthStore.getState().user;
      if (!currentUser) {
        throw new Error('PROFILE_LOAD_FAILED');
      }

      onRegisterSuccess();
      navigate(resolvePostLoginPath(currentUser.role, redirectFrom), { replace: true });
    },
    [fetchUser, navigate, onRegisterSuccess, redirectFrom],
  );

  return { completeRegistration };
}
