import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/authService';
import { authTokenStorage } from '../../../shared/api';
import { sessionManager } from '../utils/sessionManager';
import { isPlaywrightRuntime } from '@/shared/mock';

export const useAuth = () => {
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
      console.error('Failed to fetch user:', error);
      // Any /me or profile-parse failure means the UI cannot establish a session.
      logout();
      authTokenStorage.clear();
      sessionManager.clear();
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading, logout]);

  const handleLogout = useCallback(() => {
    const refreshToken = authTokenStorage.getRefreshToken();
    logout();
    navigate('/', { replace: true });

    void authService.logout(refreshToken).catch((error) => {
      console.error('Logout error:', error);
    });
  }, [logout, navigate]);

  useEffect(() => {
    const token = authTokenStorage.getAccessToken();
    if (token && !sessionManager.getSessionStartedAt()) {
      sessionManager.markSessionStart();
    }
    // Refresh the persisted profile on mount so role changes from /me replace
    // stale local state (for example Employer -> HrMember).
    if (token) {
      fetchUser();
    } else if (!token) {
      // WebKit can clear token storage during a same-origin E2E reload while
      // the persisted mock profile remains valid for the test session.
      if (!(isPlaywrightRuntime() && useAuthStore.getState().user)) {
        logout();
      }
      setLoading(false);
    }
  }, []); // Empty dependency array - only run once on mount

  return {
    user,
    isAuthenticated,
    isLoading,
    fetchUser,
    logout: handleLogout,
  };
};
