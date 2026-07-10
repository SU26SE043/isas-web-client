import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { useLanguage } from '@/shared/languages';
import { AuthCard } from '../components/AuthCard';
import { SocialLoginButton } from '../components/SocialLoginButton';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/authStore';
import { parseAuthError } from '../utils/authErrors';
import { getPostLoginPath } from '../utils/getPostLoginPath';

export function LoginPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchUser } = useAuth();
  const { isAuthenticated, user } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  usePageTitle(t('auth.signInTitle'));

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
  const sessionExpired = (location.state as { reason?: string } | null)?.reason === 'session-expired';

  if (isAuthenticated && user) {
    return <Navigate to={from ?? getPostLoginPath(user.role)} replace />;
  }

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
          state: { mfaToken: result.mfaToken, email: email.trim(), from },
        });
        return;
      }

      await fetchUser();
      const currentUser = useAuthStore.getState().user;
      navigate(from ?? (currentUser ? getPostLoginPath(currentUser.role) : '/profile'), { replace: true });
    } catch (err) {
      const parsed = parseAuthError(err, t('auth.loginFailed'));
      if (parsed.kind === 'accountLocked') {
        navigate('/account-locked', { replace: true });
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
    <AuthCard
      title={t('auth.signInTitle')}
      description={t('auth.signInSubtitle')}
      footer={
        <span className="text-muted-foreground">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="text-foreground underline-offset-4 hover:underline">
            {t('auth.signUp')}
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {sessionExpired ? <Alert variant="warning">{t('auth.sessionExpiredBanner')}</Alert> : null}

        <SocialLoginButton />
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
    </AuthCard>
  );
}
