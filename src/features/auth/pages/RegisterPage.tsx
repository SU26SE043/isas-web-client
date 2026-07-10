import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { useLanguage } from '@/shared/languages';
import { AuthCard } from '../components/AuthCard';
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter';
import { SocialLoginButton } from '../components/SocialLoginButton';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/authStore';
import { parseAuthError } from '../utils/authErrors';
import { getPostLoginPath } from '../utils/getPostLoginPath';
import { validatePassword } from '../utils/passwordPolicy';

export function RegisterPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { fetchUser } = useAuth();
  const { isAuthenticated, user } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  usePageTitle(t('auth.signUpTitle'));

  if (isAuthenticated && user) {
    return <Navigate to={getPostLoginPath(user.role)} replace />;
  }

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
      const result = await authService.register({
        email: email.trim(),
        fullName: fullName.trim(),
        password,
      });

      if (result.emailVerificationRequired) {
        navigate(`/verify-email?email=${encodeURIComponent(email.trim())}`, { replace: true });
        return;
      }

      await fetchUser();
      const currentUser = useAuthStore.getState().user;
      navigate(currentUser ? getPostLoginPath(currentUser.role) : '/profile', { replace: true });
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
    <AuthCard
      title={t('auth.signUpTitle')}
      description={t('auth.signUpSubtitle')}
      footer={
        <span className="text-muted-foreground">
          {t('auth.haveAccount')}{' '}
          <Link to="/login" className="text-foreground underline-offset-4 hover:underline">
            {t('auth.signInTitle')}
          </Link>
        </span>
      }
    >
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
    </AuthCard>
  );
}
