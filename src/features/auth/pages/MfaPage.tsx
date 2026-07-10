import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { getApiErrorMessage } from '@/shared/api';
import { useLanguage } from '@/shared/languages';
import { AuthCard } from '../components/AuthCard';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/authStore';
import { getPostLoginPath } from '../utils/getPostLoginPath';

interface MfaLocationState {
  mfaToken?: string;
  email?: string;
  from?: string;
}

export function MfaPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchUser } = useAuth();
  const { mfaToken, email, from } = (location.state as MfaLocationState) ?? {};
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  usePageTitle(t('auth.mfaTitle'));

  if (!mfaToken) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!code.trim()) {
      setError(t('auth.mfaCodeRequired'));
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.verifyMfa({ mfaToken, code: code.trim() });
      await fetchUser();
      const currentUser = useAuthStore.getState().user;
      navigate(from ?? (currentUser ? getPostLoginPath(currentUser.role) : '/candidate/dashboard'), { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, t('auth.mfaInvalid')));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title={t('auth.mfaTitle')}
      description={t('auth.mfaDescription')}
      footer={
        <Link to="/login" className="text-foreground underline-offset-4 hover:underline">
          {t('auth.backToSignIn')}
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {email ? <p className="text-sm text-muted-foreground">{email}</p> : null}

        <div className="space-y-2">
          <Label htmlFor="mfa-code">{t('auth.mfaCodeLabel')}</Label>
          <Input
            id="mfa-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t('auth.otpPlaceholder')}
            required
          />
        </div>

        {error ? <Alert variant="error">{error}</Alert> : null}

        <Button type="submit" className="w-full" loading={isSubmitting}>
          {isSubmitting ? t('auth.verifying') : t('auth.mfaSubmit')}
        </Button>
      </form>
    </AuthCard>
  );
}
