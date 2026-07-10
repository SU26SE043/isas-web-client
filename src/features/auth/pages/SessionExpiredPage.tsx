import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { useLanguage } from '@/shared/languages';
import { AuthCard } from '../components/AuthCard';

export function SessionExpiredPage() {
  const { t } = useLanguage();
  usePageTitle(t('auth.sessionExpiredTitle'));

  return (
    <AuthCard title={t('auth.sessionExpiredTitle')} description={t('auth.sessionExpiredDescription')}>
      <Button render={<Link to="/login" state={{ reason: 'session-expired' }} />} className="w-full">
        {t('auth.sessionExpiredAction')}
      </Button>
    </AuthCard>
  );
}
