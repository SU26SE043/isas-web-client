import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { useLanguage } from '@/shared/languages';
import { AuthCard } from '../components/AuthCard';

export function AccountLockedPage() {
  const { t } = useLanguage();
  usePageTitle(t('auth.accountLockedTitle'));

  return (
    <AuthCard title={t('auth.accountLockedTitle')} description={t('auth.accountLockedDescription')}>
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">{t('auth.accountLockedHint')}</p>
        <Button render={<Link to="/login" />} className="w-full">
          {t('auth.backToSignIn')}
        </Button>
      </div>
    </AuthCard>
  );
}
