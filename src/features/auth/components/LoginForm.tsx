import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import { SocialLoginButton } from './SocialLoginButton';
import { SSOButton } from './SSOButton';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/authStore';
import { parseAuthError } from '../utils/authErrors';
import { getPostLoginPath } from '../utils/getPostLoginPath';

export interface LoginFormProps {
  redirectFrom?: string;
  sessionExpired?: boolean;
  registeredEmail?: string;
  onSuccess?: () => void;
}

export function LoginForm({
  redirectFrom,
  sessionExpired = false,
  registeredEmail,
  onSuccess,
}: LoginFormProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { fetchUser } = useAuth();
  const [email, setEmail] = useState(registeredEmail ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError(t('auth.loginRequired'));
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await authService.login({ email: email.trim(), password });

      if (result.mfaRequired) {
        navigate('/mfa', {
          replace: true,
          state: { mfaToken: result.mfaToken, email: email.trim(), from: redirectFrom },
        });
        return;
      }

      if (result.emailVerificationRequired) {
        navigate(`/verify-email?email=${encodeURIComponent(email.trim())}`, { replace: true });
        return;
      }

      await fetchUser();
      const currentUser = useAuthStore.getState().user;
      onSuccess?.();
      navigate(
        redirectFrom ?? (currentUser ? getPostLoginPath(currentUser.role) : '/candidate/dashboard'),
        { replace: true },
      );
    } catch (err) {
      const parsed = parseAuthError(err, t('auth.loginFailed'));
      if (parsed.kind === 'accountLocked') {
        navigate('/account-locked', { replace: true });
        return;
      }
      if (parsed.kind === 'mfaRequired' && parsed.mfaToken) {
        navigate('/mfa', {
          replace: true,
          state: { mfaToken: parsed.mfaToken, email: email.trim(), from: redirectFrom },
        });
        return;
      }
      setError(
        parsed.kind === 'invalidCredentials' ? t('auth.invalidCredentials') : parsed.message,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {sessionExpired ? <Alert variant="warning">{t('auth.sessionExpiredBanner')}</Alert> : null}
      {registeredEmail ? (
        <Alert variant="info">
          {t('auth.registerCheckEmail').replace('{email}', registeredEmail)}
        </Alert>
      ) : null}

      <SocialLoginButton />
      <SSOButton />
      <p className="text-center text-xs text-muted-foreground">{t('auth.orContinueWithEmail')}</p>

      <div className="space-y-2">
        <Label htmlFor="login-email">{t('auth.emailPlaceholder')}</Label>
        <Input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password">{t('auth.passwordPlaceholder')}</Label>
          <Link
            to="/forgot-password"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {t('auth.forgotPassword')}
          </Link>
        </div>
        <Input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </div>

      {error ? <Alert variant="error">{error}</Alert> : null}

      <Button type="submit" className="w-full" loading={isSubmitting}>
        {isSubmitting ? t('auth.loggingIn') : t('auth.signInTitle')}
      </Button>
    </form>
  );
}
