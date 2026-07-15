import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { getApiErrorMessage } from '@/shared/api';
import { useLanguage } from '@/shared/languages';
import { AuthCard } from '../components/AuthCard';
import { authService } from '../services/authService';

export function ForgotPasswordPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  usePageTitle(t('auth.forgotTitle'));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!email.trim()) {
      setError(t('auth.loginRequired'));
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.forgotPassword({ email: email.trim() });
      navigate('/forgot-password/verify', {
        replace: true,
        state: { email: email.trim() },
      });
    } catch (err) {
      setError(getApiErrorMessage(err, t('auth.forgotFailed')));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title={t('auth.forgotTitle')}
      description={t('auth.forgotDescription')}
      footer={
        <Link to="/login" className="text-foreground underline-offset-4 hover:underline">
          {t('auth.backToSignIn')}
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="forgot-email">{t('auth.emailPlaceholder')}</Label>
          <Input
            id="forgot-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        {error ? <Alert variant="error">{error}</Alert> : null}

        <Button type="submit" className="w-full" loading={isSubmitting}>
          {isSubmitting ? t('auth.sendingLink') : t('auth.sendLink')}
        </Button>
      </form>
    </AuthCard>
  );
}
