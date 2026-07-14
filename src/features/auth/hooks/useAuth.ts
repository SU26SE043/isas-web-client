import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/authService';
import { authTokenStorage } from '../../../shared/api';
import { sessionManager } from '../utils/sessionManager';

export const useAuth = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout } = useAuthStore();

  const fetchUser = useCallback(async () => {
    const token = authTokenStorage.getAccessToken();
    if (!token) {
      logout();
      return;
    }

    try {
      setLoading(true);
      const userData = await authService.me();
      setUser(userData);
    } catch (error: any) {
      console.error('Failed to fetch user:', error);

      // If it's a 401 error, clear auth state silently
      if (error.response?.status === 401) {
        console.log('Token expired or invalid - clearing auth state');
        logout();
        return;
      }

      // If API endpoint doesn't exist (404) or other server errors (5xx)
      if (error.response?.status === 404 || error.response?.status >= 500) {
        console.error('api/auth/me not available');
        logout();
        return;
      }

      // For other errors, don't logout but show error
      console.error('Unexpected error fetching user data');
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading, logout]);

  const handleLogout = useCallback(() => {
    // Snapshot token, clear local auth, and leave protected UI immediately.
    const refreshToken = authTokenStorage.getRefreshToken();
    logout();
    authTokenStorage.clear();
    sessionManager.clear();
    navigate('/', { replace: true });

    void authService.logout(refreshToken).catch((error) => {
      console.error('Logout error:', error);
    });
  }, [logout, navigate]);

  useEffect(() => {
    // Check for tokens in URL params (e.g., from Google Login callback)
    const searchParams = new URLSearchParams(window.location.search);
    const urlAccessToken = searchParams.get('accessToken');
    const urlRefreshToken = searchParams.get('refreshToken');

    if (urlAccessToken && urlRefreshToken) {
      authTokenStorage.setTokens(urlAccessToken, urlRefreshToken);
      sessionManager.markSessionStart();
      // Clean up URL parameters without refreshing page
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const token = authTokenStorage.getAccessToken();
    if (token && !sessionManager.getSessionStartedAt()) {
      sessionManager.markSessionStart();
    }
    // Only fetch user if we have a token and no user data yet
    if (token && !user && !isLoading) {
      fetchUser();
    } else if (!token) {
      // If no token, make sure we're in logged out state
      logout();
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