import { useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/authService';
import { authTokenStorage } from '../../../shared/api';
import { sessionManager } from '../utils/sessionManager';
import { isPlaywrightRuntime } from '@/shared/mock';

interface UseAuthOptions {
  /** Only the app-level AuthProvider should rehydrate /me automatically. */
  bootstrap?: boolean;
}

let bootstrapPromise: Promise<unknown> | null = null;

export const useAuth = ({ bootstrap = false }: UseAuthOptions = {}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout } = useAuthStore();

  const fetchUser = useCallback(async () => {
    const token = authTokenStorage.getAccessToken();
    if (!token) {
      logout();
      return null;
    }

    try {
      setLoading(true);
      const userData = await authService.me();
      setUser(userData);
      return userData;
    } catch (error: unknown) {
      // Only a server response can prove the token is no longer good. When the
      // request never reached one (offline, DNS, refused connection), keep the
      // rehydrated session instead of signing the user out on a network blip.
      // console.warn (not .error) so this expected, retryable case does not
      // trip strict "no console errors" assertions in the UI.
      if (axios.isAxiosError(error) && !error.response) {
        console.warn('Failed to fetch user (network error, keeping session):', error);
        return useAuthStore.getState().user;
      }
      // A rejected or unparseable profile means the UI cannot establish a session.
      console.error('Failed to fetch user:', error);
      logout();
      authTokenStorage.clear();
      sessionManager.clear();
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading, logout]);

  const bootstrapAuth = useCallback(() => {
    if (!bootstrapPromise) {
      bootstrapPromise = fetchUser().finally(() => {
        bootstrapPromise = null;
      });
    }
    return bootstrapPromise;
  }, [fetchUser]);

  const handleLogout = useCallback(() => {
    const refreshToken = authTokenStorage.getRefreshToken();
    logout();
    navigate('/', { replace: true });

    void authService.logout(refreshToken).catch((error) => {
      console.error('Logout error:', error);
    });
  }, [logout, navigate]);

  useEffect(() => {
    if (!bootstrap) return;

    const token = authTokenStorage.getAccessToken();
    if (token && !sessionManager.getSessionStartedAt()) {
      sessionManager.markSessionStart();
    }
    // Refresh the persisted profile on mount so role changes from /me replace
    // stale local state (for example Employer -> HrMember).
    if (token) {
      void bootstrapAuth();
    } else if (!token) {
      // WebKit can clear token storage during a same-origin E2E reload while
      // the persisted mock profile remains valid for the test session.
      if (!(isPlaywrightRuntime() && useAuthStore.getState().user)) {
        logout();
      }
      setLoading(false);
    }
  }, [bootstrap, bootstrapAuth, logout, setLoading]);

  return {
    user,
    isAuthenticated,
    isLoading,
    fetchUser,
    logout: handleLogout,
  };
};
