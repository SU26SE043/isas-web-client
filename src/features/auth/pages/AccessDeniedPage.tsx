import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { useLanguage } from '@/shared/languages';
import { AuthCard } from '../components/AuthCard';

export function AccessDeniedPage() {
  const { t } = useLanguage();
  usePageTitle(t('auth.accessDeniedTitle'));

  return (
    <AuthCard title={t('auth.accessDeniedTitle')} description={t('auth.accessDeniedDescription')}>
      <div className="flex flex-col gap-3">
        <Button render={<Link to="/" />} className="w-full">
          {t('ds.error.goHome')}
        </Button>
        <Button variant="outline" render={<Link to="/login" />} className="w-full">
          {t('auth.signInTitle')}
        </Button>
      </div>
    </AuthCard>
  );
}
