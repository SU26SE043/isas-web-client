import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../../../shared/languages';
import { authService } from '../../services/authService';
import { useRegisterFlow } from '../../hooks/useRegisterFlow';
import { parseRegisterError } from '../../utils/authErrors';
import { validatePassword } from '../../utils/passwordPolicy';
import { PasswordStrengthMeter } from '../PasswordStrengthMeter';
import { signUpFormVariants } from './authModal.animations';

const fieldClassName =
  'bg-surface-overlay border border-default rounded-lg px-4 py-2.5 text-sm text-foreground focus-ring w-full transition-all placeholder:text-muted-foreground mb-3';

interface SignUpOrgFormProps {
  isSignUp: boolean;
  isOrgSignUp: boolean;
  onRegisterSuccess: () => void;
  onCandidateSignUpClick: () => void;
  reducedMotion: boolean | null;
}

export const SignUpOrgForm: React.FC<SignUpOrgFormProps> = ({
  isSignUp,
  isOrgSignUp,
  onRegisterSuccess,
  onCandidateSignUpClick,
  reducedMotion,
}) => {
  const { t } = useLanguage();
  const { completeRegistration } = useRegisterFlow(onRegisterSuccess);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!fullName.trim() || !email.trim() || !password.trim() || !orgName.trim()) {
      setStatusMessage(t('auth.registerOrgRequired'));
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
      const trimmedTaxCode = taxCode.trim();
      const result = await authService.registerOrg({
        email: email.trim(),
        fullName: fullName.trim(),
        password,
        orgName: orgName.trim(),
        ...(trimmedTaxCode ? { taxCode: trimmedTaxCode } : {}),
      });

      setStatusMessage(t('auth.registerSuccess'));
      await completeRegistration(result, email.trim());
    } catch (error) {
      const parsed = parseRegisterError(error, t('auth.registerFailed'));
      setStatusMessage(
        parsed.kind === 'emailAlreadyExists' ? t('auth.emailAlreadyUsed') : parsed.message,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isActive = isSignUp && isOrgSignUp;

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="absolute inset-0 overflow-y-auto flex flex-col items-center justify-start py-6 px-12"
      variants={signUpFormVariants(reducedMotion)}
      initial={false}
      animate={isActive ? 'active' : 'hiddenRight'}
    >
      <h1 className="text-3xl heading-primary mb-4 tracking-tight text-center">
        {t('auth.signUpOrgTitle')}
      </h1>
      <p className="mb-4 text-center text-xs text-muted-foreground">{t('auth.signUpOrgDescription')}</p>

      <input
        className={fieldClassName}
        placeholder={t('auth.orgNamePlaceholder')}
        aria-label={t('auth.orgNamePlaceholder')}
        value={orgName}
        onChange={(event) => setOrgName(event.target.value)}
        autoComplete="organization"
      />
      <input
        className={fieldClassName}
        placeholder={t('auth.taxCodePlaceholder')}
        aria-label={t('auth.taxCodePlaceholder')}
        value={taxCode}
        onChange={(event) => setTaxCode(event.target.value)}
      />
      <input
        className={fieldClassName}
        placeholder={t('auth.fullNamePlaceholder')}
        aria-label={t('auth.fullNamePlaceholder')}
        value={fullName}
        onChange={(event) => setFullName(event.target.value)}
        autoComplete="name"
      />
      <input
        className={fieldClassName}
        placeholder={t('auth.emailPlaceholder')}
        aria-label={t('auth.emailPlaceholder')}
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
      />
      <input
        className={`${fieldClassName} mb-2`}
        type="password"
        placeholder={t('auth.password')}
        aria-label={t('auth.password')}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="new-password"
      />
      <div className="w-full mb-3">
        <PasswordStrengthMeter password={password} />
      </div>

      <p
        className={`min-h-5 mb-2 text-xs font-bold text-center ${statusMessage === t('auth.registerSuccess') ? 'text-foreground' : 'text-error'}`}
      >
        {statusMessage}
      </p>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full uppercase tracking-wider disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? t('auth.registeringOrg') : t('auth.signUpOrg')}
      </button>

      <button
        type="button"
        onClick={onCandidateSignUpClick}
        className="mt-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        {t('auth.switchToCandidateSignUp')}
      </button>
    </motion.form>
  );
};
