import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { useLanguage } from '@/shared/languages';
import { AuthModal } from '../components/AuthModal';
import { useAuthStore } from '../stores/authStore';
import { getPostLoginPath } from '../utils/getPostLoginPath';

export function LoginPage() {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  usePageTitle(t('auth.signInTitle'));

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
  const sessionExpired = (location.state as { reason?: string } | null)?.reason === 'session-expired';
  const registeredEmail = (location.state as { registeredEmail?: string } | null)?.registeredEmail;

  if (isAuthenticated && user) {
    return <Navigate to={from ?? getPostLoginPath(user.role)} replace />;
  }

  return (
    <AuthModal
      isOpen
      onClose={() => navigate('/', { replace: true })}
      initialView="login"
      redirectFrom={from}
      sessionExpired={sessionExpired}
      registeredEmail={registeredEmail}
    />
  );
}
