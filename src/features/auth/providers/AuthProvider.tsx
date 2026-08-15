import type { ReactNode } from 'react';
import { useCallback } from 'react';
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
  const { isAuthenticated, user, logout } = useAuth({ bootstrap: true });

  const handleExpire = useCallback(() => {
    logout();
  }, [logout]);

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
