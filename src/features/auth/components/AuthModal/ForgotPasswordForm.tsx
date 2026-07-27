import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../../../shared/languages';
import { authService } from '../../services/authService';
import { getApiErrorMessage } from '../../../../shared/api';
import { validatePassword } from '../../utils/passwordPolicy';
import { PasswordStrengthMeter } from '../PasswordStrengthMeter';
import { forgotPasswordFormVariants } from './authModal.animations';

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
      await authService.resetPassword({ email: email.trim(), otp: otp.trim(), newPassword });
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

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center px-12"
      variants={forgotPasswordFormVariants(reducedMotion)}
      initial="hiddenRight"
      animate="active"
      exit="hiddenRight"
    >
      {step === 'email' && (
        <>
          <h1 className="text-4xl heading-primary mb-4 tracking-tight">{t('auth.forgotTitle')}</h1>
          <p className="text-sm text-muted-foreground mb-8 text-center font-medium leading-relaxed">
            {t('auth.forgotDescription')}
          </p>

          <input
            className="bg-surface-overlay border border-default rounded-lg px-4 py-2.5 text-sm text-foreground focus-ring w-full transition-all placeholder:text-muted-foreground mb-2"
            placeholder={t('auth.emailPlaceholder')}
            aria-label={t('auth.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          {error && <p className="text-xs text-error w-full mb-4 font-medium">{error}</p>}
          {!error && <div className="h-6"></div>}

          <button
            onClick={handleSendEmail}
            disabled={isLoading}
            className="btn-primary w-full uppercase tracking-wider mb-6 disabled:opacity-70"
          >
            {isLoading ? t('auth.sendingLink') : t('auth.sendLink')}
          </button>
        </>
      )}

      {step === 'otp' && (
        <>
          <h1 className="text-4xl heading-primary mb-4 tracking-tight">{t('auth.verifyOtpTitle')}</h1>
          <p className="text-sm text-muted-foreground mb-8 text-center font-medium leading-relaxed">
            {t('auth.verifyOtpDescription')}
          </p>

          <input
            className="bg-surface-overlay border border-default px-5 py-3.5 rounded-xl w-full mb-4 text-sm text-muted-foreground focus:outline-none"
            value={email}
            disabled
            aria-label={t('auth.emailPlaceholder')}
          />

          <input
            className="bg-surface-overlay border border-default rounded-lg px-4 py-2.5 text-sm text-foreground focus-ring w-full transition-all placeholder:text-muted-foreground mb-2"
            placeholder={t('auth.otpPlaceholder')}
            aria-label={t('auth.otpPlaceholder')}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            disabled={isLoading}
          />
          {error && <p className="text-xs text-error w-full mb-4 font-medium">{error}</p>}
          {!error && <div className="h-6"></div>}

          <button
            onClick={handleVerifyOtp}
            disabled={isLoading}
            className="btn-primary w-full uppercase tracking-wider mb-6 disabled:opacity-70"
          >
            {isLoading ? t('auth.verifying') : t('auth.verify')}
          </button>
        </>
      )}

      {step === 'reset' && (
        <>
          <h1 className="text-4xl heading-primary mb-4 tracking-tight">{t('auth.resetPasswordTitle')}</h1>
          <p className="text-sm text-muted-foreground mb-8 text-center font-medium leading-relaxed">
            {t('auth.resetPasswordDescription')}
          </p>

          <input
            className="bg-surface-overlay border border-default px-5 py-3.5 rounded-xl w-full mb-4 text-sm text-muted-foreground focus:outline-none"
            value={email}
            disabled
            aria-label={t('auth.emailPlaceholder')}
          />

          <input
            type="password"
            className="bg-surface-overlay border border-default rounded-lg px-4 py-2.5 text-sm text-foreground focus-ring w-full transition-all placeholder:text-muted-foreground mb-2"
            placeholder={t('auth.newPasswordPlaceholder')}
            aria-label={t('auth.newPasswordPlaceholder')}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isLoading || !!success}
          />
          <div className="w-full mb-2">
            <PasswordStrengthMeter password={newPassword} />
          </div>
          {error && <p className="text-xs text-error w-full mb-4 font-medium">{error}</p>}
          {success && <p className="text-xs text-foreground w-full mb-4 font-medium">{success}</p>}
          {!error && !success && <div className="h-6"></div>}

          <button
            onClick={handleResetPassword}
            disabled={isLoading || !!success}
            className="btn-primary w-full uppercase tracking-wider mb-6 disabled:opacity-70"
          >
            {isLoading ? t('auth.resetting') : t('auth.reset')}
          </button>
        </>
      )}

      <button
        onClick={(e) => {
          e.preventDefault();
          handleBack();
        }}
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-2 mt-4"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>{t('auth.backToSignIn')}</span>
      </button>
    </motion.div>
  );
};
