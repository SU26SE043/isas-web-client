import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { SocialLoginButton } from './SocialLoginButton';
import { authService } from '../services/authService';
import { parseAuthError } from '../utils/authErrors';
import { validatePassword } from '../utils/passwordPolicy';

export interface RegisterFormProps {
  onSuccess?: (email: string) => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFieldError('');

    if (!fullName.trim() || !email.trim() || !password) {
      setFieldError(t('auth.registerRequired'));
      return;
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      setFieldError(t('auth.passwordComplexity'));
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.register({
        email: email.trim(),
        fullName: fullName.trim(),
        password,
      });
      const trimmedEmail = email.trim();
      onSuccess?.(trimmedEmail);
      navigate(`/verify-email?email=${encodeURIComponent(trimmedEmail)}`, { replace: true });
    } catch (error) {
      const parsed = parseAuthError(error, t('auth.registerFailed'));
      if (parsed.kind === 'invalidCredentials' || parsed.message.toLowerCase().includes('email')) {
        setFieldError(t('auth.emailAlreadyUsed'));
      } else {
        setFieldError(parsed.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <SocialLoginButton />
      <p className="text-center text-xs text-muted-foreground">{t('auth.orContinueWithEmail')}</p>

      <div className="space-y-2">
        <Label htmlFor="register-name">{t('auth.fullNamePlaceholder')}</Label>
        <Input
          id="register-name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email">{t('auth.emailPlaceholder')}</Label>
        <Input
          id="register-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password">{t('auth.password')}</Label>
        <Input
          id="register-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />
        <PasswordStrengthMeter password={password} />
      </div>

      {fieldError ? <Alert variant="error">{fieldError}</Alert> : null}

      <Button type="submit" className="w-full" loading={isSubmitting}>
        {isSubmitting ? t('auth.registering') : t('auth.signUp')}
      </Button>
    </form>
  );
}
