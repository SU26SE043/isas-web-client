import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getApiErrorMessage, getApiStatusCode } from '../../../../shared/api';
import { useLanguage } from '../../../../shared/languages';
import { authService } from '../../services/authService';
import { validatePassword } from '../../utils/passwordPolicy';
import { PasswordStrengthMeter } from '../PasswordStrengthMeter';
import { SocialLoginButton } from '../SocialLoginButton';
import { signUpFormVariants } from './authModal.animations';

interface SignUpFormProps {
  isSignUp: boolean;
  onRegisterSuccess: () => void;
  reducedMotion: boolean | null;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({
  isSignUp,
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

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="absolute inset-0 flex flex-col items-center justify-center px-12"
      variants={signUpFormVariants(reducedMotion)}
      initial={false}
      animate={isSignUp ? 'active' : 'hiddenRight'}
    >
      <h1 className="text-4xl heading-primary mb-6 tracking-tight">{t('auth.signUpTitle')}</h1>

      <div className="w-full mb-6">
        <SocialLoginButton />
      </div>

      <input
        className="bg-surface-overlay border border-default rounded-lg px-4 py-2.5 text-sm text-foreground focus-ring w-full transition-all placeholder:text-muted-foreground mb-4"
        placeholder={t('auth.fullNamePlaceholder')}
        aria-label={t('auth.fullNamePlaceholder')}
        value={fullName}
        onChange={(event) => setFullName(event.target.value)}
        autoComplete="name"
      />
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
        className="bg-surface-overlay border border-default rounded-lg px-4 py-2.5 text-sm text-foreground focus-ring w-full transition-all placeholder:text-muted-foreground mb-2"
        type="password"
        placeholder={t('auth.password')}
        aria-label={t('auth.password')}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="new-password"
      />
      <div className="w-full mb-4">
        <PasswordStrengthMeter password={password} />
      </div>

      <p
        className={`min-h-5 mb-3 text-xs font-bold text-center ${statusMessage === t('auth.registerSuccess') ? 'text-foreground' : 'text-error'}`}
      >
        {statusMessage}
      </p>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full uppercase tracking-wider disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? t('auth.registering') : t('auth.signUp')}
      </button>
    </motion.form>
  );
};
