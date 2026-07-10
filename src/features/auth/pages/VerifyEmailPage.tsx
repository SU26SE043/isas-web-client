import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { getApiErrorMessage } from '@/shared/api';
import { useLanguage } from '@/shared/languages';
import { AuthCard } from '../components/AuthCard';
import { authService } from '../services/authService';

export function VerifyEmailPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const emailParam = searchParams.get('email') ?? '';
  const [email, setEmail] = useState(emailParam);
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  usePageTitle(t('auth.verifyEmailTitle'));

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    const verify = async () => {
      setStatus('verifying');
      try {
        await authService.verifyEmail({ token });
        if (!cancelled) {
          setStatus('success');
          setMessage(t('auth.verifyEmailSuccess'));
        }
      } catch (error) {
        if (!cancelled) {
          setStatus('error');
          setMessage(getApiErrorMessage(error, t('auth.verifyEmailFailed')));
        }
      }
    };

    void verify();
    return () => {
      cancelled = true;
    };
  }, [token, t]);

  const handleResend = async () => {
    if (!email.trim()) {
      setMessage(t('auth.loginRequired'));
      setStatus('error');
      return;
    }

    setIsResending(true);
    setMessage('');
    try {
      await authService.resendVerification({ email: email.trim() });
      setStatus('idle');
      setMessage(t('auth.verifyEmailResent'));
    } catch (error) {
      setStatus('error');
      setMessage(getApiErrorMessage(error, t('auth.verifyEmailResendFailed')));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthCard
      title={t('auth.verifyEmailTitle')}
      description={t('auth.verifyEmailDescription')}
      footer={
        status === 'success' ? (
          <Button type="button" className="w-full" onClick={() => navigate('/login', { replace: true })}>
            {t('auth.signInTitle')}
          </Button>
        ) : (
          <Link to="/login" className="text-foreground underline-offset-4 hover:underline">
            {t('auth.backToSignIn')}
          </Link>
        )
      }
    >
      <div className="space-y-4">
        {status === 'verifying' ? (
          <p className="body-text text-center">{t('auth.verifying')}</p>
        ) : null}

        {message ? (
          <Alert variant={status === 'success' ? 'success' : status === 'error' ? 'error' : 'info'}>
            {message}
          </Alert>
        ) : null}

        {!token && status !== 'success' ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="verify-email">{t('auth.emailPlaceholder')}</Label>
              <Input
                id="verify-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <Button type="button" className="w-full" loading={isResending} onClick={handleResend}>
              {isResending ? t('auth.sendingLink') : t('auth.verifyEmailResend')}
            </Button>
          </>
        ) : null}
      </div>
    </AuthCard>
  );
}
