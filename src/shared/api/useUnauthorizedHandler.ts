import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { authTokenStorage } from './authTokenStorage';
import { clearUnauthorizedHandler, setUnauthorizedHandler } from './unauthorizedHandler';

export function useUnauthorizedHandler() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      authTokenStorage.clear();
      navigate('/login', { replace: true, state: { reason: 'session-expired' } });
    });

    return clearUnauthorizedHandler;
  }, [logout, navigate]);
}
