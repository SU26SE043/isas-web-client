import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthCard } from '../components/AuthCard';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/authStore';
import { getPostLoginPath } from '../utils/getPostLoginPath';
import { useLanguage } from '@/shared/languages';

type CallbackState = 'loading' | 'invalidCode' | 'remoteError' | 'noLoginInfo' | 'suspended' | 'failed';

const pendingExchanges = new Map<string, ReturnType<typeof authService.exchangeGoogleCode>>();

function exchangeCodeOnce(code: string) {
  const pending = pendingExchanges.get(code);
  if (pending) return pending;

  const request = authService.exchangeGoogleCode({ code });
  pendingExchanges.set(code, request);
  void request.then(
    () => pendingExchanges.delete(code),
    () => pendingExchanges.delete(code),
  );
  return request;
}

function resolveReason(reason: string | null): CallbackState | null {
  if (reason === 'remote_error') return 'remoteError';
  if (reason === 'no_login_info') return 'noLoginInfo';
  if (reason === 'account_suspended') return 'suspended';
  if (reason === 'login_failed') return 'failed';
  return null;
}

const messageKeyByState: Record<Exclude<CallbackState, 'loading'>, string> = {
  invalidCode: 'auth.googleInvalidCode',
  remoteError: 'auth.googleRemoteError',
  noLoginInfo: 'auth.googleNoLoginInfo',
  suspended: 'auth.googleAccountSuspended',
  failed: 'auth.googleLoginFailed',
};

export function GoogleAuthCallbackPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<CallbackState>('loading');
  const code = searchParams.get('code')?.trim() ?? '';
  // New AuthService contract uses `error`; keep `reason` as a compatibility fallback.
  const reasonState = resolveReason(searchParams.get('error') ?? searchParams.get('reason'));

  useEffect(() => {
    let active = true;

    if (reasonState) {
      setState(reasonState);
      return () => {
        active = false;
      };
    }

    if (!code) {
      setState('failed');
      return () => {
        active = false;
      };
    }

    void exchangeCodeOnce(code)
      .then(() => authService.me())
      .then((user) => {
        if (!active) return;
        useAuthStore.getState().setUser(user);
        navigate(getPostLoginPath(user.role), { replace: true });
      })
      .catch(() => {
        if (active) setState('invalidCode');
      });

    return () => {
      active = false;
    };
  }, [code, navigate, reasonState]);

  if (state === 'loading') {
    return (
      <AuthCard title={t('auth.googleCompletingTitle')} description={t('auth.googleCompletingDescription')}>
        <div className="flex items-center gap-3 text-sm text-muted-foreground" role="status">
          <span className="size-4 animate-spin rounded-full border-2 border-default border-t-foreground" aria-hidden />
          {t('auth.googleCompleting')}
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title={t('auth.googleErrorTitle')} description={t(messageKeyByState[state])}>
      <Link to="/login" className="btn-primary inline-flex w-full justify-center">
        {t('auth.backToSignIn')}
      </Link>
    </AuthCard>
  );
}
