import { Navigate, useNavigate } from 'react-router-dom';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { useLanguage } from '@/shared/languages';
import { AuthModal } from '../components/AuthModal';
import { useAuthStore } from '../stores/authStore';
import { getPostLoginPath } from '../utils/getPostLoginPath';

export function RegisterPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  usePageTitle(t('auth.signUpTitle'));

  if (isAuthenticated && user) {
    return <Navigate to={getPostLoginPath(user.role)} replace />;
  }

  return (
    <AuthModal
      isOpen
      onClose={() => navigate('/', { replace: true })}
      initialView="signup"
    />
  );
}
