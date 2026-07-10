import type { ReactNode } from 'react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authTokenStorage } from '@/shared/api';
import { SessionTimeoutModal } from '../components/SessionTimeoutModal';
import { useAuth } from '../hooks/useAuth';
import { useSessionTimeout } from '../hooks/useSessionTimeout';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/authStore';
import { sessionManager } from '../utils/sessionManager';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleExpire = useCallback(() => {
    logout();
    sessionManager.clear();
    authTokenStorage.clear();
    navigate('/session-expired', { replace: true });
  }, [logout, navigate]);

  const { showWarning, secondsLeft, extendSession } = useSessionTimeout({
    enabled: isAuthenticated,
    role: user?.role ?? null,
    onExpire: handleExpire,
  });

  const handleExtend = useCallback(async () => {
    try {
      await authService.refresh();
      sessionManager.touchActivity();
      extendSession();
    } catch {
      handleExpire();
    }
  }, [extendSession, handleExpire]);

  const handleLogout = useCallback(() => {
    void logout();
    sessionManager.clear();
  }, [logout]);

  return (
    <>
      {children}
      <SessionTimeoutModal
        open={showWarning}
        secondsLeft={secondsLeft}
        onExtend={handleExtend}
        onLogout={handleLogout}
      />
    </>
  );
}

export function markAuthSessionStart() {
  sessionManager.markSessionStart();
}

export function clearAuthSession() {
  sessionManager.clear();
}

export function useAuthContext() {
  return useAuthStore();
}
