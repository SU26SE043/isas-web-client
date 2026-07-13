import { Link, Navigate } from 'react-router-dom';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { useLanguage } from '@/shared/languages';
import { AuthCard } from '../components/AuthCard';
import { RegisterForm } from '../components/RegisterForm';
import { useAuthStore } from '../stores/authStore';
import { getPostLoginPath } from '../utils/getPostLoginPath';

export function RegisterPage() {
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuthStore();

  usePageTitle(t('auth.signUpTitle'));

  if (isAuthenticated && user) {
    return <Navigate to={getPostLoginPath(user.role)} replace />;
  }

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
      <RegisterForm />
    </AuthCard>
  );
}
