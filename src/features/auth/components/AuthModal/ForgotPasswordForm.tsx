import React, { useState } from 'react';
import { ArrowLeftIcon } from 'lucide-react';
import { useLanguage } from '../../../../shared/languages';
import { authService } from '../../services/authService';
import { getApiErrorMessage } from '../../../../shared/api';
import { validatePassword } from '../../utils/passwordPolicy';
import { PasswordStrengthMeter } from '../PasswordStrengthMeter';
import { AuthFormStatus } from './AuthFormStatus';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ForgotPasswordFormProps {
  onBackToSignInClick: () => void;
  reducedMotion: boolean | null;
}

type ForgotPasswordStep = 'email' | 'otp' | 'reset';

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onBackToSignInClick,
  reducedMotion,
}) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<ForgotPasswordStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendEmail = async () => {
    if (!email.trim()) {
      setError(t('auth.loginRequired'));
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await authService.forgotPassword({ email: email.trim() });
      setStep('otp');
    } catch (err) {
      setError(getApiErrorMessage(err, t('auth.forgotFailed')));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError(t('auth.otpRequired'));
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await authService.verifyOtp({ email: email.trim(), otp: otp.trim() });
      setStep('reset');
    } catch (err) {
      setError(getApiErrorMessage(err, t('auth.otpInvalid')));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.valid) {
      setError(t('auth.passwordComplexity'));
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await authService.resetPassword({ email: email.trim(), newPassword });
      setSuccess(t('auth.resetSuccess'));
      setTimeout(() => {
        handleBack();
      }, 3000);
    } catch (err) {
      setError(getApiErrorMessage(err, t('auth.resetFailed')));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep('email');
    setEmail('');
    setOtp('');
    setNewPassword('');
    setError('');
    setSuccess('');
    onBackToSignInClick();
  };

  const statusMessage = success || error;
  const statusVariant = success ? 'success' : error ? 'error' : 'neutral';

  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        onClick={handleBack}
        className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-ring rounded-sm"
      >
        <ArrowLeftIcon className="size-4" aria-hidden />
        <span>{t('auth.backToSignIn')}</span>
      </button>

      {step === 'email' ? (
        <>
          <header className="space-y-2">
            <h2 className="heading-secondary text-xl tracking-tight">{t('auth.forgotTitle')}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{t('auth.forgotDescription')}</p>
          </header>

          <div className="space-y-2">
            <Label htmlFor="auth-forgot-email">{t('auth.emailPlaceholder')}</Label>
            <Input
              id="auth-forgot-email"
              className="h-10 bg-surface-overlay border-default"
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              aria-invalid={!!error || undefined}
            />
          </div>

          <AuthFormStatus message={statusMessage} variant={statusVariant} reducedMotion={reducedMotion} />

          <Button
            type="button"
            size="lg"
            loading={isLoading}
            onClick={handleSendEmail}
            className="h-10 w-full bg-primary text-primary-foreground font-semibold"
          >
            {isLoading ? t('auth.sendingLink') : t('auth.sendLink')}
          </Button>
        </>
      ) : null}

      {step === 'otp' ? (
        <>
          <header className="space-y-2">
            <h2 className="heading-secondary text-xl tracking-tight">{t('auth.verifyOtpTitle')}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{t('auth.verifyOtpDescription')}</p>
          </header>

          <Input
            className="h-10 bg-surface-overlay/60 border-default text-muted-foreground"
            value={email}
            disabled
            aria-label={t('auth.emailPlaceholder')}
          />

          <div className="space-y-2">
            <Label htmlFor="auth-forgot-otp">{t('auth.otpPlaceholder')}</Label>
            <Input
              id="auth-forgot-otp"
              className="h-10 bg-surface-overlay border-default"
              placeholder={t('auth.otpPlaceholder')}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={isLoading}
              aria-invalid={!!error || undefined}
            />
          </div>

          <AuthFormStatus message={statusMessage} variant={statusVariant} reducedMotion={reducedMotion} />

          <Button
            type="button"
            size="lg"
            loading={isLoading}
            onClick={handleVerifyOtp}
            className="h-10 w-full bg-primary text-primary-foreground font-semibold"
          >
            {isLoading ? t('auth.verifying') : t('auth.verify')}
          </Button>
        </>
      ) : null}

      {step === 'reset' ? (
        <>
          <header className="space-y-2">
            <h2 className="heading-secondary text-xl tracking-tight">{t('auth.resetPasswordTitle')}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('auth.resetPasswordDescription')}
            </p>
          </header>

          <Input
            className="h-10 bg-surface-overlay/60 border-default text-muted-foreground"
            value={email}
            disabled
            aria-label={t('auth.emailPlaceholder')}
          />

          <div className="space-y-2">
            <Label htmlFor="auth-forgot-new-password">{t('auth.newPasswordPlaceholder')}</Label>
            <Input
              id="auth-forgot-new-password"
              type="password"
              className="h-10 bg-surface-overlay border-default"
              placeholder={t('auth.newPasswordPlaceholder')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading || !!success}
              aria-invalid={!!error || undefined}
            />
            <PasswordStrengthMeter password={newPassword} />
          </div>

          <AuthFormStatus message={statusMessage} variant={statusVariant} reducedMotion={reducedMotion} />

          <Button
            type="button"
            size="lg"
            loading={isLoading}
            disabled={!!success}
            onClick={handleResetPassword}
            className="h-10 w-full bg-primary text-primary-foreground font-semibold"
          >
            {isLoading ? t('auth.resetting') : t('auth.reset')}
          </Button>
        </>
      ) : null}
    </div>
  );
};
