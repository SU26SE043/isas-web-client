import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { useLanguage } from '@/shared/languages';
import { AuthCard } from '../components/AuthCard';
import { MFAChallenge } from '../components/MFAChallenge';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../stores/authStore';
import { resolvePostLoginPath } from '../utils/getPostLoginPath';

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

  usePageTitle(t('auth.mfaTitle'));

  if (!mfaToken) {
    return <Navigate to="/login" replace />;
  }

  const handleVerified = async () => {
    await fetchUser();
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) {
      navigate('/login', { replace: true });
      return;
    }
    navigate(resolvePostLoginPath(currentUser.role, from), { replace: true });
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
      <MFAChallenge mfaToken={mfaToken} email={email} onVerified={handleVerified} />
    </AuthCard>
  );
}
