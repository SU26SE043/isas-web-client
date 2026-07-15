import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { getApiErrorMessage } from '@/shared/api';
import { useLanguage } from '@/shared/languages';
import { AuthCard } from '../components/AuthCard';
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter';
import { authService } from '../services/authService';
import { validatePassword } from '../utils/passwordPolicy';

type ForgotOtpLocationState = { email?: string };

export function ForgotPasswordOtpPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as ForgotOtpLocationState)?.email ?? '';
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  usePageTitle(t('auth.verifyOtpTitle'));

  if (!email) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!otp.trim()) {
      setError(t('auth.otpRequired'));
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.verifyOtp({ email, otp: otp.trim() });
      navigate('/reset-password', { replace: true, state: { email } });
    } catch (err) {
      setError(getApiErrorMessage(err, t('auth.otpInvalid')));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title={t('auth.verifyOtpTitle')}
      description={t('auth.verifyOtpDescription')}
      footer={
        <Link to="/login" className="text-foreground underline-offset-4 hover:underline">
          {t('auth.backToSignIn')}
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input type="email" value={email} disabled aria-readonly />

        <div className="space-y-2">
          <Label htmlFor="forgot-otp">{t('auth.otpPlaceholder')}</Label>
          <Input
            id="forgot-otp"
            inputMode="numeric"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            autoComplete="one-time-code"
            required
          />
        </div>

        {error ? <Alert variant="error">{error}</Alert> : null}

        <Button type="submit" className="w-full" loading={isSubmitting}>
          {isSubmitting ? t('auth.verifying') : t('auth.verify')}
        </Button>
      </form>
    </AuthCard>
  );
}

export function ResetPasswordByTokenPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { token = '' } = useParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  usePageTitle(t('auth.resetPasswordTitle'));

  if (!token) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      setError(t('auth.passwordComplexity'));
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.resetPasswordWithToken({ token, newPassword: password });
      setSuccess(true);
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err) {
      setError(getApiErrorMessage(err, t('auth.resetFailed')));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title={t('auth.resetPasswordTitle')}
      description={t('auth.resetPasswordDescription')}
      footer={
        <Link to="/login" className="text-foreground underline-offset-4 hover:underline">
          {t('auth.backToSignIn')}
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="reset-password-token">{t('auth.newPasswordPlaceholder')}</Label>
          <Input
            id="reset-password-token"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            disabled={success}
            required
          />
          <PasswordStrengthMeter password={password} />
        </div>

        {error ? <Alert variant="error">{error}</Alert> : null}
        {success ? <Alert variant="success">{t('auth.resetSuccess')}</Alert> : null}

        <Button type="submit" className="w-full" loading={isSubmitting} disabled={success}>
          {isSubmitting ? t('auth.resetting') : t('auth.reset')}
        </Button>
      </form>
    </AuthCard>
  );
}

export function ResetPasswordPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as ForgotOtpLocationState)?.email ?? '';
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  usePageTitle(t('auth.resetPasswordTitle'));

  if (!email) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      setError(t('auth.passwordComplexity'));
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.resetPassword({ email, newPassword: password });
      setSuccess(true);
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err) {
      setError(getApiErrorMessage(err, t('auth.resetFailed')));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title={t('auth.resetPasswordTitle')}
      description={t('auth.resetPasswordDescription')}
      footer={
        <Link to="/login" className="text-foreground underline-offset-4 hover:underline">
          {t('auth.backToSignIn')}
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input type="email" value={email} disabled aria-readonly />

        <div className="space-y-2">
          <Label htmlFor="reset-password">{t('auth.newPasswordPlaceholder')}</Label>
          <Input
            id="reset-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            disabled={success}
            required
          />
          <PasswordStrengthMeter password={password} />
        </div>

        {error ? <Alert variant="error">{error}</Alert> : null}
        {success ? <Alert variant="success">{t('auth.resetSuccess')}</Alert> : null}

        <Button type="submit" className="w-full" loading={isSubmitting} disabled={success}>
          {isSubmitting ? t('auth.resetting') : t('auth.reset')}
        </Button>
      </form>
    </AuthCard>
  );
}
