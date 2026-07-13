import { Link, Navigate, useLocation } from 'react-router-dom';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { useLanguage } from '@/shared/languages';
import { AuthCard } from '../components/AuthCard';
import { LoginForm } from '../components/LoginForm';
import { useAuthStore } from '../stores/authStore';
import { getPostLoginPath } from '../utils/getPostLoginPath';

export function LoginPage() {
  const { t } = useLanguage();
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();

  usePageTitle(t('auth.signInTitle'));

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
  const sessionExpired = (location.state as { reason?: string } | null)?.reason === 'session-expired';
  const registeredEmail = (location.state as { registeredEmail?: string } | null)?.registeredEmail;

  if (isAuthenticated && user) {
    return <Navigate to={from ?? getPostLoginPath(user.role)} replace />;
  }

  return (
    <AuthCard
      title={t('auth.signInTitle')}
      description={t('auth.signInSubtitle')}
      footer={
        <span className="text-muted-foreground">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="text-foreground underline-offset-4 hover:underline">
            {t('auth.signUp')}
          </Link>
        </span>
      }
    >
      <LoginForm
        redirectFrom={from}
        sessionExpired={sessionExpired}
        registeredEmail={registeredEmail}
      />
    </AuthCard>
  );
}
