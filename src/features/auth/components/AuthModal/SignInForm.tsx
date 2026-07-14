import React, { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../../../shared/languages';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../stores/authStore';
import { parseAuthError } from '../../utils/authErrors';
import { getPostLoginPath } from '../../utils/getPostLoginPath';
import { SocialLoginButton } from '../SocialLoginButton';
import { SSOButton } from '../SSOButton';
import { signInFormVariants } from './authModal.animations';

interface SignInFormProps {
  isSignUp: boolean;
  isForgotPassword: boolean;
  onForgotPasswordClick: () => void;
  onLoginSuccess: () => void;
  reducedMotion: boolean | null;
}

export const SignInForm: React.FC<SignInFormProps> = ({
  isSignUp,
  isForgotPassword,
  onForgotPasswordClick,
  onLoginSuccess,
  reducedMotion,
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { fetchUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectFrom = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
  const sessionExpired =
    searchParams.get('reason') === 'session-expired' ||
    (location.state as { reason?: string } | null)?.reason === 'session-expired';

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
      navigate(
        redirectFrom ?? (currentUser ? getPostLoginPath(currentUser.role) : '/candidate/dashboard'),
        { replace: true },
      );
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

  const isActive = !isSignUp && !isForgotPassword;

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="absolute inset-0 flex flex-col items-center justify-center px-12"
      variants={signInFormVariants(reducedMotion)}
      initial={false}
      animate={isActive ? 'active' : 'hiddenLeft'}
    >
      <h1 className="text-4xl heading-primary mb-6 tracking-tight">{t('auth.signInTitle')}</h1>

      {sessionExpired ? (
        <p className="mb-4 w-full rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-center text-xs text-warning">
          {t('auth.sessionExpiredInline')}
        </p>
      ) : null}

      <div className="w-full mb-4">
        <SocialLoginButton />
      </div>
      <div className="w-full mb-6">
        <SSOButton />
      </div>

      <input
        className="bg-surface-overlay border border-default rounded-lg px-4 py-2.5 text-sm text-foreground focus-ring w-full transition-all placeholder:text-muted-foreground mb-4"
        placeholder={t('auth.emailPlaceholder')}
        aria-label={t('auth.emailPlaceholder')}
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
      />
      <input
        className="bg-surface-overlay border border-default rounded-lg px-4 py-2.5 text-sm text-foreground focus-ring w-full transition-all placeholder:text-muted-foreground mb-4"
        type="password"
        placeholder={t('auth.passwordPlaceholder')}
        aria-label={t('auth.passwordPlaceholder')}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="current-password"
      />

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onForgotPasswordClick();
        }}
        className="text-sm font-medium text-muted-foreground mb-8 hover:text-foreground transition-colors"
      >
        {t('auth.forgotPassword')}
      </button>

      <p
        className={`min-h-5 mb-3 text-xs font-bold text-center ${statusMessage === t('auth.loginSuccess') ? 'text-foreground' : 'text-error'}`}
      >
        {statusMessage}
      </p>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full uppercase tracking-wider disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? t('auth.loggingIn') : t('auth.signInTitle')}
      </button>
    </motion.form>
  );
};
