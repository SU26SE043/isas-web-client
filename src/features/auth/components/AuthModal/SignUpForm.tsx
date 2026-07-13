import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiErrorMessage, getApiStatusCode } from '../../../../shared/api';
import { useLanguage } from '../../../../shared/languages';
import { authService } from '../../services/authService';
import { validatePassword } from '../../utils/passwordPolicy';
import { PasswordStrengthMeter } from '../PasswordStrengthMeter';
import { SocialLoginButton } from '../SocialLoginButton';
import { AuthFormStatus } from './AuthFormStatus';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface SignUpFormProps {
  onRegisterSuccess: () => void;
  reducedMotion: boolean | null;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({
  onRegisterSuccess,
  reducedMotion,
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setStatusMessage(t('auth.registerRequired'));
      return;
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      setStatusMessage(t('auth.passwordComplexity'));
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('');

    try {
      await authService.register({
        email: email.trim(),
        fullName: fullName.trim(),
        password,
      });
      const trimmedEmail = email.trim();
      onRegisterSuccess();
      navigate(`/verify-email?email=${encodeURIComponent(trimmedEmail)}`, { replace: true });
    } catch (error) {
      const statusCode = getApiStatusCode(error);
      if (statusCode === 400 || statusCode === 409) {
        setStatusMessage(t('auth.emailAlreadyUsed'));
      } else {
        setStatusMessage(getApiErrorMessage(error, t('auth.registerFailed')));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusVariant =
    statusMessage === t('auth.registerSuccess')
      ? 'success'
      : statusMessage
        ? 'error'
        : 'neutral';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <header className="space-y-1 text-center sm:text-left">
        <h2 className="heading-secondary text-xl tracking-tight">{t('auth.signUpTitle')}</h2>
        <p className="text-sm text-muted-foreground">{t('auth.signUpSubtitle')}</p>
      </header>

      <SocialLoginButton />

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
          <Label htmlFor="auth-signup-name">{t('auth.fullNamePlaceholder')}</Label>
          <Input
            id="auth-signup-name"
            className="h-10 bg-surface-overlay border-default"
            placeholder={t('auth.fullNamePlaceholder')}
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            autoComplete="name"
            aria-invalid={statusVariant === 'error' || undefined}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="auth-signup-email">{t('auth.emailPlaceholder')}</Label>
          <Input
            id="auth-signup-email"
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
          <Label htmlFor="auth-signup-password">{t('auth.password')}</Label>
          <Input
            id="auth-signup-password"
            className="h-10 bg-surface-overlay border-default"
            type="password"
            placeholder={t('auth.password')}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            aria-invalid={statusVariant === 'error' || undefined}
          />
          <PasswordStrengthMeter password={password} />
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
        {isSubmitting ? t('auth.registering') : t('auth.signUp')}
      </Button>
    </form>
  );
};
