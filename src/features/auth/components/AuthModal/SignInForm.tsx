import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../../shared/languages';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../stores/authStore';
import { parseAuthError } from '../../utils/authErrors';
import { getPostLoginPath } from '../../utils/getPostLoginPath';
import { SocialLoginButton } from '../SocialLoginButton';
import { SSOButton } from '../SSOButton';
import { AuthFormStatus } from './AuthFormStatus';
import { Alert } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface SignInFormProps {
  onForgotPasswordClick: () => void;
  onLoginSuccess: () => void;
  reducedMotion: boolean | null;
  redirectFrom?: string;
  sessionExpired?: boolean;
  registeredEmail?: string;
}

export const SignInForm: React.FC<SignInFormProps> = ({
  onForgotPasswordClick,
  onLoginSuccess,
  reducedMotion,
  redirectFrom,
  sessionExpired = false,
  registeredEmail,
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { fetchUser } = useAuth();
  const [email, setEmail] = useState(registeredEmail ?? '');
  const [password, setPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setStatusMessage(t('auth.loginRequired'));
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('');

    try {
      const result = await authService.login({
        email: email.trim(),
        password,
      });

      if (result.mfaRequired) {
        onLoginSuccess();
        navigate('/mfa', {
          replace: true,
          state: { mfaToken: result.mfaToken, email: email.trim(), from: redirectFrom },
        });
        return;
      }

      if (result.emailVerificationRequired) {
        onLoginSuccess();
        navigate(`/verify-email?email=${encodeURIComponent(email.trim())}`, { replace: true });
        return;
      }

      await fetchUser();
      setStatusMessage(t('auth.loginSuccess'));
      onLoginSuccess();
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        navigate(redirectFrom ?? getPostLoginPath(currentUser.role), { replace: true });
      }
    } catch (error) {
      const parsed = parseAuthError(error, t('auth.loginFailed'));
      if (parsed.kind === 'accountLocked') {
        onLoginSuccess();
        navigate('/account-locked', { replace: true });
        return;
      }
      if (parsed.kind === 'mfaRequired' && parsed.mfaToken) {
        onLoginSuccess();
        navigate('/mfa', {
          replace: true,
          state: { mfaToken: parsed.mfaToken, email: email.trim(), from: redirectFrom },
        });
        return;
      }
      setStatusMessage(
        parsed.kind === 'invalidCredentials' ? t('auth.invalidCredentials') : parsed.message,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusVariant =
    statusMessage === t('auth.loginSuccess')
      ? 'success'
      : statusMessage
        ? 'error'
        : 'neutral';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {sessionExpired ? <Alert variant="warning">{t('auth.sessionExpiredBanner')}</Alert> : null}
      {registeredEmail ? (
        <Alert variant="info">
          {t('auth.registerCheckEmail').replace('{email}', registeredEmail)}
        </Alert>
      ) : null}

      <header className="space-y-1 text-center sm:text-left">
        <h2 className="heading-secondary text-xl tracking-tight">{t('auth.signInTitle')}</h2>
        <p className="text-sm text-muted-foreground">{t('auth.signInSubtitle')}</p>
      </header>

      <div className="space-y-3">
        <SocialLoginButton />
        <SSOButton />
      </div>

      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <span className="w-full border-t border-subtle" />
        </div>
        <p className="relative mx-auto w-fit bg-surface-elevated/95 px-3 text-xs text-muted-foreground">
          {t('auth.orContinueWithEmail')}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="auth-signin-email">{t('auth.emailPlaceholder')}</Label>
          <Input
            id="auth-signin-email"
            className="h-10 bg-surface-overlay border-default"
            placeholder={t('auth.emailPlaceholder')}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            aria-invalid={statusVariant === 'error' || undefined}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="auth-signin-password">{t('auth.passwordPlaceholder')}</Label>
            <button
              type="button"
              onClick={onForgotPasswordClick}
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-ring rounded-sm"
            >
              {t('auth.forgotPassword')}
            </button>
          </div>
          <Input
            id="auth-signin-password"
            className="h-10 bg-surface-overlay border-default"
            type="password"
            placeholder={t('auth.passwordPlaceholder')}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            aria-invalid={statusVariant === 'error' || undefined}
          />
        </div>
      </div>

      <AuthFormStatus
        message={statusMessage}
        variant={statusVariant}
        reducedMotion={reducedMotion}
      />

      <Button
        type="submit"
        size="lg"
        loading={isSubmitting}
        className="h-10 w-full bg-primary text-primary-foreground font-semibold"
      >
        {isSubmitting ? t('auth.loggingIn') : t('auth.signInTitle')}
      </Button>
    </form>
  );
};
