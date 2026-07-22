import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { authTokenStorage, getApiErrorMessage } from '@/shared/api';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { useLanguage } from '@/shared/languages';
import { AuthCard } from '../components/AuthCard';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/authStore';
import { getPostLoginPath } from '../utils/getPostLoginPath';
import { sessionManager } from '../utils/sessionManager';

export function GoogleAuthCallbackPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);
  const startedRef = useRef(false);
  const [error, setError] = useState('');

  usePageTitle(t('auth.googleCompleting'));

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const code = searchParams.get('code')?.trim();
    if (!code) {
      setError(t('auth.googleCodeMissing'));
      return;
    }

    void (async () => {
      try {
        await authService.exchangeGoogleCode({ code });
        const user = await authService.me();
        setUser(user);
        navigate(getPostLoginPath(user.role), { replace: true });
      } catch (err) {
        authTokenStorage.clear();
        sessionManager.clear();
        useAuthStore.getState().logout();
        setError(getApiErrorMessage(err, t('auth.googleExchangeFailed')));
      }
    })();
  }, [navigate, searchParams, setUser, t]);

  return (
    <AuthCard
      title={t('auth.googleCompleting')}
      description={t('auth.googleCompletingDescription')}
    >
      <div className="space-y-4">
        {error ? (
          <>
            <Alert variant="error">{error}</Alert>
            <Button type="button" className="w-full" onClick={authService.loginWithGoogle}>
              {t('auth.googleTryAgain')}
            </Button>
          </>
        ) : (
          <p className="text-center text-sm text-muted-foreground" role="status">
            {t('auth.googleExchangingCode')}
          </p>
        )}
      </div>
    </AuthCard>
  );
}
